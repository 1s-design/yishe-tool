import {
  ref,
  computed,
  shallowRef,
  nextTick,
  watch,
  defineAsyncComponent,
  defineComponent,
  shallowReactive,
} from "vue";
// 使用 html-to-image
import {
  toPng,
  toJpeg,
  toBlob,
  toPixelData,
  toSvg,
  toCanvas,
  getFontEmbedCSS,
} from "html-to-image";
import { downloadByFile } from "@/common/transform";
import { useDebounceFn } from "@vueuse/core";
import { waitImage } from "@/common";
import { createCanvasChildSvg } from "./children/svg/svg.tsx";

import {
  createCanvasChildText,
  createDefaultCanvasChildTextOptions,
} from "./children/text/text.tsx";
import {
  createCanvasChildBackground,
  createDefaultCanvasChildBackgroundOptions,
} from "./children/background/index.tsx";
import {
  createDefaultCanvasChildQrcodeOptions,
  createCanvasChildQrcode,
} from "./children/qrcode.tsx";
import {
  createDefaultCanvasChildSvgRectOptions,
  createCanvasChildRect,
  createCanvasChildEllipse,
  createDefaultCanvasChildSvgEllipseOptions,
} from "./children/svg/svg.tsx";
import {
  createCanvasChildImage,
  createDefaultCanvasChildImageOptions,
} from "./children/image.tsx";
import { formatSizeOptionToPixelValue } from "./helper.tsx";
import { 
  remapBindingBySchema, 
  getComponentDefaultConfig,
  COMPONENT_CONFIGS
} from "./componentConfigSchema";


import {
  createCanvasChildRawCanvas,
  createDefaultCanvasChildRawCanvasOptions,
} from "./children/rawCanvas.tsx";
import {
  createCanvasChildWordCloud,
  createDefaultCanvasChildWordCloudOptions,
} from "./children/wordCloud/index.tsx";
import {
  createCanvasChildThreeScene,
  createDefaultCanvasChildThreeSceneOptions,
} from "./children/threeScene/index.tsx";
import {
  createCanvasChildEchart,
  createDefaultCanvasChildEchartOptions,
} from "./children/echart/index.tsx";
import {
  createCanvasChildMath,
  createDefaultCanvasChildMathOptions,
} from "./children/math.tsx";
import {
  createCanvasChildMermaid,
  createDefaultCanvasChildMermaidOptions,
} from "./children/mermaid.tsx";
import {
  createCanvasChildCodeBlock,
  createDefaultCanvasChildCodeBlockOptions,
} from "./children/codeBlock.tsx";
import {
  createCanvasChildMolecule,
  createDefaultCanvasChildMoleculeOptions,
} from "./children/molecule.tsx";
import {
  createCanvasChildThreeMol,
  createDefaultCanvasChildThreeMolOptions,
} from "./children/threeMol.tsx";
import {
  createCanvasChildAbcNotation,
  createDefaultCanvasChildAbcNotationOptions,
} from "./children/abcNotation.tsx";
import {
  createCanvasChildVexFlow,
  createDefaultCanvasChildVexFlowOptions,
} from "./children/vexFlow.tsx";
import {
  createCanvasChildCytoscape,
  createDefaultCanvasChildCytoscapeOptions,
} from "./children/cytoscape.tsx";
import {
  createCanvasChildCytoscapeGraph,
  createDefaultCanvasChildCytoscapeGraphOptions,
} from "./children/cytoscapeGraph.tsx";
import {
  createCanvasChildVueDataUi,
  createDefaultCanvasChildVueDataUiOptions,
} from "./children/vueDataUi.tsx";
import {
  createCanvasChildD3,
  createDefaultCanvasChildD3Options,
} from "./children/d3.tsx";
import {
  createCanvasChildD3Cloud,
  createDefaultCanvasChildD3CloudOptions,
} from "./children/d3Cloud.tsx";
import {
  createCanvasChildFiglet,
  createDefaultCanvasChildFigletOptions,
} from "./children/figlet.tsx";
import {
  createCanvasChildOpentypeText,
  createDefaultCanvasChildOpentypeTextOptions,
} from "./children/opentypeText.tsx";
import {
  createCanvasChildSimplexNoise,
  createDefaultCanvasChildSimplexNoiseOptions,
} from "./children/simplexNoise.tsx";
import {
  createCanvasChildGraphviz,
  createDefaultCanvasChildGraphvizOptions,
} from "./children/graphviz.tsx";
import {
  createCanvasChildDagreGraph,
  createDefaultCanvasChildDagreGraphOptions,
} from "./children/dagreGraph.tsx";
import {
  createCanvasChildRoughShape,
  createDefaultCanvasChildRoughShapeOptions,
} from "./children/roughShape.tsx";
import {
  createCanvasChildChartjs,
  createDefaultCanvasChildChartjsOptions,
} from "./children/chartjs.tsx";
import {
  createCanvasChildFrappeChart,
  createDefaultCanvasChildFrappeChartOptions,
} from "./children/frappeChart.tsx";
import {
  createCanvasChildChartXkcd,
  createDefaultCanvasChildChartXkcdOptions,
} from "./children/chartXkcd.tsx";
import {
  createCanvasChildPlotlyChart,
  createDefaultCanvasChildPlotlyChartOptions,
} from "./children/plotlyChart.tsx";
import {
  createCanvasChildVegaLite,
  createDefaultCanvasChildVegaLiteOptions,
} from "./children/vegaLite.tsx";
import {
  createCanvasChildWaveform,
  createDefaultCanvasChildWaveformOptions,
} from "./children/waveform.tsx";
import {
  createCanvasChildMarkmapChart,
  createDefaultCanvasChildMarkmapChartOptions,
} from "./children/markmapChart.tsx";
import {
  createCanvasChildParticlesEffect,
  createDefaultCanvasChildParticlesEffectOptions,
} from "./children/particlesEffect.tsx";
import {
  createCanvasChildConfetti,
  createDefaultCanvasChildConfettiOptions,
} from "./children/confetti.tsx";
import {
  createCanvasChildTrianglify,
  createDefaultCanvasChildTrianglifyOptions,
} from "./children/trianglifyPattern.tsx";

import { createDefaultCanvasChildcanvasStickerOptions } from "./children/canvas";

import { Canvas } from "./children/canvas.tsx";
import { createFilterDefaultOptions } from "./children/defaultOptions.tsx";

import Utils from "@/common/utils";

import { currentModelController } from "@/components/design/store";

import { imageDataToFile, canvasToFile } from "@/common/transform";
import { defineCanvasChild } from "./children/define.tsx";
import {
  syncHtmlTemplateFieldsFromContent,
  getValueByPath,
  setValueByPath,
} from "./htmlTemplate/runtime.ts";

// import { PngIcoConverter } from "/public/lib/png2icojs"; // 导入库

/*
    画布参数
*/

export const currentEditingCustomStickerId = ref<string | null>(null)
export const currentEditingCustomStickerFolderId = ref<string | null>(null)
export const currentEditingCustomStickerName = ref<string | null>(null)

export function exitCustomStickerEditMode() {
  currentEditingCustomStickerId.value = null
  currentEditingCustomStickerFolderId.value = null
  currentEditingCustomStickerName.value = null
}

