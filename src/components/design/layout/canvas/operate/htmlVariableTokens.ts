import { inferHtmlTemplateFieldsFromContent } from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";
import type { HtmlTemplateFieldDefinition } from "@/components/design/layout/canvas/htmlTemplate/types";
import { canvasChildLabelMap, inferComponentTypeFromKey } from "../index.tsx";

export interface HtmlVariableToken {
  token: string;
  description: string;
  type: string;
}

export interface HtmlVariableGroup {
  key: string;
  label: string;
  type: string;
  tokens: HtmlVariableToken[];
}

export function getHtmlVariableBadgeType(type: string) {
  switch (type) {
    case "text":
    case "textarea":
      return "info";
    case "color":
      return "success";
    case "image":
      return "warning";
    case "font":
      return "primary";
    case "child":
      return "danger";
    case "html":
      return "warning";
    default:
      return "info";
  }
}

export const systemGroupedVariables = [
  {
    label: "画布尺寸",
    type: "canvas",
    tokens: [
      { token: "{{canvas.width}}", description: "画布宽度数值", type: "canvas" },
      { token: "{{canvas.height}}", description: "画布高度数值", type: "canvas" },
      { token: "{{canvas.widthUnit}}", description: "画布宽度单位", type: "canvas" },
      { token: "{{canvas.heightUnit}}", description: "画布高度单位", type: "canvas" },
      { token: "{{canvas.widthCss}}", description: "画布宽度 CSS 值", type: "canvas" },
      { token: "{{canvas.heightCss}}", description: "画布高度 CSS 值", type: "canvas" },
    ],
  },
  {
    label: "当前元素",
    type: "element",
    tokens: [
      { token: "{{element.id}}", description: "当前元素 id", type: "element" },
      { token: "{{element.zIndex}}", description: "当前元素层级", type: "element" },
    ],
  },
];

export const componentReferenceItems = [
  {
    category: "数据图表",
    items: [
      { name: "ECharts 图表", token: "{{echart.myChart}}" },
      { name: "Chart.js 图表", token: "{{chartjs.myChart}}" },
      { name: "Plotly 科学图表", token: "{{plotlyChart.myChart}}" },
      { name: "Frappe 极简图表", token: "{{frappeChart.myChart}}" },
      { name: "xkcd 手绘图表", token: "{{chartXkcd.myChart}}" },
      { name: "Data UI 图表", token: "{{vueDataUi.myReport}}" },
      { name: "Vega-Lite 规范", token: "{{vegaLite.myChart}}" },
    ],
  },
  {
    category: "3D与图形",
    items: [
      { name: "Three.js 3D场景", token: "{{threejs.myScene}}" },
      { name: "Cytoscape 关系图", token: "{{cytoscape.myGraph}}" },
      { name: "Dagre 拓扑图", token: "{{dagreGraph.myGraph}}" },
      { name: "D3 自定义绘图", token: "{{d3.myChart}}" },
      { name: "Rough 手绘图形", token: "{{roughShape.myShape}}" },
      { name: "程序画布 Canvas", token: "{{rawCanvas.myCanvas}}" },
    ],
  },
  {
    category: "文字与编码",
    items: [
      { name: "二维码", token: "{{qrcode.myCode}}" },
      { name: "条形码", token: "{{barcode.myCode}}" },
      { name: "Figlet 艺术字", token: "{{figlet.artText}}" },
      { name: "OpenType 路径字", token: "{{opentypeText.brandTitle}}" },
      { name: "Shiki 代码高亮", token: "{{codeBlock.myCode}}" },
      { name: "D3 词云图", token: "{{wordCloud.myCloud}}" },
    ],
  },
  {
    category: "科学与文档",
    items: [
      { name: "KaTeX 数学公式", token: "{{math.formula}}" },
      { name: "Mermaid 流程图", token: "{{mermaid.flowchart}}" },
      { name: "Graphviz DOT网络", token: "{{graphviz.dotGraph}}" },
      { name: "RDKit 2D分子式", token: "{{molecule.mol2d}}" },
      { name: "3Dmol 3D分子结构", token: "{{threeMol.mol3d}}" },
      { name: "Markmap 思维导图", token: "{{markmapChart.mindmap}}" },
    ],
  },
  {
    category: "乐谱",
    items: [
      { name: "ABC 简易乐谱", token: "{{abcNotation.score}}" },
      { name: "VexFlow 五线谱", token: "{{vexFlow.musicSheet}}" },
    ],
  },
  {
    category: "特效与背景",
    items: [
      { name: "Particles 粒子特效", token: "{{particlesEffect.particles}}" },
      { name: "Confetti 撒花效果", token: "{{confetti.effect}}" },
      { name: "Trianglify 三角背景", token: "{{trianglify.pattern}}" },
      { name: "Astronomy 星座图", token: "{{starChart.starMap}}" },
      { name: "Waveform 音频波形", token: "{{waveform.audioWave}}" },
      { name: "Simplex 噪声纹理", token: "{{simplexNoise.noiseBg}}" },
    ],
  },
];

