import type { HtmlTemplateDefinition } from "../types";
import {
  colorField,
  createPlaceholderImageBinding,
  createPureColor,
  createTemplate,
  defaultFontBinding,
  fontField,
  imageField,
  textField,
  textareaField,
} from "./shared";

export const stickerTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "pod-sticker-badge",
      name: "贴纸主视觉卡",
      category: "贴纸 / 抠图",
      description: "用圆角大字和高对比配色快速做出可直接用于贴纸和局部印花的主视觉。",
      tags: ["贴纸", "徽章", "标题", "趣味文案"],
      difficulty: "simple",
      printStyle: "cutout",
      suitableProducts: ["防水贴纸", "Die-cut 贴纸", "胸章卡片", "手机壳局部贴花"],
      sceneDescription: "适合一句短标题加一句副文案的趣味印花，适合做新品系列或主题贴纸。",
      sortOrder: 110,
    },
    [
      textField("text.chip", "顶部标签", "NEW DROP", "适合做系列名、版本名、季节标签。"),
      textField("text.title", "主标题", "Summer Club"),
      textareaField(
        "text.subtitle",
        "副标题",
        "Sunshine, surf and slow weekends.",
        2,
        "可写一句情绪文案或简短说明。"
      ),
      colorField("color.surface", "卡片底色"),
      colorField("color.accent", "强调色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        chip: "NEW DROP",
        title: "Summer Club",
        subtitle: "Sunshine, surf and slow weekends.",
      },
      color: {
        surface: createPureColor("#fff7ed"),
        accent: createPureColor("#ea580c"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .sticker-card{width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:6%;box-sizing:border-box;background:radial-gradient(circle at top right, rgba(255,255,255,.78), transparent 42%), {{color.surface}};}
      .sticker-card__panel{width:100%;height:100%;border-radius:30px;padding:10% 9%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;background:rgba(255,255,255,.72);border:2px solid rgba(255,255,255,.85);box-shadow:0 24px 50px rgba(15,23,42,.12);}
      .sticker-card__chip{display:inline-flex;align-items:center;align-self:flex-start;padding:10px 18px;border-radius:999px;background:{{color.accent}};color:#fff;font-size:clamp(11px,1.5vw,14px);font-weight:700;letter-spacing:.18em;text-transform:uppercase;}
      .sticker-card__title{margin:18px 0 12px;font-size:clamp(34px,5vw,68px);line-height:.94;font-weight:900;color:#111827;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .sticker-card__subtitle{font-size:clamp(13px,1.8vw,16px);line-height:1.6;color:rgba(17,24,39,.78);max-width:80%;}
      .sticker-card__footer{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-top:18px;}
      .sticker-card__dot{width:min(15vw,78px);height:min(15vw,78px);border-radius:50%;background:linear-gradient(135deg, {{color.accent}}, #111827);opacity:.92;}
      .sticker-card__rule{flex:1;height:3px;border-radius:999px;background:linear-gradient(90deg, rgba(17,24,39,.14), rgba(17,24,39,.02));}
    </style>
    <div class="sticker-card">
      <div class="sticker-card__panel">
        <div>
          <div class="sticker-card__chip">{{text.chip}}</div>
          <div class="sticker-card__title">{{text.title}}</div>
          <div class="sticker-card__subtitle">{{text.subtitle}}</div>
        </div>
        <div class="sticker-card__footer">
          <div class="sticker-card__rule"></div>
          <div class="sticker-card__dot"></div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "die-cut-outline-sticker",
      name: "Die-Cut 抠边贴纸",
      category: "贴纸 / 抠图",
      description: "模拟电商里常见的白边抠图贴纸效果，适合角色、IP、插画和吉祥物类印花。",
      tags: ["抠图", "白边", "吉祥物", "角色贴纸"],
      difficulty: "intermediate",
      printStyle: "cutout",
      suitableProducts: ["Die-cut 贴纸", "转印贴", "笔记本贴纸", "包装封口贴"],
      sceneDescription: "适合把主图做成强轮廓贴纸，中心图可替换为人物、卡通或单品主图。",
      sortOrder: 120,
    },
    [
      imageField("image.hero", "主图资源", "建议使用抠图感强、主体明确的图片。"),
      textField("text.kicker", "小标签", "Limited Piece"),
      textField("text.title", "主标题", "Lucky Buddy"),
      textareaField("text.note", "底部说明", "Bold outlines. Clean cut. Instant sticker energy.", 2),
      colorField("color.background", "背景色"),
      colorField("color.outline", "白边投影色"),
      fontField("font.title", "标题字体"),
    ],
    {
      image: {
        hero: createPlaceholderImageBinding("builtin-die-cut", "Sticker Hero", "#22c55e", "#f0fdf4"),
      },
      text: {
        kicker: "Limited Piece",
        title: "Lucky Buddy",
        note: "Bold outlines. Clean cut. Instant sticker energy.",
      },
      color: {
        background: createPureColor("#dcfce7"),
        outline: createPureColor("#ffffff"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .die-cut{width:100%;height:100%;position:relative;overflow:hidden;display:grid;place-items:center;padding:6.5%;box-sizing:border-box;background:
        radial-gradient(circle at 14% 18%, rgba(255,255,255,.7), transparent 24%),
        radial-gradient(circle at 84% 16%, rgba(255,255,255,.45), transparent 20%),
        linear-gradient(160deg, {{color.background}}, #ffffff);}
      .die-cut__blob{position:absolute;inset:10%;border-radius:34% 66% 58% 42% / 44% 38% 62% 56%;background:rgba(255,255,255,.38);filter:blur(8px);}
      .die-cut__card{position:relative;z-index:1;width:100%;height:100%;display:grid;grid-template-rows:auto 1fr auto;justify-items:center;text-align:center;padding:7% 8%;box-sizing:border-box;}
      .die-cut__kicker{padding:8px 14px;border-radius:999px;background:rgba(17,24,39,.08);font-size:clamp(11px,1.4vw,13px);font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#1f2937;}
      .die-cut__figure{width:min(72%,420px);aspect-ratio:1/1;object-fit:cover;margin-top:5%;border-radius:28% 72% 70% 30% / 30% 27% 73% 70%;background:#fff;padding:3.4%;box-sizing:border-box;box-shadow:
        0 0 0 min(1.9vw,14px) {{color.outline}},
        0 18px 48px rgba(15,23,42,.18);
        transform:rotate(-6deg);}
      .die-cut__title{margin-top:4%;font-size:clamp(34px,5vw,72px);line-height:.88;font-weight:900;color:#111827;letter-spacing:-.04em;font-family:{{font.title.family}}, "Arial Black", sans-serif;text-shadow:0 4px 0 rgba(255,255,255,.55);}
      .die-cut__note{margin-top:10px;max-width:78%;font-size:clamp(12px,1.7vw,15px);line-height:1.55;color:rgba(17,24,39,.72);}
    </style>
    <div class="die-cut">
      <div class="die-cut__blob"></div>
      <div class="die-cut__card">
        <div class="die-cut__kicker">{{text.kicker}}</div>
        <div style="display:grid;justify-items:center;align-self:center;">
          <img class="die-cut__figure" src="{{image.hero.url}}" alt="{{image.hero.name}}" />
          <div class="die-cut__title">{{text.title}}</div>
          <div class="die-cut__note">{{text.note}}</div>
        </div>
        <div></div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "embroidered-patch-badge",
      name: "刺绣章仔风贴片",
      category: "贴纸 / 抠图",
      description: "用纯 CSS 做出刺绣补丁、章仔、徽章感，适合做学院风、工装风和复古运动风印花。",
      tags: ["刺绣", "章仔", "补丁", "复古"],
      difficulty: "advanced",
      printStyle: "cutout",
      suitableProducts: ["布贴印花示意", "帽子章仔", "卫衣胸前章", "工装风贴纸"],
      sceneDescription: "适合需要模拟布料纹理和包边缝线感的视觉，标题越短越有章仔感。",
      sortOrder: 130,
    },
    [
      textField("text.title", "主标题", "Ride Club"),
      textField("text.subtitle", "副标题", "Dept. 1987"),
      textField("text.ribbon", "底部条幅", "Patch Series"),
      colorField("color.surface", "章仔底色"),
      colorField("color.accent", "缝线颜色"),
      colorField("color.ribbon", "条幅颜色"),
      fontField("font.title", "主标题字体"),
    ],
    {
      text: {
        title: "Ride Club",
        subtitle: "Dept. 1987",
        ribbon: "Patch Series",
      },
      color: {
        surface: createPureColor("#1f2937"),
        accent: createPureColor("#f8fafc"),
        ribbon: createPureColor("#ef4444"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .patch{width:100%;height:100%;display:grid;place-items:center;padding:7%;box-sizing:border-box;background:
        radial-gradient(circle at 50% 20%, rgba(255,255,255,.12), transparent 28%),
        linear-gradient(160deg, #dbeafe, #f8fafc);}
      .patch__shape{width:min(88%,680px);height:min(88%,680px);border-radius:30% 30% 36% 36% / 26% 26% 42% 42%;position:relative;overflow:hidden;background:
        repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 2px, rgba(0,0,0,.03) 2px 4px),
        repeating-linear-gradient(90deg, rgba(255,255,255,.02) 0 2px, rgba(0,0,0,.02) 2px 5px),
        {{color.surface}};
        box-shadow:
          0 0 0 10px rgba(255,255,255,.5),
          inset 0 0 0 12px rgba(255,255,255,.08),
          inset 0 0 0 18px rgba(0,0,0,.12),
          0 26px 60px rgba(15,23,42,.16);}
      .patch__shape::before{content:"";position:absolute;inset:3.5%;border-radius:inherit;border:2px dashed {{color.accent}};opacity:.64;}
      .patch__shape::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 35%, rgba(255,255,255,.18), transparent 34%);}
      .patch__content{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:12%;box-sizing:border-box;color:{{color.accent}};}
      .patch__subtitle{font-size:clamp(13px,1.8vw,16px);letter-spacing:.34em;text-transform:uppercase;opacity:.86;}
      .patch__title{margin-top:4%;font-size:clamp(38px,6vw,82px);line-height:.9;font-weight:900;letter-spacing:-.05em;font-family:{{font.title.family}}, "Arial Black", sans-serif;text-shadow:0 2px 0 rgba(0,0,0,.15);}
      .patch__ribbon{margin-top:8%;padding:10px 18px;border-radius:999px;background:{{color.ribbon}};color:#fff;font-size:clamp(11px,1.6vw,14px);font-weight:800;letter-spacing:.18em;text-transform:uppercase;box-shadow:0 10px 24px rgba(15,23,42,.16);}
    </style>
    <div class="patch">
      <div class="patch__shape">
        <div class="patch__content">
          <div class="patch__subtitle">{{text.subtitle}}</div>
          <div class="patch__title">{{text.title}}</div>
          <div class="patch__ribbon">{{text.ribbon}}</div>
        </div>
      </div>
    </div>`
  ),
];