export var canvasStickerOptions = ref({
  unit: "px", // 这个单位还是要保留，当作整个部分的单位
  showCanvasRealSize: false,
  supportBackgroundColor: {
    type: "pure",
    color: "rgba(0,0,0,0)",
  },
  svgFilter: {
    // 正在操作的自定义的滤镜元素， 只存在一个
    children: [],

    // 内置的滤镜
    // builtInSvgFilters: [],
  },
  children: [
    // 默认会存在一个画布元素
    createDefaultCanvasChildcanvasStickerOptions(),
    // 默认固定的 HTML 代码主元素
    {
      id: "this_is_html_id",
      type: "html",
      htmlContent: `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #fafafa; color: #666; font-family: sans-serif; font-size: 24px;">\n  主 HTML 模板\n</div>`,
      htmlBindings: {},
      htmlTemplateFields: [],
      htmlTemplateDefaultBindings: {},
      htmlTemplateMeta: null,
      transform: {
        rotate: 0,
        scaleX: 1,
        scaleY: 1,
      },
      filter: {
        blur: { value: 0, unit: "px" },
        brightness: { value: 100, unit: "%" },
        contrast: { value: 100, unit: "%" },
        grayscale: { value: 0, unit: "%" },
        hueRotate: { value: 0, unit: "deg" },
        invert: { value: 0, unit: "%" },
        opacity: { value: 100, unit: "%" },
        saturate: { value: 100, unit: "%" },
        sepia: { value: 0, unit: "%" },
      },
      zIndex: 0,
      undeletable: true,
    }
  ],
});

let lastKnownCanvasSize = {
  width: 2000,
  height: 2000,
  unit: "px",
};

watch(
  canvasStickerOptions,
  (newVal) => {
    if (!newVal.children) {
      newVal.children = [];
    }
    const children = newVal.children;
    const currentCanvas = children.find((c) => c.type === "canvas") as any;
    if (currentCanvas?.width?.value && currentCanvas?.height?.value) {
      lastKnownCanvasSize = {
        width: currentCanvas.width.value,
        height: currentCanvas.height.value,
        unit: currentCanvas.width.unit || "px",
      };
    }

    // 1. 确保始终存在 canvas 元素
    if (!currentCanvas) {
      children.unshift(
        createDefaultCanvasChildcanvasStickerOptions(
          lastKnownCanvasSize.width,
          lastKnownCanvasSize.height,
          lastKnownCanvasSize.unit,
        ),
      );
    }

    // 2. 确保始终存在 id 为 "this_is_html_id" 的 html 元素
    let hasHtml = children.some((c) => c.id === "this_is_html_id");
    if (!hasHtml) {
      const defaultHtml = {
        id: "this_is_html_id",
        type: "html",
        htmlContent: `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #fafafa; color: #666; font-family: sans-serif; font-size: 24px;">\n  主 HTML 模板\n</div>`,
        htmlBindings: {},
        htmlTemplateFields: [],
        htmlTemplateDefaultBindings: {},
        htmlTemplateMeta: null,
        transform: {
          rotate: 0,
          scaleX: 1,
          scaleY: 1,
        },
        filter: {
          blur: { value: 0, unit: "px" },
          brightness: { value: 100, unit: "%" },
          contrast: { value: 100, unit: "%" },
          grayscale: { value: 0, unit: "%" },
          hueRotate: { value: 0, unit: "deg" },
          invert: { value: 0, unit: "%" },
          opacity: { value: 100, unit: "%" },
          saturate: { value: 100, unit: "%" },
          sepia: { value: 0, unit: "%" },
          filterUrl: {
            isCompositeFilter: false,
            filterChildren: [],
          }
        },
        zIndex: 0,
        undeletable: true,
      };

      const canvasIndex = children.findIndex((c) => c.type === "canvas");
      if (canvasIndex !== -1) {
        children.splice(canvasIndex + 1, 0, defaultHtml);
      } else {
        children.push(defaultHtml);
      }
    } else {
      const htmlChild = children.find((c) => c.id === "this_is_html_id");
      if (htmlChild) {
        if (!htmlChild.filter) {
          htmlChild.filter = {
            blur: { value: 0, unit: "px" },
            brightness: { value: 100, unit: "%" },
            contrast: { value: 100, unit: "%" },
            grayscale: { value: 0, unit: "%" },
            hueRotate: { value: 0, unit: "deg" },
            invert: { value: 0, unit: "%" },
            opacity: { value: 100, unit: "%" },
            saturate: { value: 100, unit: "%" },
            sepia: { value: 0, unit: "%" },
          } as any;
        }
        if (!htmlChild.filter.filterUrl) {
          htmlChild.filter.filterUrl = {
            isCompositeFilter: false,
            filterChildren: [],
          };
        }
        htmlChild.undeletable = true;
      }
    }
  },
  { immediate: true, deep: true }
);

export const canvasStickerOptionsOnlyChild = computed(() => {
  return canvasStickerOptions.value.children.find((c) => c.type == "canvas") as any;
});

// 获取子元素最高层级的元素，而不是获取该层级 ， 有多个返回第一个
export function getCanvasTopZIndexChild() {
  let children = canvasStickerOptions.value.children;

  const maxIndex = Math.max(
    ...children.map((item: any) => item.zIndex).filter(Boolean),
  );
  let maxChild: any = children.find((item: any) => item.zIndex == maxIndex);

  return maxChild;
}

export function getCanvasChildTopZIndex() {
  return getCanvasTopZIndexChild()?.zIndex || 0;
}

/**
 * 这里会默认的留一个画布元素
 */

// 定义所有出现的类型
export const CanvasChildType = {
  canvas: "canvas", // 画布
};

export const canvasChildLabelMap = {
  [CanvasChildType.canvas]: "画布",
};

export const canvasChildDefaultOptionsMap = {
  [CanvasChildType.canvas]: null,
};

export const canvasChildRenderMap = {
  [CanvasChildType.canvas]: null,
};

