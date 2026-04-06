import type { HtmlTemplateDefinition } from "../types";
import {
  colorField,
  createPureColor,
  createTemplate,
  textField,
  textareaField,
} from "./shared";

export const infoCardTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "feature-grid-panel",
      name: "功能信息网格",
      category: "信息 / 说明卡",
      description: "用 2 x 2 网格快速呈现卖点、规格和优势，适合商品详情页插图。",
      tags: ["信息", "网格", "规格", "卖点"],
      difficulty: "simple",
      printStyle: "info-card",
      suitableProducts: ["商品详情配图", "卖点说明卡", "产品介绍图", "对比信息块"],
      sceneDescription: "适合把四个核心优势排成一张清晰信息卡，适配绝大多数商品。",
      sortOrder: 610,
    },
    [
      textField("text.title", "标题", "Why this print works"),
      textField("text.item1", "卡片 1", "Matte finish"),
      textField("text.item2", "卡片 2", "Fade resistant"),
      textField("text.item3", "卡片 3", "Soft edge stroke"),
      textField("text.item4", "卡片 4", "Gift ready"),
      colorField("color.background", "背景色"),
      colorField("color.accent", "强调色"),
    ],
    {
      text: {
        title: "Why this print works",
        item1: "Matte finish",
        item2: "Fade resistant",
        item3: "Soft edge stroke",
        item4: "Gift ready",
      },
      color: {
        background: createPureColor("#f8fafc"),
        accent: createPureColor("#7c3aed"),
      },
    },
    `<style>
      .feature-grid{width:100%;height:100%;padding:8%;box-sizing:border-box;background:{{color.background}};display:flex;flex-direction:column;gap:18px;}
      .feature-grid__title{font-size:clamp(30px,4vw,48px);line-height:1;font-weight:900;color:#111827;}
      .feature-grid__panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;flex:1;}
      .feature-grid__item{padding:20px;border-radius:24px;background:#fff;box-shadow:0 16px 32px rgba(15,23,42,.08);display:flex;align-items:flex-end;position:relative;overflow:hidden;}
      .feature-grid__item::before{content:"";position:absolute;inset:auto auto 0 0;width:72px;height:72px;border-radius:24px 24px 0 0;background:linear-gradient(135deg, {{color.accent}}, rgba(124,58,237,.12));opacity:.18;}
      .feature-grid__label{position:relative;z-index:1;font-size:clamp(16px,2.4vw,20px);font-weight:700;color:#0f172a;line-height:1.25;}
    </style>
    <div class="feature-grid">
      <div class="feature-grid__title">{{text.title}}</div>
      <div class="feature-grid__panel">
        <div class="feature-grid__item"><div class="feature-grid__label">{{text.item1}}</div></div>
        <div class="feature-grid__item"><div class="feature-grid__label">{{text.item2}}</div></div>
        <div class="feature-grid__item"><div class="feature-grid__label">{{text.item3}}</div></div>
        <div class="feature-grid__item"><div class="feature-grid__label">{{text.item4}}</div></div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "comparison-spec-card",
      name: "参数对比说明卡",
      category: "信息 / 说明卡",
      description: "适合两组方案、两种材质或两种规格的对比说明，结构规整且容易换词。",
      tags: ["对比", "参数", "规格", "说明卡"],
      difficulty: "intermediate",
      printStyle: "info-card",
      suitableProducts: ["商品对比图", "材质对比卡", "套餐说明图", "版本差异展示"],
      sceneDescription: "适合在同一模板里展示 A/B 两套参数，电商详情页里非常常用。",
      sortOrder: 620,
    },
    [
      textField("text.title", "标题", "Compare Options"),
      textField("text.leftTitle", "左标题", "Standard"),
      textField("text.leftMeta", "左说明", "Lightweight and flexible"),
      textField("text.rightTitle", "右标题", "Premium"),
      textField("text.rightMeta", "右说明", "Dense texture and richer color hold"),
      textareaField("text.footer", "底部说明", "Use this card when the product line has two clear versions or material tiers.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
    ],
    {
      text: {
        title: "Compare Options",
        leftTitle: "Standard",
        leftMeta: "Lightweight and flexible",
        rightTitle: "Premium",
        rightMeta: "Dense texture and richer color hold",
        footer: "Use this card when the product line has two clear versions or material tiers.",
      },
      color: {
        background: createPureColor("#f8fafc"),
        primary: createPureColor("#111827"),
        secondary: createPureColor("#2563eb"),
      },
    },
    `<style>
      .compare-card{width:100%;height:100%;padding:8%;box-sizing:border-box;background:{{color.background}};display:flex;flex-direction:column;}
      .compare-card__title{font-size:clamp(30px,4vw,46px);font-weight:900;line-height:1;color:{{color.primary}};}
      .compare-card__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px;flex:1;}
      .compare-card__panel{border-radius:24px;padding:20px;background:#fff;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 16px 36px rgba(15,23,42,.08);position:relative;overflow:hidden;}
      .compare-card__panel::before{content:"";position:absolute;inset:auto 0 0 0;height:10px;background:linear-gradient(90deg, {{color.secondary}}, rgba(37,99,235,.12));}
      .compare-card__panelTitle{font-size:clamp(22px,3vw,30px);font-weight:800;color:#0f172a;}
      .compare-card__panelMeta{margin-top:10px;font-size:clamp(13px,1.7vw,15px);line-height:1.7;color:#64748b;}
      .compare-card__footer{margin-top:16px;font-size:clamp(12px,1.5vw,13px);line-height:1.7;color:#475569;max-width:88%;}
    </style>
    <div class="compare-card">
      <div class="compare-card__title">{{text.title}}</div>
      <div class="compare-card__grid">
        <div class="compare-card__panel">
          <div class="compare-card__panelTitle">{{text.leftTitle}}</div>
          <div class="compare-card__panelMeta">{{text.leftMeta}}</div>
        </div>
        <div class="compare-card__panel">
          <div class="compare-card__panelTitle">{{text.rightTitle}}</div>
          <div class="compare-card__panelMeta">{{text.rightMeta}}</div>
        </div>
      </div>
      <div class="compare-card__footer">{{text.footer}}</div>
    </div>`
  ),
  createTemplate(
    {
      id: "review-proof-card",
      name: "口碑 / 评论证明卡",
      category: "信息 / 说明卡",
      description: "适合把评分、简短评价和标签放进一张证据感强的卡片里，用于商品背书。",
      tags: ["评价", "评分", "口碑", "背书"],
      difficulty: "simple",
      printStyle: "marketing",
      suitableProducts: ["商品背书图", "评价摘要卡", "社媒截图替代图", "评论型卖点卡"],
      sceneDescription: "适合整理真实评论或摘要评价，在详情页和广告页都能单独使用。",
      sortOrder: 630,
    },
    [
      textField("text.rating", "评分", "4.9"),
      textField("text.title", "标题", "Loved by creators"),
      textareaField("text.review", "评论", "Great color hold, surprisingly premium feel, and the layout stays sharp even on larger formats.", 3),
      textField("text.tag1", "标签 1", "Fast feedback"),
      textField("text.tag2", "标签 2", "Repeat orders"),
      textField("text.tag3", "标签 3", "Gift-ready"),
      colorField("color.background", "背景色"),
      colorField("color.accent", "强调色"),
    ],
    {
      text: {
        rating: "4.9",
        title: "Loved by creators",
        review: "Great color hold, surprisingly premium feel, and the layout stays sharp even on larger formats.",
        tag1: "Fast feedback",
        tag2: "Repeat orders",
        tag3: "Gift-ready",
      },
      color: {
        background: createPureColor("#fff7ed"),
        accent: createPureColor("#f97316"),
      },
    },
    `<style>
      .review-card{width:100%;height:100%;padding:8%;box-sizing:border-box;background:{{color.background}};display:flex;align-items:center;justify-content:center;}
      .review-card__panel{width:100%;height:100%;border-radius:28px;padding:8%;box-sizing:border-box;background:#fff;box-shadow:0 20px 48px rgba(15,23,42,.08);display:flex;flex-direction:column;}
      .review-card__top{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;}
      .review-card__rating{font-size:clamp(48px,7vw,84px);line-height:.86;font-weight:900;color:#111827;}
      .review-card__title{font-size:clamp(20px,3vw,28px);font-weight:800;color:#111827;}
      .review-card__review{margin-top:16px;font-size:clamp(13px,1.7vw,15px);line-height:1.75;color:#475569;flex:1;}
      .review-card__tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;}
      .review-card__tag{padding:8px 12px;border-radius:999px;background:rgba(249,115,22,.08);color:{{color.accent}};font-size:clamp(11px,1.5vw,13px);font-weight:700;}
    </style>
    <div class="review-card">
      <div class="review-card__panel">
        <div class="review-card__top">
          <div class="review-card__rating">{{text.rating}}</div>
          <div class="review-card__title">{{text.title}}</div>
        </div>
        <div class="review-card__review">{{text.review}}</div>
        <div class="review-card__tags">
          <div class="review-card__tag">{{text.tag1}}</div>
          <div class="review-card__tag">{{text.tag2}}</div>
          <div class="review-card__tag">{{text.tag3}}</div>
        </div>
      </div>
    </div>`
  ),
];
