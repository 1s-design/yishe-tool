import type { HtmlTemplateDefinition } from "../types";
import {
  colorField,
  createPureColor,
  createTemplate,
  defaultFontBinding,
  fontField,
  numberField,
  textField,
  textareaField,
} from "./shared";

export const allOverPrintTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "desk-mat-wave-grid",
      name: "鼠标垫全幅波纹网格",
      category: "全幅印花",
      description: "横向排版更适合桌垫、鼠标垫和长条类商品，兼顾大字和满版纹理。",
      tags: ["鼠标垫", "桌垫", "全幅", "波纹", "网格"],
      difficulty: "simple",
      printStyle: "all-over",
      suitableProducts: ["鼠标垫", "桌垫", "瑜伽垫", "围巾印花"],
      sceneDescription: "适合做带有系列名的大面积底图，画布变宽时视觉仍然稳定。",
      sortOrder: 210,
    },
    [
      textField("text.kicker", "标签", "All Over Print"),
      textField("text.title", "标题", "Motion Surface"),
      textareaField("text.subtitle", "副标题", "Fluid lines for long-format products and wide canvas layouts.", 2),
      colorField("color.background", "背景色"),
      colorField("color.accent", "强调色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "标题字体"),
      numberField("number.gridOpacity", "网格透明度", {
        min: 8,
        max: 40,
        step: 1,
        placeholder: "18",
        description: "控制背景网格的强弱，数值越大越明显。",
      }),
    ],
    {
      text: {
        kicker: "All Over Print",
        title: "Motion Surface",
        subtitle: "Fluid lines for long-format products and wide canvas layouts.",
      },
      color: {
        background: createPureColor("#0f172a"),
        accent: createPureColor("#22d3ee"),
        secondary: createPureColor("#f97316"),
      },
      font: {
        title: defaultFontBinding,
      },
      number: {
        gridOpacity: 18,
      },
    },
    `<style>
      .desk-mat{width:100%;height:100%;position:relative;overflow:hidden;padding:6.5%;box-sizing:border-box;background:
        radial-gradient(circle at 12% 18%, rgba(255,255,255,.08), transparent 20%),
        linear-gradient(125deg, {{color.background}}, #111827);}
      .desk-mat::before{content:"";position:absolute;inset:0;background:
        linear-gradient(rgba(255,255,255,calc({{number.gridOpacity}} / 100)) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,calc({{number.gridOpacity}} / 100)) 1px, transparent 1px);
        background-size:clamp(18px,2.8vw,26px) clamp(18px,2.8vw,26px);
        opacity:.72;}
      .desk-mat::after{content:"";position:absolute;inset:auto -6% -24% auto;width:50%;aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle, rgba(249,115,22,.34), transparent 66%);filter:blur(8px);}
      .desk-mat__waves{position:absolute;inset:8% 4%;background:
        radial-gradient(120% 90% at 20% 50%, transparent 53%, rgba(34,211,238,.42) 54% 56%, transparent 57%),
        radial-gradient(120% 90% at 48% 50%, transparent 53%, rgba(34,211,238,.34) 54% 56%, transparent 57%),
        radial-gradient(120% 90% at 76% 50%, transparent 53%, rgba(249,115,22,.28) 54% 56%, transparent 57%);
        opacity:.86;}
      .desk-mat__content{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#fff;}
      .desk-mat__kicker{align-self:flex-start;padding:9px 14px;border-radius:999px;background:rgba(255,255,255,.08);backdrop-filter:blur(12px);font-size:clamp(11px,1.4vw,13px);letter-spacing:.16em;text-transform:uppercase;font-weight:700;}
      .desk-mat__title{margin-top:auto;font-size:clamp(40px,6.4vw,86px);line-height:.88;font-weight:900;letter-spacing:-.05em;max-width:58%;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .desk-mat__subtitle{margin-top:16px;max-width:52%;font-size:clamp(13px,1.6vw,16px);line-height:1.6;color:rgba(255,255,255,.76);}
      .desk-mat__bar{margin-top:22px;width:min(34vw,220px);height:12px;border-radius:999px;background:linear-gradient(90deg, {{color.accent}}, {{color.secondary}});}
    </style>
    <div class="desk-mat">
      <div class="desk-mat__waves"></div>
      <div class="desk-mat__content">
        <div class="desk-mat__kicker">{{text.kicker}}</div>
        <div>
          <div class="desk-mat__title">{{text.title}}</div>
          <div class="desk-mat__subtitle">{{text.subtitle}}</div>
          <div class="desk-mat__bar"></div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "mug-wrap-orbit-lines",
      name: "杯身环绕轨道线",
      category: "全幅印花",
      description: "专门适合横向杯身、保温杯、瓶身环绕视觉，做成连续包裹的印花更自然。",
      tags: ["杯子", "环绕", "线条", "横版"],
      difficulty: "intermediate",
      printStyle: "all-over",
      suitableProducts: ["马克杯", "保温杯", "玻璃杯", "瓶身贴"],
      sceneDescription: "适合文字 logo 和抽象线条结合，避免中间过空，适配横向长画布。",
      sortOrder: 220,
    },
    [
      textField("text.title", "主标题", "Orbit Brew"),
      textField("text.subtitle", "副标题", "Sip slowly"),
      textField("text.note", "补充文案", "Wrapped around the mug in one continuous rhythm."),
      colorField("color.background", "背景色"),
      colorField("color.accent", "主线条色"),
      colorField("color.secondary", "副线条色"),
      fontField("font.title", "标题字体"),
      numberField("number.arc", "轨道粗细", {
        min: 6,
        max: 28,
        step: 1,
        placeholder: "16",
        description: "控制圆弧轨道的粗细。",
      }),
    ],
    {
      text: {
        title: "Orbit Brew",
        subtitle: "Sip slowly",
        note: "Wrapped around the mug in one continuous rhythm.",
      },
      color: {
        background: createPureColor("#faf5ff"),
        accent: createPureColor("#7c3aed"),
        secondary: createPureColor("#ec4899"),
      },
      font: {
        title: defaultFontBinding,
      },
      number: {
        arc: 16,
      },
    },
    `<style>
      .mug-wrap{width:100%;height:100%;position:relative;overflow:hidden;padding:6%;box-sizing:border-box;background:
        linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,.18)),
        {{color.background}};}
      .mug-wrap__orbit{position:absolute;inset:-10% -8%;background:
        radial-gradient(circle at 20% 52%, transparent 0 26%, rgba(124,58,237,.08) 26.5% 27.2%, transparent 27.8%),
        radial-gradient(circle at 50% 50%, transparent 0 34%, rgba(124,58,237,.18) 34.4% calc(34.4% + {{number.arc}}px), transparent calc(35.2% + {{number.arc}}px)),
        radial-gradient(circle at 74% 46%, transparent 0 42%, rgba(236,72,153,.24) 42.5% calc(42.5% + {{number.arc}}px), transparent calc(43.2% + {{number.arc}}px));
        filter:blur(.1px);}
      .mug-wrap__content{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;}
      .mug-wrap__subtitle{font-size:clamp(12px,1.6vw,14px);font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:{{color.accent}};}
      .mug-wrap__title{margin-top:14px;font-size:clamp(42px,7vw,96px);line-height:.9;font-weight:900;letter-spacing:-.06em;color:#3b0764;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .mug-wrap__note{margin-top:12px;max-width:58%;font-size:clamp(12px,1.6vw,15px);line-height:1.65;color:rgba(59,7,100,.7);}
      .mug-wrap__chips{margin-top:24px;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;}
      .mug-wrap__chip{padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.7);border:1px solid rgba(124,58,237,.12);font-size:clamp(11px,1.4vw,13px);color:#6b21a8;}
    </style>
    <div class="mug-wrap">
      <div class="mug-wrap__orbit"></div>
      <div class="mug-wrap__content">
        <div class="mug-wrap__subtitle">{{text.subtitle}}</div>
        <div class="mug-wrap__title">{{text.title}}</div>
        <div class="mug-wrap__note">{{text.note}}</div>
        <div class="mug-wrap__chips">
          <div class="mug-wrap__chip">360 wrap</div>
          <div class="mug-wrap__chip">smooth loop</div>
          <div class="mug-wrap__chip">{{text.subtitle}}</div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "repeat-monogram-swatch",
      name: "重复字母纹样底版",
      category: "全幅印花",
      description: "用重复字母和色块生成可延展的底纹，适合 tote、抱枕、布料和礼品类 POD 图案。",
      tags: ["纹样", "重复", "字母", "底纹", "Tote"],
      difficulty: "advanced",
      printStyle: "pattern",
      suitableProducts: ["帆布袋", "抱枕", "布料样版", "礼品包装纸"],
      sceneDescription: "适合做品牌字母纹样、联名底纹和高识别度的持续图案。",
      sortOrder: 230,
    },
    [
      textField("text.letter", "核心字母", "S"),
      textField("text.caption", "说明文案", "Repeat, scale, and tile."),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主纹样色"),
      colorField("color.secondary", "副纹样色"),
      fontField("font.title", "字母字体"),
      numberField("number.tile", "纹样尺寸", {
        min: 72,
        max: 180,
        step: 2,
        placeholder: "118",
        description: "控制每个重复模块的尺寸。",
      }),
    ],
    {
      text: {
        letter: "S",
        caption: "Repeat, scale, and tile.",
      },
      color: {
        background: createPureColor("#f8fafc"),
        primary: createPureColor("#0f172a"),
        secondary: createPureColor("#38bdf8"),
      },
      font: {
        title: defaultFontBinding,
      },
      number: {
        tile: 118,
      },
    },
    `<style>
      .repeat-swatch{width:100%;height:100%;position:relative;overflow:hidden;background:{{color.background}};}
      .repeat-swatch__pattern{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4, minmax(0,1fr));grid-template-rows:repeat(3, minmax(0,1fr));}
      .repeat-swatch__cell{display:grid;place-items:center;position:relative;overflow:hidden;}
      .repeat-swatch__cell:nth-child(odd){background:rgba(15,23,42,.03);}
      .repeat-swatch__cell:nth-child(3n){background:rgba(56,189,248,.08);}
      .repeat-swatch__letter{font-size:min(calc({{number.tile}} * 1px), 18vw);line-height:1;font-weight:900;letter-spacing:-.08em;color:{{color.primary}};font-family:{{font.title.family}}, "Arial Black", sans-serif;opacity:.92;}
      .repeat-swatch__cell:nth-child(even) .repeat-swatch__letter{color:{{color.secondary}};}
      .repeat-swatch__cell::after{content:"";position:absolute;inset:auto 10% 16% 10%;height:10%;border-radius:999px;background:linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);opacity:.55;}
      .repeat-swatch__meta{position:absolute;left:4.5%;right:4.5%;bottom:5%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 14px;border-radius:18px;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);box-shadow:0 14px 26px rgba(15,23,42,.08);}
      .repeat-swatch__meta strong{font-size:clamp(12px,1.6vw,14px);color:#0f172a;letter-spacing:.18em;text-transform:uppercase;}
      .repeat-swatch__meta span{font-size:clamp(11px,1.4vw,13px);color:#475569;}
    </style>
    <div class="repeat-swatch">
      <div class="repeat-swatch__pattern">
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
        <div class="repeat-swatch__cell"><div class="repeat-swatch__letter">{{text.letter}}</div></div>
      </div>
      <div class="repeat-swatch__meta">
        <strong>Pattern Tile</strong>
        <span>{{text.caption}}</span>
      </div>
    </div>`
  ),
];
