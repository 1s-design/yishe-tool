/**
 * 画布自动审查（保存前质检）
 *
 * 目标：不合格的设计不进入图库。检查项：
 *  1. 画布尺寸是否符合预期
 *  2. 主/副文案是否真的出现在画面上
 *  3. 主文案是否几何居中（(50%,50%)）
 *  4. 是否有元素/文字超出画布边界
 *  5. 主文案字号是否过大（超过画布高度上限）
 *  6. 背景是否足够丰富（图层启发式：渐变/插画/纹理/光影/边框）
 *
 * 无法测量时（拿不到画布 DOM）返回通过，避免阻塞生产。
 */

import { canvasStickerOptions } from "@/components/design/layout/canvas";

export interface CanvasAuditOptions {
  expectedWidth?: number
  expectedHeight?: number
  /** 期望出现在画面上的文案（主文案、副文案） */
  expectedTexts?: string[]
  /** 严格文字白名单：画面上任何不在 expectedTexts 里的文字都算硬伤（防自创标语/副标题） */
  strictTextWhitelist?: boolean
  /** 期望背景色（#RRGGBB）；色相/明度偏离过大记硬伤 */
  expectedBackground?: string
  /** 主文案必须竖排成单列（高>宽）；横排/多列群组算硬伤 */
  expectVerticalMain?: boolean
  /** 要求的真实图片图层数下限（印章/肌理等外部素材，缺了算硬伤） */
  requireImageLayers?: number
  /** 要求金箔印章图层（rotate+linearGradient 的 <svg>），缺了算硬伤 */
  requireSeal?: boolean
}

/** 长文案折列检测：逐字外接框聚类，任何一列都装不齐全部字 = 折列/散列 */
function longTextColumnIssues(root: HTMLElement, text: string): string[] {
  const chars = Array.from(normalize(text)).filter((c) => /\S/.test(c));
  if (chars.length < 8) return [];
  const uniq = Array.from(new Set(chars));
  const all: { ch: string; cx: number }[] = [];
  for (const ch of uniq) {
    for (const rect of findCharRects(root, ch)) {
      all.push({ ch, cx: rect.left + rect.width / 2 });
    }
  }
  if (!all.length) return [];
  all.sort((a, b) => a.cx - b.cx);
  const clusters: typeof all[] = [];
  let cur: typeof all = [all[0]];
  for (let i = 1; i < all.length; i++) {
    if (all[i].cx - cur[cur.length - 1].cx > 80) {
      clusters.push(cur);
      cur = [all[i]];
    } else {
      cur.push(all[i]);
    }
  }
  clusters.push(cur);
  let bestCover = 0;
  for (const c of clusters) {
    const set = new Set(c.map((x) => x.ch));
    bestCover = Math.max(bestCover, uniq.filter((u) => set.has(u)).length);
  }
  if (bestCover < uniq.length) {
    return [
      `副文案「${text.slice(0, 10)}…」未排成单列（各字分散在多个水平位置，疑似折成多列），必须 nowrap 单列到底`,
    ];
  }
  return [];
}

export interface CanvasAuditMetrics {
  width: number
  height: number
  mainCenterX: number | null
  mainCenterY: number | null
  mainHeightRatio: number | null
  mainWidthRatio: number | null
  overflowCount: number
  gradients: number
  shapes: number
  images: number
  filters: number
  shadows: number
  borders: number
  visualLayers: number
}

export interface CanvasAuditResult {
  /** 无硬伤即可保存（建议项不影响保存） */
  ok: boolean
  /** 全部问题（硬伤 + 建议） */
  issues: string[]
  /** 硬伤：尺寸不符 / 文案缺失 / 严重不居中 / 文字溢出画布 */
  criticalIssues: string[]
  /** 建议：背景不够丰富 / 文字块偏宽 / 字号偏大等，不拦保存 */
  advisoryIssues: string[]
  metrics: CanvasAuditMetrics
  /** 是否真的做了测量（false = 无法测量，按通过处理） */
  measured: boolean
}

const MAIN_MAX_HEIGHT_RATIO = 0.34 // 主文案容器高 / 画布高
const MAIN_MAX_WIDTH_RATIO = 0.9 // 主文案容器宽 / 画布宽
const CENTER_TOLERANCE_X = 6 // 百分比
const CENTER_TOLERANCE_Y = 9
const OVERFLOW_TOLERANCE_PX = 4
const MIN_VISUAL_LAYERS = 3

function emptyMetrics(): CanvasAuditMetrics {
  return {
    width: 0,
    height: 0,
    mainCenterX: null,
    mainCenterY: null,
    mainHeightRatio: null,
    mainWidthRatio: null,
    overflowCount: 0,
    gradients: 0,
    shapes: 0,
    images: 0,
    filters: 0,
    shadows: 0,
    borders: 0,
    visualLayers: 0,
  }
}

