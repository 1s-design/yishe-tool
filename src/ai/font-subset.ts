import opentype from "opentype.js";
import { renderDiagnostics } from "./render-diagnostics";

/**
 * 字体子集化嵌入
 *
 * 设计里用到的中文字体单个体积可达 3-12MB，若按 html-to-image 默认方式全量
 * base64 嵌入，SVG data URL 会膨胀到数十 MB，浏览器解析会长时间卡死（实测 >90s），
 * 最终只能降级为「不嵌入字体」，导致文字回退默认字体。
 *
 * 这里改为只把「画面实际用到的字形」子集化后再嵌入：11.8MB 的字体子集后约 10KB，
 * 渲染既快又能保留设计指定字体。
 */

// 解析后的字体按 URL 缓存，避免每个设计都重复拉取/解析数 MB 字体
const parsedFontCache = new Map<string, opentype.Font | null>();
// 子集 data URL 按「URL + 用到的字符集」缓存
const subsetCache = new Map<string, string | null>();

function normalizeFamily(value: string): string {
  return String(value || "")
    .trim()
    .replace(/["']/g, "");
}

function collectUsedFamilies(node: Element): Set<string> {
  const families = new Set<string>();
  const walk = (el: Element) => {
    const inline = (el as HTMLElement).style?.fontFamily;
    const computed = inline || window.getComputedStyle(el).fontFamily;
    String(computed || "")
      .split(",")
      .map(normalizeFamily)
      .filter(Boolean)
      .forEach((family) => families.add(family));
    Array.from(el.children).forEach(walk);
  };
  walk(node);
  return families;
}

function collectUsedChars(node: Element): string {
  const chars = new Set<string>();
  for (const ch of node.textContent || "") chars.add(ch);
  // 伪元素 content:"..." 里的文案不在 textContent 中，需从 <style> 里补
  node.querySelectorAll("style").forEach((styleEl) => {
    for (const ch of styleEl.textContent || "") chars.add(ch);
  });
  // 常见字符兜底，避免编号/标点缺字形
  for (const ch of "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:;!?/\\-—–·、，。：；！？（）()【】《》〈〉…%&+*#@°'\"~^_=<>[]{}|")
    chars.add(ch);
  return Array.from(chars).join("");
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function getParsedFont(url: string): Promise<opentype.Font | null> {
  if (parsedFontCache.has(url)) return parsedFontCache.get(url) ?? null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const font = opentype.parse(await res.arrayBuffer());
    parsedFontCache.set(url, font);
    return font;
  } catch (error) {
    console.warn("[FontSubset] 字体加载/解析失败:", url, error);
    parsedFontCache.set(url, null);
    return null;
  }
}

function buildSubsetFont(
  font: opentype.Font,
  chars: string,
): opentype.Font {
  const glyphs = [font.glyphs.get(0)];
  const seen = new Set<number>([0]);
  for (const ch of chars) {
    const glyph = font.charToGlyph(ch);
    if (glyph && glyph.index && !seen.has(glyph.index)) {
      seen.add(glyph.index);
      glyphs.push(glyph);
    }
  }
  return new opentype.Font({
    familyName: "subset",
    styleName: "Regular",
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    glyphs,
  });
}

async function subsetFontToDataUrl(
  url: string,
  chars: string,
): Promise<string | null> {
  const cacheKey = `${url}::${chars.length}::${chars}`;
  if (subsetCache.has(cacheKey)) return subsetCache.get(cacheKey) ?? null;

  const font = await getParsedFont(url);
  if (!font) {
    subsetCache.set(cacheKey, null);
    return null;
  }

  try {
    const subset = buildSubsetFont(font, chars);
    const dataUrl = `data:font/ttf;base64,${arrayBufferToBase64(subset.toArrayBuffer())}`;
    subsetCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (error) {
    console.warn("[FontSubset] 子集化失败:", url, error);
    subsetCache.set(cacheKey, null);
    return null;
  }
}

function collectFontFaceRules(): CSSFontFaceRule[] {
  const rules: CSSFontFaceRule[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList | null = null;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(cssRules || [])) {
      if (rule.type === CSSRule.FONT_FACE_RULE) {
        rules.push(rule as CSSFontFaceRule);
      }
    }
  }
  return rules;
}

/**
 * 生成只包含实际使用字形的 @font-face CSS（供 html-to-image 的 fontEmbedCSS 使用）。
 * 任何环节失败都会跳过该字体，保证渲染不会因为字体而卡死。
 */
export async function buildSubsetFontEmbedCSS(
  node: Element | null,
): Promise<string> {
  if (!node) return "";
  const usedFamilies = collectUsedFamilies(node);
  if (!usedFamilies.size) return "";
  const chars = collectUsedChars(node);

  const allRules = collectFontFaceRules();
  renderDiagnostics.usedFamilies = usedFamilies.size;
  renderDiagnostics.fontFaceRules = allRules.length;

  const parts: string[] = [];
  for (const rule of allRules) {
    const family = normalizeFamily(rule.style.getPropertyValue("font-family"));
    if (!usedFamilies.has(family)) continue;
    const src = rule.style.getPropertyValue("src");
    const url = src.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    if (!url) continue;

    const dataUrl = await subsetFontToDataUrl(url, chars);
    if (!dataUrl) {
      // 子集化失败：宁可不嵌入（文字回退），也不要塞入数 MB 全量字体把渲染拖死
      console.warn("[FontSubset] 跳过字体嵌入:", family);
      renderDiagnostics.subsetFail = Number(renderDiagnostics.subsetFail) + 1;
      continue;
    }
    renderDiagnostics.subsetOk = Number(renderDiagnostics.subsetOk) + 1;
    parts.push(rule.cssText.replace(/url\([^)]*\)/, `url(${dataUrl})`));
  }
  return parts.join("\n");
}