/** 根据 HTML 内容推导当前模板变量分组（含可插入 token） */
export function buildTemplateVariableItems(content: string, target: any): HtmlVariableGroup[] {
  const fields = inferHtmlTemplateFieldsFromContent(content, target?.htmlTemplateFields || []);

  return fields.map((field: HtmlTemplateFieldDefinition) => {
    let label = field.label || field.key;
    if (field.type === "child") {
      const componentType = inferComponentTypeFromKey(field.key);
      const componentLabel = canvasChildLabelMap[componentType] || componentType;
      const varName = field.key.includes(".") ? field.key.split(".").pop() : field.key;
      label = `${componentLabel} (${varName})`;
    } else if (field.type === "html") {
      const varName = field.key.includes(".") ? field.key.split(".").pop() : field.key;
      label = `子模板 (${varName})`;
    }

    return {
      key: field.key,
      label,
      type: field.type,
      tokens: createMagicVariableItemsForField(field),
    };
  });
}

function createMagicVariableItemsForField(field: HtmlTemplateFieldDefinition): HtmlVariableToken[] {
  switch (field.type) {
    case "color":
      return [
        { token: `{{${field.key}}}`, description: `${field.label}，直接输出颜色值`, type: field.type },
        { token: `{{${field.key}.css}}`, description: `${field.label}，颜色 CSS 别名`, type: field.type },
      ];
    case "image":
      return [
        { token: `{{${field.key}.url}}`, description: `${field.label}，图片地址`, type: field.type },
        { token: `{{${field.key}.src}}`, description: `${field.label}，图片地址别名`, type: field.type },
        { token: `{{${field.key}.name}}`, description: `${field.label}，图片名称`, type: field.type },
      ];
    case "font":
      return [
        { token: `{{${field.key}.family}}`, description: `${field.label}，渲染后的字体 family`, type: field.type },
        { token: `{{${field.key}.name}}`, description: `${field.label}，字体名称`, type: field.type },
      ];
    case "child": {
      const hasPrefix = field.key.includes(".");
      return [
        {
          token: hasPrefix ? `{{${field.key}}}` : `{{child.${field.key}}}`,
          description: `${field.label}，嵌入组件插槽（如 ECharts、Sticker 等）`,
          type: field.type,
        },
      ];
    }
    case "html": {
      const hasPrefix = field.key.includes(".");
      return [
        {
          token: hasPrefix ? `{{${field.key}}}` : `{{html.${field.key}}}`,
          description: `${field.label}，递归嵌套的 HTML 代码片段`,
          type: field.type,
        },
      ];
    }
    case "textarea":
    case "text":
    default:
      return [{ token: `{{${field.key}}}`, description: `${field.label}，文本变量`, type: field.type }];
  }
}
