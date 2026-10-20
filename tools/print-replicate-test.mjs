/**
 * 印花解构 → 复刻 端到端测试
 *
 * 用法: node tools/print-replicate-test.mjs <imageUrl> [same|similar] [connectionId]
 *
 * 流程:
 *   1) 量原图像素尺寸（PNG IHDR / JPEG SOF）
 *   2) 视觉模型解构分析（结构化 JSON）
 *   3) 编译硬约束 brief（尺寸锁死 + 资源分派）
 *   4) run_task 派发给设计工具复刻
 *   5) 下载成品、核验尺寸
 */
import { readFileSync, appendFileSync, mkdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";

const TOKEN = readFileSync(new URL("./.test-token", import.meta.url), "utf-8").trim();
const API = "http://127.0.0.1:1520";
const LOG_DIR = new URL("../.batch-logs/", import.meta.url).pathname;
mkdirSync(LOG_DIR, { recursive: true });
const LOG = path.join(LOG_DIR, "print-replicate-test.log");
const OUT_DIR = path.join(LOG_DIR, "print-replicate-out");
mkdirSync(OUT_DIR, { recursive: true });

const IMAGE_URL = process.argv[2];
const MODE = process.argv[3] === "similar" ? "similar" : "same";
const WANT_CONN = process.argv[4] || "";

if (!IMAGE_URL) {
  console.error("用法: node tools/print-replicate-test.mjs <imageUrl> [same|similar] [connectionId]");
  process.exit(1);
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG, line + "\n");
}

async function mcp(tool, input, timeoutMs = 300000) {
  const res = await fetch(`${API}/api/ai-assistant/tools/execute`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ tool, input }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const d = await res.json();
  const m = (d?.data?.messages || []).find((x) => x.role === "tool");
  return m?.toolResult?.data ?? m?.toolResult ?? d;
}

