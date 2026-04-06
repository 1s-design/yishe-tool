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

export const labelTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "hang-tag-minimal",
      name: "极简吊牌标签",
      category: "标签 / 辅料",
      description: "适合服饰、配件和礼品类商品的吊牌设计，强调简洁品牌识别。",
      tags: ["吊牌", "标签", "服饰", "极简"],
      difficulty: "simple",
      printStyle: "label",
      suitableProducts: ["服饰吊牌", "礼品标签", "挂卡", "配饰品牌牌"],
      sceneDescription: "适合品牌名、系列名和一句副标题，便于快速做出成套标签。",
      sortOrder: 510,
    },
    [
      textField("text.brand", "品牌名", "STUDIO 1S"),
      textField("text.title", "系列标题", "Everyday Print"),
      textField("text.meta", "底部信息", "Designed for small rituals"),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        brand: "STUDIO 1S",
        title: "Everyday Print",
        meta: "Designed for small rituals",
      },
      color: {
        background: createPureColor("#ffffff"),
        primary: createPureColor("#111827"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .hang-tag{width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:7%;box-sizing:border-box;background:#f8fafc;}
      .hang-tag__card{width:min(72%,420px);height:100%;max-height:680px;background:{{color.background}};border-radius:28px;padding:10% 12%;box-sizing:border-box;position:relative;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 24px 60px rgba(15,23,42,.12);}
      .hang-tag__hole{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:24px;height:24px;border-radius:50%;box-shadow:0 0 0 8px #f8fafc inset;background:#fff;border:1px solid rgba(15,23,42,.08);}
      .hang-tag__brand{margin-top:22%;font-size:clamp(11px,1.5vw,13px);letter-spacing:.3em;text-transform:uppercase;color:#64748b;text-align:center;}
      .hang-tag__title{font-size:clamp(30px,5vw,56px);line-height:.96;font-weight:900;letter-spacing:-.04em;color:{{color.primary}};text-align:center;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .hang-tag__meta{font-size:clamp(12px,1.6vw,14px);line-height:1.6;color:#6b7280;text-align:center;}
    </style>
    <div class="hang-tag">
      <div class="hang-tag__card">
        <div class="hang-tag__hole"></div>
        <div class="hang-tag__brand">{{text.brand}}</div>
        <div class="hang-tag__title">{{text.title}}</div>
        <div class="hang-tag__meta">{{text.meta}}</div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "neck-label-strip",
      name: "领标条带风格",
      category: "标签 / 辅料",
      description: "模拟服饰内领标和织唛条带，适合展示品牌、尺码和产地信息。",
      tags: ["领标", "织唛", "尺码", "服饰"],
      difficulty: "intermediate",
      printStyle: "label",
      suitableProducts: ["T 恤领标", "卫衣织唛", "服饰内标", "尺码标签"],
      sceneDescription: "适合服装 POD 衍生物料或展示图，也能作为品牌标识模板长期复用。",
      sortOrder: 520,
    },
    [
      textField("text.brand", "品牌名", "1S APPAREL"),
      textField("text.size", "尺码", "XL"),
      textField("text.origin", "产地说明", "Designed in Shanghai"),
      textField("text.material", "材质说明", "100% Cotton"),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "品牌字体"),
    ],
    {
      text: {
        brand: "1S APPAREL",
        size: "XL",
        origin: "Designed in Shanghai",
        material: "100% Cotton",
      },
      color: {
        background: createPureColor("#e2e8f0"),
        primary: createPureColor("#111827"),
        secondary: createPureColor("#f8fafc"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      .neck-label{width:100%;height:100%;padding:8%;box-sizing:border-box;background:{{color.background}};display:flex;align-items:center;justify-content:center;}
      .neck-label__strip{width:100%;height:min(56%,340px);border-radius:26px;background:{{color.primary}};color:{{color.secondary}};padding:6%;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;box-shadow:0 24px 48px rgba(15,23,42,.16);}
      .neck-label__brand{font-size:clamp(28px,4vw,48px);line-height:.94;font-weight:900;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .neck-label__meta{margin-top:14px;display:flex;flex-wrap:wrap;gap:10px 16px;font-size:clamp(12px,1.6vw,14px);color:rgba(248,250,252,.72);}
      .neck-label__size{display:grid;place-items:center;min-width:min(20vw,120px);padding:0 16px;border-radius:20px;background:rgba(255,255,255,.08);font-size:clamp(34px,5vw,56px);font-weight:900;}
    </style>
    <div class="neck-label">
      <div class="neck-label__strip">
        <div>
          <div class="neck-label__brand">{{text.brand}}</div>
          <div class="neck-label__meta">
            <span>{{text.origin}}</span>
            <span>{{text.material}}</span>
          </div>
        </div>
        <div class="neck-label__size">{{text.size}}</div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "product-spec-label",
      name: "规格信息标签",
      category: "标签 / 辅料",
      description: "适合把材质、容量、工艺等做成规整标签块，方便商品图或包装直接复用。",
      tags: ["规格", "材质", "容量", "信息标签"],
      difficulty: "simple",
      printStyle: "info-card",
      suitableProducts: ["产品信息牌", "包装标签", "容量说明", "商品卖点标签"],
      sceneDescription: "适合把三到四条关键属性做成统一规范的信息模块，便于多平台复用。",
      sortOrder: 530,
    },
    [
      textField("text.title", "标题", "Product Specs"),
      textField("text.item1", "规格 1", "Ceramic body"),
      textField("text.item2", "规格 2", "11 oz"),
      textField("text.item3", "规格 3", "Dishwasher safe"),
      textareaField("text.note", "补充说明", "Compact, readable, and easy to reuse across product pages.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
    ],
    {
      text: {
        title: "Product Specs",
        item1: "Ceramic body",
        item2: "11 oz",
        item3: "Dishwasher safe",
        note: "Compact, readable, and easy to reuse across product pages.",
      },
      color: {
        background: createPureColor("#ffffff"),
        primary: createPureColor("#0f172a"),
        secondary: createPureColor("#14b8a6"),
      },
    },
    `<style>
      .spec-label{width:100%;height:100%;padding:7%;box-sizing:border-box;background:#ecfeff;display:flex;align-items:center;justify-content:center;}
      .spec-label__panel{width:100%;height:100%;border-radius:26px;background:{{color.background}};padding:8%;box-sizing:border-box;border:1px solid rgba(15,23,42,.08);display:flex;flex-direction:column;box-shadow:0 18px 40px rgba(15,23,42,.08);}
      .spec-label__title{font-size:clamp(26px,4vw,42px);line-height:1;font-weight:900;color:{{color.primary}};}
      .spec-label__list{display:grid;gap:10px;margin-top:16px;}
      .spec-label__item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:14px;background:rgba(20,184,166,.08);}
      .spec-label__dot{width:10px;height:10px;border-radius:50%;background:{{color.secondary}};flex-shrink:0;}
      .spec-label__text{font-size:clamp(13px,1.7vw,15px);font-weight:600;color:#1e293b;}
      .spec-label__note{margin-top:auto;font-size:clamp(12px,1.5vw,13px);line-height:1.6;color:#64748b;}
    </style>
    <div class="spec-label">
      <div class="spec-label__panel">
        <div class="spec-label__title">{{text.title}}</div>
        <div class="spec-label__list">
          <div class="spec-label__item"><div class="spec-label__dot"></div><div class="spec-label__text">{{text.item1}}</div></div>
          <div class="spec-label__item"><div class="spec-label__dot"></div><div class="spec-label__text">{{text.item2}}</div></div>
          <div class="spec-label__item"><div class="spec-label__dot"></div><div class="spec-label__text">{{text.item3}}</div></div>
        </div>
        <div class="spec-label__note">{{text.note}}</div>
      </div>
    </div>`
  ),
];
