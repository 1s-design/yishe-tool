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

export const apparelLayoutTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "oversized-back-print-collage",
      name: "后背大图拼贴版式",
      category: "服饰 / 版式",
      description: "适合 T 恤、卫衣、外套后背的大面积印花，用拼贴卡片和标题形成完整视觉。",
      tags: ["T恤", "卫衣", "后背大图", "拼贴", "服饰"],
      difficulty: "intermediate",
      printStyle: "poster",
      suitableProducts: ["T 恤后背印花", "卫衣后背印花", "夹克背面图案", "服饰系列海报"],
      sceneDescription: "适合做品牌系列感很强的后背大图，尤其适合街头和 editorial 风格。",
      sortOrder: 810,
    },
    [
      textField("text.eyebrow", "顶部标签", "Edition 01"),
      textField("text.title", "主标题", "CITY NOTES"),
      textareaField("text.note", "说明文案", "Layered frames, editorial spacing and oversized title rhythm for back-print apparel graphics.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        eyebrow: "Edition 01",
        title: "CITY NOTES",
        note: "Layered frames, editorial spacing and oversized title rhythm for back-print apparel graphics.",
      },
      color: {
        background: createPureColor("#f8fafc"),
        primary: createPureColor("#111827"),
        secondary: createPureColor("#ef4444"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .back-collage{width:100%;height:100%;position:relative;overflow:hidden;padding:8%;box-sizing:border-box;background:{{color.background}};}
      .back-collage__frame{width:100%;height:100%;border:1px solid rgba(15,23,42,.08);padding:6%;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,.34fr) minmax(0,1fr);grid-template-rows:auto 1fr auto;gap:14px;background:linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.34));}
      .back-collage__eyebrow{font-size:clamp(11px,1.5vw,13px);letter-spacing:.24em;text-transform:uppercase;color:#64748b;}
      .back-collage__chip{justify-self:end;align-self:start;padding:8px 12px;border-radius:999px;background:rgba(239,68,68,.08);color:{{color.secondary}};font-size:clamp(11px,1.4vw,12px);font-weight:700;}
      .back-collage__stack{display:grid;gap:12px;}
      .back-collage__card{border-radius:20px;background:#fff;box-shadow:0 14px 30px rgba(15,23,42,.08);}
      .back-collage__card--a{height:34%;background:linear-gradient(135deg, rgba(239,68,68,.12), rgba(255,255,255,.9));}
      .back-collage__card--b{height:20%;background:linear-gradient(135deg, rgba(17,24,39,.08), rgba(255,255,255,.92));}
      .back-collage__card--c{height:28%;background:linear-gradient(135deg, rgba(59,130,246,.1), rgba(255,255,255,.9));}
      .back-collage__titleWrap{display:flex;flex-direction:column;justify-content:center;}
      .back-collage__title{font-size:clamp(60px,11vw,156px);line-height:.82;font-weight:900;letter-spacing:-.08em;color:{{color.primary}};font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .back-collage__note{margin-top:14px;max-width:74%;font-size:clamp(13px,1.7vw,16px);line-height:1.7;color:#475569;}
    </style>
    <div class="back-collage">
      <div class="back-collage__frame">
        <div class="back-collage__eyebrow">{{text.eyebrow}}</div>
        <div class="back-collage__chip">Back Print</div>
        <div class="back-collage__stack">
          <div class="back-collage__card back-collage__card--a"></div>
          <div class="back-collage__card back-collage__card--b"></div>
          <div class="back-collage__card back-collage__card--c"></div>
        </div>
        <div class="back-collage__titleWrap">
          <div class="back-collage__title">{{text.title}}</div>
          <div class="back-collage__note">{{text.note}}</div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "front-chest-seal-mark",
      name: "前胸印章标记",
      category: "服饰 / 版式",
      description: "适合前胸小图、口袋位印花和左胸徽章位，用圆形章印结构快速出成套方案。",
      tags: ["前胸", "小图", "胸前印花", "印章", "徽章"],
      difficulty: "simple",
      printStyle: "cutout",
      suitableProducts: ["T 恤前胸印花", "卫衣左胸图案", "口袋位小图", "帽衫前胸徽章"],
      sceneDescription: "适合做小范围精致印花，缩小后依然能保持辨识度。",
      sortOrder: 820,
    },
    [
      textField("text.top", "顶部文字", "Studio Dept."),
      textField("text.title", "中心标题", "1S"),
      textField("text.bottom", "底部文字", "Crafted Daily"),
      colorField("color.background", "底色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "中心字体"),
    ],
    {
      text: {
        top: "Studio Dept.",
        title: "1S",
        bottom: "Crafted Daily",
      },
      color: {
        background: createPureColor("#f8fafc"),
        primary: createPureColor("#111827"),
        secondary: createPureColor("#0f766e"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .front-seal{width:100%;height:100%;display:grid;place-items:center;padding:10%;box-sizing:border-box;background:{{color.background}};}
      .front-seal__mark{width:min(64%,360px);aspect-ratio:1/1;border-radius:50%;display:grid;place-items:center;position:relative;background:
        radial-gradient(circle, rgba(255,255,255,.88), rgba(255,255,255,.96)),
        #fff;box-shadow:0 20px 44px rgba(15,23,42,.12), inset 0 0 0 12px rgba(17,24,39,.04), inset 0 0 0 2px {{color.primary}};}
      .front-seal__ring{position:absolute;inset:8%;border-radius:50%;border:2px dashed {{color.secondary}};opacity:.74;}
      .front-seal__top,.front-seal__bottom{position:absolute;left:50%;transform:translateX(-50%);font-size:clamp(11px,1.6vw,13px);letter-spacing:.18em;text-transform:uppercase;color:#475569;}
      .front-seal__top{top:18%;}
      .front-seal__bottom{bottom:18%;}
      .front-seal__title{font-size:clamp(46px,8vw,92px);line-height:1;font-weight:900;color:{{color.primary}};font-family:{{font.title.family}}, "Arial Black", sans-serif;}
    </style>
    <div class="front-seal">
      <div class="front-seal__mark">
        <div class="front-seal__ring"></div>
        <div class="front-seal__top">{{text.top}}</div>
        <div class="front-seal__title">{{text.title}}</div>
        <div class="front-seal__bottom">{{text.bottom}}</div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "sleeve-stripe-repeat",
      name: "袖条重复字带",
      category: "服饰 / 版式",
      description: "适合袖子侧边、裤腿侧条、帽绳区域等狭长区域，用重复字带形成节奏。",
      tags: ["袖条", "侧条", "重复", "窄长", "运动风"],
      difficulty: "simple",
      printStyle: "pattern",
      suitableProducts: ["卫衣袖条", "运动裤侧条", "帽绳区域图案", "围边装饰带"],
      sceneDescription: "适合狭长比例区域，横向或纵向都能用，做系列化很方便。",
      sortOrder: 830,
    },
    [
      textField("text.word", "重复文字", "STUDIO 1S"),
      textField("text.note", "补充词", "repeat band"),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "文字字体"),
    ],
    {
      text: {
        word: "STUDIO 1S",
        note: "repeat band",
      },
      color: {
        background: createPureColor("#111827"),
        primary: createPureColor("#f8fafc"),
        secondary: createPureColor("#38bdf8"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .sleeve-band{width:100%;height:100%;display:flex;align-items:center;padding:8% 0;box-sizing:border-box;background:{{color.background}};overflow:hidden;}
      .sleeve-band__track{display:flex;gap:18px;white-space:nowrap;min-width:100%;padding:0 4%;}
      .sleeve-band__pill{display:inline-flex;align-items:center;gap:12px;padding:10px 16px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(56,189,248,.16);}
      .sleeve-band__word{font-size:clamp(18px,3vw,30px);font-weight:900;letter-spacing:.12em;color:{{color.primary}};font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .sleeve-band__dot{width:10px;height:10px;border-radius:50%;background:{{color.secondary}};}
      .sleeve-band__note{font-size:clamp(10px,1.4vw,12px);text-transform:uppercase;letter-spacing:.16em;color:rgba(248,250,252,.54);}
    </style>
    <div class="sleeve-band">
      <div class="sleeve-band__track">
        <div class="sleeve-band__pill"><span class="sleeve-band__word">{{text.word}}</span><span class="sleeve-band__dot"></span><span class="sleeve-band__note">{{text.note}}</span></div>
        <div class="sleeve-band__pill"><span class="sleeve-band__word">{{text.word}}</span><span class="sleeve-band__dot"></span><span class="sleeve-band__note">{{text.note}}</span></div>
        <div class="sleeve-band__pill"><span class="sleeve-band__word">{{text.word}}</span><span class="sleeve-band__dot"></span><span class="sleeve-band__note">{{text.note}}</span></div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "varsity-arc-badge",
      name: "学院弧形徽章",
      category: "服饰 / 版式",
      description: "适合学院风、运动风和社团风的服饰印花，用弧形字和中心徽章形成经典结构。",
      tags: ["学院风", "Varsity", "运动风", "徽章", "弧形字"],
      difficulty: "intermediate",
      printStyle: "cutout",
      suitableProducts: ["卫衣胸前图案", "棒球夹克徽章", "学院风 T 恤", "帽衫中间印花"],
      sceneDescription: "适合做简洁但有品牌感的服饰标记，尤其是学院和运动类 POD 图案。",
      sortOrder: 840,
    },
    [
      textField("text.top", "上弧文案", "CREATIVE CLUB"),
      textField("text.center", "中心字", "1S"),
      textField("text.bottom", "下方文案", "Since 2026"),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "中心字体"),
    ],
    {
      text: {
        top: "CREATIVE CLUB",
        center: "1S",
        bottom: "Since 2026",
      },
      color: {
        background: createPureColor("#eff6ff"),
        primary: createPureColor("#1d4ed8"),
        secondary: createPureColor("#0f172a"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .varsity-badge{width:100%;height:100%;display:grid;place-items:center;padding:10%;box-sizing:border-box;background:{{color.background}};}
      .varsity-badge__wrap{width:min(78%,420px);aspect-ratio:1/1;position:relative;display:grid;place-items:center;}
      .varsity-badge__arc{position:absolute;left:50%;transform:translateX(-50%);width:100%;text-align:center;font-size:clamp(14px,2vw,18px);font-weight:800;letter-spacing:.24em;color:{{color.secondary}};}
      .varsity-badge__arc--top{top:2%;clip-path:ellipse(50% 100% at 50% 100%);}
      .varsity-badge__ring{width:76%;aspect-ratio:1/1;border-radius:50%;display:grid;place-items:center;background:#fff;box-shadow:0 22px 44px rgba(29,78,216,.14), inset 0 0 0 14px rgba(29,78,216,.12), inset 0 0 0 2px {{color.primary}};}
      .varsity-badge__center{font-size:clamp(54px,9vw,102px);line-height:1;font-weight:900;color:{{color.primary}};font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .varsity-badge__bottom{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);font-size:clamp(12px,1.6vw,14px);letter-spacing:.16em;text-transform:uppercase;color:#475569;}
    </style>
    <div class="varsity-badge">
      <div class="varsity-badge__wrap">
        <div class="varsity-badge__arc varsity-badge__arc--top">{{text.top}}</div>
        <div class="varsity-badge__ring">
          <div class="varsity-badge__center">{{text.center}}</div>
        </div>
        <div class="varsity-badge__bottom">{{text.bottom}}</div>
      </div>
    </div>`
  ),
];