async function chatLLM(body, timeoutMs = 180000) {
  const res = await fetch(`${API}/api/ai/agent-proxy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ featureCode: "ai.chat.vision", keyId: 22, ...body }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  return await res.json();
}

function extractText(resp) {
  const cands = [resp, resp?.data, resp?.result, resp?.response, resp?.data?.data];
  for (const c of cands) {
    const msg = c?.choices?.[0]?.message || c?.message;
    const content = msg?.content;
    if (typeof content === "string" && content.trim()) return content;
    if (Array.isArray(content)) {
      const t = content.map((p) => (typeof p === "string" ? p : p?.text || "")).filter(Boolean).join("\n");
      if (t) return t;
    }
    if (typeof c?.output_text === "string" && c.output_text) return c.output_text;
    if (typeof c === "string" && c.trim()) return c;
  }
  return "";
}

function extractJSON(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

/** 读 PNG/JPEG 头量出像素尺寸 */
async function measureImage(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const buf = Buffer.from(await res.arrayBuffer());
    // PNG: IHDR at 16..24
    if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length };
    }
    // JPEG: 扫描 SOF
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7), bytes: buf.length };
        }
        i += 2 + len;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

const ANALYSIS_PROMPT = `你是资深印花/平面设计解构专家。用户给你一张印花设计图（可能是商品实拍或样机图），你的任务是**只做分析拆解**，不生成新设计。

## 识别原则
1. **穿透拍摄环境**：实拍图周围的桌面、地板、键盘、摄影背景布、阴影高光都不是设计本体，必须忽略；只提取印花画面内部的真实元素与配色。
2. **文字逐字原样**：图上所有文字逐字识别，不得改写；识别不确定的字用「□」占位并在 effects 里注明。
3. **颜色给 HEX**：每个关键色给出十六进制色值（可用近似值）。
4. **诚实保守**：看不清的项给空字符串或空数组，不要编造。

## 复刻落地方式（impl）判定规则
1. 文字 → impl="font"：必须用真实字体渲染。每条文字给 fontSearchKeywords（字体库检索词，如 ["楷体","书法"]）。
2. 复杂视觉 → impl="image"（外部图片）：主体插画、纹样、角饰、图标、肌理、烫金质感等带笔触/细节的图形，必须走外部图片素材。给 imageSearchKeywords（2-4 个）和 implReason。
3. 纯几何 → impl="css"：只有矩形/圆形色块、纯色或线性渐变背景、分割线、简单描边框。

## 画布尺寸判定（designCanvas）— 非常重要
参考图可能是手机截图/实拍样机（带 UI、桌面、键盘等环境），**画布必须按印花设计本体的比例给出**，不是截图像素。
- 识别印花本体（桌面垫/鼠标垫/衣服/袋子等）及其成品规格；长款鼠标垫/桌垫 → 3000×1376（900×400mm ≈ 2.25:1）；3:2 → 3000×2000；方形 → 2400×2400；袋印 → 3000×1408。
- designCanvas 给 { "width": 建议像素宽, "height": 建议像素高, "reason": "依据（如 长款桌垫 900×400mm）" }。

## 输出格式
严格输出以下 JSON，不要写 JSON 之外的任何内容：
{
  "designCanvas": { "width": 3000, "height": 1376, "reason": "长款鼠标垫 900×400mm" },
  "texts": [{ "content": "逐字文案", "role": "primary|secondary|badge|decoration", "fontStyle": "书法/黑体/宋体/手写", "color": "#RRGGBB", "position": "居中/左上/底部", "effects": ["描边"], "impl": "font", "fontSearchKeywords": ["楷体","毛笔"] }],
  "fontTraits": ["楷体笔触"],
  "graphics": [{ "name": "元素名", "kind": "illustration|pattern|ornament|border|icon|texture|other", "description": "形态", "position": "位置", "count": 1, "impl": "image|css", "imageSearchKeywords": ["锦鲤","中国风"], "implReason": "复杂插画需外部素材" }],
  "colors": [{ "hex": "#7A1F2B", "role": "background|primary|secondary|accent|text", "usage": "底色" }],
  "composition": { "layout": "中轴对称", "whitespace": "12%", "hierarchy": "主文案 > 主体插画 > 辅助纹样" },
  "adaptability": { "standalone": true, "cropRisk": "低", "notes": "" },
  "resourcePlan": {
    "fonts": [{ "keywords": ["楷体","书法"], "usedBy": "主文案" }],
    "images": [{ "name": "锦鲤插画", "keywords": ["锦鲤","中国风"], "reason": "复杂插画需外部素材" }],
    "cssElements": ["纯色背景"]
  },
  "summary": "一句话概括"
}`;

const ROLE_LABELS = { primary: "主文案", secondary: "副文案", badge: "角标", decoration: "装饰字" };

function buildBrief(a, mode, size) {
  // 画布尺寸优先用分析给出的 designCanvas（印花本体比例），原图像素仅作兜底
  const canvas = (a.designCanvas && a.designCanvas.width > 0 && a.designCanvas.height > 0)
    ? { width: Math.round(a.designCanvas.width), height: Math.round(a.designCanvas.height), reason: a.designCanvas.reason || "" }
    : size ? { width: size.width, height: size.height, reason: "" } : null;

  const L = [];
  L.push(`请按下面的印花解构结果制作一张「${mode === "same" ? "同款（忠实还原）" : "相似款（同主题变体）"}」设计。`);
  L.push("");
  L.push("## 画布尺寸（最高优先级）");
  if (canvas) {
    L.push(`- **第一步必须调用 canvas.setSize({ width: ${canvas.width}, height: ${canvas.height}, unit: "px" })**${canvas.reason ? `（依据：${canvas.reason}）` : ""}`);
    L.push("- 禁止使用 canvas.smartSize / setSizeByPreset 或自选尺寸，尺寸不符即为失败");
  } else {
    L.push("- 第一步用 canvas.setSize 明确数值（按原图宽高比），禁止不设尺寸就开始画");
  }
  L.push("");

  if (a.texts?.length) {
    L.push("## 文字（文案必须逐字使用，不得改写）");
    a.texts.forEach((t, i) => {
      const parts = [`${i + 1}. ${ROLE_LABELS[t.role] || t.role}「${t.content}」`];
      if (t.fontStyle) parts.push(`字体气质：${t.fontStyle}`);
      if (t.color) parts.push(`颜色：${t.color}`);
      if (t.position) parts.push(`位置：${t.position}`);
      if (t.effects?.length) parts.push(`效果：${t.effects.join("、")}`);
      const kw = t.fontSearchKeywords?.length ? t.fontSearchKeywords.join("、") : t.fontStyle || "书法";
      parts.push(`→ 必须调用 resource.searchFont 搜索真实字体（检索词：${kw}），用 htmlBindings 绑定后以 {{font.xxx.family}} 渲染，禁止用默认无衬线字体糊弄`);
      L.push(parts.join("；"));
    });
    L.push("");
  }

  const imgs = (a.graphics || []).filter((g) => (g.impl || "image") !== "css");
  const css = (a.graphics || []).filter((g) => g.impl === "css");
  if (imgs.length) {
    L.push("## 外部图片素材（禁止 CSS 硬画，必须搜素材绑定）");
    imgs.forEach((g, i) => {
      const kw = g.imageSearchKeywords?.length ? g.imageSearchKeywords.join("、") : g.name;
      L.push(`${i + 1}. ${g.name}${g.count > 1 ? ` ×${g.count}` : ""}${g.position ? `；位置：${g.position}` : ""}${g.description ? `；形态：${g.description}` : ""}；→ 必须调用 resource.searchSticker 搜索外部图片素材（检索词：${kw}），用 htmlBindings 绑定后以 {{image.xxx.url}} 呈现，禁止用 CSS/SVG 硬画`);
    });
    L.push("");
  }
  if (css.length) {
    L.push("## 可 CSS 实现（仅限纯几何）");
    css.forEach((g, i) => L.push(`${i + 1}. ${g.name}（纯几何，允许 CSS）`));
    L.push("");
  }

  if (a.colors?.length) {
    L.push(`## 色系\n${a.colors.map((c) => `${c.usage || c.role} ${c.hex}`).join(" · ")}`);
    L.push("");
  }
  if (a.composition) {
    L.push("## 构图");
    if (a.composition.layout) L.push(`骨架：${a.composition.layout}`);
    if (a.composition.whitespace) L.push(`留白：${a.composition.whitespace}`);
    if (a.composition.hierarchy) L.push(`层级：${a.composition.hierarchy}`);
    L.push("");
  }
  if (a.fontTraits?.length) {
    L.push(`## 整体字体气质\n${a.fontTraits.join("、")}`);
    L.push("");
  }

  if (mode === "same") {
    L.push("## 制作要求（同款 · 四项必须一致）");
    L.push(`1. **尺寸一致**：画布就是 ${canvas ? `${canvas.width}×${canvas.height} px` : "印花本体尺寸"}，不得改`);
    L.push("2. **文案一致**：逐字保留，主/副文案内容、层级、相对位置不得改动");
    L.push("3. **色系一致**：按上面 HEX 还原底色/主色/辅色/点缀色，禁止换色系");
    L.push("4. **构图一致**：按上面骨架/留白/层级还原；主文案几何中心放画布中心，主体集中居中、四周留可裁切边距");
    L.push("5. 完成后自查：上述四项任一不符都必须先改到一致，再结束");
  } else {
    L.push("## 制作要求（相似款）");
    L.push(`- **尺寸不变**：画布保持 ${canvas ? `${canvas.width}×${canvas.height} px` : "印花本体尺寸"}`);
    L.push("- 保持主题与文案气质；在「字体气质 / 配色 / 构图」中选 1-2 个维度做明显变化，其余保持稳定");
    L.push("- 变化仍须使用真实字体与外部素材，不得退回 CSS 硬画");
  }
  L.push("");
  L.push("## 全局硬性规则");
  L.push("1. **第一步先设尺寸**：必须先 canvas.setSize（数值见上），再 canvas.clear，再作画；禁止 smartSize/自选尺寸");
  L.push("2. **不要盲目用代码实现**：文字必须用 resource.searchFont 的真实字体；插画/纹样/角饰/图标/肌理必须用 resource.searchSticker 的外部图片素材；CSS 只允许画纯色块、渐变、分割线");
  L.push("3. 资源必须放进 canvas.addHtml 的 htmlBindings：字体 {{font.xxx.family}}，图片 {{image.xxx.url}}");
  L.push("4. 搜索无果时优先换关键词再搜或从候选里挑最接近的，不要直接放弃资源改用 CSS 画复杂图形");
  L.push("5. 用一个完整的 canvas.addHtml 完成画面；完成前不要调用保存/导出");
  L.push("6. 画面完成后调用 canvas.updateAndSaveSticker 保存，名称含「复刻」二字");
  return L.join("\n");
}

