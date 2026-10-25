// 临时验证脚本：发送 chat（resetConversation），打印本次对话的工具调用与结果
import { io } from "socket.io-client";
import { readFileSync } from "fs";

const TOKEN = readFileSync("/Users/jackie/workspace/1s/tools/.test-token", "utf-8").trim();
const SERVER = "http://localhost:1520";
const prompt = process.argv[2];
if (!prompt) { console.error("usage: node .tmp-agent-chat.mjs <prompt>"); process.exit(1); }

const pending = new Map();
const socket = io(SERVER.replace(/^http/, "ws") + "/ws", {
  transports: ["websocket"], auth: { token: TOKEN },
  query: { clientSource: "管理后台", clientId: `tmp-chat-${Date.now()}` },
});
socket.on("remote-result", (d) => {
  if (d?.phase === "accepted") return;
  if (d?.requestId && pending.has(d.requestId)) { pending.get(d.requestId)(d); pending.delete(d.requestId); }
});
await new Promise(r => socket.on("connect", r));

async function api(path, body) {
  const res = await fetch(`${SERVER}/api${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json();
  return json.data ?? json;
}
function sendCmd(connectionId, command, timeoutMs = 180000) {
  const rid = command.requestId;
  const waiter = new Promise(res => {
    pending.set(rid, res);
    setTimeout(() => res({ phase: "timeout" }), timeoutMs);
  });
  return fetch(`${SERVER}/api/websocket/remote-command`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ connectionId, command }),
  }).then(() => waiter);
}

const connections = await api("/websocket/my-online-runtime-connection-views", { summary: true, compact: true });
const tool = (Array.isArray(connections) ? connections : []).find(c =>
  ["设计工具", "设计端"].includes(String(c.clientSource || c.query?.clientSource || "")) ||
  c.clientInfo?.app?.name === "yishe-tool" || String(c.id).startsWith("designtool-"));
if (!tool) { console.error("no design tool online"); process.exit(1); }
console.log("tool:", tool.id);

const rid = `tmp-chat-${Date.now()}`;
const result = await sendCmd(tool.id, {
  type: "chat",
  requestId: rid,
  payload: { message: prompt, resetConversation: true },
});
console.log("chat phase:", result.phase, "| msg:", String(result.message || result.error || "").slice(0, 150));
if (result.agentResponse) console.log("agentResponse:", String(result.agentResponse).slice(0, 300));

const convoRes = await sendCmd(tool.id, { type: "getConversation", requestId: `tmp-convo-${Date.now()}`, payload: {} }, 30000);
const msgs = convoRes?.conversation || convoRes?.result?.conversation || [];
console.log("msg count:", msgs.length);
for (const m of msgs) {
  const c = String(m.content || "").slice(0, 200).replace(/\n/g, " ");
  const tcs = (m.tool_calls || []).map(t => t.name || t.function?.name).join(",");
  console.log(`[${m.role}] ${tcs ? "tools:" + tcs + " | " : ""}${c}`);
}
process.exit(0);
