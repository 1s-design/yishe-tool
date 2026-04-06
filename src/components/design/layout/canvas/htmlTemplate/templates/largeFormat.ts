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

export const largeFormatTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "aurora-desk-mat-flow",
      name: "极光流动鼠标垫",
      category: "家居 / 大幅",
      description: "适合超宽鼠标垫、桌垫和电竞桌面背景布，用多层极光渐变营造沉浸式氛围。",
      tags: ["鼠标垫", "桌垫", "极光", "渐变", "动效", "电竞"],
      difficulty: "advanced",
      printStyle: "all-over",
      suitableProducts: ["超宽鼠标垫", "电竞桌垫", "键盘垫", "桌面背景布"],
      sceneDescription: "适合长画幅商品，流动极光会让预览更有生命力，静态导出时也能保持漂亮的渐变层次。",
      sortOrder: 240,
    },
    [
      textField("text.kicker", "顶部标签", "Aurora Surface"),
      textField("text.title", "主标题", "Night Drift"),
      textareaField("text.subtitle", "副标题", "Wide, smooth, and immersive gradients built for extended desk setups.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主渐变色"),
      colorField("color.secondary", "副渐变色"),
      colorField("color.tertiary", "第三渐变色"),
      fontField("font.title", "标题字体"),
      numberField("number.speed", "动画速度", {
        min: 8,
        max: 40,
        step: 1,
        placeholder: "18",
        description: "控制极光渐变流动速度，数值越大越慢。",
      }),
    ],
    {
      text: {
        kicker: "Aurora Surface",
        title: "Night Drift",
        subtitle: "Wide, smooth, and immersive gradients built for extended desk setups.",
      },
      color: {
        background: createPureColor("#020617"),
        primary: createPureColor("#38bdf8"),
        secondary: createPureColor("#8b5cf6"),
        tertiary: createPureColor("#f97316"),
      },
      font: {
        title: defaultFontBinding,
      },
      number: {
        speed: 18,
      },
    },
    `<style>
      @keyframes auroraDeskShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes auroraDeskFloatA {
        0%,100% { transform: translate3d(0,0,0) scale(1); }
        50% { transform: translate3d(4%, -3%, 0) scale(1.06); }
      }
      @keyframes auroraDeskFloatB {
        0%,100% { transform: translate3d(0,0,0) scale(1); }
        50% { transform: translate3d(-3%, 4%, 0) scale(1.08); }
      }
      .aurora-mat{width:100%;height:100%;position:relative;overflow:hidden;padding:6.2%;box-sizing:border-box;background:{{color.background}};}
      .aurora-mat::before{content:"";position:absolute;inset:-20%;background:
        radial-gradient(circle at 18% 30%, rgba(56,189,248,.38), transparent 24%),
        radial-gradient(circle at 78% 24%, rgba(139,92,246,.32), transparent 24%),
        radial-gradient(circle at 62% 78%, rgba(249,115,22,.24), transparent 26%),
        linear-gradient(120deg, {{color.background}}, {{color.primary}}, {{color.secondary}}, {{color.tertiary}}, {{color.background}});
        background-size:180% 180%;
        filter:blur(6px) saturate(120%);
        animation:auroraDeskShift calc({{number.speed}} * 1s) ease infinite;}
      .aurora-mat__orb{position:absolute;border-radius:50%;filter:blur(22px);opacity:.46;}
      .aurora-mat__orb--a{width:34%;aspect-ratio:1/1;left:6%;top:16%;background:{{color.primary}};animation:auroraDeskFloatA 15s ease-in-out infinite;}
      .aurora-mat__orb--b{width:42%;aspect-ratio:1/1;right:6%;bottom:10%;background:{{color.secondary}};animation:auroraDeskFloatB 17s ease-in-out infinite;}
      .aurora-mat__noise{position:absolute;inset:0;background:
        linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
        background-size:22px 22px, 22px 22px;
        opacity:.28;mix-blend-mode:screen;}
      .aurora-mat__panel{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#f8fafc;}
      .aurora-mat__kicker{align-self:flex-start;padding:9px 15px;border-radius:999px;background:rgba(255,255,255,.08);backdrop-filter:blur(14px);font-size:clamp(11px,1.4vw,13px);letter-spacing:.16em;text-transform:uppercase;font-weight:700;}
      .aurora-mat__title{margin-top:auto;max-width:58%;font-size:clamp(42px,6.8vw,92px);line-height:.86;font-weight:900;letter-spacing:-.06em;font-family:{{font.title.family}}, "Arial Black", sans-serif;text-shadow:0 10px 30px rgba(0,0,0,.28);}
      .aurora-mat__subtitle{margin-top:14px;max-width:52%;font-size:clamp(13px,1.7vw,16px);line-height:1.7;color:rgba(248,250,252,.78);}
      .aurora-mat__bar{margin-top:20px;width:min(36vw,240px);height:12px;border-radius:999px;background:linear-gradient(90deg, {{color.primary}}, {{color.secondary}}, {{color.tertiary}});}
    </style>
    <div class="aurora-mat">
      <div class="aurora-mat__orb aurora-mat__orb--a"></div>
      <div class="aurora-mat__orb aurora-mat__orb--b"></div>
      <div class="aurora-mat__noise"></div>
      <div class="aurora-mat__panel">
        <div class="aurora-mat__kicker">{{text.kicker}}</div>
        <div>
          <div class="aurora-mat__title">{{text.title}}</div>
          <div class="aurora-mat__subtitle">{{text.subtitle}}</div>
          <div class="aurora-mat__bar"></div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "topographic-scan-desk-mat",
      name: "地形扫描桌垫",
      category: "家居 / 大幅",
      description: "适合鼠标垫、桌垫和工作台垫，以地形线和扫描光做出地图感与科技感。",
      tags: ["鼠标垫", "桌垫", "地形", "地图", "科技", "扫描"],
      difficulty: "advanced",
      printStyle: "all-over",
      suitableProducts: ["鼠标垫", "长桌垫", "工作台防污垫", "摄影桌布"],
      sceneDescription: "适合喜欢地图感、工程感和科技感的商品视觉，横向铺开后层次很足。",
      sortOrder: 250,
    },
    [
      textField("text.title", "主标题", "Contour Lab"),
      textField("text.subtitle", "副标题", "Field grid 01"),
      textareaField("text.note", "补充文案", "Topographic contours, soft scan light and thin technical labels for long-format products.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主线条色"),
      colorField("color.secondary", "扫描光色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        title: "Contour Lab",
        subtitle: "Field grid 01",
        note: "Topographic contours, soft scan light and thin technical labels for long-format products.",
      },
      color: {
        background: createPureColor("#04111d"),
        primary: createPureColor("#38bdf8"),
        secondary: createPureColor("#34d399"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      @keyframes topoDeskSweep {
        0% { transform: translateX(-120%); opacity: 0; }
        15% { opacity: .24; }
        70% { opacity: .24; }
        100% { transform: translateX(120%); opacity: 0; }
      }
      .topo-mat{width:100%;height:100%;position:relative;overflow:hidden;padding:6%;box-sizing:border-box;background:
        radial-gradient(circle at 18% 24%, rgba(56,189,248,.12), transparent 20%),
        linear-gradient(180deg, #071423, {{color.background}});}
      .topo-mat::before{content:"";position:absolute;inset:0;background:
        radial-gradient(120% 84% at 18% 52%, transparent 55%, rgba(56,189,248,.18) 56% 56.6%, transparent 57.4%),
        radial-gradient(120% 84% at 42% 52%, transparent 55%, rgba(56,189,248,.14) 56% 56.6%, transparent 57.4%),
        radial-gradient(120% 84% at 66% 52%, transparent 55%, rgba(56,189,248,.18) 56% 56.6%, transparent 57.4%),
        radial-gradient(120% 84% at 90% 52%, transparent 55%, rgba(56,189,248,.14) 56% 56.6%, transparent 57.4%);
        opacity:.94;}
      .topo-mat::after{content:"";position:absolute;top:0;bottom:0;left:-24%;width:22%;background:linear-gradient(90deg, transparent, rgba(52,211,153,.32), transparent);filter:blur(12px);animation:topoDeskSweep 11s linear infinite;}
      .topo-mat__grid{position:absolute;inset:0;background:
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
        background-size:28px 28px;opacity:.42;}
      .topo-mat__panel{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#e2e8f0;}
      .topo-mat__subtitle{align-self:flex-start;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.06);font-size:clamp(11px,1.4vw,13px);letter-spacing:.18em;text-transform:uppercase;color:{{color.secondary}};}
      .topo-mat__title{margin-top:auto;font-size:clamp(44px,7vw,96px);line-height:.88;font-weight:900;letter-spacing:-.06em;font-family:{{font.title.family}}, "Arial Black", sans-serif;color:#f8fafc;}
      .topo-mat__note{margin-top:14px;max-width:54%;font-size:clamp(13px,1.7vw,16px);line-height:1.7;color:rgba(226,232,240,.72);}
      .topo-mat__meta{margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;}
      .topo-mat__meta span{padding:8px 12px;border-radius:999px;background:rgba(15,23,42,.36);border:1px solid rgba(56,189,248,.16);font-size:clamp(11px,1.4vw,12px);}
    </style>
    <div class="topo-mat">
      <div class="topo-mat__grid"></div>
      <div class="topo-mat__panel">
        <div class="topo-mat__subtitle">{{text.subtitle}}</div>
        <div>
          <div class="topo-mat__title">{{text.title}}</div>
          <div class="topo-mat__note">{{text.note}}</div>
          <div class="topo-mat__meta">
            <span>contour</span>
            <span>scan line</span>
            <span>{{text.subtitle}}</span>
          </div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "woven-sunburst-tapestry",
      name: "编织感日晕挂毯",
      category: "家居 / 大幅",
      description: "适合挂毯、背景布、地毯和墙面装饰布，用太阳弧形和织物纹理做出温暖家居感。",
      tags: ["挂毯", "挂布", "家居", "太阳", "编织", "波西米亚"],
      difficulty: "intermediate",
      printStyle: "all-over",
      suitableProducts: ["挂毯", "背景挂布", "墙面装饰布", "地垫主视觉"],
      sceneDescription: "适合偏家居、生活方式和波西米亚风格的大画幅商品。",
      sortOrder: 260,
    },
    [
      textField("text.kicker", "小标题", "Home Textile"),
      textField("text.title", "主标题", "Sun Loom"),
      textareaField("text.note", "说明文案", "Woven texture, layered arches and a warm sunrise center for soft interior products.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      colorField("color.tertiary", "第三色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        kicker: "Home Textile",
        title: "Sun Loom",
        note: "Woven texture, layered arches and a warm sunrise center for soft interior products.",
      },
      color: {
        background: createPureColor("#f8f0dd"),
        primary: createPureColor("#b45309"),
        secondary: createPureColor("#f59e0b"),
        tertiary: createPureColor("#7c2d12"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      @keyframes loomSunPulse {
        0%,100% { transform: scale(1); opacity: .88; }
        50% { transform: scale(1.04); opacity: 1; }
      }
      .sun-loom{width:100%;height:100%;position:relative;overflow:hidden;padding:7%;box-sizing:border-box;background:{{color.background}};}
      .sun-loom::before{content:"";position:absolute;inset:0;background:
        repeating-linear-gradient(0deg, rgba(255,255,255,.16) 0 2px, rgba(0,0,0,.02) 2px 5px),
        repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 1px, transparent 1px 8px);
        opacity:.44;mix-blend-mode:multiply;}
      .sun-loom__sun{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(38vw,280px);aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle, rgba(255,250,240,.95), {{color.secondary}} 62%, transparent 63%);animation:loomSunPulse 9s ease-in-out infinite;}
      .sun-loom__arch{position:absolute;left:50%;transform:translateX(-50%);border-radius:50% 50% 0 0 / 100% 100% 0 0;border-top-left-radius:999px;border-top-right-radius:999px;}
      .sun-loom__arch--a{bottom:18%;width:84%;height:54%;background:{{color.primary}};}
      .sun-loom__arch--b{bottom:18%;width:68%;height:44%;background:{{color.secondary}};}
      .sun-loom__arch--c{bottom:18%;width:52%;height:34%;background:{{color.tertiary}};}
      .sun-loom__arch--d{bottom:18%;width:36%;height:24%;background:{{color.background}};}
      .sun-loom__content{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#451a03;}
      .sun-loom__kicker{align-self:flex-start;font-size:clamp(11px,1.5vw,13px);letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:rgba(69,26,3,.72);}
      .sun-loom__title{margin-top:auto;font-size:clamp(40px,6vw,82px);line-height:.9;font-weight:900;letter-spacing:-.05em;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .sun-loom__note{margin-top:12px;max-width:52%;font-size:clamp(13px,1.7vw,15px);line-height:1.7;color:rgba(69,26,3,.72);}
    </style>
    <div class="sun-loom">
      <div class="sun-loom__sun"></div>
      <div class="sun-loom__arch sun-loom__arch--a"></div>
      <div class="sun-loom__arch sun-loom__arch--b"></div>
      <div class="sun-loom__arch sun-loom__arch--c"></div>
      <div class="sun-loom__arch sun-loom__arch--d"></div>
      <div class="sun-loom__content">
        <div class="sun-loom__kicker">{{text.kicker}}</div>
        <div>
          <div class="sun-loom__title">{{text.title}}</div>
          <div class="sun-loom__note">{{text.note}}</div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "celestial-orbit-tapestry",
      name: "星轨月相挂毯",
      category: "家居 / 大幅",
      description: "适合夜空挂毯、卧室背景布、冥想空间布艺，用星轨和月相营造静谧氛围。",
      tags: ["挂毯", "星空", "月亮", "神秘", "夜空", "冥想"],
      difficulty: "advanced",
      printStyle: "all-over",
      suitableProducts: ["挂毯", "背景布", "瑜伽空间装饰布", "房间挂画布"],
      sceneDescription: "适合星空、占星、冥想、神秘学主题的布艺和家居产品。",
      sortOrder: 270,
    },
    [
      textField("text.kicker", "小标题", "Celestial Cloth"),
      textField("text.title", "主标题", "Moon Circuit"),
      textareaField("text.note", "说明文案", "Orbit rings, moon phases and tiny stars for dreamy room-scale textile products.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        kicker: "Celestial Cloth",
        title: "Moon Circuit",
        note: "Orbit rings, moon phases and tiny stars for dreamy room-scale textile products.",
      },
      color: {
        background: createPureColor("#020617"),
        primary: createPureColor("#f8fafc"),
        secondary: createPureColor("#38bdf8"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      @keyframes orbitTapestrySpinA {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes orbitTapestrySpinB {
        from { transform: translate(-50%, -50%) rotate(360deg); }
        to { transform: translate(-50%, -50%) rotate(0deg); }
      }
      .moon-circuit{width:100%;height:100%;position:relative;overflow:hidden;padding:7%;box-sizing:border-box;background:
        radial-gradient(circle at 22% 20%, rgba(56,189,248,.18), transparent 18%),
        radial-gradient(circle at 80% 24%, rgba(255,255,255,.1), transparent 18%),
        linear-gradient(180deg, #081121, {{color.background}});}
      .moon-circuit__stars{position:absolute;inset:0;background:
        radial-gradient(circle at 12% 22%, rgba(255,255,255,.7) 0 1px, transparent 2px),
        radial-gradient(circle at 28% 72%, rgba(255,255,255,.64) 0 1px, transparent 2px),
        radial-gradient(circle at 76% 18%, rgba(255,255,255,.72) 0 1px, transparent 2px),
        radial-gradient(circle at 84% 64%, rgba(255,255,255,.64) 0 1px, transparent 2px),
        radial-gradient(circle at 62% 42%, rgba(255,255,255,.72) 0 1px, transparent 2px);}
      .moon-circuit__ring{position:absolute;left:50%;top:50%;border-radius:50%;border:1px solid rgba(248,250,252,.18);}
      .moon-circuit__ring--a{width:min(58vw,420px);aspect-ratio:1/1;transform:translate(-50%,-50%);animation:orbitTapestrySpinA 24s linear infinite;}
      .moon-circuit__ring--b{width:min(76vw,560px);aspect-ratio:1/1;transform:translate(-50%,-50%);animation:orbitTapestrySpinB 34s linear infinite;}
      .moon-circuit__moon{position:absolute;border-radius:50%;background:radial-gradient(circle at 30% 30%, #fff, #e2e8f0 62%, rgba(255,255,255,.12) 63%);}
      .moon-circuit__moon--a{width:min(12vw,72px);aspect-ratio:1/1;left:50%;top:50%;transform:translate(-50%,-50%);}
      .moon-circuit__moon--b{width:min(6vw,42px);aspect-ratio:1/1;left:16%;top:46%;}
      .moon-circuit__moon--c{width:min(5vw,34px);aspect-ratio:1/1;right:14%;top:38%;}
      .moon-circuit__content{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#f8fafc;}
      .moon-circuit__kicker{align-self:flex-start;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.06);font-size:clamp(11px,1.4vw,13px);letter-spacing:.18em;text-transform:uppercase;color:{{color.secondary}};}
      .moon-circuit__title{margin-top:auto;font-size:clamp(40px,6vw,86px);line-height:.9;font-weight:900;letter-spacing:-.06em;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .moon-circuit__note{margin-top:12px;max-width:52%;font-size:clamp(13px,1.7vw,15px);line-height:1.7;color:rgba(226,232,240,.78);}
    </style>
    <div class="moon-circuit">
      <div class="moon-circuit__stars"></div>
      <div class="moon-circuit__ring moon-circuit__ring--a"></div>
      <div class="moon-circuit__ring moon-circuit__ring--b"></div>
      <div class="moon-circuit__moon moon-circuit__moon--a"></div>
      <div class="moon-circuit__moon moon-circuit__moon--b"></div>
      <div class="moon-circuit__moon moon-circuit__moon--c"></div>
      <div class="moon-circuit__content">
        <div class="moon-circuit__kicker">{{text.kicker}}</div>
        <div>
          <div class="moon-circuit__title">{{text.title}}</div>
          <div class="moon-circuit__note">{{text.note}}</div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "liquid-mesh-blanket",
      name: "液态网格抱毯",
      category: "家居 / 大幅",
      description: "适合抱毯、毛毯、床尾毯这类大面柔性产品，用软质液态渐变做舒适又高级的氛围。",
      tags: ["抱毯", "毛毯", "液态", "mesh", "柔和", "渐变"],
      difficulty: "advanced",
      printStyle: "all-over",
      suitableProducts: ["抱毯", "毛毯", "床尾毯", "沙发盖毯"],
      sceneDescription: "适合家居软装、舒缓情绪和高质感渐变风格的布艺产品。",
      sortOrder: 280,
    },
    [
      textField("text.kicker", "小标签", "Soft Textile"),
      textField("text.title", "主标题", "Cloud Melt"),
      textareaField("text.note", "说明文案", "A soft liquid mesh for blankets, throws and other large comfort-focused POD products.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主色"),
      colorField("color.secondary", "辅助色"),
      colorField("color.tertiary", "第三色"),
      fontField("font.title", "标题字体"),
    ],
    {
      text: {
        kicker: "Soft Textile",
        title: "Cloud Melt",
        note: "A soft liquid mesh for blankets, throws and other large comfort-focused POD products.",
      },
      color: {
        background: createPureColor("#f8fafc"),
        primary: createPureColor("#60a5fa"),
        secondary: createPureColor("#c084fc"),
        tertiary: createPureColor("#fb7185"),
      },
      font: {
        title: defaultFontBinding,
      },
    },
    `<style>
      @keyframes blanketMeshDrift {
        0% { transform: translate3d(0,0,0) scale(1); }
        50% { transform: translate3d(-3%, 2%, 0) scale(1.08); }
        100% { transform: translate3d(0,0,0) scale(1); }
      }
      .mesh-blanket{width:100%;height:100%;position:relative;overflow:hidden;padding:6.8%;box-sizing:border-box;background:{{color.background}};}
      .mesh-blanket::before{content:"";position:absolute;inset:-10%;background:
        radial-gradient(circle at 18% 24%, {{color.primary}}, transparent 30%),
        radial-gradient(circle at 74% 18%, {{color.secondary}}, transparent 28%),
        radial-gradient(circle at 58% 78%, {{color.tertiary}}, transparent 30%),
        radial-gradient(circle at 24% 74%, rgba(255,255,255,.9), transparent 28%);
        filter:blur(24px) saturate(116%);
        opacity:.74;animation:blanketMeshDrift 18s ease-in-out infinite;}
      .mesh-blanket::after{content:"";position:absolute;inset:0;background:
        radial-gradient(circle at 50% 50%, rgba(255,255,255,.34), transparent 54%),
        linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,.04));}
      .mesh-blanket__content{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#0f172a;}
      .mesh-blanket__kicker{align-self:flex-start;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.52);backdrop-filter:blur(10px);font-size:clamp(11px,1.4vw,13px);letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:#334155;}
      .mesh-blanket__title{margin-top:auto;font-size:clamp(42px,6.5vw,88px);line-height:.88;font-weight:900;letter-spacing:-.06em;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .mesh-blanket__note{margin-top:14px;max-width:52%;font-size:clamp(13px,1.7vw,15px);line-height:1.7;color:rgba(15,23,42,.68);}
    </style>
    <div class="mesh-blanket">
      <div class="mesh-blanket__content">
        <div class="mesh-blanket__kicker">{{text.kicker}}</div>
        <div>
          <div class="mesh-blanket__title">{{text.title}}</div>
          <div class="mesh-blanket__note">{{text.note}}</div>
        </div>
      </div>
    </div>`
  ),
  createTemplate(
    {
      id: "moire-silk-scarf",
      name: "摩尔纹丝巾图案",
      category: "家居 / 大幅",
      description: "适合丝巾、围巾、轻薄披肩这类商品，用摩尔纹和细线波动做优雅的图案感。",
      tags: ["丝巾", "围巾", "摩尔纹", "线条", "时尚", "高级"],
      difficulty: "advanced",
      printStyle: "pattern",
      suitableProducts: ["丝巾", "围巾", "披肩", "轻薄布艺"],
      sceneDescription: "适合偏时装感、优雅感和配饰感的图案，缩放后也很耐看。",
      sortOrder: 290,
    },
    [
      textField("text.title", "主标题", "Silk Echo"),
      textField("text.subtitle", "副标题", "moire study"),
      textareaField("text.note", "说明文案", "Fine waves, layered stripes and a restrained palette for fashion-oriented textile products.", 2),
      colorField("color.background", "背景色"),
      colorField("color.primary", "主线条色"),
      colorField("color.secondary", "辅助色"),
      fontField("font.title", "标题字体"),
      numberField("number.density", "纹理密度", {
        min: 8,
        max: 30,
        step: 1,
        placeholder: "16",
        description: "控制背景线条的密度。",
      }),
    ],
    {
      text: {
        title: "Silk Echo",
        subtitle: "moire study",
        note: "Fine waves, layered stripes and a restrained palette for fashion-oriented textile products.",
      },
      color: {
        background: createPureColor("#fffaf5"),
        primary: createPureColor("#6b21a8"),
        secondary: createPureColor("#0f766e"),
      },
      font: {
        title: defaultFontBinding,
      },
      number: {
        density: 16,
      },
    },
    `<style>
      @keyframes silkMoireShift {
        0%,100% { background-position: 0 0, 0 0, 50% 50%; }
        50% { background-position: 28px 0, -18px 0, 50% 52%; }
      }
      .silk-echo{width:100%;height:100%;position:relative;overflow:hidden;padding:7%;box-sizing:border-box;background:{{color.background}};}
      .silk-echo::before{content:"";position:absolute;inset:0;background:
        repeating-linear-gradient(90deg, rgba(107,33,168,.08) 0 1px, transparent 1px calc({{number.density}} * 1px)),
        repeating-linear-gradient(0deg, rgba(15,118,110,.08) 0 1px, transparent 1px calc(({{number.density}} * 1px) + 8px)),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,.6), transparent 56%);
        mix-blend-mode:multiply;animation:silkMoireShift 10s ease-in-out infinite;}
      .silk-echo__wave{position:absolute;inset:12% 8%;border-radius:40px;background:
        linear-gradient(140deg, transparent 0 22%, rgba(107,33,168,.08) 22% 28%, transparent 28% 40%, rgba(15,118,110,.08) 40% 46%, transparent 46% 58%, rgba(107,33,168,.08) 58% 64%, transparent 64%);}
      .silk-echo__content{position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#1f2937;}
      .silk-echo__subtitle{align-self:flex-start;font-size:clamp(11px,1.5vw,13px);letter-spacing:.24em;text-transform:uppercase;color:rgba(31,41,55,.52);}
      .silk-echo__title{margin-top:auto;font-size:clamp(38px,6vw,82px);line-height:.9;font-weight:900;letter-spacing:-.06em;font-family:{{font.title.family}}, "Arial Black", sans-serif;}
      .silk-echo__note{margin-top:12px;max-width:52%;font-size:clamp(13px,1.7vw,15px);line-height:1.7;color:rgba(31,41,55,.68);}
    </style>
    <div class="silk-echo">
      <div class="silk-echo__wave"></div>
      <div class="silk-echo__content">
        <div class="silk-echo__subtitle">{{text.subtitle}}</div>
        <div>
          <div class="silk-echo__title">{{text.title}}</div>
          <div class="silk-echo__note">{{text.note}}</div>
        </div>
      </div>
    </div>`
  ),
];
