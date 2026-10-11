import { io } from "socket.io-client";
import { readFileSync } from "fs";
const TOKEN = readFileSync("/Users/jackie/workspace/1s/tools/.test-token", "utf-8").trim();
const SERVER = "http://localhost:1520";
const pending = new Map();
const socket = io(SERVER.replace(/^http/, "ws") + "/ws", {
  transports: ["websocket"], auth: { token: TOKEN },
  query: { clientSource: "管理后台", clientId: `convo-${Date.now()}` },
});
socket.on("remote-result", (d) => {
  if (d?.phase === "accepted") return;
  if (d?.requestId && pending.has(d.requestId)) { pending.get(d.requestId)(d); pending.delete(d.requestId); }
});
await new Promise(r => socket.on("connect", r));
const tool = process.argv[2];
const rid = `convo-${Date.now()}`;
const waiter = new Promise(res => { pending.set(rid, res); setTimeout(() => res({phase:"timeout"}), 30000); });
await fetch(`${SERVER}/api/websocket/remote-command`, {
  method:"POST", headers:{Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json"},
  body: JSON.stringify({ connectionId: tool, command: { type:"getConversation", requestId: rid, payload: {} }})
});
const res = await waiter;
const msgs = res?.conversation || res?.result?.conversation || [];
console.log("msg count:", msgs.length);
for (const m of msgs.slice(-12)) {
  const c = String(m.content||"").slice(0,120);
  const tcs = (m.tool_calls||[]).map(t => t.name || t.function?.name).join(",");
  console.log(`[${m.role}] ${tcs ? "tools:"+tcs : ""} ${c}`);
}
process.exit(0);
