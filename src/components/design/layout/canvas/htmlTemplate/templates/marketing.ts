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

export const marketingTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "product-highlight-showcase",
      name: "商品亮点展示卡",
      category: "营销 / 展示",
      description: "适合鼠标垫、杯子、贴纸等商品的主图展示，左图右文结构清晰耐用。",
      tags: ["商品卡", "图片", "卖点", "展示"],
      difficulty: "simple",
      printStyle: "marketing",
      suitableProducts: ["商品主图", "详情页首屏", "系列展示图", "新品卡片"],
      sceneDescription: "适合主图很强、需要同时讲卖点的商品展示场景。",
      sortOrder: 710,
    },
    [
      imageField("image.hero", "主图资源"),
      textField("text.badge", "标签文案", "Best Seller"),
      textField("text.title", "主标题", "Desk Mat Collection"),
      textareaField("text.subtitle", "说明文案", "Smooth glide surface with vibrant all-over print.", 3),
      colorField("color.accent", "强调色"),
      colorField("color.surface", "底色"),
      fontField("font.title", "标题字体"),
    ],
    {
      image: {
        hero: createPlaceholderImageBinding("builtin-desk-mat", "Desk Mat", "#0f766e", "#ecfeff"),
      },
      text: {
        badge: "Best Seller",
        title: "Desk Mat Collection",
        subtitle: "Smooth glide surface with vibrant all-over print.",
      },
      color: {
        accent: createPureColor("#0f766e"),
        surface: createPureColor("#ecfeff"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .showcase{width:100%;height:100%;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);background:{{color.surface}};overflow:hidden;}
      .showcase__visual{position:relative;padding:8%;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.14));}
      .showcase__visual::after{content:"";position:absolute;inset:11%;border-radius:30px;border:2px dashed rgba(15,118,110,.18);}
      .showcase__image{position:relative;z-index:1;width:100%;max-width:92%;aspect-ratio:1/1;object-fit:cover;border-radius:28px;box-shadow:0 26px 60px rgba(15,23,42,.18);}
      .showcase__content{padding:10% 9% 10% 0;display:flex;flex-direction:column;justify-content:center;}
      .showcase__badge{display:inline-flex;align-self:flex-start;padding:9px 16px;border-radius:999px;background:rgba(15,118,110,.12);color:{{color.accent}};font-size:clamp(11px,1.5vw,13px);font-weight:700;letter-spacing:.12em;text-transform:uppercase;}
      .showcase__title{margin:18px 0 14px;font-size:clamp(32px,5vw,62px);line-height:.95;color:#062c30;font-weight:900;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .showcase__subtitle{font-size:clamp(13px,1.7vw,16px);line-height:1.7;color:rgba(6,44,48,.76);}
      .showcase__accent{width:130px;height:12px;border-radius:999px;background:linear-gradient(90deg, {{color.accent}}, rgba(15,118,110,.12));margin-top:26px;}
    </style>
    <div class="showcase">
      <div class="showcase__visual">
        <img class="showcase__image" src="{{image.hero.url}}" alt="{{image.hero.name}}" />
      </div>
      <div class="showcase__content">
        <div class="showcase__badge">{{text.badge}}</div>
        <div class="showcase__title">{{text.title}}</div>
        <div class="showcase__subtitle">{{text.subtitle}}</div>
        <div class="showcase__accent"></div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "sale-tag-card",
      name: "促销价格签",
      category: "营销 / 展示",
      description: "适合促销图、价格牌、优惠角标等运营场景，结构直观且便于快速换价。",
      tags: ["价格", "促销", "运营", "优惠"],
      difficulty: "simple",
      printStyle: "marketing",
      suitableProducts: ["促销角标", "价格图", "活动卡片", "限时折扣图"],
      sceneDescription: "适合电商上新、清仓、节日折扣等快速运营场景。",
      sortOrder: 720,
    },
    [
      textField("text.tag", "促销标签", "Weekend Drop"),
      textField("text.price", "价格", "$18"),
      textareaField("text.caption", "说明文案", "Limited run. Ships in 48 hours.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.price", "价格字体"),
    ],
    {
      text: {
        tag: "Weekend Drop",
        price: "$18",
        caption: "Limited run. Ships in 48 hours.",
      },
      color: {
        background: createPureColor("#fff1f2"),
        primary: createPureColor("#e11d48"),
        secondary: createPureColor("#111827"),
      },
      font: {
        price: defaultFontBinding,
      },
    },
    `<style>
      .sale-tag{width:100%;height:100%;padding:8%;box-sizing:border-box;background:{{color.background}};display:flex;align-items:center;justify-content:center;}
      .sale-tag__inner{width:100%;height:100%;border-radius:36px;padding:10%;box-sizing:border-box;background:linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.55));box-shadow:0 28px 70px rgba(225,29,72,.16);display:grid;grid-template-columns:minmax(0,.84fr) minmax(0,1fr);align-items:center;gap:20px;}
      .sale-tag__badge{display:inline-flex;align-self:flex-start;padding:10px 16px;border-radius:999px;background:{{color.primary}};color:#fff;font-size:clamp(11px,1.5vw,13px);font-weight:700;letter-spacing:.12em;text-transform:uppercase;}
      .sale-tag__caption{margin-top:14px;font-size:clamp(13px,1.7vw,15px);line-height:1.7;color:rgba(17,24,39,.72);}
      .sale-tag__priceBox{display:flex;flex-direction:column;align-items:flex-end;text-align:right;}
      .sale-tag__price{font-size:clamp(48px,8vw,112px);line-height:.88;color:{{color.secondary}};font-weight:900;font-family:{{font.price.family}}, "Arial Black", sans-serif;}
      .sale-tag__rule{margin-top:18px;width:120px;height:12px;border-radius:999px;background:linear-gradient(90deg, {{color.primary}}, rgba(225,29,72,.12));}
    </style>
    <div class="sale-tag">
      <div class="sale-tag__inner">
        <div>
          <div class="sale-tag__badge">{{text.tag}}</div>
          <div class="sale-tag__caption">{{text.caption}}</div>
        </div>
        <div class="sale-tag__priceBox">
          <div class="sale-tag__price">{{text.price}}</div>
          <div class="sale-tag__rule"></div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "drop-launch-banner",
      name: "新品发售倒计时横幅",
      category: "营销 / 展示",
      description: "适合活动页、社媒卡片或新品 Drop 预告，突出时间感和发售节奏。",
      tags: ["新品", "倒计时", "发售", "横幅"],
      difficulty: "advanced",
      printStyle: "marketing",
      suitableProducts: ["上新横幅", "社媒封面", "活动预热图", "新品倒计时卡"],
      sceneDescription: "适合做品牌 Drop、联名预热和限量发售，画面节奏感会更强。",
      sortOrder: 730,
    },
    [
      textField("text.kicker", "标签", "Next Drop"),
      textField("text.title", "主标题", "00 : 48 : 21"),
      textField("text.subtitle", "副标题", "Launches Friday 10:00 AM"),
      textareaField("text.note", "说明", "Use for release countdowns, popup promotions, or short-run product launches.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "副色"),
      fontField("font.title", "数字字体"),
    ],
    {
      text: {
        kicker: "Next Drop",
        title: "00 : 48 : 21",
        subtitle: "Launches Friday 10:00 AM",
        note: "Use for release countdowns, popup promotions, or short-run product launches.",
      },
      color: {
        background: createPureColor("#0f172a"),
        primary: createPureColor("#f8fafc"),
        secondary: createPureColor("#22d3ee"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .launch{width:100%;height:100%;position:relative;overflow:hidden;padding:7%;box-sizing:border-box;background:
        radial-gradient(circle at 16% 22%, rgba(34,211,238,.22), transparent 18%),
        radial-gradient(circle at 82% 28%, rgba(56,189,248,.18), transparent 18%),
        linear-gradient(135deg, {{color.background}}, #020617);}
      .launch::before{content:"";position:absolute;inset:0;background:
        linear-gradient(transparent 0 96%, rgba(255,255,255,.06) 96% 100%),
        linear-gradient(90deg, transparent 0 96%, rgba(255,255,255,.04) 96% 100%);
        background-size:100% 24px, 24px 100%;
        opacity:.42;}
      .launch__card{position:relative;z-index:1;width:100%;height:100%;border-radius:28px;padding:7%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.14);}
      .launch__kicker{align-self:flex-start;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.08);font-size:clamp(11px,1.4vw,13px);letter-spacing:.18em;text-transform:uppercase;color:#cbd5e1;}
      .launch__title{font-size:clamp(48px,8vw,120px);line-height:.88;font-weight:900;letter-spacing:-.08em;color:{{color.primary}};font-family:{{font.title.family}}, "Arial Black", sans-serif;text-shadow:0 0 28px rgba(34,211,238,.18);}
      .launch__subtitle{margin-top:12px;font-size:clamp(15px,2vw,20px);font-weight:700;color:{{color.secondary}};}
      .launch__note{max-width:50%;font-size:clamp(12px,1.6vw,14px);line-height:1.7;color:rgba(226,232,240,.72);}
    </style>
    <div class="launch">
      <div class="launch__card">
        <div class="launch__kicker">{{text.kicker}}</div>
        <div>
          <div class="launch__title">{{text.title}}</div>
          <div class="launch__subtitle">{{text.subtitle}}</div>
        </div>
        <div class="launch__note">{{text.note}}</div>
      </div>
    </div>`
  ),
];
