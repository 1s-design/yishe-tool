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

export const packagingTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "thank-you-insert",
      name: "感谢卡 / 包装插卡",
      category: "包装 / 插卡",
      description: "适合放进订单包裹里的品牌感谢卡，适用于 POD 出货随包附赠。",
      tags: ["包装", "感谢卡", "品牌", "插卡"],
      difficulty: "simple",
      printStyle: "packaging",
      suitableProducts: ["感谢卡", "包装插卡", "售后卡", "订单随包小卡"],
      sceneDescription: "适合用品牌图、感谢语和社媒账号组成一张简洁出货卡。",
      sortOrder: 410,
    },
    [
      imageField("image.logo", "品牌图片"),
      textField("text.title", "标题", "Thanks for your order"),
      textareaField("text.message", "正文", "Your new favorite print is on the way.", 4),
      textField("text.footer", "页脚", "@studio1s"),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      fontField("font.title", "标题字体"),
    ],
    {
      image: {
        logo: createPlaceholderImageBinding("builtin-logo", "1S", "#1d4ed8", "#eff6ff"),
      },
      text: {
        title: "Thanks for your order",
        message: "Your new favorite print is on the way. Tag us when it lands on your desk or wall.",
        footer: "@studio1s",
      },
      color: {
        background: createPureColor("#eff6ff"),
        primary: createPureColor("#1d4ed8"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .insert-card{width:100%;height:100%;display:grid;grid-template-columns:minmax(120px, .72fr) minmax(0,1fr);gap:24px;padding:8%;box-sizing:border-box;background:{{color.background}};color:#111827;}
      .insert-card__logoWrap{display:flex;align-items:center;justify-content:center;}
      .insert-card__logo{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:28px;box-shadow:0 20px 48px rgba(29,78,216,.16);}
      .insert-card__content{display:flex;flex-direction:column;justify-content:center;}
      .insert-card__title{font-size:clamp(28px,4vw,52px);line-height:.98;font-weight:900;color:#0f172a;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .insert-card__message{margin-top:16px;font-size:clamp(13px,1.7vw,16px);line-height:1.7;color:rgba(15,23,42,.74);max-width:94%;}
      .insert-card__footer{margin-top:22px;display:flex;align-items:center;gap:12px;color:{{color.primary}};font-size:clamp(11px,1.5vw,13px);font-weight:700;letter-spacing:.18em;text-transform:uppercase;}
      .insert-card__footer::before{content:"";display:block;width:52px;height:2px;background:{{color.primary}};}
    </style>
    <div class="insert-card">
      <div class="insert-card__logoWrap">
        <img class="insert-card__logo" src="{{image.logo.url}}" alt="{{image.logo.name}}" />
      </div>
      <div class="insert-card__content">
        <div class="insert-card__title">{{text.title}}</div>
        <div class="insert-card__message">{{text.message}}</div>
        <div class="insert-card__footer">{{text.footer}}</div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "brand-story-fold-card",
      name: "品牌故事折页卡",
      category: "包装 / 插卡",
      description: "把品牌故事、理念和一条 CTA 放进一张折页感卡片，适合提升包装完整度。",
      tags: ["品牌故事", "折页", "包装", "介绍卡"],
      difficulty: "intermediate",
      printStyle: "packaging",
      suitableProducts: ["品牌故事卡", "包装内页", "品牌介绍小卡", "系列说明卡"],
      sceneDescription: "适合讲品牌起源、系列理念或工艺特色，比普通感谢卡信息承载更多。",
      sortOrder: 420,
    },
    [
      textField("text.eyebrow", "顶部标签", "Our Story"),
      textField("text.title", "主标题", "Built for daily rituals"),
      textareaField("text.body", "正文", "We design prints for objects that stay in your routine, from desk mats to everyday carry.", 4),
      textField("text.cta", "底部口号", "Keep creating"),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        eyebrow: "Our Story",
        title: "Built for daily rituals",
        body: "We design prints for objects that stay in your routine, from desk mats to everyday carry.",
        cta: "Keep creating",
      },
      color: {
        background: createPureColor("#fff7ed"),
        primary: createPureColor("#c2410c"),
        secondary: createPureColor("#7c2d12"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .story-card{width:100%;height:100%;position:relative;overflow:hidden;padding:7%;box-sizing:border-box;background:
        linear-gradient(140deg, rgba(255,255,255,.82), rgba(255,255,255,.34)),
        {{color.background}};}
      .story-card__fold{position:absolute;top:0;right:0;border-left:min(18vw,110px) solid transparent;border-bottom:min(18vw,110px) solid rgba(255,255,255,.8);}
      .story-card__layout{width:100%;height:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.42fr);gap:20px;border:1px solid rgba(124,45,18,.08);border-radius:26px;padding:7%;box-sizing:border-box;background:rgba(255,255,255,.6);}
      .story-card__eyebrow{font-size:clamp(11px,1.4vw,13px);letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:{{color.primary}};}
      .story-card__title{margin-top:14px;font-size:clamp(32px,5vw,60px);line-height:.94;font-weight:900;color:{{color.secondary}};font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .story-card__body{margin-top:14px;max-width:94%;font-size:clamp(13px,1.7vw,16px);line-height:1.7;color:rgba(124,45,18,.78);}
      .story-card__cta{align-self:end;justify-self:end;writing-mode:vertical-rl;text-orientation:mixed;font-size:clamp(14px,2vw,18px);letter-spacing:.18em;text-transform:uppercase;color:rgba(124,45,18,.42);}
    </style>
    <div class="story-card">
      <div class="story-card__fold"></div>
      <div class="story-card__layout">
        <div>
          <div class="story-card__eyebrow">{{text.eyebrow}}</div>
          <div class="story-card__title">{{text.title}}</div>
          <div class="story-card__body">{{text.body}}</div>
        </div>
        <div class="story-card__cta">{{text.cta}}</div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "care-instruction-card",
      name: "护理说明小卡",
      category: "包装 / 插卡",
      description: "适合衣物、织物、杯具等 POD 商品的洗护 / 使用说明，样式简洁便于标准化。",
      tags: ["护理说明", "洗护卡", "说明卡", "包装规范"],
      difficulty: "simple",
      printStyle: "info-card",
      suitableProducts: ["T 恤洗护卡", "抱枕说明卡", "杯具使用说明", "布艺护理卡"],
      sceneDescription: "适合把注意事项做成统一品牌卡，后续批量复用成本低。",
      sortOrder: 430,
    },
    [
      textField("text.title", "标题", "Care Guide"),
      textField("text.line1", "说明 1", "Cold wash only"),
      textField("text.line2", "说明 2", "Do not bleach"),
      textField("text.line3", "说明 3", "Dry flat in shade"),
      textField("text.footer", "底部说明", "Made to last longer with gentle care."),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
    ],
    {
      text: {
        title: "Care Guide",
        line1: "Cold wash only",
        line2: "Do not bleach",
        line3: "Dry flat in shade",
        footer: "Made to last longer with gentle care.",
      },
      color: {
        background: createPureColor("#f8fafc"),
        primary: createPureColor("#0f172a"),
        secondary: createPureColor("#0ea5e9"),
      },
    },
    `<style>
      .care-card{width:100%;height:100%;padding:8%;box-sizing:border-box;background:{{color.background}};display:flex;align-items:center;justify-content:center;}
      .care-card__panel{width:100%;height:100%;border-radius:24px;padding:8%;box-sizing:border-box;border:1px solid rgba(15,23,42,.08);background:#fff;display:flex;flex-direction:column;}
      .care-card__title{font-size:clamp(26px,4vw,42px);line-height:1;font-weight:900;color:{{color.primary}};}
      .care-card__list{margin-top:18px;display:grid;gap:12px;flex:1;}
      .care-card__item{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:16px;background:rgba(14,165,233,.06);}
      .care-card__icon{width:34px;height:34px;border-radius:12px;background:{{color.secondary}};opacity:.16;flex-shrink:0;}
      .care-card__label{font-size:clamp(13px,1.7vw,15px);font-weight:600;color:#1e293b;}
      .care-card__footer{margin-top:16px;font-size:clamp(12px,1.5vw,13px);line-height:1.6;color:#64748b;}
    </style>
    <div class="care-card">
      <div class="care-card__panel">
        <div class="care-card__title">{{text.title}}</div>
        <div class="care-card__list">
          <div class="care-card__item"><div class="care-card__icon"></div><div class="care-card__label">{{text.line1}}</div></div>
          <div class="care-card__item"><div class="care-card__icon"></div><div class="care-card__label">{{text.line2}}</div></div>
          <div class="care-card__item"><div class="care-card__icon"></div><div class="care-card__label">{{text.line3}}</div></div>
        </div>
        <div class="care-card__footer">{{text.footer}}</div>
      </div>
    </div>`
  ),
];
