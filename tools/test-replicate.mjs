// 复刻功能测试：以某张已存贴纸为基稿，产出带扰动的变体
// 用法: node tools/test-replicate.mjs [sourceStickerId] [variants] [width] [height] [label]
import { readFileSync, writeFileSync } from "fs";

const TOKEN = readFileSync(new URL("./.test-token", import.meta.url), "utf-8").trim();
const API = "http://127.0.0.1:1520/api/ai-assistant/tools/execute";
const OUT = "/tmp/replicate-test.log";

const sourceStickerId =
  process.argv[2] || "1c9ae856-c587-40b9-8a15-6fa29616189b";
const variants = Number(process.argv[3]) || 2;
const width = Number(process.argv[4]) || 3000;
const height = Number(process.argv[5]) || 2000;
const label = process.argv[6] || `${width}x${height}`;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  writeFileSync(OUT, readFileSync(OUT, "utf-8") + line + "\n");
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mcp(tool, input, timeoutMs = 1200000) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tool, input }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const d = await res.json();
      const m = (d?.data?.messages || []).find((x) => x.role === "tool");
      return m?.toolResult?.data ?? m?.toolResult ?? d;
    } catch (e) {
      if (attempt === 2) return { phase: "error", error: e.message };
      await sleep(5000);
    }
  }
}

log(`🧪 复刻测试：源=${sourceStickerId} · ${variants} 变体 · ${width}x${height}(${label})`);

const list = await mcp("system.design_tool.query_design_tools", { onlineOnly: true }, 40000);
const id = (list?.items || [])[0]?.clientId;
if (!id) {
  log("❌ 无在线设计端");
  process.exit(1);
}
log(`目标: ${id}`);

const t0 = Date.now();
const r = await mcp("system.design_tool.batch_start", {
  connectionId: id,
  description: "",
  count: 10,
  taskPreset: "custom",
  outputKind: "independent-batch",
  customInstructions:
    "本次复刻请保持原设计的视觉气质，变体要与基稿明显不同但同系列。",
  taskSource: {
    kind: "replicate",
    sourceStickerId,
    variants,
    sizes: [{ width, height, label }],
    perturb: { palette: true, font: true, layout: true, copy: true },
  },
  timeoutMs: 1200000,
});
log(`受理: phase=${r?.phase} msg=${String(r?.message || r?.error || "").slice(0, 120)}`);

for (let i = 0; i < 60; i++) {
  await sleep(20000);
  const st = await mcp("system.design_tool.batch_get_state", { connectionId: id }, 30000).catch(() => ({}));
  const b = st?.batch || st?.raw?.batch || st;
  if (!b) continue;
  log(
    `[${i}] status=${b.status} ok=${b.succeeded ?? "-"}/${b.total ?? "-"} fail=${b.failed ?? "-"}` +
      (b.error ? ` err=${String(b.error).slice(0, 80)}` : ""),
  );
  for (const it of b.items || []) {
    log(`     ${it.title} : ${it.status}${it.savedUrl ? " url有" : ""}${it.error ? " | " + String(it.error).slice(0, 80) : ""}`);
  }
  if (b.status === "done" || b.status === "stopped" || b.status === "idle") {
    log(`=== 结束，用时 ${Math.round((Date.now() - t0) / 1000)}s ===`);
    break;
  }
}