import backgroundLayout from "./operateLayout/background.vue";
import canvasLayout from "./operateLayout/canvas.vue";
import textLayout from "./operateLayout/text.vue";
import imageLayout from "./operateLayout/image.vue";
import rawCanvasLayout from "./operateLayout/rawCanvas.vue";
import qrcodeLayout from "./operateLayout/qrcode.vue";
import rectLayout from "./operateLayout/rect.vue";
import ellipseLayout from "./operateLayout/ellipse.vue";
import barcodeLayout from "./operateLayout/barcode.vue";
import htmlLayout from "./operateLayout/html.vue";
import wordCloudLayout from "./operateLayout/wordCloud.vue";
import threeSceneLayout from "./operateLayout/threeScene.vue";
import echartLayout from "./operateLayout/echart.vue";
import mathLayout from "./operateLayout/mathFormula.vue";
import mermaidLayout from "./operateLayout/mermaid.vue";
import codeBlockLayout from "./operateLayout/codeBlock.vue";
import moleculeLayout from "./operateLayout/molecule.vue";
import threeMolLayout from "./operateLayout/threeMol.vue";
import abcNotationLayout from "./operateLayout/abcNotation.vue";
import vexFlowLayout from "./operateLayout/vexFlow.vue";
import cytoscapeLayout from "./operateLayout/cytoscape.vue";
import cytoscapeGraphLayout from "./operateLayout/cytoscapeGraph.vue";
import vueDataUiLayout from "./operateLayout/vueDataUi.vue";
import d3Layout from "./operateLayout/d3.vue";
import d3CloudLayout from "./operateLayout/d3Cloud.vue";
import figletLayout from "./operateLayout/figlet.vue";
import opentypeTextLayout from "./operateLayout/opentypeText.vue";
import simplexNoiseLayout from "./operateLayout/simplexNoise.vue";
import graphvizLayout from "./operateLayout/graphviz.vue";
import dagreGraphLayout from "./operateLayout/dagreGraph.vue";
import roughShapeLayout from "./operateLayout/roughShape.vue";
import chartjsLayout from "./operateLayout/chartjs.vue";
import frappeChartLayout from "./operateLayout/frappeChart.vue";
import chartXkcdLayout from "./operateLayout/chartXkcd.vue";
import plotlyChartLayout from "./operateLayout/plotlyChart.vue";
import vegaLiteLayout from "./operateLayout/vegaLite.vue";
import starChartLayout from "./operateLayout/starChart.vue";
import waveformLayout from "./operateLayout/waveform.vue";
import markmapChartLayout from "./operateLayout/markmapChart.vue";
import particlesEffectLayout from "./operateLayout/particlesEffect.vue";
import confettiLayout from "./operateLayout/confetti.vue";
import trianglifyPatternLayout from "./operateLayout/trianglifyPattern.vue";

import {
  createCanvasChildStarChart,
  createDefaultCanvasChildStarChartOptions,
} from "./children/starChart.tsx";

import {
  createCanvasChildBarcode,
  createDefaultCanvasChildBarcodeOptions,
} from "./children/barcode/index.tsx";
import {
  createCanvasChildHtml,
  createDefaultCanvasChildHtmlOptions,
} from "./children/html.tsx";

export const CanvasChildOperationComponentMap = {
  [CanvasChildType.canvas]: canvasLayout,
};

// 文字
defineCanvasChild({
  typeName: "text",
  typeKey: "text",
  label: "文字",
  defaultOptionsCreator: createDefaultCanvasChildTextOptions,
  renderer: createCanvasChildText,
  operationLayout: textLayout,
});

defineCanvasChild({
  typeName: "background",
  typeKey: "background",
  label: "背景",
  defaultOptionsCreator: createDefaultCanvasChildBackgroundOptions,
  renderer: createCanvasChildBackground,
  operationLayout: backgroundLayout,
});

defineCanvasChild({
  typeName: "image",
  typeKey: "image",
  label: "图片",
  defaultOptionsCreator: createDefaultCanvasChildImageOptions,
  renderer: createCanvasChildImage,
  operationLayout: imageLayout,
});

defineCanvasChild({
  typeName: "rawCanvas",
  typeKey: "rawCanvas",
  label: "程序画布 (Canvas)",
  defaultOptionsCreator: createDefaultCanvasChildRawCanvasOptions,
  renderer: createCanvasChildRawCanvas,
  operationLayout: rawCanvasLayout,
});

defineCanvasChild({
  typeName: "wordCloud",
  typeKey: "wordCloud",
  label: "词云 (wordcloud2)",
  defaultOptionsCreator: createDefaultCanvasChildWordCloudOptions,
  renderer: createCanvasChildWordCloud,
  operationLayout: wordCloudLayout,
});

defineCanvasChild({
  typeName: "threeScene",
  typeKey: "threeScene",
  label: "3D模型 (Three.js)",
  defaultOptionsCreator: createDefaultCanvasChildThreeSceneOptions,
  renderer: createCanvasChildThreeScene,
  operationLayout: threeSceneLayout,
});

defineCanvasChild({
  typeName: "echart",
  typeKey: "echart",
  label: "图表 (ECharts)",
  defaultOptionsCreator: createDefaultCanvasChildEchartOptions,
  renderer: createCanvasChildEchart,
  operationLayout: echartLayout,
});

defineCanvasChild({
  typeName: "math",
  typeKey: "math",
  label: "数学公式 (KaTeX)",
  defaultOptionsCreator: createDefaultCanvasChildMathOptions,
  renderer: createCanvasChildMath,
  operationLayout: mathLayout,
});

defineCanvasChild({
  typeName: "mermaid",
  typeKey: "mermaid",
  label: "流程图 (Mermaid)",
  defaultOptionsCreator: createDefaultCanvasChildMermaidOptions,
  renderer: createCanvasChildMermaid,
  operationLayout: mermaidLayout,
});

defineCanvasChild({
  typeName: "graphviz",
  typeKey: "graphviz",
  label: "Graphviz (DOT)",
  defaultOptionsCreator: createDefaultCanvasChildGraphvizOptions,
  renderer: createCanvasChildGraphviz,
  operationLayout: graphvizLayout,
});

defineCanvasChild({
  typeName: "codeBlock",
  typeKey: "codeBlock",
  label: "代码块 (Shiki)",
  defaultOptionsCreator: createDefaultCanvasChildCodeBlockOptions,
  renderer: createCanvasChildCodeBlock,
  operationLayout: codeBlockLayout,
});

defineCanvasChild({
  typeName: "ellipse",
  typeKey: "ellipse",
  label: "圆和椭圆",
  defaultOptionsCreator: createDefaultCanvasChildSvgEllipseOptions,
  renderer: createCanvasChildEllipse,
  operationLayout: ellipseLayout,
});

defineCanvasChild({
  typeName: "rect",
  typeKey: "rect",
  label: "矩形",
  defaultOptionsCreator: createDefaultCanvasChildSvgRectOptions,
  renderer: createCanvasChildRect,
  operationLayout: rectLayout,
});

defineCanvasChild({
  typeName: "qrcode",
  typeKey: "qrcode",
  label: "二维码",
  defaultOptionsCreator: createDefaultCanvasChildQrcodeOptions,
  renderer: createCanvasChildQrcode,
  operationLayout: qrcodeLayout,
});

defineCanvasChild({
  typeName: "barcode",
  typeKey: "barcode",
  label: "条形码",
  defaultOptionsCreator: createDefaultCanvasChildBarcodeOptions,
  renderer: createCanvasChildBarcode,
  operationLayout: barcodeLayout,
});

defineCanvasChild({
  typeName: "html",
  typeKey: "html",
  label: "代码画布",
  defaultOptionsCreator: createDefaultCanvasChildHtmlOptions,
  renderer: createCanvasChildHtml,
  operationLayout: htmlLayout,
});

defineCanvasChild({
  typeName: "molecule",
  typeKey: "molecule",
  label: "分子结构 (RDKit.js)",
  defaultOptionsCreator: createDefaultCanvasChildMoleculeOptions,
  renderer: createCanvasChildMolecule,
  operationLayout: moleculeLayout,
});

defineCanvasChild({
  typeName: "threeMol",
  typeKey: "threeMol",
  label: "3D分子 (3Dmol.js)",
  defaultOptionsCreator: createDefaultCanvasChildThreeMolOptions,
  renderer: createCanvasChildThreeMol,
  operationLayout: threeMolLayout,
});

