import type { HtmlTemplateDefinition } from "../types";
import {
  colorField,
  createPureColor,
  createTemplate,
  defaultFontBinding,
  fontField,
  textField,
  textareaField,
} from "./shared";

export const posterTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "quote-poster-editorial",
      name: "引语海报模板",
      category: "海报 / 排版",
      description: "大标题和极简留白的经典版式，适合语录、品牌理念、封面式印花。",
      tags: ["海报", "引语", "极简", "排版"],
      difficulty: "simple",
      printStyle: "poster",
      suitableProducts: ["海报印花", "T 恤后背大字", "帆布袋大字", "封面图"],
      sceneDescription: "适合一句主观点配一个署名，作为系列印花的封面款非常稳定。",
      sortOrder: 310,
    },
    [
      textareaField("text.quote", "引语内容", "Create loud things with soft colors.", 4),
      textField("text.author", "署名", "Studio 1S"),
      colorField("color.background", "背景色"),
      colorField("color.accent", "强调色"),
      fontField("font.quote", "主字体"),
    ],
    {
      text: {
        quote: "Create loud things with soft colors.",
        author: "Studio 1S",
      },
      color: {
        background: createPureColor("#111827"),
        accent: createPureColor("#f59e0b"),
      },
      font: {
        quote: defaultFontBinding,
      },
    },
    `<style>
      .quote-poster{width:100%;height:100%;padding:10%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;background:{{color.background}};color:#f8fafc;position:relative;overflow:hidden;}
      .quote-poster::before{content:"";position:absolute;width:42%;aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle, rgba(245,158,11,.26), transparent 72%);top:-8%;right:-10%;}
      .quote-poster__mark{font-size:clamp(72px,10vw,96px);line-height:1;color:{{color.accent}};font-weight:900;opacity:.92;}
      .quote-poster__body{font-size:clamp(34px,5vw,68px);line-height:1.04;letter-spacing:-.03em;font-weight:800;max-width:92%;font-family:{{font.quote.family}}, "Arial Black", sans-serif;}
      .quote-poster__footer{display:flex;align-items:center;gap:16px;color:rgba(248,250,252,.82);}
      .quote-poster__line{width:64px;height:2px;background:{{color.accent}};}
      .quote-poster__author{font-size:clamp(12px,1.6vw,15px);letter-spacing:.22em;text-transform:uppercase;}
    </style>
    <div class="quote-poster">
      <div class="quote-poster__mark">"</div>
      <div class="quote-poster__body">{{text.quote}}</div>
      <div class="quote-poster__footer">
        <div class="quote-poster__line"></div>
        <div class="quote-poster__author">{{text.author}}</div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "retro-halftone-poster",
      name: "复古半调爆点海报",
      category: "海报 / 排版",
      description: "用半调点、爆炸光斑和粗体标题做出复古潮流感，适合街头感和复古运动风印花。",
      tags: ["复古", "半调", "街头", "爆点"],
      difficulty: "intermediate",
      printStyle: "poster",
      suitableProducts: ["T 恤后背大图", "海报", "托特袋正面", "唱片封面风印花"],
      sceneDescription: "适合做一张强烈主视觉海报式印花，能把字和色块都做得很有冲击力。",
      sortOrder: 320,
    },
    [
      textField("text.kicker", "顶部标签", "Vintage Run"),
      textField("text.title", "主标题", "LOUD"),
      textareaField("text.subtitle", "副标题", "Halftone energy with oversized color impact.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        kicker: "Vintage Run",
        title: "LOUD",
        subtitle: "Halftone energy with oversized color impact.",
      },
      color: {
        background: createPureColor("#fef3c7"),
        primary: createPureColor("#dc2626"),
        secondary: createPureColor("#111827"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .retro-poster{width:100%;height:100%;position:relative;overflow:hidden;padding:8%;box-sizing:border-box;background:{{color.background}};}
      .retro-poster::before{content:"";position:absolute;inset:0;background:
        radial-gradient(circle, rgba(17,24,39,.16) 1.4px, transparent 1.5px);
        background-size:12px 12px;opacity:.28;mix-blend-mode:multiply;}
      .retro-poster::after{content:"";position:absolute;width:64%;aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle, {{color.primary}}, transparent 70%);left:-12%;top:22%;opacity:.74;filter:blur(8px);}
      .retro-poster__frame{position:relative;z-index:1;width:100%;height:100%;border:2px solid rgba(17,24,39,.12);display:flex;flex-direction:column;justify-content:space-between;padding:5.5%;box-sizing:border-box;}
      .retro-poster__kicker{font-size:clamp(11px,1.6vw,14px);letter-spacing:.24em;text-transform:uppercase;font-weight:700;color:{{color.secondary}};}
      .retro-poster__title{font-size:clamp(74px,13vw,180px);line-height:.82;font-weight:900;letter-spacing:-.08em;color:#fff;-webkit-text-stroke:2px {{color.secondary}};text-shadow:10px 10px 0 rgba(17,24,39,.12);font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .retro-poster__subtitle{max-width:52%;font-size:clamp(13px,1.7vw,16px);line-height:1.65;color:rgba(17,24,39,.78);}
    </style>
    <div class="retro-poster">
      <div class="retro-poster__frame">
        <div class="retro-poster__kicker">{{text.kicker}}</div>
        <div class="retro-poster__title">{{text.title}}</div>
        <div class="retro-poster__subtitle">{{text.subtitle}}</div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "cyber-glow-poster",
      name: "赛博渐变玻璃海报",
      category: "海报 / 排版",
      description: "用多层渐变、玻璃卡片和荧光描边做偏未来感的封面或印花视觉。",
      tags: ["赛博", "渐变", "未来感", "玻璃"],
      difficulty: "advanced",
      printStyle: "poster",
      suitableProducts: ["潮流海报", "卫衣后背印花", "社媒封面", "科技感产品图"],
      sceneDescription: "适合强调未来感、AI 感和数字品牌气质，也适合做一图式宣传海报。",
      sortOrder: 330,
    },
    [
      textField("text.eyebrow", "小标题", "Neon Archive"),
      textField("text.title", "主标题", "AFTER GLOW"),
      textareaField("text.subtitle", "说明文案", "Gradient light, layered blur and a glass card that still adapts to different canvas ratios.", 3),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主渐变色"),
      colorField("color.secondary", "副渐变色"),
      fontField("font.title", "主标题字体"),
    ],
    {
      text: {
        eyebrow: "Neon Archive",
        title: "AFTER GLOW",
        subtitle: "Gradient light, layered blur and a glass card that still adapts to different canvas ratios.",
      },
      color: {
        background: createPureColor("#020617"),
        primary: createPureColor("#22d3ee"),
        secondary: createPureColor("#a855f7"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .cyber{width:100%;height:100%;position:relative;overflow:hidden;background:
        radial-gradient(circle at 24% 24%, rgba(34,211,238,.36), transparent 22%),
        radial-gradient(circle at 82% 18%, rgba(168,85,247,.32), transparent 24%),
        radial-gradient(circle at 64% 78%, rgba(56,189,248,.18), transparent 26%),
        {{color.background}};}
      .cyber::before{content:"";position:absolute;inset:0;background:linear-gradient(transparent 0 96%, rgba(255,255,255,.08) 96% 100%);background-size:100% 22px;opacity:.16;}
      .cyber__card{position:absolute;inset:9%;border-radius:30px;padding:8.5%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.16);box-shadow:0 24px 80px rgba(0,0,0,.28);backdrop-filter:blur(16px);}
      .cyber__eyebrow{align-self:flex-start;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);font-size:clamp(11px,1.4vw,13px);letter-spacing:.18em;text-transform:uppercase;color:#e2e8f0;}
      .cyber__title{font-size:clamp(46px,8vw,108px);line-height:.88;font-weight:900;letter-spacing:-.07em;font-family:{{font.title.family}}, "Arial Black", sans-serif;background:linear-gradient(90deg, {{color.primary}}, #ffffff 45%, {{color.secondary}});-webkit-background-clip:text;background-clip:text;color:transparent;}
      .cyber__subtitle{max-width:60%;font-size:clamp(13px,1.7vw,16px);line-height:1.7;color:rgba(226,232,240,.82);}
      .cyber__line{width:min(34vw,220px);height:12px;border-radius:999px;background:linear-gradient(90deg, {{color.primary}}, {{color.secondary}});box-shadow:0 0 24px rgba(34,211,238,.4);}
    </style>
    <div class="cyber">
      <div class="cyber__card">
        <div class="cyber__eyebrow">{{text.eyebrow}}</div>
        <div>
          <div class="cyber__title">{{text.title}}</div>
          <div class="cyber__subtitle">{{text.subtitle}}</div>
        </div>
        <div class="cyber__line"></div>
      </div>
    </div>`
  ),
];
