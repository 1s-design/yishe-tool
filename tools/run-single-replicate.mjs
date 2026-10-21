import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const TOKEN = readFileSync(new URL("./.test-token", import.meta.url), "utf-8").trim();
const API = "http://127.0.0.1:1520";
const CONN = "designtool-mvha7qv1-wt9g63";

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

const BRIEF = `请设计一张全新的「黑金典藏版·牛气冲天」高端国潮印花桌垫（风格彻底区别于上一款红色，采用曜石黑金高奢质感）。

## 画布尺寸（最高优先级）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 canvas.smartSize 或其他尺寸，尺寸已锁定。

## 文案与元素清单（逐字呈现）
1. 主文案「牛气冲天」：位置正中央水平横排居中；字体使用毛笔书法大字（font-size: calc(var(--canvas-html-vh) * 36)），字重极重且霸气，颜色为鎏金色 #F5D77F，带立体深邃阴影
2. 上方副文案「📈 顺大势者乘风破浪，辨龙头者日进斗金」：水平横向排在主文案正上方居中（top: 12%），颜色：香槟金 #E6CA85，字号 calc(var(--canvas-html-vh) * 6.8)，white-space: nowrap
3. 下方副文案「严守纪律 · 知行合一 · 让利润奔跑 ↗」：水平横向排在主文案正下方居中（bottom: 12%），颜色：香槟金 #E6CA85，字号 calc(var(--canvas-html-vh) * 6.8)，white-space: nowrap
4. 装饰徽章左侧一列5个圆形印章「顺」「势」「而」「为」「赢」：位于 left: 4%，垂直一列均匀居中分布，圆环金边，内置单字
5. 装饰徽章右侧一列5个圆形印章「知」「行」「合」「一」「定」：位于 right: 4%，垂直一列均匀居中分布，圆环金边，内置单字

## 色系与视觉质感（曜石黑金奢华风）
- 底色：曜石黑暗金深邃渐变 radial-gradient(ellipse at center, #232526 0%, #151618 65%, #0A0A0B 100%)
- 文字与金属细线：高光金 #F5D77F 与暖金 #E6CA85
- 边框装饰：外围细腻金线矩形框与四角直角折角装饰

## 模板变量化要求（核心要求：方便用户后续在 UI 右侧属性面板一键改字换色）
- 主文案使用 {{text.title}}，在 htmlBindings.text.title 设默认值 "牛气冲天"
- 上方副文案使用 {{text.subtitleTop}}，在 htmlBindings.text.subtitleTop 设默认值 "📈 顺大势者乘风破浪，辨龙头者日进斗金"
- 下方副文案使用 {{text.subtitleBottom}}，在 htmlBindings.text.subtitleBottom 设默认值 "严守纪律 · 知行合一 · 让利润奔跑 ↗"
- 金色高光色使用 {{color.gold.css}}，在 htmlBindings.color.gold 设默认值 { color: "#F5D77F", type: "pure" }
- 主背景底色使用 {{color.bg.css}}，在 htmlBindings.color.bg 设默认值 { color: "#151618", type: "pure" }
- 字体使用 {{font.hero.family}} 绑定书法字体
- 在 htmlTemplateFields 中声明对应的 label（主标题文字、顶部副文案、底部副文案、烫金高光色、背景底色、主视觉书法字体）

## 执行步骤
1. 不要调用 resource.searchCustomSticker 或 resource.searchSticker（本品为全新黑金主题定制，无需检索）
2. 第一步调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
3. resource.searchFont({ query: "毛笔", category: "calligraphy" }) 检索书法字体，绑定为 font.hero
4. 立即用一个完整的 canvas.addHtml 实现完整画面（必须采用上述模板变量和 htmlBindings，字字忠实，禁止硬编码文字）
5. 确认无误后立即调用 canvas.updateAndSaveSticker 保存，名称为「黑金牛气冲天模板桌垫」`;

async function main() {
  console.log(`[Replicate Runner] 派发任务到设计端: ${CONN}`);
  const t0 = Date.now();
  const res = await mcp("system.design_tool.run_task", {
    connectionId: CONN,
    message: BRIEF,
    executionMode: "automatic",
    timeoutMs: 600000,
  }, 620000);

  const duration = Math.round((Date.now() - t0) / 1000);
  console.log(`[Replicate Runner] 任务完成，耗时 ${duration}s`);
  console.log("响应:", JSON.stringify(res, null, 2));

  // 获取快照
  const snap = await mcp("system.design_tool.snapshot", { connectionId: CONN }, 60000);
  console.log("快照结果:", snap);
}

main().catch(console.error);