defineCanvasChild({
  typeName: "abcNotation",
  typeKey: "abcNotation",
  label: "乐谱 (abcjs)",
  defaultOptionsCreator: createDefaultCanvasChildAbcNotationOptions,
  renderer: createCanvasChildAbcNotation,
  operationLayout: abcNotationLayout,
});

defineCanvasChild({
  typeName: "vexFlow",
  typeKey: "vexFlow",
  label: "五线谱 (VexFlow)",
  defaultOptionsCreator: createDefaultCanvasChildVexFlowOptions,
  renderer: createCanvasChildVexFlow,
  operationLayout: vexFlowLayout,
});

defineCanvasChild({
  typeName: "cytoscape",
  typeKey: "cytoscape",
  label: "关系图 (Cytoscape.js)",
  defaultOptionsCreator: createDefaultCanvasChildCytoscapeOptions,
  renderer: createCanvasChildCytoscape,
  operationLayout: cytoscapeLayout,
});

defineCanvasChild({
  typeName: "cytoscapeGraph",
  typeKey: "cytoscapeGraph",
  label: "网络图 (Cytoscape Graph)",
  defaultOptionsCreator: createDefaultCanvasChildCytoscapeGraphOptions,
  renderer: createCanvasChildCytoscapeGraph,
  operationLayout: cytoscapeGraphLayout,
});

defineCanvasChild({
  typeName: "vueDataUi",
  typeKey: "vueDataUi",
  label: "数据图表 (vue-data-ui)",
  defaultOptionsCreator: createDefaultCanvasChildVueDataUiOptions,
  renderer: createCanvasChildVueDataUi,
  operationLayout: vueDataUiLayout,
});

defineCanvasChild({
  typeName: "d3",
  typeKey: "d3",
  label: "自定义图表 (D3.js)",
  defaultOptionsCreator: createDefaultCanvasChildD3Options,
  renderer: createCanvasChildD3,
  operationLayout: d3Layout,
});

defineCanvasChild({
  typeName: "d3Cloud",
  typeKey: "d3Cloud",
  label: "词云 (D3-Cloud)",
  defaultOptionsCreator: createDefaultCanvasChildD3CloudOptions,
  renderer: createCanvasChildD3Cloud,
  operationLayout: d3CloudLayout,
});

defineCanvasChild({
  typeName: "figlet",
  typeKey: "figlet",
  label: "ASCII艺术字 (Figlet)",
  defaultOptionsCreator: createDefaultCanvasChildFigletOptions,
  renderer: createCanvasChildFiglet,
  operationLayout: figletLayout,
});

defineCanvasChild({
  typeName: "opentypeText",
  typeKey: "opentypeText",
  label: "字体转路径 (OpenType)",
  defaultOptionsCreator: createDefaultCanvasChildOpentypeTextOptions,
  renderer: createCanvasChildOpentypeText,
  operationLayout: opentypeTextLayout,
});

defineCanvasChild({
  typeName: "simplexNoise",
  typeKey: "simplexNoise",
  label: "噪声纹理 (Simplex Noise)",
  defaultOptionsCreator: createDefaultCanvasChildSimplexNoiseOptions,
  renderer: createCanvasChildSimplexNoise,
  operationLayout: simplexNoiseLayout,
});

defineCanvasChild({
  typeName: "roughShape",
  typeKey: "roughShape",
  label: "手绘图形 (Rough.js)",
  defaultOptionsCreator: createDefaultCanvasChildRoughShapeOptions,
  renderer: createCanvasChildRoughShape,
  operationLayout: roughShapeLayout,
});

defineCanvasChild({
  typeName: "dagreGraph",
  typeKey: "dagreGraph",
  label: "有向图布局 (dagre)",
  defaultOptionsCreator: createDefaultCanvasChildDagreGraphOptions,
  renderer: createCanvasChildDagreGraph,
  operationLayout: dagreGraphLayout,
});

defineCanvasChild({
  typeName: "chartjs",
  typeKey: "chartjs",
  label: "图表 (Chart.js)",
  defaultOptionsCreator: createDefaultCanvasChildChartjsOptions,
  renderer: createCanvasChildChartjs,
  operationLayout: chartjsLayout,
});

defineCanvasChild({
  typeName: "frappeChart",
  typeKey: "frappeChart",
  label: "图表 (Frappe Charts)",
  defaultOptionsCreator: createDefaultCanvasChildFrappeChartOptions,
  renderer: createCanvasChildFrappeChart,
  operationLayout: frappeChartLayout,
});

defineCanvasChild({
  typeName: "chartXkcd",
  typeKey: "chartXkcd",
  label: "手绘图表 (chart.xkcd)",
  defaultOptionsCreator: createDefaultCanvasChildChartXkcdOptions,
  renderer: createCanvasChildChartXkcd,
  operationLayout: chartXkcdLayout,
});

defineCanvasChild({
  typeName: "starChart",
  typeKey: "starChart",
  label: "星图 (Astronomy Engine)",
  defaultOptionsCreator: createDefaultCanvasChildStarChartOptions,
  renderer: createCanvasChildStarChart,
  operationLayout: starChartLayout,
});

defineCanvasChild({
  typeName: "plotlyChart",
  typeKey: "plotlyChart",
  label: "科学图表 (Plotly.js)",
  defaultOptionsCreator: createDefaultCanvasChildPlotlyChartOptions,
  renderer: createCanvasChildPlotlyChart,
  operationLayout: plotlyChartLayout,
});

defineCanvasChild({
  typeName: "vegaLite",
  typeKey: "vegaLite",
  label: "图表 (Vega-Lite)",
  defaultOptionsCreator: createDefaultCanvasChildVegaLiteOptions,
  renderer: createCanvasChildVegaLite,
  operationLayout: vegaLiteLayout,
});

defineCanvasChild({
  typeName: "waveform",
  typeKey: "waveform",
  label: "音频波形 (Wavesurfer.js)",
  defaultOptionsCreator: createDefaultCanvasChildWaveformOptions,
  renderer: createCanvasChildWaveform,
  operationLayout: waveformLayout,
});

defineCanvasChild({
  typeName: "markmapChart",
  typeKey: "markmapChart",
  label: "思维导图 (Markmap)",
  defaultOptionsCreator: createDefaultCanvasChildMarkmapChartOptions,
  renderer: createCanvasChildMarkmapChart,
  operationLayout: markmapChartLayout,
});

defineCanvasChild({
  typeName: "particlesEffect",
  typeKey: "particlesEffect",
  label: "粒子效果 (Particles.js)",
  defaultOptionsCreator: createDefaultCanvasChildParticlesEffectOptions,
  renderer: createCanvasChildParticlesEffect,
  operationLayout: particlesEffectLayout,
});

defineCanvasChild({
  typeName: "confetti",
  typeKey: "confetti",
  label: "撒花效果 (canvas-confetti)",
  defaultOptionsCreator: createDefaultCanvasChildConfettiOptions,
  renderer: createCanvasChildConfetti,
  operationLayout: confettiLayout,
});