async function main() {
  log("===== 印花解构复刻测试 =====");
  log(`图片: ${IMAGE_URL}`);
  log(`模式: ${MODE}`);

  // 1) 尺寸
  const size = await measureImage(IMAGE_URL);
  log(`原图尺寸: ${size ? `${size.width}x${size.height}` : "未知"}`);

  // 2) 解构分析
  log("开始解构分析...");
  const analysisResp = await chatLLM({
    messages: [
      { role: "system", content: ANALYSIS_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: `请解构这张印花图，按系统要求输出结构化 JSON。${size ? `（原图实际像素尺寸：${size.width}×${size.height}）` : ""}` },
          { type: "image_url", image_url: { url: IMAGE_URL, detail: "high" } },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  }, 180000);
  const analysisText = extractText(analysisResp);
  if (!analysisText) {
    log("❌ 分析返回为空: " + JSON.stringify(analysisResp).slice(0, 500));
    process.exit(1);
  }
  const analysis = extractJSON(analysisText);
  if (!analysis) {
    log("❌ 分析结果不是 JSON: " + analysisText.slice(0, 400));
    process.exit(1);
  }
  writeFileSync(path.join(OUT_DIR, "analysis.json"), JSON.stringify(analysis, null, 2));
  log(`分析完成: 文字 ${analysis.texts?.length || 0} 条 · 图形 ${analysis.graphics?.length || 0} · 色 ${analysis.colors?.length || 0}`);
  log(`概要: ${analysis.summary || "(无)"}`);

  // 3) brief
  const brief = buildBrief(analysis, MODE, size);
  writeFileSync(path.join(OUT_DIR, "brief.txt"), brief);
  log(`brief 已生成 (${brief.length} 字符)`);

  // 4) 找设计端
  let conn = WANT_CONN;
  if (!conn) {
    const dt = await mcp("system.design_tool.query_design_tools", { onlineOnly: true }, 30000);
    const items = dt?.items || [];
    if (!items.length) {
      log("❌ 没有在线的设计工具实例");
      process.exit(1);
    }
    conn = items[0].clientId;
  }
  log(`设计端: ${conn}`);

  // 5) 派发复刻（阻塞等待）
  log("派发复刻任务（run_task, automatic）...");
  const t0 = Date.now();
  const runResp = await mcp("system.design_tool.run_task", {
    connectionId: conn,
    message: brief,
    executionMode: "automatic",
    timeoutMs: 900000,
  }, 920000);
  writeFileSync(path.join(OUT_DIR, "run-result.json"), JSON.stringify(runResp, null, 2));
  const outputs = runResp?.outputs || runResp?.raw?.outputs || [];
  const agentResponse = runResp?.agentResponse || runResp?.raw?.agentResponse || "";
  log(`复刻完成 用时 ${Math.round((Date.now() - t0) / 1000)}s · toolCalls=${runResp?.toolCallsCount ?? "?"}`);
  log(`Agent 回复: ${String(agentResponse).slice(0, 300)}`);
  log(`outputs: ${outputs.length} 个`);

  // 6) 下载成品核验（期望尺寸 = designCanvas，兜底原图像素）
  const expectSize = (analysis.designCanvas && analysis.designCanvas.width > 0)
    ? { width: Math.round(analysis.designCanvas.width), height: Math.round(analysis.designCanvas.height) }
    : size;
  for (const [i, out] of outputs.entries()) {
    const url = out?.url || out?.savedUrl || out?.image || "";
    log(`产物[${i}]: ${url}`);
    if (url && /^https?:/.test(url)) {
      try {
        const dest = path.join(OUT_DIR, `result-${i}.png`);
        execSync(`curl -sSL -o "${dest}" "${url}"`, { stdio: "pipe" });
        const dim = execSync(`sips -g pixelWidth -g pixelHeight "${dest}"`, { encoding: "utf-8" });
        const wm = dim.match(/pixelWidth:\s*(\d+)/);
        const hm = dim.match(/pixelHeight:\s*(\d+)/);
        const w = wm ? wm[1] : "?";
        const h = hm ? hm[1] : "?";
        const expect = expectSize ? `${expectSize.width}x${expectSize.height}` : "?";
        const ok = expectSize && String(w) === String(expectSize.width) && String(h) === String(expectSize.height);
        log(`  尺寸: ${w}x${h} · 期望 ${expect} · ${ok ? "✅ 一致" : "❌ 不一致"}`);
      } catch (e) {
        log(`  下载/核验失败: ${e.message}`);
      }
    }
  }

  // 7) 快照
  try {
    const snap = await mcp("system.design_tool.snapshot", { connectionId: conn }, 60000);
    const snapUrl = snap?.url || snap?.data?.url || "";
    log(`画布快照: ${snapUrl || JSON.stringify(snap).slice(0, 200)}`);
  } catch (e) {
    log(`快照失败: ${e.message}`);
  }

  log("===== 完成 =====");
}

main().catch((e) => {
  log("❌ 致命错误: " + (e.stack || e.message));
  process.exit(1);
});
