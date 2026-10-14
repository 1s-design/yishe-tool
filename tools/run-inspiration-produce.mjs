/**
 * 灵感驱动批量生产（通用编排器）
 *
 * 用法:
 *   node tools/run-inspiration-produce.mjs [target] [chunk] [variants] [sizeSpec] [category]
 *
 * sizeSpec: 逗号分隔的 `宽x高:标签`，例如
 *   "3000x1376:长款,3000x2000:3:2,2400x2400:1:1,3000x2500:1.2:1"
 *   "3000x1408:2.1314"  → 只跑一个尺寸（收纳袋/文具袋印花）
 * category: 只生产该分类的灵感（如「商品印花」）；不传=全部
 */
import { readFileSync, appendFileSync, existsSync } from "fs";

const TOKEN = readFileSync(new URL("./.test-token", import.meta.url), "utf-8").trim();
const API = "http://127.0.0.1:1520/api/ai-assistant/tools/execute";
const INSP = "http://127.0.0.1:1520/api/design-inspiration";
const POOL_PATH = new URL("./insp-pool.json", import.meta.url);
const LOG = process.env.LOG_FILE || "/tmp/inspiration-produce.log";

const TARGET = Number(process.argv[2]) || 2000;
const CHUNK = Number(process.argv[3]) || 4;
const VARIANTS = Number(process.argv[4]) || 2;
const ONLY_CATEGORY = process.argv[6] || "";

function parseSizes(spec) {
  const fallback = [
    { width: 3000, height: 1376, label: "长款" },
    { width: 3000, height: 2000, label: "3:2" },
    { width: 2400, height: 2400, label: "1:1" },
    { width: 3000, height: 2500, label: "1.2:1" },
  ];
  if (!spec) return fallback;
  return spec.split(",").map((one) => {
    // 只在第一个冒号处分割，避免把 3:2 / 1.2:1 这类标签截断
    const idx = one.indexOf(":");
    const wh = idx === -1 ? one : one.slice(0, idx);
    const label = idx === -1 ? "" : one.slice(idx + 1);
    const [w, h] = wh.split("x").map(Number);
    return { width: w, height: h, label: label || `${w}x${h}` };
  });
}
const SIZES = parseSizes(process.argv[5]);

const INSTRUCTIONS = [
  "【画面】背景至少三层（主题色渐变底 + 纹理肌理 + 主题插画/光影），至少 2 个具象元素，画面饱满有氛围，不要大片纯色空白。",
  "【主文案居中·硬性】主文案的几何中心必须落在画布正中心 (50%,50%)，只对主文案容器用 translate(-50%,-50%)；副文案挂在主文案正下方；绝不能把主+副整体居中（否则主文案偏上）。",
  "【文字完整】文字必须完整落在画布内，字号不得超过画布高度的 26%（两行时每行 ≤14%），长文案换行不要截断；禁止 text-overflow:ellipsis、white-space:nowrap；禁止用 vw/vh/clamp 做字号。",
  "【自由发挥】装饰、纹样、光影、材质、配色与字体风格都可大胆尝试。",
  "【印花适配】主体集中居中、四周留适度可裁切边距，适合做布艺商品印花。",
].join(" ");

const pool = existsSync(POOL_PATH) ? JSON.parse(readFileSync(POOL_PATH, "utf-8")) : [];
let produced = 0;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG, line + "\n");
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(maxWaitMs = 600000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "system.design_tool.query_design_tools", input: { onlineOnly: true } }),
        signal: AbortSignal.timeout(15000),
      });
      if (r.ok) return true;
    } catch {}
    await sleep(8000);
  }
  return false;
}

async function mcp(tool, input, timeoutMs = 1800000) {
  for (let attempt = 1; attempt <= 3; attempt++) {
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
      if (attempt === 3) return { phase: "error", error: e.message };
      await sleep(5000 * attempt);
    }
  }
}