defineCanvasChild({
  typeName: "trianglify",
  typeKey: "trianglify",
  label: "三角纹理 (Trianglify)",
  defaultOptionsCreator: createDefaultCanvasChildTrianglifyOptions,
  renderer: createCanvasChildTrianglify,
  operationLayout: trianglifyPatternLayout,
});

/*
    是否展示主画布
*/
export var showMainCanvas = ref(true);

export function addCanvasChild(options) {
  options = {
    ...canvasChildDefaultOptionsMap[options.type].call(null),
    ...options,
    id: "_" + String(new Date().getTime()), // 这里要兼容 选择器规范
  };

  canvasStickerOptions.value.children.push(options);
  currentOperatingCanvasChildId.value = options.id;
}

// 当前正在操作的元素id
export var currentOperatingCanvasChildId = ref("this_is_canvas_id");

export const currentOperatingCanvasChild: any = computed({
  get() {
    let child = canvasStickerOptions.value.children.find(
      (c) => c.id == currentOperatingCanvasChildId.value,
    );

    if (!child) {
      currentOperatingCanvasChildId.value =
        canvasStickerOptions.value.children[0].id;
      return canvasStickerOptions.value.children[0];
    }
    return child;
  },
  set(val) {
    const index = canvasStickerOptions.value.children.findIndex(
      (c) => c.id == currentOperatingCanvasChildId.value,
    );
    if (index !== -1) {
      canvasStickerOptions.value.children[index] = val;
    }
  },
});

/**
 * 固定图层绑定 —— 画布 / 代码画布各自独立。
 * 两个操作面板可以同时渲染，不再依赖 currentOperatingCanvasChild 切换。
 */
function makeFixedLayerChild(id: string) {
  return computed({
    get() {
      let child = canvasStickerOptions.value.children.find((c) => c.id == id);
      if (!child) {
        child = canvasStickerOptions.value.children.find(
          (c) => c.type == (id === "this_is_html_id" ? "html" : "canvas"),
        );
      }
      return child;
    },
    set(val) {
      const index = canvasStickerOptions.value.children.findIndex(
        (c) => c.id == id,
      );
      if (index !== -1) {
        canvasStickerOptions.value.children[index] = val;
      }
    },
  });
}

export const canvasLayerChild: any = makeFixedLayerChild("this_is_canvas_id");
export const htmlLayerChild: any = makeFixedLayerChild("this_is_html_id");

/**
 * @todo 增加最近删除功能
 */
export function removeCavnasChild(id) {
  let child = canvasStickerOptions.value.children.find(
    (child: any) => child.id == id,
  ) as any;
  if (!child || child.type === "canvas" || child.type === "html" || child.id === "this_is_html_id") return;
  let index = canvasStickerOptions.value.children.indexOf(child);
  canvasStickerOptions.value.children.splice(index, 1);
  if (currentOperatingCanvasChildId.value === id) {
    currentOperatingCanvasChildId.value = canvasStickerOptions.value.children[0]?.id || null;
  }
}

export const currentCanvasControllerInstance = shallowRef(null);

export function updateRenderingCanvas() {
  currentCanvasControllerInstance.value?.updateRenderingCanvas();
}

function createCanvasChild(options) {
  if (!canvasChildRenderMap[options.type]) {
    return;
  }
  return canvasChildRenderMap[options.type]?.call(null, options);
}

export const renderingLoading = ref(false);

// ============ DOM 重挂载与插槽机制 ============

let activeResizeObserver: ResizeObserver | null = null;

function reparentCanvasChildren() {
  const children = canvasStickerOptions.value.children;

  if (!activeResizeObserver) {
    activeResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const placeholder = entry.target as HTMLElement;
        const childId = placeholder.getAttribute("data-s1-child-id");
        if (!childId) continue;

        const renderNode = document.getElementById(`s1-child-render-${childId}`);
        if (renderNode) {
          renderNode.dispatchEvent(
            new CustomEvent("s1-child-resize", {
              detail: {
                width: placeholder.clientWidth,
                height: placeholder.clientHeight,
              },
            })
          );
        }
      }
    });
  }

  // 先清空历史观察
  activeResizeObserver.disconnect();

  children.forEach((child) => {
    if (child.type === "canvas" || child.type === "html") return;

    // 支持 data-s1-child-id 或 class="s1-child"
    const placeholder = document.querySelector(`[data-s1-child-id="${child.id}"]`);
    const renderNode = document.getElementById(`s1-child-render-${child.id}`);

    if (placeholder && renderNode) {
      if (renderNode.parentNode !== placeholder) {
        placeholder.appendChild(renderNode);
      }

      // 重写子组件的绝对定位与大小，使其填满插槽
      renderNode.style.width = "100%";
      renderNode.style.height = "100%";
      renderNode.style.position = "relative";
      renderNode.style.top = "0";
      renderNode.style.left = "0";

      const childEl = renderNode.firstElementChild as HTMLElement;
      if (childEl) {
        childEl.style.width = "100%";
        childEl.style.height = "100%";
        childEl.style.position = "relative";
        childEl.style.top = "0";
        childEl.style.left = "0";
        childEl.style.transform = "none";
      }

      // 监听插槽尺寸变化
      activeResizeObserver.observe(placeholder);
    } else if (renderNode) {
      // 找不到插槽时退回到离屏池中，防止被销毁
      const pool = document.getElementById("s1-offscreen-pool");
      if (pool && renderNode.parentNode !== pool) {
        pool.appendChild(renderNode);
      }
    }
  });
}

// 二维的画布控制器

export class CanvasController {
  target = null;

  fontEmbedCSSCache: {
    value: string;
    key: string;
    expiresAt: number;
  } | null = null;

  constructor(params) {
    currentCanvasControllerInstance.value = this;

    // 先不自动控制
    // this.updateRenderingCanvas = useDebounceFn(this.updateRenderingCanvas, 666).bind(this)
    this.maxDisplaySize = params.max;
  }

  // 保留兼容字段；PNG 编码改为导出或 AI 分析时按需执行。
  base64 = null;

  maxDisplaySize = null;

  loading = ref(false);

  async toPngFile() {
    // 等待字体加载完成
    await this.waitForFontsLoaded();

    // 使用 html-to-image
    const blob = await toBlob(this.el, {
      quality: 1,
      pixelRatio: 1,
      backgroundColor: null,
      fontEmbedCSS: await this.getCachedFontEmbedCSS(),
    });

    return new File([blob], "canvas.png", { type: "image/png" });
  }

  async getCachedFontEmbedCSS() {
    const now = Date.now();
    const cacheKey = `${document.fonts?.size || 0}:${document.styleSheets.length}`;
    if (
      this.fontEmbedCSSCache &&
      this.fontEmbedCSSCache.key === cacheKey &&
      this.fontEmbedCSSCache.expiresAt > now
    ) {
      return this.fontEmbedCSSCache.value;
    }

    const value = await Promise.race([
      getFontEmbedCSS(this.el),
      new Promise<string>((resolve) => setTimeout(() => resolve(''), 8_000)),
    ]);
    this.fontEmbedCSSCache = {
      value,
      key: cacheKey,
      expiresAt: now + 30_000,
    };
    return value;
  }

