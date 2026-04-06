import type { HtmlTemplateDefinition } from "../types";
import {
  colorField,
  createPureColor,
  createTemplate,
  numberField,
} from "./shared";

export const productPatternTemplates: HtmlTemplateDefinition[] = [
  createTemplate(
    {
      id: "mousepad-spectrum-flow",
      name: "鼠标垫光谱流体渐变",
      category: "纯图案 / 产品底图",
      description: "纯背景型鼠标垫图案，用多层 mesh 渐变和柔和流体运动做出整块桌垫视觉。",
      tags: ["鼠标垫", "桌垫", "渐变", "mesh", "纯图案", "无文字"],
      difficulty: "advanced",
      printStyle: "all-over",
      suitableProducts: ["鼠标垫", "桌垫", "电竞桌垫", "工作台垫"],
      sceneDescription: "适合直接作为商品图案本体，不依赖文案和图片，重点是整块色彩氛围。",
      sortOrder: 10,
    },
    [
      colorField("color.background", "底色"),
      colorField("color.primary", "主渐变色"),
      colorField("color.secondary", "副渐变色"),
      colorField("color.tertiary", "第三渐变色"),
      numberField("number.blur", "流体柔化", {
        min: 12,
        max: 48,
        step: 1,
        placeholder: "26",
        description: "控制色块边缘的柔和程度。",
      }),
    ],
    {
      color: {
        background: createPureColor("#020617"),
        primary: createPureColor("#22d3ee"),
        secondary: createPureColor("#8b5cf6"),
        tertiary: createPureColor("#fb7185"),
      },
      number: {
        blur: 26,
      },
    },
    `<style>
      @keyframes spectrumFlowDrift {
        0% { transform: translate3d(0,0,0) scale(1); }
        33% { transform: translate3d(4%, -2%, 0) scale(1.08); }
        66% { transform: translate3d(-3%, 3%, 0) scale(1.1); }
        100% { transform: translate3d(0,0,0) scale(1); }
      }
      .pattern-spectrum{width:100%;height:100%;position:relative;overflow:hidden;background:{{color.background}};}
      .pattern-spectrum::before{content:"";position:absolute;inset:-12%;background:
        radial-gradient(circle at 18% 24%, {{color.primary}}, transparent 28%),
        radial-gradient(circle at 76% 18%, {{color.secondary}}, transparent 30%),
        radial-gradient(circle at 54% 76%, {{color.tertiary}}, transparent 28%),
        radial-gradient(circle at 22% 78%, rgba(255,255,255,.42), transparent 24%);
        filter:blur(calc({{number.blur}} * 1px)) saturate(120%);
        opacity:.92;
        animation:spectrumFlowDrift 18s ease-in-out infinite;}
      .pattern-spectrum::after{content:"";position:absolute;inset:0;background:
        linear-gradient(135deg, rgba(255,255,255,.06), transparent 26%, rgba(255,255,255,.04) 52%, transparent 72%),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,.08), transparent 58%);}
    </style>
    <div class="pattern-spectrum"></div>`
  ),
  createTemplate(
    {
      id: "mousepad-neon-wave-lines",
      name: "鼠标垫霓虹波浪线",
      category: "纯图案 / 产品底图",
      description: "用层层波浪线和发光路径做长幅鼠标垫图案，适合科技感和夜色风格。",
      tags: ["鼠标垫", "波浪线", "霓虹", "科技", "纯图案"],
      difficulty: "advanced",
      printStyle: "all-over",
      suitableProducts: ["鼠标垫", "电竞桌垫", "长条桌垫", "科技风背景布"],
      sceneDescription: "整块图案由波浪路径构成，适合长横幅比例的产品底图。",
      sortOrder: 20,
    },
    [
      colorField("color.background", "底色"),
      colorField("color.primary", "主线条色"),
      colorField("color.secondary", "副线条色"),
      colorField("color.highlight", "高光色"),
      numberField("number.spacing", "线条密度", {
        min: 18,
        max: 52,
        step: 1,
        placeholder: "28",
        description: "控制波浪线之间的间距。",
      }),
    ],
    {
      color: {
        background: createPureColor("#020617"),
        primary: createPureColor("#22d3ee"),
        secondary: createPureColor("#38bdf8"),
        highlight: createPureColor("#c084fc"),
      },
      number: {
        spacing: 28,
      },
    },
    `<style>
      @keyframes neonWaveShift {
        0% { background-position: 0 0, 0 0, 0 0; }
        50% { background-position: 60px 0, -40px 0, 20px 0; }
        100% { background-position: 0 0, 0 0, 0 0; }
      }
      .pattern-wave{width:100%;height:100%;position:relative;overflow:hidden;background:
        radial-gradient(circle at 18% 18%, rgba(34,211,238,.12), transparent 22%),
        linear-gradient(180deg, {{color.background}}, #081121);}
      .pattern-wave::before{content:"";position:absolute;inset:0;background:
        radial-gradient(120% 92% at 18% 54%, transparent 56%, rgba(34,211,238,.28) 57% 58%, transparent 59%),
        radial-gradient(120% 92% at 44% 54%, transparent 56%, rgba(56,189,248,.24) 57% 58%, transparent 59%),
        radial-gradient(120% 92% at 70% 54%, transparent 56%, rgba(192,132,252,.22) 57% 58%, transparent 59%);
        background-size:calc({{number.spacing}} * 6px) 100%;
        animation:neonWaveShift 16s ease-in-out infinite;
        filter:drop-shadow(0 0 10px rgba(34,211,238,.18));}
      .pattern-wave::after{content:"";position:absolute;inset:0;background:
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
        background-size:32px 32px;
        opacity:.22;}
    </style>
    <div class="pattern-wave"></div>`
  ),
  createTemplate(
    {
      id: "mousepad-speed-grid",
      name: "鼠标垫速度网格",
      category: "纯图案 / 产品底图",
      description: "适合电竞和数码风的鼠标垫，结合透视网格、斜切光束和速度线形成冲击感。",
      tags: ["鼠标垫", "网格", "速度线", "电竞", "科技"],
      difficulty: "intermediate",
      printStyle: "all-over",
      suitableProducts: ["鼠标垫", "电竞桌垫", "键盘垫", "游戏背景布"],
      sceneDescription: "适合偏锐利、带速度感的桌垫图案，整体更硬朗。",
      sortOrder: 30,
    },
    [
      colorField("color.background", "底色"),
      colorField("color.primary", "网格色"),
      colorField("color.secondary", "斜切光色"),
      numberField("number.grid", "网格间距", {
        min: 16,
        max: 40,
        step: 1,
        placeholder: "22",
        description: "控制网格密度。",
      }),
    ],
    {
      color: {
        background: createPureColor("#0f172a"),
        primary: createPureColor("#38bdf8"),
        secondary: createPureColor("#f97316"),
      },
      number: {
        grid: 22,
      },
    },
    `<style>
      @keyframes speedGridSweep {
        0% { transform: translateX(-24%); opacity: 0; }
        30% { opacity: .26; }
        70% { opacity: .18; }
        100% { transform: translateX(120%); opacity: 0; }
      }
      .pattern-speed{width:100%;height:100%;position:relative;overflow:hidden;background:
        linear-gradient(180deg, #0b1120, {{color.background}});}
      .pattern-speed::before{content:"";position:absolute;inset:0;background:
        linear-gradient(rgba(56,189,248,.2) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56,189,248,.16) 1px, transparent 1px);
        background-size:calc({{number.grid}} * 1px) calc({{number.grid}} * 1px);
        transform:perspective(900px) rotateX(72deg) scale(1.4);
        transform-origin:center 80%;
        opacity:.5;}
      .pattern-speed::after{content:"";position:absolute;top:0;bottom:0;left:-28%;width:24%;background:linear-gradient(90deg, transparent, rgba(249,115,22,.28), transparent);filter:blur(12px);transform:skewX(-24deg);animation:speedGridSweep 9s linear infinite;}
    </style>
    <div class="pattern-speed"></div>`
  ),
  createTemplate(
    {
      id: "mousepad-contour-tech",
      name: "鼠标垫地形等高线",
      category: "纯图案 / 产品底图",
      description: "纯 CSS 等高线图案，适合做科技感、地图感、工程感的大面积桌垫底图。",
      tags: ["鼠标垫", "等高线", "地图", "地形", "科技"],
      difficulty: "advanced",
      printStyle: "all-over",
      suitableProducts: ["鼠标垫", "桌垫", "工作台垫", "工程感背景布"],
      sceneDescription: "适合喜欢地图纹理、技术感底图的产品设计。",
      sortOrder: 40,
    },
    [
      colorField("color.background", "底色"),
      colorField("color.primary", "线条色"),
      colorField("color.secondary", "高亮点缀色"),
    ],
    {
      color: {
        background: createPureColor("#04111d"),
        primary: createPureColor("#38bdf8"),
        secondary: createPureColor("#34d399"),
      },
    },
    `<style>
      @keyframes contourPulse {
        0%,100% { opacity:.18; }
        50% { opacity:.32; }
      }
      .pattern-contour{width:100%;height:100%;position:relative;overflow:hidden;background:
        radial-gradient(circle at 18% 20%, rgba(56,189,248,.08), transparent 16%),
        linear-gradient(180deg, #061422, {{color.background}});}
      .pattern-contour::before{content:"";position:absolute;inset:0;background:
        radial-gradient(120% 86% at 16% 52%, transparent 56%, rgba(56,189,248,.18) 57% 57.6%, transparent 58.2%),
        radial-gradient(120% 86% at 38% 52%, transparent 56%, rgba(56,189,248,.14) 57% 57.6%, transparent 58.2%),
        radial-gradient(120% 86% at 60% 52%, transparent 56%, rgba(56,189,248,.16) 57% 57.6%, transparent 58.2%),
        radial-gradient(120% 86% at 82% 52%, transparent 56%, rgba(56,189,248,.14) 57% 57.6%, transparent 58.2%);
        opacity:.92;}
      .pattern-contour::after{content:"";position:absolute;inset:0;background:
        radial-gradient(circle at 18% 44%, rgba(52,211,153,.46) 0 2px, transparent 3px),
        radial-gradient(circle at 46% 22%, rgba(52,211,153,.38) 0 2px, transparent 3px),
        radial-gradient(circle at 74% 62%, rgba(52,211,153,.42) 0 2px, transparent 3px),
        radial-gradient(circle at 86% 36%, rgba(52,211,153,.34) 0 2px, transparent 3px);
        animation:contourPulse 5s ease-in-out infinite;}
    </style>
    <div class="pattern-contour"></div>`
  ),
  createTemplate(
    {
      id: "tapestry-sun-arches",
      name: "挂毯波西米亚日晕",
      category: "纯图案 / 产品底图",
      description: "用弧形、日晕和织物感噪点做挂毯图案，适合 boho 和家居风格。",
      tags: ["挂毯", "boho", "日晕", "家居", "纯图案"],
      difficulty: "intermediate",
      printStyle: "pattern",
      suitableProducts: ["挂毯", "墙布", "背景布", "地垫"],
      sceneDescription: "适合家居、卧室、生活方式挂布的柔和大图案。",
      sortOrder: 50,
    },
    [
      colorField("color.background", "底色"),
      colorField("color.primary", "主弧形色"),
      colorField("color.secondary", "太阳色"),
      colorField("color.tertiary", "深层色"),
    ],
    {
      color: {
        background: createPureColor("#f8f0dd"),
        primary: createPureColor("#b45309"),
        secondary: createPureColor("#f59e0b"),
        tertiary: createPureColor("#7c2d12"),
      },
    },
    `<style>
      .pattern-boho{width:100%;height:100%;position:relative;overflow:hidden;background:{{color.background}};}
      .pattern-boho::before{content:"";position:absolute;inset:0;background:
        repeating-linear-gradient(0deg, rgba(255,255,255,.16) 0 2px, rgba(0,0,0,.02) 2px 5px),
        repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 1px, transparent 1px 8px);
        opacity:.36;mix-blend-mode:multiply;}
      .pattern-boho__sun{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);width:min(30vw,220px);aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle, #fff7ed, {{color.secondary}} 64%, transparent 65%);}
      .pattern-boho__arch{position:absolute;left:50%;transform:translateX(-50%);border-radius:999px 999px 0 0;}
      .pattern-boho__arch--a{bottom:16%;width:86%;height:56%;background:{{color.primary}};}
      .pattern-boho__arch--b{bottom:16%;width:68%;height:44%;background:{{color.secondary}};}
      .pattern-boho__arch--c{bottom:16%;width:50%;height:32%;background:{{color.tertiary}};}
      .pattern-boho__arch--d{bottom:16%;width:32%;height:20%;background:{{color.background}};}
    </style>
    <div class="pattern-boho">
      <div class="pattern-boho__sun"></div>
      <div class="pattern-boho__arch pattern-boho__arch--a"></div>
      <div class="pattern-boho__arch pattern-boho__arch--b"></div>
      <div class="pattern-boho__arch pattern-boho__arch--c"></div>
      <div class="pattern-boho__arch pattern-boho__arch--d"></div>
    </div>`
  ),
  createTemplate(
    {
      id: "tapestry-celestial-tiles",
      name: "挂毯星月图腾",
      category: "纯图案 / 产品底图",
      description: "适合神秘感、星空感挂毯的 CSS 图案，用月亮、星点和轨道构成整块底图。",
      tags: ["挂毯", "星空", "月亮", "神秘", "占星"],
      difficulty: "advanced",
      printStyle: "pattern",
      suitableProducts: ["挂毯", "墙布", "背景布", "冥想空间布艺"],
      sceneDescription: "适合卧室、冥想角、神秘学和宇宙主题家居图案。",
      sortOrder: 60,
    },
    [
      colorField("color.background", "底色"),
      colorField("color.primary", "月亮色"),
      colorField("color.secondary", "点缀色"),
    ],
    {
      color: {
        background: createPureColor("#020617"),
        primary: createPureColor("#f8fafc"),
        secondary: createPureColor("#38bdf8"),
      },
    },
    `<style>
      @keyframes celestialOrbitSpin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      .pattern-celestial{width:100%;height:100%;position:relative;overflow:hidden;background:
        radial-gradient(circle at 20% 20%, rgba(56,189,248,.1), transparent 16%),
        linear-gradient(180deg, #081121, {{color.background}});}
      .pattern-celestial::before{content:"";position:absolute;inset:0;background:
        radial-gradient(circle at 12% 20%, rgba(255,255,255,.7) 0 1px, transparent 2px),
        radial-gradient(circle at 28% 72%, rgba(255,255,255,.58) 0 1px, transparent 2px),
        radial-gradient(circle at 52% 24%, rgba(255,255,255,.64) 0 1px, transparent 2px),
        radial-gradient(circle at 76% 18%, rgba(255,255,255,.72) 0 1px, transparent 2px),
        radial-gradient(circle at 84% 62%, rgba(255,255,255,.6) 0 1px, transparent 2px);}
      .pattern-celestial__ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;border:1px solid rgba(248,250,252,.14);}
      .pattern-celestial__ring--a{width:min(54vw,420px);aspect-ratio:1/1;animation:celestialOrbitSpin 24s linear infinite;}
      .pattern-celestial__ring--b{width:min(78vw,620px);aspect-ratio:1/1;animation:celestialOrbitSpin 40s linear reverse infinite;}
      .pattern-celestial__moon{position:absolute;border-radius:50%;background:radial-gradient(circle at 32% 32%, #fff, {{color.primary}} 62%, rgba(255,255,255,.08) 63%);}
      .pattern-celestial__moon--a{width:min(12vw,84px);aspect-ratio:1/1;left:50%;top:50%;transform:translate(-50%,-50%);}
      .pattern-celestial__moon--b{width:min(5vw,34px);aspect-ratio:1/1;left:18%;top:42%;}
      .pattern-celestial__moon--c{width:min(4vw,28px);aspect-ratio:1/1;right:16%;top:34%;}
    </style>
    <div class="pattern-celestial">
      <div class="pattern-celestial__ring pattern-celestial__ring--a"></div>
      <div class="pattern-celestial__ring pattern-celestial__ring--b"></div>
      <div class="pattern-celestial__moon pattern-celestial__moon--a"></div>
      <div class="pattern-celestial__moon pattern-celestial__moon--b"></div>
      <div class="pattern-celestial__moon pattern-celestial__moon--c"></div>
    </div>`
  ),
  createTemplate(
    {
      id: "tapestry-mandala-bloom",
      name: "挂毯曼陀罗花盘",
      category: "纯图案 / 产品底图",
      description: "用 conic-gradient 和多层圆盘构成曼陀罗式挂毯图案，适合中心构图的大画幅。",
      tags: ["挂毯", "曼陀罗", "中心构图", "花盘", "纯图案"],
      difficulty: "advanced",
      printStyle: "pattern",
      suitableProducts: ["挂毯", "墙布", "瑜伽布", "圆心式地垫图案"],
      sceneDescription: "适合需要中心聚焦的大型图案，画布放大后也能保持对称美感。",
      sortOrder: 70,
    },
    [
      colorField("color.background", "底色"),
      colorField("color.primary", "主花盘色"),
      colorField("color.secondary", "副花盘色"),
      colorField("color.tertiary", "第三色"),
    ],
    {
      color: {
        background: createPureColor("#f8fafc"),
        primary: createPureColor("#0f766e"),
        secondary: createPureColor("#f59e0b"),
        tertiary: createPureColor("#b91c1c"),
      },
    },
    `<style>
      @keyframes mandalaBloomTurn {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      .pattern-mandala{width:100%;height:100%;position:relative;overflow:hidden;background:
        radial-gradient(circle at 50% 50%, rgba(255,255,255,.72), transparent 56%),
        {{color.background}};}
      .pattern-mandala__disc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;}
      .pattern-mandala__disc--a{width:min(72vw,560px);aspect-ratio:1/1;background:
        repeating-conic-gradient(from 0deg, rgba(15,118,110,.16) 0 10deg, transparent 10deg 20deg),
        radial-gradient(circle, transparent 0 58%, rgba(15,118,110,.22) 58% 60%, transparent 60%);
        animation:mandalaBloomTurn 48s linear infinite;}
      .pattern-mandala__disc--b{width:min(48vw,360px);aspect-ratio:1/1;background:
        repeating-conic-gradient(from 0deg, rgba(245,158,11,.24) 0 12deg, transparent 12deg 24deg),
        radial-gradient(circle, transparent 0 54%, rgba(185,28,28,.16) 54% 56%, transparent 56%);}
      .pattern-mandala__disc--c{width:min(22vw,160px);aspect-ratio:1/1;background:radial-gradient(circle, #fff, {{color.secondary}} 58%, {{color.primary}} 76%, transparent 77%);}
    </style>
    <div class="pattern-mandala">
      <div class="pattern-mandala__disc pattern-mandala__disc--a"></div>
      <div class="pattern-mandala__disc pattern-mandala__disc--b"></div>
      <div class="pattern-mandala__disc pattern-mandala__disc--c"></div>
    </div>`
  ),
  createTemplate(
    {
      id: "textile-moire-checker",
      name: "织物摩尔棋盘纹",
      category: "纯图案 / 产品底图",
      description: "适合挂毯、抱毯、围巾和布艺配饰，用棋盘和摩尔纹制造时髦的织物图案。",
      tags: ["布艺", "棋盘", "摩尔纹", "织物", "纯图案"],
      difficulty: "advanced",
      printStyle: "pattern",
      suitableProducts: ["挂毯", "抱毯", "围巾", "布艺配饰"],
      sceneDescription: "适合偏时装感、图案感更强的布艺类商品。",
      sortOrder: 80,
    },
    [
      colorField("color.background", "底色"),
      colorField("color.primary", "主图案色"),
      colorField("color.secondary", "辅助图案色"),
      numberField("number.tile", "图案密度", {
        min: 20,
        max: 80,
        step: 1,
        placeholder: "42",
        description: "控制棋盘和纹理的大小。",
      }),
    ],
    {
      color: {
        background: createPureColor("#fffaf5"),
        primary: createPureColor("#111827"),
        secondary: createPureColor("#0f766e"),
      },
      number: {
        tile: 42,
      },
    },
    `<style>
      @keyframes moireTileShift {
        0%,100% { background-position: 0 0, 0 0, 50% 50%; }
        50% { background-position: 20px 0, -14px 0, 50% 52%; }
      }
      .pattern-moire{width:100%;height:100%;position:relative;overflow:hidden;background:{{color.background}};}
      .pattern-moire::before{content:"";position:absolute;inset:0;background:
        linear-gradient(45deg, rgba(17,24,39,.08) 25%, transparent 25%, transparent 75%, rgba(17,24,39,.08) 75%, rgba(17,24,39,.08)),
        linear-gradient(45deg, rgba(15,118,110,.08) 25%, transparent 25%, transparent 75%, rgba(15,118,110,.08) 75%, rgba(15,118,110,.08)),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,.42), transparent 58%);
        background-size:calc({{number.tile}} * 1px) calc({{number.tile}} * 1px), calc({{number.tile}} * 1px) calc({{number.tile}} * 1px), 100% 100%;
        background-position:0 0, calc(({{number.tile}} * 1px) / 2) calc(({{number.tile}} * 1px) / 2), 50% 50%;
        animation:moireTileShift 9s ease-in-out infinite;
        mix-blend-mode:multiply;}
      .pattern-moire::after{content:"";position:absolute;inset:0;background:
        repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 1px, transparent 1px 8px),
        repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 10px);
        opacity:.34;}
    </style>
    <div class="pattern-moire"></div>`
  ),
];