function normalize(text: string): string {
  return foldT2S(
    String(text || "")
      .replace(/\s+/g, "")
      .replace(/[，。、：；！？,.:;!?"'“”‘’()（）【】《》〈〉\-—–_/|~·]/g, ""),
  )
}

/** 繁简归一（仅用于比较，不影响显示）：书法/繁体文案与简体清单视为同文 */
const T2S_PAIRS: [string, string][] = [
  ["戶", "户"], ["氣", "气"], ["對", "对"], ["勝", "胜"], ["給", "给"], ["榮", "荣"],
  ["億", "亿"], ["隨", "随"], ["頂", "顶"], ["無", "无"], ["負", "负"], ["選", "选"],
  ["這", "这"], ["個", "个"], ["們", "们"], ["說", "说"], ["話", "话"], ["語", "语"],
  ["讀", "读"], ["書", "书"], ["學", "学"], ["會", "会"], ["時", "时"], ["間", "间"],
  ["來", "来"], ["東", "东"], ["車", "车"], ["馬", "马"], ["買", "买"], ["賣", "卖"],
  ["錢", "钱"], ["銀", "银"], ["開", "开"], ["關", "关"], ["門", "门"], ["風", "风"],
  ["雲", "云"], ["電", "电"], ["頭", "头"], ["題", "题"], ["顏", "颜"], ["紅", "红"],
  ["綠", "绿"], ["藍", "蓝"], ["黃", "黄"], ["鳥", "鸟"], ["魚", "鱼"], ["龍", "龙"],
  ["鳳", "凤"], ["華", "华"], ["國", "国"], ["圓", "圆"], ["圖", "图"], ["園", "园"],
  ["樣", "样"], ["種", "种"], ["條", "条"], ["葉", "叶"], ["藝", "艺"], ["業", "业"],
  ["產", "产"], ["總", "总"], ["務", "务"], ["動", "动"], ["輕", "轻"], ["轉", "转"],
  ["輪", "轮"], ["廣", "广"], ["鄉", "乡"], ["鐘", "钟"], ["鋼", "钢"], ["鐵", "铁"],
  ["飛", "飞"], ["驗", "验"], ["體", "体"], ["讓", "让"], ["認", "认"], ["識", "识"],
  ["記", "记"], ["詞", "词"], ["課", "课"], ["護", "护"], ["醫", "医"], ["麼", "么"],
  ["齊", "齐"], ["齒", "齿"], ["虧", "亏"], ["漲", "涨"], ["價", "价"], ["貨", "货"],
  ["資", "资"], ["債", "债"], ["豐", "丰"], ["達", "达"], ["運", "运"], ["過", "过"],
  ["進", "进"], ["遠", "远"], ["邊", "边"], ["還", "还"], ["適", "适"], ["應", "应"],
  ["當", "当"], ["眾", "众"], ["優", "优"], ["傳", "传"], ["傷", "伤"], ["儀", "仪"],
];
const T2S_MAP = new Map(T2S_PAIRS);
function foldT2S(text: string): string {
  let out = "";
  for (const ch of text) out += T2S_MAP.get(ch) || ch;
  return out;
}

/** 最长公共子串长度（文案短，O(n*m) 可接受） */
function longestCommonSubstring(a: string, b: string): number {
  if (!a || !b) return 0;
  let best = 0;
  const dp = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let prev = 0;
    for (let j = 1; j <= b.length; j++) {
      const cur = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : 0;
      if (dp[j] > best) best = dp[j];
      prev = cur;
    }
  }
  return best;
}

/**
 * 收集画布上「可见文案」：排除 <style>/<script> 内容
 * （我们注入的防溢出样式里含 CSS 选择器文本，会被 textContent 读到，导致文案比对误报）。
 */
function collectVisibleText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("style, script").forEach((el) => el.remove());
  return normalize(clone.textContent || "");
}

/** 收集可见文字片段（逐文本节点，排除 style/script），用于白名单比对 */
function collectTextSegments(root: HTMLElement): string[] {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("style, script").forEach((el) => el.remove());
  const segs: string[] = [];
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const t = normalize(node.textContent || "");
    if (t) segs.push(t);
  }
  return segs;
}

/** 片段是否被白名单覆盖：片段包含于某条期望文案，或包含某条期望文案 */
function isSegmentAllowed(seg: string, allowed: string[]): boolean {
  for (const a of allowed) {
    if (!a) continue;
    if (a.includes(seg) || seg.includes(a)) return true;
  }
  return false;
}

/** 按文案找包含该文案的元素（用于副文案竖排几何检查）；只认覆盖率 ≥85% 的元素 */
function findElementByText(root: HTMLElement, rawText: string): HTMLElement | null {
  const needle = normalize(rawText);
  if (!needle) return null;
  let best: HTMLElement | null = null;
  let bestCoverage = 0.85; // 低于 85% 覆盖率的碎片不认
  const all = root.querySelectorAll<HTMLElement>("*");
  for (const el of all) {
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => normalize(n.textContent || ""))
      .join("");
    if (!own || own.length < needle.length * 0.85) continue;
    // 仅认「元素文案完整包含期望」或覆盖率 ≥85% 的大块，避免单字碎片误匹配
    const coverage = own.includes(needle) ? 1 : own.length / needle.length;
    if (coverage >= bestCoverage) {
      if (!best || el.querySelectorAll("*").length < best.querySelectorAll("*").length) {
        best = el;
        bestCoverage = coverage;
      }
    }
  }
  return best;
}

function parseHexColor(hex: string): [number, number, number] | null {
  const m = String(hex || "").trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function parseCssRgb(value: string): [number, number, number] | null {
  const m = String(value || "").match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/**
 * 计算容器内「文字」的实际外接框（用 Range 测真实字形边界，而不是容器框，
 * 避免把整屏 wrapper 误判成主文案过大）。
 */
function textUnionRect(container: HTMLElement) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let count = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();
  while (node) {
    const text = String(node.textContent || "").trim();
    if (text) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
        count += 1;
      }
    }
    node = walker.nextNode();
  }
  if (!count || !Number.isFinite(left)) return null;
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

/** 找出画布上某个字符的所有字形外接框（逐字符 Range 测量；style/script 不计） */
function findCharRects(root: HTMLElement, ch: string): DOMRect[] {
  const out: DOMRect[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && /^(STYLE|SCRIPT)$/i.test(parent.tagName)) {
      node = walker.nextNode();
      continue;
    }
    const text = String(node.textContent || "");
    for (let i = 0; i < text.length; i++) {
      if (foldT2S(text[i]) !== foldT2S(ch)) continue;
      try {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) out.push(rect as DOMRect);
      } catch {}
    }
    node = walker.nextNode();
  }
  return out;
}

/**
 * 主文案单列竖排的逐字几何检查（2+1 群组 / 横排 / 多列拆块都会被打回）。
 * 逐字取最大字形外接框（避免徽章同字干扰），要求：各字水平中心对齐、自上而下、并集高>宽、并集高 ≥55% 画布高。
 */