  // 等待所有字体加载完成
  async waitForFontsLoaded() {
    // 等待 document.fonts API 加载完成（最多 5 秒）
    if (document.fonts && document.fonts.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 5_000)),
        ]);
      } catch (e) {
        console.warn("Font loading check failed:", e);
      }
    }

    // 检查所有使用的字体是否已加载
    const fontElements =
      this.el?.querySelectorAll('[style*="font-family"]') || [];
    const pendingFontNames = new Set<string>();

    fontElements.forEach((el: HTMLElement) => {
      const computedStyle = window.getComputedStyle(el);
      const fontFamily = computedStyle.fontFamily;

      // 检查是否是自定义字体（以 font_ 开头）
      if (fontFamily && fontFamily.includes("font_")) {
        // 提取字体名称
        const fontName = fontFamily.match(/font_\d+/)?.[0];
        if (fontName && document.fonts) {
          // 检查字体是否已加载
          const fontCheck = document.fonts.check(`12px ${fontName}`);
          if (!fontCheck) pendingFontNames.add(fontName);
        }
      }
    });

    if (pendingFontNames.size > 0) {
      await Promise.all(
        Array.from(pendingFontNames).map(
          (fontName) =>
            new Promise<void>((resolve) => {
              let attempts = 0;
              const maxAttempts = 50;
              const checkInterval = setInterval(() => {
                attempts++;
                if (
                  document.fonts.check(`12px ${fontName}`) ||
                  attempts >= maxAttempts
                ) {
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 100);
            }),
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  async downloadTrimmedPng() {
    const trimmedCanvas = Utils.trimCanvas(this.canvasEl);
    downloadByFile(await canvasToFile(trimmedCanvas));
  }

  async downloadPng() {
    await this.activeUpdateRenderingCanvas();
    downloadByFile(await canvasToFile(this.canvasEl));
  }

  // async downloadIco() {
  //     const imageData = this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
  //     let file = imageDataToFile(imageData)

  //     // 使用 PNG2ICOjs 转换为 ICO 格式
  //     const converter = new PngIcoConverter();
  //     const resultBlob = await converter.convertToBlobAsync([{ png: file }]);

  //     // 创建下载链接
  //     const url = URL.createObjectURL(resultBlob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'favicon.ico';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  // }

  canvasId = "canvas-render-helper-el";

  rawId = "this_is_canvas_id";

  get el() {
    return document.querySelector("#" + this.rawId) as any;
  }

  get canvasEl() {
    return document.querySelector("#" + this?.canvasId) as any;
  }

  get ctx() {
    if (!this.canvasEl) {
      return null;
    }
    return this.canvasEl.getContext("2d");
  }

  getBase64() {
    return this.canvasEl.toDataURL("image/png");
  }

  async getPalette() {
    return Utils.color.getPalette(this.getBase64());
  }

  // 需要组件渲染后再更新
  async updateRenderingCanvas() {
    this.shouldUpdateCanvasSticker.value = true;

    return;

    this.loading.value = true;
    renderingLoading.value = true;

    this.debouncedUpdateJob();
  }

  // 是否应该更新贴纸
  shouldUpdateCanvasSticker = ref(true);

  // 主动触发更新贴纸
  async activeUpdateRenderingCanvas() {
    this.loading.value = true;
    renderingLoading.value = true;
    this.debouncedUpdateJob();
    // await this.updateRenderingCanvasJob()
  }

  debouncedUpdateJob = useDebounceFn(
    this.updateRenderingCanvasJob.bind(this),
    11,
  );

  // 渲染锁：防止并发渲染导致状态混乱
  _renderingLock = false;

  async updateRenderingCanvasJob() {
    if (this._renderingLock) {
      console.warn("[Canvas] 渲染进行中，跳过重复请求");
      return;
    }
    this._renderingLock = true;
    try {
      await this._doUpdateRenderingCanvas();
    } finally {
      this._renderingLock = false;
    }
  }

  async _doUpdateRenderingCanvas() {
    if (!this.el) {
      console.log("miss canvas el");
      this.loading.value = false;
      renderingLoading.value = false;
      return;
    }

    async function update() {
      console.time("updateRenderingCanvas");

      try {
        // 等待字体加载完成
        await this.waitForFontsLoaded();

        // 使用 html-to-image
        // 获取字体嵌入 CSS
        const fontEmbedCSS = await this.getCachedFontEmbedCSS();

        // 转换为 canvas（最多 30 秒）
        // imagePlaceholder: 图片加载失败时的占位符，避免整体渲染失败
        let _canvas = await Promise.race([
          toCanvas(this.el, {
            quality: 1,
            pixelRatio: 1,
            backgroundColor: null,
            fontEmbedCSS: fontEmbedCSS,
            imagePlaceholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjqU8L3RleHQ+PC9zdmc+',
            skipAutoScale: true,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('画布截图转换超时 (30s)')), 30_000),
          ),
        ]);
        console.log("html-to-image toCanvas");

        let width = Number(
          formatSizeOptionToPixelValue(
            canvasStickerOptionsOnlyChild.value.width,
          ),
        );
        let height = Number(
          formatSizeOptionToPixelValue(
            canvasStickerOptionsOnlyChild.value.height,
          ),
        );

        // OLD: 使用 imageData 方式 (已注释，保留用于回溯)
        // let _ctx = _canvas.getContext('2d')
        // const imageData = _ctx.getImageData(0, 0, width, height);
        // this.ctx.putImageData(imageData, 0, 0);

        this.clearCanvas();

        this.ctx.drawImage(
          _canvas,
          0,
          0,
          _canvas.width,
          _canvas.height,
          0,
          0,
          width,
          height,
        );

        this.loading.value = false;
        renderingLoading.value = false;

        this.shouldUpdateCanvasSticker.value = false;

        console.timeEnd("updateRenderingCanvas");
      } catch (e) {
        console.warn("画布渲染首次失败，尝试降级重试:", e.message);
        // 降级重试：跳过字体嵌入，使用占位图
        try {
          let _canvas = await toCanvas(this.el, {
            quality: 0.8,
            pixelRatio: 1,
            backgroundColor: null,
            skipFonts: true,
            imagePlaceholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjqU8L3RleHQ+PC9zdmc+',
            skipAutoScale: true,
          });
          let width = Number(formatSizeOptionToPixelValue(canvasStickerOptionsOnlyChild.value.width));
          let height = Number(formatSizeOptionToPixelValue(canvasStickerOptionsOnlyChild.value.height));
          this.clearCanvas();
          this.ctx.drawImage(_canvas, 0, 0, _canvas.width, _canvas.height, 0, 0, width, height);
          this.loading.value = false;
          renderingLoading.value = false;
          this.shouldUpdateCanvasSticker.value = false;
          console.warn("画布降级渲染成功");
        } catch (e2) {
          console.error("画布降级渲染也失败:", e2.message);
          this.loading.value = false;
          renderingLoading.value = false;
        }
      }
    }

    try {
      await update.call(this);
      console.warn("画布渲染成功");
    } catch (e) {
      console.error("画布渲染：存在丢失的元素");
      this.loading.value = false;
      renderingLoading.value = false;
    }
  }

  clearCanvas() {
    if (!this.canvasEl) {
      return;
    }
    this.canvasEl.width = this.canvasEl?.width;
  }

  // 画布元素是否在加载中
  pending = ref(false);

  getRender() {
    // 改为异步组件
    function render() {
      const childrenOptions = canvasStickerOptions.value.children;

      // 嵌入模式：只渲染 Master HTML 在画布顶层，其他元素渲染在离屏池中，并通过 DOM 重挂载挂载到 HTML 中
      const htmlChild = childrenOptions.find((c) => c.type === "html");
      const htmlRenderNode = htmlChild ? createCanvasChild(htmlChild) : null;

      const nonHtmlChildren = childrenOptions.filter(
        (c) => c.type !== "canvas" && c.type !== "html"
      );
      
      const offscreenRenderNodes = nonHtmlChildren.map((c) => {
        return (
          <div
            id={`s1-child-render-${c.id}`}
            key={c.id}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            {createCanvasChild(c)}
          </div>
        );
      });

      nextTick(() => {
        reparentCanvasChildren();
      });

      return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {/* 主画布：仅挂载 Master HTML */}
          <Canvas
            options={childrenOptions.find(
              (item) => item.type == "canvas",
            )}
          >
            {htmlRenderNode}
          </Canvas>

          {/* 离屏渲染池：挂载所有图表、词云等其他子元素 */}
          <div
            id="s1-offscreen-pool"
            style={{
              position: "absolute",
              top: "-9999px",
              left: "-9999px",
              width: "1000px",
              height: "1000px",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {offscreenRenderNodes}
          </div>
        </div>
      );
    }

    return render.bind(this);
  }
}

export function inferComponentTypeFromKey(key: string): string {
  let inferredType = "echart"; // default ECharts
  
  if (key.startsWith("threejs.") || key.startsWith("threeScene.")) {
    inferredType = "threeScene";
  } else if (key.startsWith("echart.")) {
    inferredType = "echart";
  } else if (key.startsWith("wordCloud.")) {
    inferredType = "wordCloud";
  } else if (key.startsWith("barcode.")) {
    inferredType = "barcode";
  } else if (key.startsWith("codeBlock.")) {
    inferredType = "codeBlock";
  } else if (key.startsWith("qrcode.")) {
    inferredType = "qrcode";
  } else if (key.startsWith("figlet.")) {
    inferredType = "figlet";
  } else if (key.startsWith("math.")) {
    inferredType = "math";
  } else if (key.startsWith("mermaid.")) {
    inferredType = "mermaid";
  } else if (key.startsWith("graphviz.")) {
    inferredType = "graphviz";
  } else if (key.startsWith("dagreGraph.")) {
    inferredType = "dagreGraph";
  } else if (key.startsWith("roughShape.")) {
    inferredType = "roughShape";
  } else if (key.startsWith("chartjs.")) {
    inferredType = "chartjs";
  } else if (key.startsWith("frappeChart.")) {
    inferredType = "frappeChart";
  } else if (key.startsWith("chartXkcd.")) {
    inferredType = "chartXkcd";
  } else if (key.startsWith("plotlyChart.")) {
    inferredType = "plotlyChart";
  } else if (key.startsWith("vegaLite.")) {
    inferredType = "vegaLite";
  } else if (key.startsWith("waveform.")) {
    inferredType = "waveform";
  } else if (key.startsWith("markmapChart.")) {
    inferredType = "markmapChart";
  } else if (key.startsWith("particlesEffect.")) {
    inferredType = "particlesEffect";
  } else if (key.startsWith("confetti.")) {
    inferredType = "confetti";
  } else if (key.startsWith("trianglify.")) {
    inferredType = "trianglify";
  } else if (key.startsWith("starChart.")) {
    inferredType = "starChart";
  } else if (key.startsWith("vexFlow.")) {
    inferredType = "vexFlow";
  } else if (key.startsWith("cytoscape.")) {
    inferredType = "cytoscape";
  } else if (key.startsWith("cytoscapeGraph.")) {
    inferredType = "cytoscapeGraph";
  } else if (key.startsWith("vueDataUi.")) {
    inferredType = "vueDataUi";
  } else if (key.startsWith("d3.")) {
    inferredType = "d3";
  } else if (key.startsWith("d3Cloud.")) {
    inferredType = "d3Cloud";
  } else if (key.startsWith("opentypeText.")) {
    inferredType = "opentypeText";
  } else if (key.startsWith("simplexNoise.")) {
    inferredType = "simplexNoise";
  } else if (key.startsWith("molecule.")) {
    inferredType = "molecule";
  } else if (key.startsWith("threeMol.")) {
    inferredType = "threeMol";
  } else if (key.startsWith("abcNotation.")) {
    inferredType = "abcNotation";
  } else if (key.startsWith("rawCanvas.")) {
    inferredType = "rawCanvas";
  }
  
  return inferredType;
}

function safeClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      // Fall through
    }
  }
  return JSON.parse(JSON.stringify(value));
}

/** Map simple AI binding properties to the actual nested paths components expect */
function remapBindingForComponentType(componentType: string, binding: Record<string, any>): Record<string, any> {
  // 使用统一的配置架构进行重映射
  return remapBindingBySchema(componentType, binding);
}

export function autoCreateAndBindNewFields(fields: any[], target: any) {
  if (!target) return;
  if (!target.htmlBindings) {
    target.htmlBindings = {};
  }
  const bindings = target.htmlBindings;

  fields.forEach((field) => {
    if (field.type === "child") {
      const existingBinding = getValueByPath(bindings, field.key);
      if (!existingBinding || !existingBinding.id) {
        const inferredType = inferComponentTypeFromKey(field.key);
        const newId = "_" + String(new Date().getTime()) + Math.random().toString(36).substring(2, 6);
        const defaultOptionsCreator = canvasChildDefaultOptionsMap[inferredType];
        // 1. 先创建默认嵌套结构
        const defaultOpts = defaultOptionsCreator ? defaultOptionsCreator.call(null) : {};
        const newOptions = { ...defaultOpts, id: newId, type: inferredType, undeletable: true };
        // 2. 将 binding 重映射到嵌套路径后写入
        if (existingBinding && typeof existingBinding === "object") {
          const remapped = remapBindingForComponentType(inferredType, existingBinding);
          Object.keys(remapped).forEach((key) => {
            if (key !== "id" && key !== "type" && key !== "undeletable") {
              setValueByPath(newOptions, key, remapped[key]);
            }
          });
        }
        if (canvasStickerOptions.value && Array.isArray(canvasStickerOptions.value.children)) {
          canvasStickerOptions.value.children.push(newOptions);
        }
        setValueByPath(bindings, field.key, {
          ...(existingBinding && typeof existingBinding === "object" ? existingBinding : {}),
          id: newId,
        });
      } else {
        // Synchronize updated properties from binding to existing canvas child
        const childComponent = canvasStickerOptions.value.children.find((c: any) => c.id === existingBinding.id);
        if (childComponent) {
          const componentType = childComponent.type || inferComponentTypeFromKey(field.key);
          const remappedBinding = remapBindingForComponentType(componentType, existingBinding);
          Object.keys(remappedBinding).forEach((propKey) => {
            if (propKey !== "id" && propKey !== "type" && propKey !== "undeletable") {
              const currentVal = getValueByPath(childComponent, propKey);
              const newVal = remappedBinding[propKey];
              if (JSON.stringify(currentVal) !== JSON.stringify(newVal)) {
                setValueByPath(childComponent, propKey, safeClone(newVal));
              }
            }
          });
        }
      }
    } else if (field.type === "html") {
      const existingBinding = getValueByPath(bindings, field.key);
      if (!existingBinding || !existingBinding.id) {
        const newId = "_" + String(new Date().getTime()) + Math.random().toString(36).substring(2, 6);
        const defaultOptionsCreator = canvasChildDefaultOptionsMap["html"];
        const defaultOpts = defaultOptionsCreator ? defaultOptionsCreator.call(null) : {};
        const newOptions = { ...defaultOpts, id: newId, type: "html", undeletable: true };
        if (existingBinding && typeof existingBinding === "object") {
          Object.keys(existingBinding).forEach((key) => {
            if (key !== "id" && key !== "type" && key !== "undeletable") {
              setValueByPath(newOptions, key, existingBinding[key]);
            }
          });
        }
        
        if (canvasStickerOptions.value && Array.isArray(canvasStickerOptions.value.children)) {
          canvasStickerOptions.value.children.push(newOptions);
        }
        setValueByPath(bindings, field.key, {
          ...(existingBinding && typeof existingBinding === "object" ? existingBinding : {}),
          id: newId,
        });
      } else {
        // Synchronize updated properties from binding to existing HTML canvas child
        const childComponent = canvasStickerOptions.value.children.find((c: any) => c.id === existingBinding.id);
        if (childComponent) {
          Object.keys(existingBinding).forEach((propKey) => {
            if (propKey !== "id" && propKey !== "type" && propKey !== "undeletable") {
              const currentVal = getValueByPath(childComponent, propKey);
              const newVal = existingBinding[propKey];
              if (JSON.stringify(currentVal) !== JSON.stringify(newVal)) {
                setValueByPath(childComponent, propKey, safeClone(newVal));
              }
            }
          });
        }
      }
    }
  });
  
  // 确保 Vue 响应式更新
  target.htmlBindings = { ...bindings };
  // 强制更新 canvasStickerOptions 的引用，确保深层变化被 Vue 检测到
  if (canvasStickerOptions.value && Array.isArray(canvasStickerOptions.value.children)) {
    canvasStickerOptions.value.children = [...canvasStickerOptions.value.children];
  }
  
  // 等待下一个 tick 后重新挂载和渲染，确保新组件正确显示
  nextTick(() => {
    reparentCanvasChildren();
    updateRenderingCanvas();
  });
}

export function deleteValueByPath(target: any, path: string) {
  const segments = path.split(".").filter(Boolean);
  if (!segments.length) return;
  
  let cursor = target;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (!cursor[segment] || typeof cursor[segment] !== "object") {
      return;
    }
    cursor = cursor[segment];
  }
  
  const lastSegment = segments[segments.length - 1];
  if (cursor && typeof cursor === "object") {
    delete cursor[lastSegment];
  }
}

