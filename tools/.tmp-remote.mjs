// 临时验证脚本：通过 WebSocket 远程指令控制已连接的设计工具（不启动浏览器）
// 用法: node .tmp-remote.mjs state
//       node .tmp-remote.mjs chat "<提示词>"
//       node .tmp-remote.mjs eval "<js表达式>"
import { io } from "socket.io-client";
import { readFileSync, writeFileSync } from "fs";

const TOKEN = readFileSync("/Users/jackie/workspace/1s/tools/.test-token", "utf-8").trim();
const SERVER = "http://localhost:1520";
const [mode, arg] = process.argv.slice(2);

const pending = new Map();
const socket = io(SERVER.replace(/^http/, "ws") + "/ws", {
  transports: ["websocket"], auth: { token: TOKEN },
  query: { clientSource: "管理后台", clientId: `tmp-remote-${Date.now()}` },
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

if (mode === "state") {
  const r = await sendCmd(tool.id, { type: "getState", requestId: `tmp-state-${Date.now()}`, payload: {} }, 60000);
  console.log(JSON.stringify(r, null, 2).slice(0, 6000));
} else if (mode === "snapshot") {
  const r = await sendCmd(tool.id, { type: "snapshot", requestId: `tmp-snap-${Date.now()}`, payload: {} }, 180000);
  const snap = r?.snapshot ?? r?.result?.snapshot ?? "";
  const raw = typeof snap === "string" ? snap : String(snap.image || snap.dataUrl || snap.base64 || "");
  const out = arg || "/Users/jackie/workspace/1s/tools/.tmp-snapshot.png";
  const b64 = raw.replace(/^data:image\/\w+;base64,/, "");
  if (!b64) { console.log("no image in snapshot:", JSON.stringify(r).slice(0, 800)); process.exit(1); }
  writeFileSync(out, Buffer.from(b64, "base64"));
  console.log("saved:", out, "| bytes:", Buffer.from(b64, "base64").length, "| msg:", String(r.message || "").slice(0, 150));
} else if (mode === "eval") {
  const r = await sendCmd(tool.id, { type: "eval", requestId: `tmp-eval-${Date.now()}`, payload: { code: arg } }, 60000);
  console.log(JSON.stringify(r, null, 2).slice(0, 6000));
} else if (mode === "chat") {
  const r = await sendCmd(tool.id, {
    type: "chat", requestId: `tmp-chat-${Date.now()}`,
    payload: { message: arg, resetConversation: true },
  }, 240000);
  console.log("phase:", r.phase, "| msg:", String(r.message || r.error || "").slice(0, 200));
  const c = await sendCmd(tool.id, { type: "getConversation", requestId: `tmp-convo-${Date.now()}`, payload: {} }, 30000);
  const msgs = c?.conversation || c?.result?.conversation || [];
  console.log("msg count:", msgs.length);
  for (const m of msgs) {
    const text = String(m.content || "").slice(0, 220).replace(/\n/g, " ");
    const tcs = (m.tool_calls || []).map(t => t.name || t.function?.name).join(",");
    console.log(`[${m.role}] ${tcs ? "tools:" + tcs + " | " : ""}${text}`);
  }
} else {
  console.error("usage: node .tmp-remote.mjs state|eval|chat [arg]");
}
process.exit(0);
