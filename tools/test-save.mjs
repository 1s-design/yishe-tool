import { io } from "socket.io-client";
import { readFileSync } from "fs";
const TOKEN = readFileSync("/Users/jackie/workspace/1s/tools/.test-token", "utf-8").trim();
const SERVER = "http://localhost:1520";
const pending = new Map();
const socket = io(SERVER.replace(/^http/, "ws") + "/ws", {
  transports: ["websocket"], auth: { token: TOKEN },
  query: { clientSource: "管理后台", clientId: `save-test-${Date.now()}` },
});
socket.on("remote-result", (d) => {
  if (d?.phase === "accepted") return;
  if (d?.requestId && pending.has(d.requestId)) { pending.get(d.requestId)(d); pending.delete(d.requestId); }
});
await new Promise(r => socket.on("connect", r));
const conns = await (await fetch(`${SERVER}/api/websocket/connections`, { method:"POST", headers:{Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json"}, body:"{}" })).json();
const tool = (conns.data||[]).find(c => c.query?.clientSource === "设计端")?.id;
console.log("tool:", tool);
const rid = `save-test-${Date.now()}`;
const waiter = new Promise(res => { pending.set(rid, res); setTimeout(() => res({phase:"timeout"}), 300000); });
await fetch(`${SERVER}/api/websocket/remote-command`, {
  method:"POST", headers:{Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json"},
  body: JSON.stringify({ connectionId: tool, command: { type:"chat", requestId: rid, payload: {
    message: "设计一张简单的文字贴纸：画布 3000x1376，主文案「平安喜乐」居中，暖杏色背景，配祥云装饰和圆润书法字体，副文案「愿你岁岁常欢愉」。\n\n【重要】完成设计后，必须调用 canvas.updateAndSaveSticker，name 参数填「平安喜乐·测试保存」，保存成功后才能结束。",
    executionMode: "manual"
  }}})
});
const res = await waiter;
console.log("phase:", res?.phase, "tools:", res?.toolCallsCount);
console.log("outputs:", JSON.stringify(res?.outputs || res?.result?.outputs || []).slice(0, 400));
console.log("reply:", (res?.agentResponse||"").slice(0,150));
process.exit(0);