export function cleanUpUnusedBindings(fields: any[], target: any) {
  if (!target) return;
  const bindings = target.htmlBindings || {};
  
  const activeKeys = new Set(fields.map(f => f.key));
  const activeBoundIds = new Set<string>();
  
  fields.forEach(field => {
    const bound = getValueByPath(bindings, field.key);
    if (bound && bound.id) {
      activeBoundIds.add(bound.id);
    }
  });
  
  const allPaths: string[] = [];
  function collectPaths(obj: any, currentPath = "") {
    if (!obj || typeof obj !== "object") return;
    if (obj.id && typeof obj.id === "string") {
      allPaths.push(currentPath);
      return;
    }
    Object.keys(obj).forEach(key => {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      collectPaths(obj[key], nextPath);
    });
  }
  collectPaths(bindings);
  
  allPaths.forEach(path => {
    if (!activeKeys.has(path)) {
      deleteValueByPath(bindings, path);
    }
  });
  
  if (canvasStickerOptions.value && Array.isArray(canvasStickerOptions.value.children)) {
    const nextChildren = canvasStickerOptions.value.children.filter((c: any) => {
      if (c.type === "canvas" || c.id === "this_is_canvas_id") {
        return true;
      }
      if (c.id === "this_is_html_id") {
        return true;
      }
      if (c.undeletable && !activeBoundIds.has(c.id) && c.id !== target.id) {
        return false;
      }
      return true;
    });
    if (nextChildren.length !== canvasStickerOptions.value.children.length) {
      canvasStickerOptions.value.children = nextChildren;
    }
  }
}

