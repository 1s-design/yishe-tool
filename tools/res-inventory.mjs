import { readFileSync } from "fs";
const TOKEN = readFileSync(new URL("./.test-token", import.meta.url), "utf-8").trim();
const API = "http://127.0.0.1:1520/api/ai-assistant/tools/execute";
const CID = process.argv[2] || "designtool-mv9hnafv-svw6cq";
async function mcp(tool, input, timeoutMs = 60000) {
  const res = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ tool, input }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const d = await res.json();
  const m = (d?.data?.messages || []).find((x) => x.role === "tool");
  return m?.toolResult?.data ?? m?.toolResult ?? d;
}
const out = {};
for (const t of ["sticker", "customSticker", "image", "font", "sentence", "tip", "document", "prompt", "designInspiration"]) {
  const r = await mcp("system.design_tool.list_resources", { connectionId: CID, type: t, pageSize: 3 });
  const items = (r?.raw?.resources) || r?.resources || [];
  out[t] = items.map((x) => ({ type: x.type, id: x.id, label: x.label, url: x.payload?.url || "" }));
  console.log(`=== ${t} (${r?.message || ""}) ===`);
  for (const i of out[t]) console.log("  ", i.id, "|", i.label, "|", (i.url || "").slice(0, 70));
}