function checkMainVerticalColumn(
  root: HTMLElement,
  mainText: string,
  rootRect: DOMRect,
): {
  critical: string[];
  advisory: string[];
  union: { width: number; height: number } | null;
} {
  const critical: string[] = [];
  const advisory: string[] = [];
  const chars = Array.from(normalize(mainText)).filter((c) => /\S/.test(c));
  if (chars.length < 2) return { critical, advisory, union: null };
  const picked: { ch: string; rect: DOMRect }[] = [];
  for (const ch of chars) {
    const rects = findCharRects(root, ch);
    if (!rects.length) continue;
    rects.sort((a, b) => b.width * b.height - a.width * a.height);
    picked.push({ ch, rect: rects[0] });
  }
  if (picked.length < chars.length) return { critical, advisory, union: null };

  const widths = picked.map((p) => p.rect.width).sort((a, b) => a - b);
  const medW = widths[Math.floor(widths.length / 2)] || 1;
  const cxs = picked.map((p) => p.rect.left + p.rect.width / 2);
  const cx0 = cxs[0];
  if (cxs.some((cx) => Math.abs(cx - cx0) > medW * 0.55)) {
    critical.push(
      "主文案未排成一列（各字水平中心分散，疑似拆成多列或 2+1 群组）",
    );
  }
  for (let i = 1; i < picked.length; i++) {
    const prev = picked[i - 1].rect;
    const cur = picked[i].rect;
    const prevCy = prev.top + prev.height / 2;
    const curCy = cur.top + cur.height / 2;
    if (curCy <= prevCy + prev.height * 0.2) {
      critical.push(
        `主文案竖排顺序错误（「${picked[i - 1].ch}」与「${picked[i].ch}」未自上而下排列）`,
      );
      break;
    }
  }
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const p of picked) {
    left = Math.min(left, p.rect.left);
    top = Math.min(top, p.rect.top);
    right = Math.max(right, p.rect.right);
    bottom = Math.max(bottom, p.rect.bottom);
  }
  const union = { width: right - left, height: bottom - top };
  if (union.height <= union.width * 1.15) {
    critical.push(
      `主文案未竖排成单列（逐字外接框 ${Math.round(union.width)}×${Math.round(union.height)}，需要高明显大于宽）`,
    );
  }
  const hRatio = union.height / rootRect.height;
  if (hRatio < 0.55) {
    critical.push(
      `主文案过小 占画布高 ${(hRatio * 100).toFixed(0)}%（竖排大字需 ≥55%）`,
    );
  } else if (hRatio > 0.9) {
    advisory.push(`主文案偏高 占画布高 ${(hRatio * 100).toFixed(0)}%`);
  }
  return { critical, advisory, union };
}

/**
 * 找出「主文案元素」：优先用居中容器（translate(-50%,-50%)），
 * 否则退回「自有文字最长的那个元素」——这样能测量实际居中效果，
 * 而不是死查某一种 CSS 写法（模型用 flex 居中同样算居中）。
 */
function pickMainTextElement(root: HTMLElement): HTMLElement | null {
  const allTextElements: { el: HTMLElement; text: string; fontSize: number; isCentered: boolean }[] = [];

  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (/^(SCRIPT|STYLE|SVG|PATH|IMG|CANVAS|AUDIO|VIDEO)$/i.test(el.tagName)) return;
    const own = Array.from(el.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => String(node.textContent || "").trim())
      .join("");
    if (!own) return;

    let p: HTMLElement | null = el;
    let isCentered = false;
    while (p && p !== root) {
      const inlineStyle = p.getAttribute("style") || "";
      if (inlineStyle.includes("translate(-50%")) {
        isCentered = true;
        break;
      }
      p = p.parentElement;
    }

    const fontSize = parseFloat(window.getComputedStyle(el).fontSize) || 0;
    allTextElements.push({ el, text: own, fontSize, isCentered });
  });

  if (!allTextElements.length) return null;

  // 1) 优先查找带居中定位的文案组中字号最大的元素对应容器
  const centeredCandidates = allTextElements.filter((item) => item.isCentered);
  if (centeredCandidates.length > 0) {
    centeredCandidates.sort((a, b) => b.fontSize - a.fontSize);
    let p: HTMLElement = centeredCandidates[0].el;
    while (
      p.parentElement &&
      p.parentElement !== root &&
      (p.parentElement.getAttribute("style") || "").includes("translate(-50%")
    ) {
      p = p.parentElement;
    }
    return p;
  }

  // 2) 若无显式 translate(-50%)，按字号最大挑选主大标题
  allTextElements.sort((a, b) => b.fontSize - a.fontSize);
  return allTextElements[0].el;
}

function hasOwnText(el: HTMLElement): boolean {
  return Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && String(node.textContent || "").trim(),
  );
}

/**
 * 主文案行的外接框：取容器内「字号最大」的含文字元素。
 * 居中容器通常同时含主文案与副文案，用整体外接框会把副文案高度算进来，
 * 导致「主文案过高」系统性误报。
 */
function mainTextRect(container: HTMLElement) {
  let best: HTMLElement | null = null;
  let bestSize = 0;
  const candidates: HTMLElement[] = [];
  if (hasOwnText(container)) candidates.push(container);
  container.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (hasOwnText(el)) candidates.push(el);
  });
  candidates.forEach((el) => {
    const size = parseFloat(window.getComputedStyle(el).fontSize) || 0;
    if (size > bestSize) {
      bestSize = size;
      best = el;
    }
  });
  return best ? textUnionRect(best) : null;
}

/** 收集所有含文字块的「文字实际外接框」+ 标签（用于遮挡检测） */
function collectTextBlocks(root: HTMLElement): {
  el: HTMLElement;
  rect: { left: number; top: number; right: number; bottom: number; width: number; height: number };
  label: string;
}[] {
  const blocks: {
    el: HTMLElement;
    rect: { left: number; top: number; right: number; bottom: number; width: number; height: number };
    label: string;
  }[] = [];
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (/^(STYLE|SCRIPT|SVG)$/i.test(el.tagName)) return;
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => String(n.textContent || "").trim())
      .join("");
    if (!own) return;
    // 纯标点碎片（竖排文本被拆出的「，」「、」span）不是视觉块，不参与遮挡检测
    if (!normalize(own)) return;
    const r = textUnionRect(el) || el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    blocks.push({ el, rect: r, label: own.slice(0, 6) });
  });
  return blocks;
}

