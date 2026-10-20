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
  return String(text || "")
    .replace(/\s+/g, "")
    .replace(/[，。、：；！？,.:;!?"'“”‘’()（）【】《》〈〉\-—–_/|~·]/g, "")
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

/**
 * 保存前自动修复：对可机械修复的问题直接改 DOM（随后立即渲染保存，改动会体现在成品里）。
 * 只做「不破坏设计」的最小改动：主文案按比例缩小、溢出文字限宽换行、去掉截断写法。
 * 返回修复说明（用于记录）。
 */
export function repairCanvasLayout(
  root: HTMLElement,
  opts?: { allowTallMain?: boolean },
): string[] {
  const fixes: string[] = [];
  const rootRect = root.getBoundingClientRect();
  if (!rootRect.width || !rootRect.height) return fixes;

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

  // 2) 检查所有含文字元素，若超出画布左右边界则自动限宽并换行
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const hasText = Array.from(el.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && String(node.textContent || "").trim(),
    );
    if (!hasText) return;
    const r = el.getBoundingClientRect();
    if (r.right > rootRect.right + 2 || r.left < rootRect.left - 2) {
      el.style.maxWidth = "90%";
      el.style.whiteSpace = "normal";
      el.style.overflowWrap = "break-word";
      el.style.wordBreak = "break-word";
      fixes.push("文字元素已自动限宽收拢以防止超出画布");
    }
  });

  // 2) 溢出的文字元素：限宽 + 换行，去掉截断写法
  const tolX = rootRect.width * 0.02;
  const tolY = rootRect.height * 0.02;
  let repaired = 0;
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const hasOwnText = Array.from(el.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && String(node.textContent || "").trim(),
    );
    if (!hasOwnText) return;
    const r = el.getBoundingClientRect();
    const out =
      r.right > rootRect.right + tolX ||
      r.left < rootRect.left - tolX ||
      r.bottom > rootRect.bottom + tolY ||
      r.top < rootRect.top - tolY;
    if (!out) return;
    el.style.maxWidth = "86%";
    el.style.whiteSpace = "normal";
    el.style.overflowWrap = "anywhere";
    el.style.wordBreak = "break-word";
    el.style.textOverflow = "clip";
    repaired += 1;
  });
  if (repaired) fixes.push(`${repaired} 处溢出文字已限宽换行`);

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
        }
        if (pageText.includes(needle)) return;
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
      // 竖排单列硬性：要求主文案外接框“高>宽”（横排/2+1 群组会宽>高）
      if (options.expectVerticalMain && r.height <= r.width * 1.05) {
        criticalIssues.push(
          `主文案未竖排成单列（外接框 ${Math.round(r.width)}×${Math.round(r.height)}，需要高明显大于宽）`,
        );
      }
      // 主文案高度：竖排书法模式给下限+放宽上限；常规模式只作建议
      if (options.expectVerticalMain) {
        if (hRatio < 0.35) {
          criticalIssues.push(
            `主文案过小 占画布高 ${(hRatio * 100).toFixed(0)}%（竖排大字需 ≥35%）`,
          );
        } else if (hRatio > 0.88) {
          advisoryIssues.push(`主文案偏高 占画布高 ${(hRatio * 100).toFixed(0)}%`);
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
      if (bgImage.includes("gradient")) gradients += 1;
      else if (bgImage !== "none") images += 1;
      if (cs.filter && cs.filter !== "none") filters += 1;
      if (cs.boxShadow && cs.boxShadow !== "none") shadows += 1;
      if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none") borders += 1;
      if (/^(SVG|PATH|CIRCLE|ELLIPSE|POLYGON|RECT|LINE|IMG|CANVAS)$/.test(el.tagName)) shapes += 1;
    });
    metrics.gradients = gradients;
    metrics.images = images;
    metrics.filters = filters;
    metrics.shadows = shadows;
    metrics.borders = borders;
    metrics.shapes = shapes;
    const visualLayers = gradients + images + filters + shadows + borders + shapes;
    metrics.visualLayers = visualLayers;

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
