import { fetchFile } from "@/api";

/**
 * 字体字形覆盖校验（缺字守卫）
 *
 * 背景：字体文件常常是「子集字体」，只包含部分汉字。当主文案里出现字体没有的字形时，
 * 浏览器会静默回退到系统字体，最终导出的成品会出现「一半书法字、一半宋体」的隐性缺陷，
 * 而画布数据、尺寸、居中审核全部正常，任何质检都发现不了。
 *
 * 本模块解析 TTF/OTF 的 cmap 表，判断指定文字在该字体里是否真的有字形，
 * 供 canvas.addHtml / canvas.loadFont 在落图前做一次硬校验。
 */

const cmapCache = new Map<string, Set<number> | null>();
const cmapPending = new Map<string, Promise<Set<number> | null>>();

/** 已加载字体的 id -> url 映射（由 fetchFontFace 注册，避免重复下载字体文件） */
const loadedFontUrls = new Map<string, string>();

export function registerLoadedFontUrl(id: string, url: string): void {
  if (id && url) loadedFontUrls.set(id, url);
}

export function getLoadedFontUrl(id: string): string | undefined {
  return loadedFontUrls.get(id);
}

function u16(view: DataView, offset: number): number {
  return view.getUint16(offset, false);
}

function u32(view: DataView, offset: number): number {
  return view.getUint32(offset, false);
}

/** 解析字体文件的 cmap，返回「有真实字形」的码点集合 */
export function parseFontCmap(buffer: ArrayBuffer): Set<number> | null {
  if (buffer.byteLength < 12) return null;
  const view = new DataView(buffer);

  const numTables = u16(view, 4);
  let cmapOffset = -1;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (rec + 16 > buffer.byteLength) break;
    const tag = String.fromCharCode(
      view.getUint8(rec),
      view.getUint8(rec + 1),
      view.getUint8(rec + 2),
      view.getUint8(rec + 3),
    );
    if (tag === "cmap") {
      cmapOffset = u32(view, rec + 8);
      break;
    }
  }
  if (cmapOffset < 0 || cmapOffset + 4 > buffer.byteLength) return null;

  const numSub = u16(view, cmapOffset + 2);
  let subOffset = -1;
  let subFormat = 0;
  for (let i = 0; i < numSub; i++) {
    const rec = cmapOffset + 4 + i * 8;
    if (rec + 8 > buffer.byteLength) break;
    const off = cmapOffset + u32(view, rec + 4);
    if (off + 2 > buffer.byteLength) continue;
    const fmt = u16(view, off);
    // 优先 format 12（含扩展区），否则 format 4
    if (fmt === 12) {
      subOffset = off;
      subFormat = 12;
      break;
    }
    if (fmt === 4 && subOffset < 0) {
      subOffset = off;
      subFormat = 4;
    }
  }
  if (subOffset < 0) return null;

  const covered = new Set<number>();

  if (subFormat === 4) {
    const segX2 = u16(view, subOffset + 6);
    const seg = segX2 / 2;
    const endBase = subOffset + 14;
    const startBase = endBase + segX2 + 2;
    const deltaBase = startBase + segX2;
    const rangeBase = deltaBase + segX2;
    for (let i = 0; i < seg; i++) {
      const end = u16(view, endBase + i * 2);
      const start = u16(view, startBase + i * 2);
      if (start > end || start === 0xffff) continue;
      const delta = view.getInt16(deltaBase + i * 2, false);
      const rangeOffset = u16(view, rangeBase + i * 2);
      for (let code = start; code <= end && code <= 0xffff; code++) {
        if (code === 0xffff) continue;
        let glyphId = 0;
        if (rangeOffset === 0) {
          glyphId = (code + delta) & 0xffff;
        } else {
          const gi = rangeBase + i * 2 + rangeOffset + (code - start) * 2;
          if (gi + 2 > buffer.byteLength) continue;
          glyphId = u16(view, gi);
          if (glyphId !== 0) glyphId = (glyphId + delta) & 0xffff;
        }
        if (glyphId !== 0) covered.add(code);
      }
    }
  } else {
    const nGroups = u32(view, subOffset + 12);
    const groupsBase = subOffset + 16;
    for (let i = 0; i < nGroups; i++) {
      const g = groupsBase + i * 12;
      if (g + 12 > buffer.byteLength) break;
      const start = u32(view, g);
      const end = u32(view, g + 4);
      const startGlyph = u32(view, g + 8);
      if (end < start) continue;
      for (let code = start; code <= end; code++) {
        if (startGlyph + (code - start) !== 0) covered.add(code);
      }
    }
  }

  return covered.size > 0 ? covered : null;
}