/** 文字块两两遮挡检测：重叠面积超过较小块的 18% 即硬伤 */
function textOverlapIssues(root: HTMLElement): string[] {
  const blocks = collectTextBlocks(root);
  const issues: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      // 父子嵌套的文字块（如列容器与其内的标点 span）天然重叠，不算遮挡
      if (
        blocks[i].el.contains(blocks[j].el) ||
        blocks[j].el.contains(blocks[i].el)
      ) {
        continue;
      }
      const a = blocks[i].rect;
      const b = blocks[j].rect;
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const inter = ix * iy;
      if (inter <= 0) continue;
      const smaller = Math.min(a.width * a.height, b.width * b.height);
      if (smaller > 0 && inter / smaller > 0.18) {
        const key = `${blocks[i].label}|${blocks[j].label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        issues.push(
          `文字遮挡：「${blocks[i].label}」与「${blocks[j].label}」互相压盖（重叠 ${Math.round((inter / smaller) * 100)}%），必须分开排布`,
        );
      }
    }
  }
  return issues;
}

/** 找到画布上的 html 模型子元素（机械修复写模型，重绘冲不掉） */
function getHtmlModelChild(): any | null {
  try {
    const store = (canvasStickerOptions as any)?.value;
    const children = store?.children || [];
    return children.find((c: any) => c && c.type === "html") || null;
  } catch {
    return null;
  }
}

function forceCanvasRerender() {
  try {
    const children = (canvasStickerOptions as any)?.value?.children;
    if (children && children.length) {
      const idx = children.findIndex((c: any) => c && c.type === "html");
      if (idx >= 0) children.splice(idx, 1, children[idx]);
    }
  } catch {}
}

/** 从 HTML 字符串的文本段里抠掉指定字符（不动标签） */
function stripCharsInHtml(
  html: string,
  foldedSet: Set<string>,
  onlySegmentsWith?: string[],
): string {
  const unique = onlySegmentsWith ? Array.from(new Set(onlySegmentsWith)) : null;
  return String(html || "").replace(/>([^<]+)</g, (match, text: string) => {
    if (unique) {
      const segFolded = foldT2S(normalize(text));
      if (segFolded.length < 2) return match;
      const overlap = unique.filter((c) => segFolded.includes(c)).length;
      if (overlap < Math.min(3, unique.length)) return match;
    }
    const cleaned = Array.from(text)
      .filter((ch) => !foldedSet.has(foldT2S(ch)))
      .join("");
    return `>${cleaned}<`;
  });
}

/** 机械补印章：brief 要求印章但 HTML 里没有渐变金块时，确定性插入（模型级，不惧重绘） */
function ensureSealInModel(): string | null {
  const child = getHtmlModelChild();
  if (!child || typeof child.htmlContent !== "string" || !child.htmlContent) return null;
  // 已有印章才算存在：seal_gold 标记，或「旋转 + 渐变」组合（任意 linearGradient 不算）
  const hasSeal =
    /seal_gold/i.test(child.htmlContent) ||
    (/rotate\(\s*1[0-9]/i.test(child.htmlContent) &&
      /linearGradient/i.test(child.htmlContent));
  if (hasSeal) return null;
  const sealSvg = `<svg style="position:absolute;left:88%;top:58%;width:calc(var(--canvas-html-vh) * 9);height:calc(var(--canvas-html-vh) * 9);transform:translate(-50%,-50%) rotate(15deg)" viewBox="0 0 100 100"><defs><linearGradient id="seal_gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8D9B5"/><stop offset="1" stop-color="#C9A24A"/></linearGradient></defs><rect width="100" height="100" rx="8" fill="url(#seal_gold)"/></svg>`;
  child.htmlContent = child.htmlContent + sealSvg;
  forceCanvasRerender();
  return "金箔印章已机械插入（模型级）";
}

/**
 * 主文案合并单列（确定性机械修复）：模型级手术优先——
 * 直接改 html 子元素的 htmlContent（内嵌竖排单列容器 + 抠掉散落的主字），
 * 跟着渲染管线走，不惧 Vue 重绘；无模型时退回 DOM 手术。
 */
function collapseMainToSingleColumn(
  root: HTMLElement,
  mainText: string,
  rootRect: DOMRect,
): string | null {
  const rawChars = Array.from(
    String(mainText || "")
      .replace(/\s+/g, "")
      .replace(/[，。、：；！？,.:;!?"'“”‘’()（）【】《》〈〉\-—–_/|~·]/g, ""),
  ).filter((c) => /\S/.test(c));
  if (rawChars.length < 2) return null;
  const foldedSet = new Set(rawChars.map((c) => foldT2S(c)));
  const display = rawChars.join("");
  const verticalDiv = `<div style="position:absolute;left:50%;top:50%;height:72%;transform:translate(-50%,-50%);writing-mode:vertical-rl;text-orientation:upright;white-space:nowrap;font-size:calc(var(--canvas-html-vh) * 23);font-weight:900;line-height:1.05;letter-spacing:0.06em">${display}</div>`;

  // 1) 模型级手术（首选）
  const child = getHtmlModelChild();
  if (child && typeof child.htmlContent === "string" && child.htmlContent) {
    const before = child.htmlContent;
    const hasMain = Array.from(foldedSet).some((c) =>
      before.split("<").some((seg) => foldT2S(seg).includes(c)),
    );
    if (hasMain || before.includes(display)) {
      child.htmlContent = stripCharsInHtml(before, foldedSet) + verticalDiv;
      forceCanvasRerender();
      return `主文案已机械合并为竖排单列·模型级（${display}）`;
    }
  }

  // 2) DOM 手术（兜底）
  let fontFamily = "";
  let fontColor = "";
  let maxFs = 0;
  let removed = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  for (const textNode of nodes) {
    const parent = textNode.parentElement;
    if (parent && /^(STYLE|SCRIPT)$/i.test(parent.tagName)) continue;
    const text = String(textNode.textContent || "");
    if (!text) continue;
    let hasMain = false;
    for (const ch of text) {
      if (foldedSet.has(foldT2S(ch))) {
        hasMain = true;
        break;
      }
    }
    if (!hasMain) continue;
    const cs = parent ? window.getComputedStyle(parent) : null;
    const fs = cs ? parseFloat(cs.fontSize) || 0 : 0;
    if (fs > maxFs) {
      maxFs = fs;
      fontFamily = cs?.fontFamily || fontFamily;
      fontColor = cs?.color || fontColor;
    }
    textNode.textContent = Array.from(text)
      .filter((ch) => !foldedSet.has(foldT2S(ch)))
      .join("");
    removed += 1;
  }
  if (!removed) return null;

  const div = document.createElement("div");
  div.textContent = display;
  const fontSize = Math.round(rootRect.height * 0.23);
  div.setAttribute(
    "style",
    [
      "position:absolute",
      "left:50%",
      "top:50%",
      "height:72%",
      "transform:translate(-50%,-50%)",
      "writing-mode:vertical-rl",
      "text-orientation:upright",
      "white-space:nowrap",
      `font-size:${fontSize}px`,
      "font-weight:900",
      "line-height:1.05",
      "letter-spacing:0.06em",
      fontFamily ? `font-family:${fontFamily}` : "",
      fontColor ? `color:${fontColor}` : "",
    ]
      .filter(Boolean)
      .join(";"),
  );
  root.appendChild(div);
  return `主文案已机械合并为竖排单列·DOM级（${display}）`;
}

/**
 * 长副文案折列/横排 → 机械合并为竖排单列（模型级手术优先）。
 * 只处理与长句有实质重叠（≥3 个共同字）的文本段，徽章单字等不会误伤。
 */
function collapseLongTextToSingleColumn(
  root: HTMLElement,
  text: string,
  rootRect: DOMRect,
): string | null {
  const rawChars = Array.from(
    String(text || "")
      .replace(/\s+/g, "")
      .replace(/[，。、：；！？,.:;!?"'“”‘’()（）【】《》〈〉\-—–_/|~·]/g, ""),
  ).filter((c) => /\S/.test(c));
  if (rawChars.length < 8) return null;
  const folded = rawChars.map((c) => foldT2S(c));
  const foldedSet = new Set(folded);
  const uniqueFolded = Array.from(foldedSet);
  const display = rawChars.join("");

  // 定位：该句现有块的平均中心（从 DOM 测量）
  let sumCx = 0;
  let count = 0;
  let top = Infinity;
  let bottom = -Infinity;
  let maxFs = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  for (const textNode of nodes) {
    const parent = textNode.parentElement;
    if (parent && /^(STYLE|SCRIPT)$/i.test(parent.tagName)) continue;
    const textContent = String(textNode.textContent || "");
    if (!textContent) continue;
    const nodeFolded = foldT2S(normalize(textContent));
    if (nodeFolded.length < 2) continue;
    const overlap = uniqueFolded.filter((c) => nodeFolded.includes(c)).length;
    if (overlap < Math.min(3, uniqueFolded.length)) continue;
    const parentEl = parent as HTMLElement | null;
    if (parentEl) {
      const r = parentEl.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        sumCx += r.left + r.width / 2;
        count += 1;
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
        const fs = parseFloat(window.getComputedStyle(parentEl).fontSize) || 0;
        if (fs > maxFs) maxFs = fs;
      }
    }
  }
  if (!count) return null;

  const cx = sumCx / count;
  const cy = (top + bottom) / 2;
  const xPct = ((cx - rootRect.left) / rootRect.width) * 100;
  const yPct = ((cy - rootRect.top) / rootRect.height) * 100;
  const fontSize =
    maxFs > 8 ? Math.round(maxFs) : Math.round(rootRect.height * 0.035);
  const columnDiv = `<div style="position:absolute;left:${xPct.toFixed(1)}%;top:${yPct.toFixed(1)}%;transform:translate(-50%,-50%);writing-mode:vertical-rl;text-orientation:upright;white-space:nowrap;font-size:${fontSize}px;line-height:1.15">${display}</div>`;

  // 1) 模型级手术（首选）：strip + append 都写进 htmlContent，重绘冲不掉
  const child = getHtmlModelChild();
  if (child && typeof child.htmlContent === "string" && child.htmlContent) {
    const before = child.htmlContent;
    const hasText = uniqueFolded.some((c) =>
      foldT2S(normalize(before.replace(/<[^>]+>/g, ""))).includes(c),
    );
    if (hasText) {
      child.htmlContent = stripCharsInHtml(before, foldedSet, uniqueFolded) + columnDiv;
      forceCanvasRerender();
      return `长文案「${display.slice(0, 8)}…」已机械合并为竖排单列·模型级`;
    }
  }

  // 2) DOM 手术（兜底）
  let removed = 0;
  for (const textNode of nodes) {
    const parent = textNode.parentElement;
    if (parent && /^(STYLE|SCRIPT)$/i.test(parent.tagName)) continue;
    const textContent = String(textNode.textContent || "");
    if (!textContent) continue;
    const nodeFolded = foldT2S(normalize(textContent));
    if (nodeFolded.length < 2) continue;
    const overlap = uniqueFolded.filter((c) => nodeFolded.includes(c)).length;
    if (overlap < Math.min(3, uniqueFolded.length)) continue;
    textNode.textContent = Array.from(textContent)
      .filter((ch) => !foldedSet.has(foldT2S(ch)))
      .join("");
    removed += 1;
  }
  if (!removed) return null;

  const div = document.createElement("div");
  div.textContent = display;
  div.setAttribute(
    "style",
    [
      "position:absolute",
      `left:${xPct.toFixed(1)}%`,
      `top:${yPct.toFixed(1)}%`,
      "transform:translate(-50%,-50%)",
      "writing-mode:vertical-rl",
      "text-orientation:upright",
      "white-space:nowrap",
      `font-size:${fontSize}px`,
      "line-height:1.15",
    ].join(";"),
  );
  root.appendChild(div);
  return `长文案「${display.slice(0, 8)}…」已机械合并为竖排单列·DOM级`;
}

/**
 * 保存前自动修复：对可机械修复的问题直接改 DOM（随后立即渲染保存，改动会体现在成品里）。
 * 只做「不破坏设计」的最小改动：主文案按比例缩小、溢出文字限宽换行、去掉截断写法。
 * 返回修复说明（用于记录）。
 */
export function repairCanvasLayout(
  root: HTMLElement,
  opts?: { allowTallMain?: boolean; mainText?: string; texts?: string[]; ensureSeal?: boolean },
): string[] {
  const fixes: string[] = [];
  const rootRect = root.getBoundingClientRect();
  if (!rootRect.width || !rootRect.height) return fixes;

  // -1) 机械补印章（模型级，先于其它修复）
  if (opts?.ensureSeal) {
    try {
      const msg = ensureSealInModel();
      if (msg) fixes.push(msg);
    } catch (error) {
      console.warn("[CanvasAudit] 印章插入失败:", error);
    }
  }

  // 0) 竖排大字 2+1/横排 → 机械合并为单列（必须在缩放/居中之前）
  if (opts?.allowTallMain && opts?.mainText) {
    try {
      const msg = collapseMainToSingleColumn(root, opts.mainText, rootRect);
      if (msg) fixes.push(msg);
    } catch (error) {
      console.warn("[CanvasAudit] 主文案合并失败:", error);
    }
  }
  // 0b) 长副文案折列/横排 → 机械合并为单列
  if (opts?.allowTallMain && Array.isArray(opts?.texts)) {
    for (const t of opts.texts) {
      if (!t || t === opts.mainText) continue;
      try {
        const msg = collapseLongTextToSingleColumn(root, t, rootRect);
        if (msg) fixes.push(msg);
      } catch (error) {
        console.warn("[CanvasAudit] 副文案合并失败:", error);
      }
    }
  }

  // 1) 主文案：高度超限则按比例缩小字号
  const centered = pickMainTextElement(root);
  if (centered) {
    // 字号常写在子元素上，必须递归缩小「所有含文字元素」的字号，只缩容器无效
    const targets: HTMLElement[] = [centered];
    centered.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const hasText = Array.from(el.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && String(node.textContent || "").trim(),
      );
      if (hasText) targets.push(el);
    });

    let r = mainTextRect(centered) || textUnionRect(centered) || centered.getBoundingClientRect();
    // 竖排书法大字允许占画布高 85%；常规主文案仍按 26% 收敛
    const targetHeight = rootRect.height * (opts?.allowTallMain ? 0.85 : 0.26);
    if (r.height > targetHeight && r.height > 0) {
      // 一次算准缩放比例，避免逐次 0.85 缩到次数用尽仍不达标
      const factor = Math.max(0.25, Math.min(0.95, targetHeight / r.height));
      targets.forEach((el) => {
        const fs = parseFloat(window.getComputedStyle(el).fontSize) || 0;
        if (fs > 10) {
          el.style.fontSize = `${Math.max(10, Math.round(fs * factor))}px`;
        }
      });
      r = mainTextRect(centered) || textUnionRect(centered) || centered.getBoundingClientRect();
      fixes.push(`主文案字号已按 ${(factor * 100).toFixed(0)}% 缩放以适配画布`);
    }

    // 强制居中：把主文案容器拉回画布正中心（这是最常见的不合理之处）
    {
      const box = mainTextRect(centered) || textUnionRect(centered) || centered.getBoundingClientRect();
      const dx = (rootRect.left + rootRect.width / 2) - (box.left + box.width / 2);
      const dy = (rootRect.top + rootRect.height / 2) - (box.top + box.height / 2);
      if (Math.abs(dx) > rootRect.width * 0.02 || Math.abs(dy) > rootRect.height * 0.02) {
        // 用「测量偏移量」做 transform 位移，而不是 left:50%/top:50%：
        // 后者是相对最近的定位祖先，嵌套容器里根本回不到画布中心。
        const prev = centered.style.transform || "";
        centered.style.transform = `${prev} translate(${Math.round(dx)}px, ${Math.round(dy)}px)`.trim();
        fixes.push(`主文案已按偏移量重新居中（${Math.round(dx)}px, ${Math.round(dy)}px）`);
      }
    }
    if (r.width > rootRect.width * 0.88) {
      centered.style.maxWidth = "86%";
      centered.style.whiteSpace = "normal";
      centered.style.overflowWrap = "anywhere";
      centered.style.wordBreak = "break-word";
      centered.style.textOverflow = "clip";
      fixes.push("主文案已限宽并允许换行");
    }
  }

  // 2) 溢出的文字元素：优先缩字号收进边界（不破坏 nowrap 竖排列），仍溢出才限宽换行
  const tolX = rootRect.width * 0.02;
  const tolY = rootRect.height * 0.02;
  let repaired = 0;
  let shrunk = 0;
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const hasOwnText = Array.from(el.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && String(node.textContent || "").trim(),
    );
    if (!hasOwnText) return;
    for (let pass = 0; pass < 3; pass++) {
      const r = el.getBoundingClientRect();
      const out =
        r.right > rootRect.right + tolX ||
        r.left < rootRect.left - tolX ||
        r.bottom > rootRect.bottom + tolY ||
        r.top < rootRect.top - tolY;
      if (!out) break;
      const fs = parseFloat(window.getComputedStyle(el).fontSize) || 0;
      if (fs > 10) {
        el.style.fontSize = `${Math.max(8, Math.round(fs * 0.82))}px`;
        shrunk += 1;
      } else {
        el.style.maxWidth = "86%";
        el.style.whiteSpace = "normal";
        el.style.overflowWrap = "anywhere";
        el.style.wordBreak = "break-word";
        el.style.textOverflow = "clip";
        repaired += 1;
        break;
      }
    }
  });
  if (shrunk) fixes.push(`${shrunk} 处溢出文字已缩字号收进边界`);
  if (repaired) fixes.push(`${repaired} 处溢出文字已限宽换行`);

  // 3) 文字互相遮挡：双方缩字号分离（最多 3 轮，每轮各缩 18%）
  for (let round = 0; round < 3; round++) {
    const blocks = collectTextBlocks(root);
    let separated = true;
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (
          blocks[i].el.contains(blocks[j].el) ||
          blocks[j].el.contains(blocks[i].el)
        ) {
          continue;
        }
        const a = blocks[i].rect;
        const b = blocks[j].rect;
        const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const inter = ix * iy;
        const smaller = Math.min(a.width * a.height, b.width * b.height);
        if (inter > 0 && smaller > 0 && inter / smaller > 0.18) {
          separated = false;
          [blocks[i].el, blocks[j].el].forEach((el) => {
            const fs = parseFloat(window.getComputedStyle(el).fontSize) || 0;
            if (fs > 10) el.style.fontSize = `${Math.max(8, Math.round(fs * 0.82))}px`;
          });
          fixes.push(
            `遮挡「${blocks[i].label}」×「${blocks[j].label}」已缩字号分离（第 ${round + 1} 轮）`,
          );
        }
      }
    }
    if (separated) break;
  }

  return fixes;
}

/**
 * 审查当前画布
 */
export async function auditCurrentCanvas(
  options: CanvasAuditOptions = {},
): Promise<CanvasAuditResult> {
  const metrics = emptyMetrics();
  const criticalIssues: string[] = [];
  const advisoryIssues: string[] = [];

  // 等 Vue 把最新设计重绘完再测量，否则会测到上一张画布（竞态）
  try {
    const vueMod: any = await import("vue");
    if (typeof vueMod.nextTick === "function") await vueMod.nextTick();
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 350));

  try {
    const mod: any = await import("@/components/design/layout/canvas");
    const controller: any = mod.currentCanvasControllerInstance?.value;
    const root: HTMLElement | null =
      (controller?.el as HTMLElement) ||
      (document.querySelector("#this_is_canvas_id") as HTMLElement | null);
    if (!root) {
      return { ok: true, issues: [], criticalIssues: [], advisoryIssues: [], metrics, measured: false };
    }

    const rootRect = root.getBoundingClientRect();
    if (!rootRect.width || !rootRect.height) {
      return { ok: true, issues: [], criticalIssues: [], advisoryIssues: [], metrics, measured: false };
    }

    const W = Math.round(root.clientWidth || rootRect.width);
    const H = Math.round(root.clientHeight || rootRect.height);
    metrics.width = W;
    metrics.height = H;

    // 1) 尺寸
    if (options.expectedWidth && Math.abs(W - options.expectedWidth) > 2) {
      criticalIssues.push(`画布宽不符 ${W}≠${options.expectedWidth}`);
    }
    if (options.expectedHeight && Math.abs(H - options.expectedHeight) > 2) {
      criticalIssues.push(`画布高不符 ${H}≠${options.expectedHeight}`);
    }

    // 2) 文案是否真的在画面上
    if (options.expectedTexts?.length) {
      const pageText = collectVisibleText(root);
      options.expectedTexts.forEach((expected, index) => {
        const needle = normalize(expected);
        if (!needle) return;
        // 竖排模式：长副文案必须竖排单列（高>宽），折列/横排算硬伤
        if (options.expectVerticalMain && needle.length >= 8) {
          const el = findElementByText(root, expected);
          if (el) {
            const er = el.getBoundingClientRect();
            const areaRatio =
              (er.width * er.height) / Math.max(1, rootRect.width * rootRect.height);
            if (
              er.width > 0 &&
              er.height > 0 &&
              areaRatio > 0.005 &&
              er.width >= er.height
            ) {
              criticalIssues.push(
                `副文案「${expected.slice(0, 12)}…」未竖排单列（外接框 ${Math.round(er.width)}×${Math.round(er.height)}）`,
              );
            }
          }
          // 折列检测：各块水平中心分散 ≥2 列即硬伤（机械修复可合并）
          criticalIssues.push(...longTextColumnIssues(root, expected));
        }
        if (pageText.includes(needle)) return;
        // 短语（徽章单字环等）拆在多个元素时整串永远拼不齐——逐字齐就算在场
        if (needle.length <= 6) {
          const missing = Array.from(needle).filter((c) => !pageText.includes(c));
          if (!missing.length) return;
        }
        // 用最长公共子串比例判定：brief 里的文案可能比画布实际文案长
        // （例如把「躺赚·小金库」整个标题写成主文案），严格全等会误报
        const ratio = longestCommonSubstring(needle, pageText) / needle.length;
        if (ratio >= 0.7) return;
        // 主文案（第 1 条）缺失算硬伤；副文案缺失只作建议——主文案才是核心内容
        const isMain = index === 0;
        const msg = `画面上找不到文案「${expected}」`;
        if (isMain) {
          if (ratio >= 0.4) advisoryIssues.push(`${msg}（匹配 ${Math.round(ratio * 100)}%）`);
          else criticalIssues.push(msg);
        } else if (ratio >= 0.3) {
          advisoryIssues.push(`${msg}（匹配 ${Math.round(ratio * 100)}%）`);
        } else {
          advisoryIssues.push(`副文案缺失「${expected}」`);
        }
      });

      // 2a) 短语逐字存在性（徽章字/短标语被拆进多元素时整串匹配会失效，逐字兜底）
      options.expectedTexts.forEach((expected) => {
        const needle = normalize(expected);
        if (needle.length < 2 || needle.length > 6) return;
        const missing = Array.from(needle).filter((c) => !pageText.includes(c));
        if (missing.length) {
          criticalIssues.push(`文案「${expected}」缺字：${missing.join("、")}`);
        }
      });

      // 2b) 严格白名单：画面上不得出现清单外的自创文字（防自创标语/副标题）
      if (options.strictTextWhitelist) {
        const allowed = options.expectedTexts
          .map((t) => normalize(t))
          .filter(Boolean);
        const segments = collectTextSegments(root);
        // 单字片段放行（徽章单字等）；2 字以上必须落在清单内
        const extras = segments.filter(
          (seg) => seg.length >= 2 && !isSegmentAllowed(seg, allowed),
        );
        if (extras.length) {
          const shown = Array.from(new Set(extras)).slice(0, 6).join("、");
          criticalIssues.push(`画面出现清单外文字：${shown}`);
        }
      }
    }

    // 2c) 背景色锁定：与期望 HEX 偏离过大记硬伤
    if (options.expectedBackground) {
      const expectedRgb = parseHexColor(options.expectedBackground);
      const computedBg =
        typeof getComputedStyle === "function"
          ? getComputedStyle(root).backgroundColor
          : "";
      const actualRgb = parseCssRgb(computedBg || "");
      if (expectedRgb && actualRgb) {
        const dist = colorDistance(expectedRgb, actualRgb);
        if (dist > 90) {
          criticalIssues.push(
            `背景色不符：期望 ${options.expectedBackground}，实际 ${computedBg}`,
          );
        }
      }
    }

    // 3) 文字溢出（只查含文字的元素；装饰层有意出血是正常设计，不算问题）
    const tolX = Math.max(OVERFLOW_TOLERANCE_PX, rootRect.width * 0.02);
    const tolY = Math.max(OVERFLOW_TOLERANCE_PX, rootRect.height * 0.02);
    let overflow = 0;
    root.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const hasOwnText = Array.from(el.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && String(node.textContent || "").trim(),
      );
      if (!hasOwnText) return;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      if (
        r.right > rootRect.right + tolX ||
        r.left < rootRect.left - tolX ||
        r.bottom > rootRect.bottom + tolY ||
        r.top < rootRect.top - tolY
      ) {
        overflow += 1;
      }
    });
    metrics.overflowCount = overflow;
    if (overflow > 0) criticalIssues.push(`有 ${overflow} 处文字超出画布边界`);

    // 3b) 文字互相遮挡（压盖）——硬伤
    criticalIssues.push(...textOverlapIssues(root));

    // 4) 主文案居中 + 字号上限
    const centered = pickMainTextElement(root);
    if (!centered) {
      if ((root.textContent || "").trim().length > 4) {
        criticalIssues.push("未找到可测量的主文案元素");
      }
    } else {
      // 用「文字实际外接框」而不是容器框，避免整屏 wrapper 被误判
      const box = mainTextRect(centered) || textUnionRect(centered) || centered.getBoundingClientRect();
      const r = box;
      const cx = ((r.left + r.width / 2 - rootRect.left) / rootRect.width) * 100;
      const cy = ((r.top + r.height / 2 - rootRect.top) / rootRect.height) * 100;
      metrics.mainCenterX = Number(cx.toFixed(1));
      metrics.mainCenterY = Number(cy.toFixed(1));
      metrics.mainHeightRatio = Number((r.height / rootRect.height).toFixed(3));
      metrics.mainWidthRatio = Number((r.width / rootRect.width).toFixed(3));
      const dx = Math.abs(cx - 50);
      const dy = Math.abs(cy - 50);
      if (dx > CENTER_TOLERANCE_X * 2 || dy > CENTER_TOLERANCE_Y * 2) {
        criticalIssues.push(`主文案严重偏离中心 (${cx.toFixed(1)}%, ${cy.toFixed(1)}%)`);
      } else if (dx > CENTER_TOLERANCE_X || dy > CENTER_TOLERANCE_Y) {
        advisoryIssues.push(`主文案略偏 (${cx.toFixed(1)}%, ${cy.toFixed(1)}%)`);
      }
      const hRatio = r.height / rootRect.height;
      const wRatio = r.width / rootRect.width;
      // 竖排单列硬性：逐字外接框检查优先（2+1 群组/多列拆块都会被打回）；无逐字数据时退回整体外接框
      if (options.expectVerticalMain) {
        const mainText = (options.expectedTexts && options.expectedTexts[0]) || "";
        const col = checkMainVerticalColumn(root, mainText, rootRect);
        if (col.union) {
          criticalIssues.push(...col.critical);
          advisoryIssues.push(...col.advisory);
          metrics.mainHeightRatio = Number(
            (col.union.height / rootRect.height).toFixed(3),
          );
          metrics.mainWidthRatio = Number(
            (col.union.width / rootRect.width).toFixed(3),
          );
        } else {
          if (r.height <= r.width * 1.05) {
            criticalIssues.push(
              `主文案未竖排成单列（外接框 ${Math.round(r.width)}×${Math.round(r.height)}，需要高明显大于宽）`,
            );
          }
          if (hRatio < 0.55) {
            criticalIssues.push(
              `主文案过小 占画布高 ${(hRatio * 100).toFixed(0)}%（竖排大字需 ≥55%）`,
            );
          } else if (hRatio > 0.9) {
            advisoryIssues.push(`主文案偏高 占画布高 ${(hRatio * 100).toFixed(0)}%`);
          }
        }
      } else if (hRatio > MAIN_MAX_HEIGHT_RATIO) {
        advisoryIssues.push(`主文案偏高 占画布高 ${(hRatio * 100).toFixed(0)}%`);
      }
      // 过宽若导致溢出会被「文字溢出」硬伤捕获，这里只作建议
      if (wRatio > MAIN_MAX_WIDTH_RATIO) {
        advisoryIssues.push(`文字块偏宽 占画布宽 ${(wRatio * 100).toFixed(0)}%`);
      }
    }

    // 5) 背景丰富度（图层启发式）
    let gradients = 0;
    let images = 0;
    let filters = 0;
    let shadows = 0;
    let borders = 0;
    let shapes = 0;
    root.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const cs = window.getComputedStyle(el);
      const bgImage = cs.backgroundImage || "none";
      // tagName 统一转大写比较：SVG 元素在 DOM 里是小写（svg/rect/path…），大小写敏感会漏计
      const tag = String(el.tagName || "").toUpperCase();
      if (tag === "IMG" || tag === "IMAGE") images += 1;
      if (bgImage.includes("gradient")) gradients += 1;
      else if (bgImage !== "none") images += 1;
      // SVG 只有「可见且带渐变/滤镜/嵌图」才算图片图层（印章金渐变、feTurbulence 肌理）；
      // 纯描边圆环/折线只是几何装饰，零尺寸/透明的 SVG 也不能冒充印章/肌理过图层闸门
      if (tag === "SVG") {
        const inner = el.innerHTML || "";
        const r = el.getBoundingClientRect();
        const opacity = parseFloat(cs.opacity || "1");
        const visible =
          r.width > 2 &&
          r.height > 2 &&
          opacity > 0.05 &&
          cs.display !== "none" &&
          cs.visibility !== "hidden";
        if (
          visible &&
          /feTurbulence|linearGradient|radialGradient|<image\b/i.test(inner)
        ) {
          images += 1;
        }
      }
      if (cs.filter && cs.filter !== "none") filters += 1;
      if (cs.boxShadow && cs.boxShadow !== "none") shadows += 1;
      if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none") borders += 1;
      if (/^(SVG|PATH|CIRCLE|ELLIPSE|POLYGON|RECT|LINE|IMG|CANVAS)$/.test(tag)) shapes += 1;
    });
    // 根节点满版肌理（background 挂在画布根上时不在 querySelectorAll("*") 里）
    const rootBg = window.getComputedStyle(root).backgroundImage || "none";
    if (rootBg.includes("gradient")) gradients += 1;
    else if (rootBg !== "none") images += 1;
    metrics.gradients = gradients;
    metrics.images = images;
    metrics.filters = filters;
    metrics.shadows = shadows;
    metrics.borders = borders;
    metrics.shapes = shapes;
    const visualLayers = gradients + images + filters + shadows + borders + shapes;
    metrics.visualLayers = visualLayers;

    // 外部图片素材（印章/肌理等）数量硬查：只认真图片图层（img/背景图/带渐变滤镜的 SVG），
    // 纯几何描边（圆环/折线）不算——否则徽章环会冒充印章/肌理误放行
    if (options.requireImageLayers) {
      if (images < options.requireImageLayers) {
        criticalIssues.push(
          `外部图片素材不足：画面仅有 ${images} 个图片图层（要求 ≥${options.requireImageLayers}；印章须带渐变的 <svg>、肌理须带 feTurbulence 的 <svg> 或真实图片，纯几何描边不算）`,
        );
      }
    }

    // 印章硬查（brief 要求印章时）：画面须有「金渐变+旋转」的印章图层；缺=硬伤（附诊断）
    if (options.requireSeal) {
      const html = root.innerHTML || "";
      const hasSeal =
        /seal_gold/i.test(html) ||
        (/rotate\(\s*1[0-9]/i.test(html) && /linearGradient/i.test(html));
      if (!hasSeal) {
        const child: any = getHtmlModelChild();
        criticalIssues.push(
          `缺金箔印章（需要 rotate(15deg) + linearGradient 的 <svg> 印章）；诊断：htmlChild=${child ? "有" : "无"}, htmlContent 长度=${child?.htmlContent?.length ?? 0}`,
        );
      }
    }

    const concreteLayers = images + filters + shadows + borders + shapes;
    if (visualLayers < MIN_VISUAL_LAYERS) {
      advisoryIssues.push(`背景过于简单（可见图层仅 ${visualLayers} 层，建议 ≥${MIN_VISUAL_LAYERS}）`);
    } else if (concreteLayers === 0) {
      advisoryIssues.push("背景只有渐变、缺少插画/纹理/光影等具象元素");
    }
  } catch (error) {
    console.warn("[CanvasAudit] 测量失败，按通过处理:", error);
    return { ok: true, issues: [], criticalIssues: [], advisoryIssues: [], metrics, measured: false };
  }

  return {
    ok: criticalIssues.length === 0,
    issues: [...criticalIssues, ...advisoryIssues],
    criticalIssues,
    advisoryIssues,
    metrics,
    measured: true,
  };
}
