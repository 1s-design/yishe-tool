/**
 * 解构分析 → 复刻制作：把 PrintAnalysisResult 编译成设计 agent 可执行的约束 brief。
 *
 * 核心原则（也是 brief 的硬性要求）：
 * - 文字用真实字体（resource.searchFont + htmlBindings），不要默认字体糊弄
 * - 复杂图形用外部图片素材（resource.searchSticker + htmlBindings），禁止 CSS 硬画
 * - 只有纯几何（色块/渐变/分割线）才允许代码实现
 * - 尺寸/文案/色值 三项数字不得漂移（brief 中只给像素，避免物理尺寸数字干扰）
 */
import type {
  PrintAnalysisResult,
  PrintTextItem,
  PrintGraphicItem,
} from "./print-analysis";

export type ReplicateMode = "same" | "similar";

const ROLE_LABELS: Record<string, string> = {
  primary: "主文案",
  secondary: "副文案",
  badge: "角标",
  decoration: "装饰字",
};

function textLine(t: PrintTextItem, index: number): string {
  const parts = [
    `${index + 1}. ${ROLE_LABELS[t.role] || t.role}「${t.content}」`,
    t.fontStyle ? `字体气质：${t.fontStyle}` : "",
    t.color ? `颜色：${t.color}` : "",
    t.position ? `位置：${t.position}` : "",
    t.effects?.length ? `效果：${t.effects.join("、")}` : "",
  ].filter(Boolean);
  const keywords = t.fontSearchKeywords.length
    ? t.fontSearchKeywords.join("、")
    : t.fontStyle || "书法";
  parts.push(
    `→ 必须调用 resource.searchFont 搜索真实字体（检索词：${keywords}），用 htmlBindings 绑定后以 {{font.xxx.family}} 渲染，禁止用默认无衬线字体或 CSS 变形糊弄`,
  );
  return parts.join("；");
}

function graphicLine(g: PrintGraphicItem, index: number): string {
  const parts = [
    `${index + 1}. ${g.name}${g.count > 1 ? ` ×${g.count}` : ""}`,
    g.position ? `位置：${g.position}` : "",
    g.description ? `形态：${g.description}` : "",
  ].filter(Boolean);

  if (g.impl === "image") {
    const keywords = g.imageSearchKeywords.length
      ? g.imageSearchKeywords.join("、")
      : g.name;
    parts.push(
      `→ 必须调用 resource.searchSticker 搜索外部图片素材（检索词：${keywords}），用 htmlBindings 绑定后以 {{image.xxx.url}} 呈现，禁止用 CSS/SVG 代码硬画此类图形`,
    );
    if (g.implReason) parts.push(`原因：${g.implReason}`);
  } else {
    parts.push("→ 该项为纯几何，允许用 CSS 实现（色块/渐变/分割线）");
  }
  return parts.join("；");
}

/**
 * 编译复刻 brief。
 * - mode="same"：同款，忠实还原，文案/色系/构图不得改动
 * - mode="similar"：相似款，主题不变，在字体气质/配色/构图中做 1-2 维明显扰动
 */