// ─── Magic variable auto-bind watcher ───────────────────────────────────────
// Watches HTML children for {{xxx.yyy}} magic variables and auto-creates/binds
// corresponding canvas child components. Guarded against re-entrant triggers
// caused by useLocalStorage ↔ canvasStickerOptions reactive cycle.

const prevHtmlContentMap = new Map<string, string>();
let htmlBindingsGuard = false;
let htmlBindingsTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => {
    if (!canvasStickerOptions.value || !Array.isArray(canvasStickerOptions.value.children)) {
      return "";
    }
    return canvasStickerOptions.value.children
      .filter((c: any) => c && c.type === "html")
      .map((c: any) => `${c.id}::${String(c.htmlContent ?? "")}`)
      .join("||");
  },
  () => {
    // Guard: skip if we're already syncing or within the cooldown window
    if (htmlBindingsGuard) return;

    // Debounce: cancel any pending sync and schedule a new one
    // This breaks the reactive chain with useLocalStorage
    if (htmlBindingsTimer) {
      clearTimeout(htmlBindingsTimer);
    }

    htmlBindingsTimer = setTimeout(() => {
      htmlBindingsTimer = null;
      if (!canvasStickerOptions.value || !Array.isArray(canvasStickerOptions.value.children)) return;

      const htmlChildren = canvasStickerOptions.value.children.filter(
        (c: any) => c && c.type === "html"
      );

      // Only process children whose htmlContent actually changed
      const changedChildren = htmlChildren.filter((child: any) => {
        const current = String(child.htmlContent ?? "");
        const prev = prevHtmlContentMap.get(child.id);
        return prev !== current;
      });

      // Update the map for next comparison
      htmlChildren.forEach((child: any) => {
        prevHtmlContentMap.set(child.id, String(child.htmlContent ?? ""));
      });

      if (!changedChildren.length) return;

      htmlBindingsGuard = true;
      try {
        changedChildren.forEach((child: any) => {
          const nextHtmlContent = String(child.htmlContent ?? "");
          const inferredFields = syncHtmlTemplateFieldsFromContent(child, nextHtmlContent);
          autoCreateAndBindNewFields(inferredFields, child);
          cleanUpUnusedBindings(inferredFields, child);
        });
      } finally {
        // Keep guard active through the next tick so useLocalStorage effects
        // that fire after our callback don't re-trigger the watch
        nextTick(() => {
          htmlBindingsGuard = false;
        });
      }
    }, 0);
  },
  { immediate: true }
);
