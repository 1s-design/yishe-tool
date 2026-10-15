/**
 * 内部资源组合测试：字体/图片/贴纸/技巧/文案/提示词 引用 + 自定义贴纸复刻
 * 用法: node tools/res-combo-test.mjs <connectionId>
 */
import { readFileSync, appendFileSync, mkdirSync } from "fs";
const TOKEN = readFileSync(new URL("./.test-token", import.meta.url), "utf-8").trim();
const API = "http://127.0.0.1:1520/api/ai-assistant/tools/execute";
const CID = process.argv[2];
const OUT = new URL("../.batch-logs/res-combo.log", import.meta.url).pathname;
mkdirSync(new URL("../.batch-logs", import.meta.url).pathname, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function log(m) {
  const line = `[${new Date().toISOString()}] ${m}`;
  console.log(line);
  appendFileSync(OUT, line + "\n");
}
async function mcp(tool, input, timeoutMs = 900000) {
  for (let a = 1; a <= 2; a++) {
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
      if (a === 2) return { phase: "error", error: e.message };
      await sleep(5000);
    }
  }
}
const FONT_A = { type: "font", id: "5d394ee9-6627-4b37-a05a-0217154f6525", label: "LXGWBrightCode LightItalic" };
const FONT_B = { type: "font", id: "2cb59900-a80d-4224-95f5-89efa3d88cb1", label: "LXGWBrightCode Light" };
const STICKER = { type: "sticker", id: "99f35682-8a68-40bb-a96e-2836c091cb7b", label: "收钱收到手软·长款" };
const TIP = { type: "tip", id: "f0c9e208-d0a7-4c7d-a1f1-2611aa7e6acc", label: "文字图案填充" };
const SENTENCE = { type: "sentence", id: "4", label: "文案#4" };
const PROMPT = { type: "prompt", id: "f422239e-3aa7-4c2c-b159-59b108774db8", label: "设计鼠标垫" };
const SIZE = [{ width: 3000, height: 1376, label: "长款" }];

const CASES = [
  {
    name: "T1 字体+图片(贴纸)",
    payload: {
      description: "做一张长款鼠标垫印花：暖橙底，主文案「越努力越幸运」，用指定字体与指定图片素材组合。",
      resources: [FONT_A, STICKER],
    },
  },
  {
    name: "T2 字体+技巧+文案",
    payload: {
      description: "做一张长款鼠标垫印花：暗底金线，主文案「人间值得」，结合设计技巧与文案资源。",
      resources: [FONT_B, TIP, SENTENCE],
    },
  },
  {
    name: "T3 自定义贴纸复刻",
    payload: {
      description: "",
      taskSource: { kind: "replicate", sourceStickerId: STICKER.id, variants: 1, sizes: SIZE },
    },
  },
  {
    name: "T4 四资源组合(字体+图片+技巧+提示词)",
    payload: {
      description: "做一张长款鼠标垫印花：国潮红金，主文案「财源滚滚」，把字体、图片、技巧、提示词四种资源全部用上。",
      resources: [FONT_A, STICKER, TIP, PROMPT],
    },
  },
];

async function runCase(c, idx) {
  log(`▶️ [${idx}] ${c.name}`);
  const r = await mcp("system.design_tool.batch_start", {
    connectionId: CID,
    count: 1,
    taskPreset: "custom",
    outputKind: "independent-batch",
    enableAnalysisOptimization: false,
    saveMode: "auto",
    ...c.payload,
    timeoutMs: 900000,
  }, 900000);
  log(`   受理: phase=${r?.phase} ${String(r?.message || r?.error || "").slice(0, 100)}`);
  for (let i = 0; i < 45; i++) {
    await sleep(20000);
    const st = await mcp("system.design_tool.batch_get_state", { connectionId: CID }, 60000).catch(() => ({}));
    const b = (st?.raw || {}).batch || st?.batch || {};
    if (!b?.status) continue;
    const it = (b.items || [])[0] || {};
    if (i % 3 === 0 || ["done", "stopped"].includes(b.status)) {
      log(`   [${i}] ${b.status} ${b.succeeded ?? 0}/${b.total ?? "-"} fail=${b.failed ?? 0} | ${it.title || ""} ${it.status || ""}${it.savedUrl ? " SAVED" : ""}${it.error ? " err=" + String(it.error).slice(0, 70) : ""}`);
    }
    if (["done", "stopped"].includes(b.status)) {
      const r2 = await mcp("system.design_tool.audit_canvas", { connectionId: CID }, 60000).catch(() => ({}));
      log(`   结果: ${it.title || ""} | ${it.status} | score=${it.score ?? "-"} | url=${(it.savedUrl || "").slice(0, 110)}`);
      return { name: c.name, status: it.status, url: it.savedUrl, error: it.error };
    }
  }
  return { name: c.name, status: "timeout" };
}

const results = [];
for (let i = 0; i < CASES.length; i++) {
  results.push(await runCase(CASES[i], i + 1));
  await sleep(8000);
}
log("==== 汇总 ====");
for (const r of results) log(`  ${r.name}: ${r.status} ${r.url ? "| " + r.url.slice(0, 90) : ""}${r.error ? " | " + String(r.error).slice(0, 80) : ""}`);