async function insp(path, body) {
  // 服务端会不定期重启，这里必须自带重试，否则一次 socket 断开就会把编排器带崩
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(`${INSP}/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
      const j = await res.json();
      return j?.data ?? j;
    } catch (error) {
      if (attempt === 5) {
        console.warn(`[insp] ${path} 连续失败: ${error?.message}`);
        return {};
      }
      await sleep(3000 * attempt);
    }
  }
  return {};
}

async function inspAllPages(query = {}) {
  const all = [];
  let page = 1;
  for (;;) {
    const d = await insp("page", { currentPage: page, pageSize: 100, ...query });
    const list = d?.list || [];
    all.push(...list);
    const total = Number(d?.total) || 0;
    if (!list.length || all.length >= total || page > 12) break;
    page += 1;
  }
  return all;
}

async function worker(tool, size, items, tag) {
  const queue = [];
  for (let i = 0; i < items.length; i += CHUNK) queue.push(items.slice(i, i + CHUNK));
  while (queue.length && produced < TARGET) {
    const chunk = queue.shift();
    const names = chunk.map((x) => x.title).join("/");
    const t0 = Date.now();
    let accepted = false;
    for (let attempt = 1; attempt <= 20; attempt++) {
      const r = await mcp("system.design_tool.batch_start", {
        connectionId: tool.clientId,
        description: "",
        count: 30,
        taskPreset: "custom",
        outputKind: "independent-batch",
        customInstructions: INSTRUCTIONS,
        taskSource: {
          kind: "inspirations",
          inspirationIds: chunk.map((x) => x.id),
          variantsPerInspiration: VARIANTS,
          sizes: [size],
          reportBack: true,
        },
        timeoutMs: 1800000,
      });
      if (r?.batch || r?.phase === "progress" || r?.success === true) {
        accepted = true;
        break;
      }
      log(`${tag} 未受理（${r?.error || r?.message || "?"}），30s 重试 (${attempt}/20)`);
      await sleep(30000);
    }
    if (!accepted) {
      log(`${tag} 「${names}」多次未受理，跳过`);
      continue;
    }
    let ok = 0, failed = 0, status = "?";
    for (let i = 0; i < 240; i++) {
      await sleep(20000);
      let b;
      try {
        const st = await mcp("system.design_tool.batch_get_state", { connectionId: tool.clientId }, 30000);
        b = st?.batch || st?.raw?.batch;
      } catch {}
      if (!b) continue;
      status = b.status;
      if (status === "done" || status === "stopped" || status === "idle") {
        ok = b.succeeded ?? 0; failed = b.failed ?? 0;
        break;
      }
    }
    produced += ok;
    log(`${tag} 「${names}」 status=${status} ok=${ok} fail=${failed} 用时 ${Math.round((Date.now() - t0) / 60000)}min · 累计 ${produced}/${TARGET}`);
  }
}

log(`🚀 灵感生产启动：目标 ${TARGET} 张 · 尺寸 ${SIZES.map((s) => `${s.label}(${s.width}x${s.height})`).join("/")} · 每批 ${CHUNK} 灵感 · ${VARIANTS} 变体${ONLY_CATEGORY ? ` · 仅「${ONLY_CATEGORY}」` : ""}`);

if (!(await waitForServer())) {
  log("❌ 服务端不可用，退出");
  process.exit(1);
}
if (!pool.length) {
  log("❌ 灵感池为空，请先运行 node tools/gen-insp-pool.mjs");
  process.exit(1);
}

// 灌灵感（新建缺失 + 更新已有文案）
const exist = await inspAllPages();
const byTitle = new Map(exist.map((x) => [x.title, x]));
let seeded = 0, updated = 0;
for (const item of pool) {
  const old = byTitle.get(item.title);
  if (!old) {
    const r = await insp("create", item);
    if (r?.id) seeded++;
    continue;
  }
  if (old.content !== item.content || old.promptHints !== item.promptHints || old.avoidNotes !== item.avoidNotes) {
    await insp("update", { id: old.id, content: item.content, promptHints: item.promptHints, avoidNotes: item.avoidNotes, keywords: item.keywords, category: item.category });
    updated++;
  }
}
log(`灵感池：新建 ${seeded} · 更新 ${updated} · 共 ${pool.length} 条`);

let pass = 0;
while (produced < TARGET) {
  pass++;
  const items = await inspAllPages();
  const titles = new Set(pool.map((x) => x.title));
  let list = items.filter((x) => titles.has(x.title));
  if (ONLY_CATEGORY) list = list.filter((x) => x.category === ONLY_CATEGORY);
  if (!list.length) {
    log("❌ 无匹配灵感，退出");
    break;
  }

  const doneItems = list.filter((x) => x.status === "done");
  for (const it of doneItems) await insp("report-produced", { id: it.id, status: "pending" });
  if (doneItems.length) log(`第 ${pass} 轮：重置 ${doneItems.length} 条为 pending`);

  const fresh = await inspAllPages();
  let pendingItems = fresh.filter((x) => titles.has(x.title) && x.status !== "failed");
  if (ONLY_CATEGORY) pendingItems = pendingItems.filter((x) => x.category === ONLY_CATEGORY);
  if (!pendingItems.length) {
    await sleep(60000);
    continue;
  }

  const tools = (await mcp("system.design_tool.query_design_tools", { onlineOnly: true }, 40000))?.items || [];
  log(`第 ${pass} 轮：${pendingItems.length} 条灵感 · 在线 ${tools.length} 台`);
  if (!tools.length) {
    await sleep(30000);
    continue;
  }

  // 一机一尺寸（按轮次轮换，保证设计端少于尺寸数时也能逐轮覆盖全部规格）
  // 同尺寸多台则分摊灵感
  const bySize = new Map();
  tools.forEach((t, i) => {
    const si = (i + pass - 1) % SIZES.length;
    if (!bySize.has(si)) bySize.set(si, []);
    bySize.get(si).push(t);
  });

  const workers = [];
  for (const [si, toolList] of bySize) {
    const size = SIZES[si];
    const per = Math.ceil(pendingItems.length / toolList.length);
    toolList.forEach((tool, k) => {
      const slice = pendingItems.slice(k * per, (k + 1) * per);
      if (!slice.length) return;
      const tag = `[${size.label}]${toolList.length > 1 ? `#${k + 1}` : ""}`;
      log(`  ${tag} ${tool.clientId.slice(12, 22)} 承接 ${slice.length} 条 × ${VARIANTS} 变体 = ${slice.length * VARIANTS} 张`);
      workers.push(worker(tool, size, slice, tag));
    });
  }

  await Promise.all(workers);
  log(`第 ${pass} 轮结束，累计 ${produced}/${TARGET}`);
}

log(`🎉 结束：本次产出 ${produced} 张`);
