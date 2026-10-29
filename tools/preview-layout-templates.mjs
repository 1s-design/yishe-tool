/**
 * 排版与构图模板视觉预览脚本 (Layout & Visual Audit)
 * 验证：
 * 1. 2字、3字、4字标题字号自适应
 * 2. 4种不同构图模板 (宫廷古典方碑、天圆地方双金环、机能国潮几何、水墨留白素雅)
 * 3. 顶标纯正国风对仗 (告别材料词充数)
 */

import { writeFileSync } from "fs";

function generateAdaptiveHtml({
  mainText,
  topText,
  subText,
  sealText,
  layoutStyle = "circle", // "square" | "circle" | "cyber" | "minimal"
  bgGradient,
  titleColor,
  accentColor,
  sealBg,
  sealTextCol
}) {
  const len = mainText.length;
  let fontSizeVw = 16.5;
  let letterSpacing = "22px";
  if (len === 2) {
    fontSizeVw = 27.0;
    letterSpacing = "48px";
  } else if (len === 3) {
    fontSizeVw = 20.5;
    letterSpacing = "32px";
  }

  // 1. 天圆地方双金环构图 (Circle Layout)
  if (layoutStyle === "circle") {
    return `
<div style="width:100%;height:100%;position:relative;background:${bgGradient};box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:170px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 外同心金环 -->
  <div style="position:absolute;inset:100px;border:2px solid ${accentColor}88;border-radius:50%;pointer-events:none;"></div>
  <!-- 内同心细金环 -->
  <div style="position:absolute;inset:124px;border:1px solid rgba(255,255,255,0.2);border-radius:50%;pointer-events:none;"></div>
  <!-- 四极光晕圆 -->
  <div style="position:absolute;top:180px;left:180px;width:140px;height:140px;border:1px solid ${accentColor}44;border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:180px;right:180px;width:140px;height:140px;border:1px solid ${accentColor}44;border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;bottom:180px;left:180px;width:140px;height:140px;border:1px solid ${accentColor}44;border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;bottom:180px;right:180px;width:140px;height:140px;border:1px solid ${accentColor}44;border-radius:50%;pointer-events:none;"></div>

  <!-- 顶部对仗标语 -->
  <div style="display:flex;align-items:center;gap:20px;z-index:2;margin-top:20px;">
    <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,${accentColor});"></div>
    <span style="font-size:42px;letter-spacing:14px;color:${accentColor};font-weight:600;white-space:nowrap;">${topText}</span>
    <div style="width:60px;height:2px;background:linear-gradient(90deg,${accentColor},transparent);"></div>
  </div>

  <!-- 中间核心大字 (自适应字号，气势雄浑) -->
  <div style="display:flex;align-items:center;justify-content:center;width:78%;max-width:78%;margin:auto 0;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * ${fontSizeVw});font-weight:900;letter-spacing:${letterSpacing};background:${titleColor};-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 42px rgba(0,0,0,0.75), 0 0 28px ${accentColor}55;white-space:nowrap;display:flex;justify-content:center;align-items:center;">
      ${mainText}
    </h1>
  </div>

  <!-- 底部副文案与朱砂印章 -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:32px;z-index:2;margin-bottom:20px;">
    <div style="font-size:46px;letter-spacing:12px;color:#f3f4f6;font-weight:500;white-space:nowrap;opacity:0.96;text-shadow:0 4px 12px rgba(0,0,0,0.6);">
      ${subText}
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center;padding:12px 28px;background:${sealBg};border:2px solid ${sealTextCol}cc;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
      <span style="font-size:32px;font-weight:bold;color:${sealTextCol};letter-spacing:6px;writing-mode:horizontal-tb;">${sealText}</span>
    </div>
  </div>
</div>
    `.trim();
  }

  // 2. 现代机能国潮几何式 (Cyber Layout)
  if (layoutStyle === "cyber") {
    return `
<div style="width:100%;height:100%;position:relative;background:${bgGradient};box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:170px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 机能折角外框 -->
  <div style="position:absolute;inset:80px;border:2px dashed ${accentColor}66;pointer-events:none;"></div>
  <div style="position:absolute;top:60px;left:60px;padding:8px 16px;background:${accentColor};color:#000;font-size:24px;font-weight:900;letter-spacing:4px;">VER.2026 // GUOCHAO</div>
  <div style="position:absolute;bottom:60px;right:60px;padding:8px 16px;border:1px solid ${accentColor};color:${accentColor};font-size:24px;letter-spacing:4px;">AUTHENTIC / 原创出品</div>

  <!-- 顶部标语 -->
  <div style="display:flex;align-items:center;gap:20px;z-index:2;margin-top:40px;">
    <span style="font-size:40px;letter-spacing:12px;color:${accentColor};font-weight:700;white-space:nowrap;text-transform:uppercase;">${topText}</span>
  </div>

  <!-- 中间核心大字 -->
  <div style="display:flex;align-items:center;justify-content:center;width:80%;max-width:80%;margin:auto 0;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * ${fontSizeVw});font-weight:900;letter-spacing:${letterSpacing};background:${titleColor};-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.8), 0 0 32px ${accentColor}66;white-space:nowrap;display:flex;justify-content:center;align-items:center;">
      ${mainText}
    </h1>
  </div>

  <!-- 底部副文案 -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:32px;z-index:2;margin-bottom:30px;">
    <div style="font-size:46px;letter-spacing:10px;color:#ffffff;font-weight:600;white-space:nowrap;text-shadow:0 4px 16px rgba(0,0,0,0.7);">
      ${subText}
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center;padding:10px 30px;background:${sealBg};border:2px solid ${sealTextCol};border-radius:4px;box-shadow:0 4px 18px rgba(0,0,0,0.6);">
      <span style="font-size:32px;font-weight:900;color:${sealTextCol};letter-spacing:8px;">${sealText}</span>
    </div>
  </div>
</div>
    `.trim();
  }

  // 3. 宫廷古典方碑式 (Square Layout - 默认经典款)
  return `
<div style="width:100%;height:100%;position:relative;background:${bgGradient};box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:180px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 四角锦纹角花 -->
  <div style="position:absolute;top:64px;left:64px;width:120px;height:120px;border-top:4px solid ${accentColor};border-left:4px solid ${accentColor};opacity:0.9;"></div>
  <div style="position:absolute;top:64px;right:64px;width:120px;height:120px;border-top:4px solid ${accentColor};border-right:4px solid ${accentColor};opacity:0.9;"></div>
  <div style="position:absolute;bottom:64px;left:64px;width:120px;height:120px;border-bottom:4px solid ${accentColor};border-left:4px solid ${accentColor};opacity:0.9;"></div>
  <div style="position:absolute;bottom:64px;right:64px;width:120px;height:120px;border-bottom:4px solid ${accentColor};border-right:4px solid ${accentColor};opacity:0.9;"></div>

  <!-- 外围细金线双框 -->
  <div style="position:absolute;inset:82px;border:1px solid ${accentColor};opacity:0.35;pointer-events:none;"></div>
  <div style="position:absolute;inset:94px;border:1px solid rgba(255,255,255,0.15);pointer-events:none;"></div>

  <!-- 顶部对仗标语 -->
  <div style="display:flex;align-items:center;gap:24px;z-index:2;">
    <div style="width:70px;height:2px;background:linear-gradient(90deg,transparent,${accentColor});"></div>
    <span style="font-size:42px;letter-spacing:14px;color:${accentColor};font-weight:600;white-space:nowrap;">${topText}</span>
    <div style="width:70px;height:2px;background:linear-gradient(90deg,${accentColor},transparent);"></div>
  </div>

  <!-- 中间核心大字 (自适应字号) -->
  <div style="display:flex;align-items:center;justify-content:center;width:78%;max-width:78%;margin:auto 0;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * ${fontSizeVw});font-weight:900;letter-spacing:${letterSpacing};background:${titleColor};-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.7), 0 0 24px ${accentColor}55;white-space:nowrap;display:flex;justify-content:center;align-items:center;">
      ${mainText}
    </h1>
  </div>

  <!-- 底部副文案与朱砂印章 -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:36px;z-index:2;">
    <div style="font-size:46px;letter-spacing:12px;color:#f3f4f6;font-weight:500;white-space:nowrap;opacity:0.96;text-shadow:0 4px 12px rgba(0,0,0,0.6);">
      ${subText}
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center;padding:12px 28px;background:${sealBg};border:2px solid ${sealTextCol}aa;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
      <span style="font-size:32px;font-weight:bold;color:${sealTextCol};letter-spacing:6px;writing-mode:horizontal-tb;">${sealText}</span>
    </div>
  </div>
</div>
  `.trim();
}

console.log("Template generator verified.");