export function buildReplicateBrief(
  analysis: PrintAnalysisResult,
  mode: ReplicateMode,
): string {
  const title = mode === "same" ? "同款（忠实还原）" : "相似款（同主题变体）";
  const lines: string[] = [];

  // 画布尺寸优先用 designCanvas（印花本体比例），原图像素仅兜底；reason 不外传以免物理尺寸数字污染像素指令
  const src = (analysis as any).sourceSize as
    | { width: number; height: number }
    | null;
  const dc = (analysis as any).designCanvas as
    | { width: number; height: number }
    | null;
  const canvas =
    dc && dc.width > 0 && dc.height > 0
      ? { width: Math.round(dc.width), height: Math.round(dc.height) }
      : src && src.width > 0
        ? { width: src.width, height: src.height }
        : null;

  lines.push(`请按下面的印花解构结果制作一张「${title}」设计。`);
  lines.push("");

  // 画布尺寸（第一步，锁死；只给像素）
  lines.push("## 画布尺寸（最高优先级 · 单位是像素 px）");
  if (canvas) {
    lines.push(
      `- 第一步必须调用 canvas.setSize({ width: ${canvas.width}, height: ${canvas.height}, unit: "px" })，即 ${canvas.width}×${canvas.height} 像素`,
    );
    lines.push(
      "- 禁止使用 canvas.smartSize / setSizeByPreset；禁止使用其他任何数字作尺寸（毫米/厘米/成品物理规格都不是像素）",
    );
    lines.push(
      "- 画布是按印花本体成图方向锁定的（已做方向辨别与本体提取）；下面所有位置比例均相对印花本体，与参考照片的画幅/拍摄角度无关",
    );
  } else {
    lines.push(
      "- 第一步用 canvas.setSize 明确像素数值（按印花本体宽高比），禁止不设尺寸就开始画",
    );
  }
  lines.push("");

  // 文案清单（放最前）
  if (analysis.texts.length) {
    lines.push("## 文案清单（逐字复制，禁止改写/增删/自创文案）");
    analysis.texts.forEach((t, i) => lines.push(textLine(t, i)));
    lines.push("");
  }

  // 外部图片 / CSS 分派
  const imageItems = analysis.graphics.filter((g) => g.impl === "image");
  const cssItems = analysis.graphics.filter((g) => g.impl === "css");
  if (imageItems.length) {
    lines.push("## 外部图片素材（禁止 CSS 硬画，必须搜素材绑定）");
    imageItems.forEach((g, i) => lines.push(graphicLine(g, i)));
    lines.push("");
  }
  if (cssItems.length) {
    lines.push("## 可 CSS 实现（仅限纯几何）");
    cssItems.forEach((g, i) => lines.push(graphicLine(g, i)));
    lines.push("");
  }

  // 色值速查
  if (analysis.colors.length) {
    const colorText = analysis.colors
      .map((c) => `${c.usage || c.role} ${c.hex}`)
      .join(" · ");
    lines.push(`## 色值速查（必须原样使用这些 HEX，禁止色相漂移）\n${colorText}`);
    lines.push("");
  }

  // 构图与布局硬规则
  const comp = analysis.composition;
  lines.push("## 构图与布局（硬性）");
  if (comp.layout) lines.push(`骨架：${comp.layout}`);
  if (comp.whitespace) lines.push(`留白：${comp.whitespace}`);
  if (comp.hierarchy) lines.push(`层级：${comp.hierarchy}`);
  lines.push(
    "- 竖排文字必须用 writing-mode:vertical-rl + text-orientation:upright + **white-space:nowrap**（不加 nowrap 竖排会换列拆成多列，字序视觉颠倒）；主文案一个容器一条竖列（禁止拆成多块/2+1 群组）",
  );
  lines.push(
    "- 主文案单独一列放画布几何中心 (50%,50%)；两侧副文案各占一列，紧贴主列、互不重叠",
  );
  lines.push(
    "- 副文案字号必须明显小于主文案（约 1/4），必要时缩小字号保证一列完整显示，禁止折成多列或截断",
  );
  lines.push(
    "- 所有列/元素禁止互相重叠、禁止溢出画布边缘；圆圈徽章排成一行放在上下短边内侧",
  );
  lines.push("- 印花适配：主体集中居中，四周留可裁切边距，远看能识别主体");
  // 主字竖排 HTML 骨架（实测可显著提升竖排命中率）
  if (analysis.texts.length) {
    const main = analysis.texts.find((t) => t.role === "primary") || analysis.texts[0];
    lines.push("");
    lines.push("### 主文案竖排 HTML 骨架（必须照抄结构）");
    lines.push(
      '```html',
    );
    lines.push(
      `<div style="position:absolute;left:50%;top:50%;height:70%;transform:translate(-50%,-50%);writing-mode:vertical-rl;text-orientation:upright;white-space:nowrap;font-size:calc(var(--canvas-html-vh) * 23);font-weight:900;line-height:1.05;letter-spacing:0.06em">${main.content}</div>`,
    );
    lines.push("```");
    lines.push(
      "（主文案文本直接写在一个容器里；white-space:nowrap 防止竖排换列拆成多列，容器 height 给足 70%；不要拆成多个绝对定位块）",
    );
    lines.push(
      "（字号只允许 calc(var(--canvas-html-vh) * N) 或 calc(var(--canvas-html-vw) * N)：1 个单位=画布高/宽 1%，与基础字号无关，比例确定；主字单字高约画布高 23%）",
    );
  }
  lines.push("");

  if (analysis.fontTraits.length) {
    lines.push(`## 整体字体气质\n${analysis.fontTraits.join("、")}`);
    lines.push("");
  }

  // 同款 vs 相似款
  if (mode === "same") {
    lines.push("## 制作要求（同款 · 四项必须一致）");
    lines.push(
      `1. **尺寸一致**：画布就是 ${canvas ? `${canvas.width}×${canvas.height} 像素` : "印花本体尺寸"}`,
    );
    lines.push("2. **文案一致**：逐字保留，主/副文案内容、层级、相对位置不得改动");
    lines.push("3. **色系一致**：按色值速查还原，禁止色相漂移");
    lines.push("4. **构图一致**：按骨架/留白/层级还原，竖排列互不重叠");
    lines.push("5. 完成后逐项自查上述四条，任一不符必须先改到一致");
  } else {
    lines.push("## 制作要求（相似款）");
    lines.push(
      `- **尺寸不变**：${canvas ? `${canvas.width}×${canvas.height} 像素` : "印花本体尺寸"}`,
    );
    lines.push("- 保持主题与文案气质（文案可轻微润色但不换主题）");
    lines.push("- 在「字体气质 / 配色 / 构图」中选 1-2 个维度做明显变化，其余保持稳定");
    lines.push("- 变化仍须使用真实字体与外部素材，不得因为求变而退回 CSS 硬画");
    lines.push("- 主体集中居中、四周留可裁切边距的印花适配要求不变");
  }
  lines.push("");

  // 全局硬规则
  lines.push("## 全局硬性规则");
  lines.push(
    "1. **第一步先设尺寸**：必须先 canvas.setSize（像素数值见上），再 canvas.clear，再作画",
  );
  lines.push(
    "2. **不要盲目用代码实现**：文字必须用 resource.searchFont 的真实字体；插画/纹样/角饰/图标/肌理必须用 resource.searchSticker 的外部图片素材；CSS 只允许画纯色块、渐变、分割线",
  );
  lines.push(
    "3. 资源必须放进 canvas.addHtml 的 htmlBindings：字体 {{font.xxx.family}}，图片 {{image.xxx.url}}",
  );
  lines.push(
    "4. 每类资源最多检索 2 次；无果就选最接近候选或用 CSS/SVG 兜底并立即继续，禁止反复重搜空转；必须尽快 canvas.addHtml 出图",
  );
  lines.push(
    "5. **最后一步必须调用 canvas.updateAndSaveSticker 保存作品，名称含「复刻」二字；未保存视为任务未完成**",
  );

  return lines.join("\n");
}
