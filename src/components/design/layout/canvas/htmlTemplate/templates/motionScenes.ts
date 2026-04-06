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

export const motionSceneTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "holographic-prism-poster",
      name: "全息棱镜海报",
      category: "动态 / 氛围",
      description: "适合赛博风、未来感、数字风主题，用全息光泽和棱镜面片制造很强的视觉存在感。",
      tags: ["全息", "棱镜", "赛博", "未来感", "渐变", "动效"],
      difficulty: "advanced",
      printStyle: "poster",
      suitableProducts: ["海报", "卫衣后背大图", "封面视觉", "数码风格印花"],
      sceneDescription: "适合做极强氛围主视觉，预览时会有轻微流动光泽效果，静态导出也有层次。",
      sortOrder: 910,
    },
    [
      textField("text.kicker", "顶部标签", "Holo Field"),
      textField("text.title", "主标题", "PRISM"),
      textareaField("text.note", "说明文案", "Iridescent layers, reflective bands and glass-like blocks for futuristic POD visuals.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "副色"),
      colorField("color.tertiary", "第三色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        kicker: "Holo Field",
        title: "PRISM",
        note: "Iridescent layers, reflective bands and glass-like blocks for futuristic POD visuals.",
      },
      color: {
        background: createPureColor("#020617"),
        primary: createPureColor("#22d3ee"),
        secondary: createPureColor("#a855f7"),
        tertiary: createPureColor("#fb7185"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      @keyframes prismSheenMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .prism-poster{width:100%;height:100%;position:relative;overflow:hidden;padding:7%;box-sizing:border-box;background:{{color.background}};}
      .prism-poster::before{content:"";position:absolute;inset:-10%;background:
        linear-gradient(120deg, rgba(255,255,255,.06), rgba(255,255,255,0) 28%, rgba(255,255,255,.12) 40%, rgba(255,255,255,0) 58%, rgba(255,255,255,.08)),
        linear-gradient(135deg, {{color.primary}}, {{color.secondary}}, {{color.tertiary}}, {{color.primary}});
        background-size:200% 200%;
        opacity:.64;filter:blur(8px);animation:prismSheenMove 14s ease infinite;}
      .prism-poster__glass{position:absolute;border:1px solid rgba(255,255,255,.14);background:linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.04));backdrop-filter:blur(12px);}
      .prism-poster__glass--a{left:9%;top:14%;width:22%;height:24%;border-radius:24px;}
      .prism-poster__glass--b{right:10%;bottom:12%;width:28%;height:30%;border-radius:32px;}
      .prism-poster__content{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#fff;}
      .prism-poster__kicker{align-self:flex-start;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.08);font-size:clamp(11px,1.4vw,13px);letter-spacing:.18em;text-transform:uppercase;}
      .prism-poster__title{margin-top:auto;font-size:clamp(56px,10vw,132px);line-height:.82;font-weight:900;letter-spacing:-.08em;font-family:{{font.title.family}}, "Arial Black", sans-serif;background:linear-gradient(90deg, #fff, rgba(255,255,255,.8), #fff);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 28px rgba(255,255,255,.08);}
      .prism-poster__note{margin-top:12px;max-width:54%;font-size:clamp(13px,1.7vw,15px);line-height:1.7;color:rgba(255,255,255,.78);}
    </style>
    <div class="prism-poster">
      <div class="prism-poster__glass prism-poster__glass--a"></div>
      <div class="prism-poster__glass prism-poster__glass--b"></div>
      <div class="prism-poster__content">
        <div class="prism-poster__kicker">{{text.kicker}}</div>
        <div>
          <div class="prism-poster__title">{{text.title}}</div>
          <div class="prism-poster__note">{{text.note}}</div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "kinetic-marquee-stack",
      name: "动态跑马字堆叠",
      category: "动态 / 氛围",
      description: "适合做潮流大字图、演出感海报和后背大图，用滚动文字形成节奏冲击。",
      tags: ["跑马灯", "文字", "节奏", "动态", "潮流"],
      difficulty: "advanced",
      printStyle: "poster",
      suitableProducts: ["T 恤后背大图", "海报", "社媒封面", "潮流服饰视觉"],
      sceneDescription: "适合强烈字体驱动的视觉风格，动画用于预览时增强节奏感。",
      sortOrder: 920,
    },
    [
      textField("text.word", "主文字", "MOTION"),
      textField("text.note", "副文字", "type in motion"),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        word: "MOTION",
        note: "type in motion",
      },
      color: {
        background: createPureColor("#020617"),
        primary: createPureColor("#f8fafc"),
        secondary: createPureColor("#22d3ee"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      @keyframes marqueeStackLeft {
        from { transform: translateX(0); }
        to { transform: translateX(-28%); }
      }
      @keyframes marqueeStackRight {
        from { transform: translateX(-18%); }
        to { transform: translateX(0); }
      }
      .kinetic-stack{width:100%;height:100%;position:relative;overflow:hidden;padding:7%;box-sizing:border-box;background:
        radial-gradient(circle at 18% 24%, rgba(34,211,238,.16), transparent 18%),
        {{color.background}};}
      .kinetic-stack__rows{position:absolute;inset:14% 0 14% 0;display:grid;align-content:center;gap:18px;}
      .kinetic-stack__row{display:flex;white-space:nowrap;will-change:transform;}
      .kinetic-stack__row--a{animation:marqueeStackLeft 18s linear infinite;}
      .kinetic-stack__row--b{animation:marqueeStackRight 14s linear infinite;}
      .kinetic-stack__word{padding-right:26px;font-size:clamp(52px,8vw,116px);line-height:.86;font-weight:900;letter-spacing:-.06em;color:rgba(248,250,252,.14);font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .kinetic-stack__row:nth-child(2) .kinetic-stack__word,
      .kinetic-stack__row:nth-child(4) .kinetic-stack__word{color:rgba(34,211,238,.22);}
      .kinetic-stack__meta{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#fff;}
      .kinetic-stack__note{align-self:flex-start;font-size:clamp(11px,1.5vw,13px);letter-spacing:.18em;text-transform:uppercase;color:{{color.secondary}};}
      .kinetic-stack__focus{margin-top:auto;font-size:clamp(54px,9vw,126px);line-height:.82;font-weight:900;letter-spacing:-.08em;color:#fff;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
    </style>
    <div class="kinetic-stack">
      <div class="kinetic-stack__rows">
        <div class="kinetic-stack__row kinetic-stack__row--a"><div class="kinetic-stack__word">{{text.word}}</div><div class="kinetic-stack__word">{{text.word}}</div><div class="kinetic-stack__word">{{text.word}}</div></div>
        <div class="kinetic-stack__row kinetic-stack__row--b"><div class="kinetic-stack__word">{{text.word}}</div><div class="kinetic-stack__word">{{text.word}}</div><div class="kinetic-stack__word">{{text.word}}</div></div>
        <div class="kinetic-stack__row kinetic-stack__row--a"><div class="kinetic-stack__word">{{text.word}}</div><div class="kinetic-stack__word">{{text.word}}</div><div class="kinetic-stack__word">{{text.word}}</div></div>
        <div class="kinetic-stack__row kinetic-stack__row--b"><div class="kinetic-stack__word">{{text.word}}</div><div class="kinetic-stack__word">{{text.word}}</div><div class="kinetic-stack__word">{{text.word}}</div></div>
      </div>
      <div class="kinetic-stack__meta">
        <div class="kinetic-stack__note">{{text.note}}</div>
        <div class="kinetic-stack__focus">{{text.word}}</div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "glitch-scan-billboard",
      name: "故障扫描广告牌",
      category: "动态 / 氛围",
      description: "适合电子感、游戏感、科技感宣传图，用轻微故障扫描制造数字屏幕氛围。",
      tags: ["故障", "扫描", "广告牌", "数码", "科技"],
      difficulty: "advanced",
      printStyle: "marketing",
      suitableProducts: ["广告横幅", "科技海报", "游戏风商品图", "数码感印花"],
      sceneDescription: "适合做科技产品和数码风服饰海报，动效主要用于预览增强屏幕感。",
      sortOrder: 930,
    },
    [
      textField("text.kicker", "顶部标签", "Signal"),
      textField("text.title", "主标题", "ERROR / OK"),
      textareaField("text.note", "说明文案", "Scan lines, offset shadows and a slight glitch split for digital-flavored product visuals.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "副色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        kicker: "Signal",
        title: "ERROR / OK",
        note: "Scan lines, offset shadows and a slight glitch split for digital-flavored product visuals.",
      },
      color: {
        background: createPureColor("#030712"),
        primary: createPureColor("#f8fafc"),
        secondary: createPureColor("#22d3ee"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      @keyframes glitchBillboardShift {
        0%,100% { transform: translateX(0); opacity: .14; }
        20% { transform: translateX(-1.5%); opacity: .22; }
        40% { transform: translateX(1.2%); opacity: .18; }
        60% { transform: translateX(-.8%); opacity: .24; }
        80% { transform: translateX(.6%); opacity: .16; }
      }
      .glitch-board{width:100%;height:100%;position:relative;overflow:hidden;padding:7%;box-sizing:border-box;background:{{color.background}};}
      .glitch-board::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px);background-size:100% 12px;opacity:.18;}
      .glitch-board__ghost{position:absolute;inset:0;display:grid;place-items:center;color:{{color.secondary}};font-size:clamp(62px,10vw,142px);font-weight:900;letter-spacing:-.08em;opacity:.14;animation:glitchBillboardShift 2.8s steps(3) infinite;}
      .glitch-board__panel{position:relative;z-index:1;width:100%;height:100%;border:1px solid rgba(255,255,255,.1);display:flex;flex-direction:column;justify-content:space-between;padding:6%;box-sizing:border-box;background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));}
      .glitch-board__kicker{font-size:clamp(11px,1.4vw,13px);letter-spacing:.2em;text-transform:uppercase;color:{{color.secondary}};}
      .glitch-board__title{margin-top:auto;font-size:clamp(58px,10vw,140px);line-height:.82;font-weight:900;letter-spacing:-.08em;color:{{color.primary}};font-family:{{font.title.family}}, "Arial Black", sans-serif;text-shadow:-3px 0 0 rgba(34,211,238,.34), 3px 0 0 rgba(248,250,252,.12);}
      .glitch-board__note{margin-top:12px;max-width:52%;font-size:clamp(13px,1.7vw,15px);line-height:1.7;color:rgba(248,250,252,.72);}
    </style>
    <div class="glitch-board">
      <div class="glitch-board__ghost">{{text.title}}</div>
      <div class="glitch-board__panel">
        <div class="glitch-board__kicker">{{text.kicker}}</div>
        <div>
          <div class="glitch-board__title">{{text.title}}</div>
          <div class="glitch-board__note">{{text.note}}</div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "liquid-chrome-sticker",
      name: "液态铬金属贴纸",
      category: "动态 / 氛围",
      description: "适合做未来感、Y2K、液态金属风贴纸和局部印花，用镜面流光做高冲击效果。",
      tags: ["液态金属", "Chrome", "Y2K", "贴纸", "未来感"],
      difficulty: "advanced",
      printStyle: "cutout",
      suitableProducts: ["金属风贴纸", "Y2K 局部印花", "数码潮流配饰贴花", "封面主视觉"],
      sceneDescription: "适合强调材质感和高反射视觉的作品，预览时会有轻微流光移动。",
      sortOrder: 940,
    },
    [
      textField("text.title", "主标题", "MELT"),
      textField("text.note", "副标题", "liquid chrome"),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主高光色"),
      colorField("color.secondary", "副高光色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        title: "MELT",
        note: "liquid chrome",
      },
      color: {
        background: createPureColor("#e2e8f0"),
        primary: createPureColor("#f8fafc"),
        secondary: createPureColor("#94a3b8"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      @keyframes chromeBlobSheen {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .chrome-blob{width:100%;height:100%;display:grid;place-items:center;padding:8%;box-sizing:border-box;background:{{color.background}};}
      .chrome-blob__shape{width:min(82%,520px);aspect-ratio:1/1;position:relative;display:grid;place-items:center;border-radius:37% 63% 54% 46% / 44% 31% 69% 56%;background:
        linear-gradient(135deg, rgba(255,255,255,.98), rgba(148,163,184,.8), rgba(255,255,255,.96), rgba(148,163,184,.7), rgba(255,255,255,.98));
        background-size:220% 220%;
        box-shadow:0 24px 54px rgba(15,23,42,.18), inset 0 0 0 2px rgba(255,255,255,.62);
        animation:chromeBlobSheen 10s ease infinite;}
      .chrome-blob__shape::before{content:"";position:absolute;inset:8%;border-radius:inherit;background:radial-gradient(circle at 28% 24%, rgba(255,255,255,.9), transparent 24%), radial-gradient(circle at 70% 70%, rgba(255,255,255,.34), transparent 26%);}
      .chrome-blob__title{position:relative;z-index:1;font-size:clamp(48px,8vw,110px);line-height:.84;font-weight:900;letter-spacing:-.08em;color:#0f172a;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .chrome-blob__note{position:absolute;bottom:14%;font-size:clamp(11px,1.4vw,13px);letter-spacing:.22em;text-transform:uppercase;color:rgba(15,23,42,.54);}
    </style>
    <div class="chrome-blob">
      <div class="chrome-blob__shape">
        <div class="chrome-blob__title">{{text.title}}</div>
        <div class="chrome-blob__note">{{text.note}}</div>
      </div>
    </div>`
  ),
];