/** 下载并解析字体（同一 URL 只解析一次，结果常驻内存） */
export async function getFontCmap(url: string): Promise<Set<number> | null> {
  if (!url) return null;
  if (cmapCache.has(url)) return cmapCache.get(url) ?? null;
  const running = cmapPending.get(url);
  if (running) return running;

  const task = (async () => {
    try {
      const file = await fetchFile(url);
      const buffer = await file.arrayBuffer();
      const covered = parseFontCmap(buffer);
      cmapCache.set(url, covered);
      return covered;
    } catch {
      cmapCache.set(url, null);
      return null;
    } finally {
      cmapPending.delete(url);
    }
  })();

  cmapPending.set(url, task);
  return task;
}

export interface FontGlyphIssue {
  fontFamily: string;
  fontName?: string;
  missing: string;
  text: string;
}

const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/;

/**
 * 从 HTML 里找出「绑定了字体的元素」及其直属文字
 * 支持两种引用方式：
 *  1. font-family:'font_<id>'          （canvas.loadFont 预加载后直接引用）
 *  2. font-family:'{{font.KEY.family}}'（htmlBindings.font 绑定）
 */
export function extractFontTextUsages(
  html: string,
): Array<{ ref: string; kind: "id" | "key"; text: string }> {
  const out: Array<{ ref: string; kind: "id" | "key"; text: string }> = [];
  if (!html) return out;
  const styleRe = /style\s*=\s*"([^"]*)"/gi;
  let m: RegExpExecArray | null;
  while ((m = styleRe.exec(html))) {
    const style = m[1] || "";
    let ref = "";
    let kind: "id" | "key" = "id";
    const bindingRef = style.match(/\{\{\s*font\.([A-Za-z0-9_-]+)\.family\s*\}\}/);
    if (bindingRef) {
      ref = bindingRef[1];
      kind = "key";
    } else {
      const idRef = style.match(/font_([0-9a-zA-Z-]{8,})/);
      if (!idRef) continue;
      ref = idRef[1];
      kind = "id";
    }
    // 取该标签结束后的直属文字（到下一个标签前）
    const afterAttr = m.index + m[0].length;
    const tagEnd = html.indexOf(">", afterAttr);
    if (tagEnd < 0) continue;
    const nextTag = html.indexOf("<", tagEnd + 1);
    const raw = html.slice(tagEnd + 1, nextTag < 0 ? html.length : nextTag);
    const text = decodeEntities(raw).trim();
    if (!text) continue;
    out.push({ ref, kind, text });
  }
  return out;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&middot;|&#183;|&middot;/gi, "·")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\{\{[^}]*\}\}/g, "");
}

/**
 * 校验 htmlContent 中引用的字体是否覆盖了对应文字
 * @param html htmlContent
 * @param fontUrlMap font_<id> 的 id -> { url, name }
 * @param bindingFontMap htmlBindings.font 的 key -> { id, url, name }
 */
export async function checkHtmlGlyphCoverage(
  html: string,
  fontUrlMap: Record<string, { url: string; name?: string }>,
  bindingFontMap: Record<string, { id: string; url: string; name?: string }> = {},
): Promise<FontGlyphIssue[]> {
  const usages = extractFontTextUsages(html);
  if (!usages.length) return [];

  const issues: FontGlyphIssue[] = [];
  const checked = new Map<string, Promise<Set<number> | null>>();

  for (const usage of usages) {
    const cjkChars = Array.from(new Set(usage.text.split(""))).filter((c) => CJK.test(c));
    if (!cjkChars.length) continue;

    const bound = usage.kind === "key" ? bindingFontMap[usage.ref] : undefined;
    const fontId = bound?.id || usage.ref;
    const info = fontUrlMap[fontId];
    const url = bound?.url || info?.url || getLoadedFontUrl(fontId);
    if (!url) continue;

    let task = checked.get(url);
    if (!task) {
      task = getFontCmap(url);
      checked.set(url, task);
    }
    const covered = await task;
    if (!covered) continue; // 解析失败就不阻断，避免误伤

    const missing = cjkChars.filter((c) => !covered.has(c.codePointAt(0)!));
    if (missing.length) {
      issues.push({
        fontFamily: bound ? `{{font.${usage.ref}.family}}` : `font_${usage.ref}`,
        fontName: bound?.name || info?.name,
        missing: missing.join(""),
        text: usage.text,
      });
    }
  }
  return issues;
}
