import { registerOperation } from "../registry";
import {
  inferHtmlTemplateFieldsFromContent,
  normalizeHtmlTemplateBindings,
} from "@/components/design/layout/canvas/htmlTemplate/runtime";
import { resolveCanvasTypographyFromContext } from "../canvas-typography";

export function isHtmlArtworkType(type: string) {
  return type === "html";
}

export interface HtmlTypographyContext {
  baseFontSize: number;
  minimumRelativeFontSize: number;
}

export function getCanvasTypographyContext(ctx: any): HtmlTypographyContext {
  const typography = resolveCanvasTypographyFromContext(ctx);
  return {
    baseFontSize: typography.baseFontSize,
    minimumRelativeFontSize: Number.parseFloat(typography.typeScale.micro) || 1,
  };
}

function formatRelativeEm(value: number): string {
  return `${Number(value.toFixed(3))}em`;
}

function normalizeFontSizeValue(value: string, typography: HtmlTypographyContext) {
  let normalized = value;
  normalized = normalized.replace(
    /(-?\d*\.?\d+)px\b/gi,
    (_match, size) => formatRelativeEm(Number(size) / typography.baseFontSize),
  );
  normalized = normalized.replace(
    /(-?\d*\.?\d+)pt\b/gi,
    (_match, size) =>
      formatRelativeEm((Number(size) * (96 / 72)) / typography.baseFontSize),
  );
  normalized = normalized.replace(/(-?\d*\.?\d+)rem\b/gi, "$1em");
  normalized = normalized.replace(
    /(-?\d*\.?\d+)vw\b/gi,
    (_match, size) => `calc(var(--canvas-html-vw) * ${Number(size)})`,
  );
  normalized = normalized.replace(
    /(-?\d*\.?\d+)vh\b/gi,
    (_match, size) => `calc(var(--canvas-html-vh) * ${Number(size)})`,
  );
  normalized = normalized.replace(/(-?\d*\.?\d+)em\b/gi, (_match, size) =>
    formatRelativeEm(Math.max(Number(size), typography.minimumRelativeFontSize)),
  );
  return normalized;
}

export function normalizeHtmlTypography(
  htmlContent: string,
  typography: HtmlTypographyContext,
) {
  let convertedDeclarations = 0;
  const normalizeDeclaration = (
    _match: string,
    prefix: string,
    value: string,
  ) => {
    const normalizedValue = normalizeFontSizeValue(value, typography);
    if (normalizedValue !== value) convertedDeclarations += 1;
    return `${prefix}${normalizedValue}`;
  };

  let normalizedHtml = String(htmlContent || "").replace(
    /--type-(?:hero|title|primary(?:-text)?|subtitle|body|caption|micro)\s*:[^;}]+;?/gi,
    "",
  );
  normalizedHtml = normalizedHtml.replace(
    /(font-size\s*:\s*)([^;}"']+)/gi,
    normalizeDeclaration,
  );
  normalizedHtml = normalizedHtml.replace(
    /(--(?:type|font-size|fs)-[\w-]+\s*:\s*)([^;}"']+)/gi,
    normalizeDeclaration,
  );
  normalizedHtml = normalizedHtml.replace(
    /(\bfont\s*:\s*)([^;}"']+)/gi,
    normalizeDeclaration,
  );

  return { htmlContent: normalizedHtml, convertedDeclarations };
}

function getHtmlContentLength(child: any) {
  return String(child?.htmlContent || "").trim().length;
}

export function parseMaybeJsonObject(value: any) {
  if (!value) return undefined;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function hasFontBindings(bindings: any) {
  return hasResourceBindings(bindings, "font");
}

function hasResourceBindings(bindings: any, group: "font" | "image") {
  return Boolean(
    bindings &&
      typeof bindings === "object" &&
      bindings[group] &&
      typeof bindings[group] === "object" &&
      Object.keys(bindings[group]).length > 0,
  );
}

function getFontBindingKeys(bindings: any) {
  return getResourceBindingKeys(bindings, "font");
}

function getResourceBindingKeys(bindings: any, group: "font" | "image") {
  if (!hasResourceBindings(bindings, group)) return [];
  return Object.keys(bindings[group]).filter((key) => {
    const value = bindings[group][key];
    return value && typeof value === "object" && value.id && value.url;
  });
}

function ensureHtmlReferencesBoundFonts(htmlContent: string, bindings: any) {
  const html = String(htmlContent || "");
  const fontKeys = getFontBindingKeys(bindings);
  if (!html || fontKeys.length === 0 || html.includes("{{font.")) {
    return html;
  }

  const fontStack = `${fontKeys
    .map((key) => `{{font.${key}.family}}`)
    .join(", ")}, serif`;
  const fontFamilyDeclaration = `font-family:${fontStack}`;

  if (/font-family\s*:/i.test(html)) {
    return html.replace(/font-family\s*:[^;]+;?/i, `${fontFamilyDeclaration};`);
  }

  return html.replace(
    /style=(["'])(.*?)\1/i,
    (_match, quote, styleValue) =>
      `style=${quote}${fontFamilyDeclaration};${styleValue}${quote}`,
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceDirectImageUrlsWithBindings(htmlContent: string, bindings: any) {
  let html = String(htmlContent || "");
  const imageKeys = getResourceBindingKeys(bindings, "image");
  for (const key of imageKeys) {
    const url = bindings.image?.[key]?.url;
    if (!url) continue;
    html = html.replace(new RegExp(escapeRegExp(url), "g"), `{{image.${key}.url}}`);
  }
  return html;
}

function findDirectExternalResourceUrls(htmlContent: string) {
  const html = String(htmlContent || "");
  const urls = new Set<string>();
  const patterns = [
    /\b(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/gi,
    /url\(\s*["']?(https?:\/\/[^)"']+)["']?\s*\)/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      if (match[1]) urls.add(match[1]);
    }
  }

  return Array.from(urls);
}

export function getDirectExternalResourceError(options: Record<string, any>) {
  const directUrls = findDirectExternalResourceUrls(options.htmlContent || "");
  if (directUrls.length === 0) return "";
  return [
    "HTML 中检测到直接写入的外部资源 URL。图片、字体等外部资源必须通过 htmlBindings 绑定，不能直接写在 htmlContent 里。",
    "请把图片改为 {{image.xxx.url}}，把字体改为 {{font.xxx.family}}，并在 htmlBindings 中提供对应的 id/url/name，方便用户在 UI 中查看和二次替换。",
    `检测到的 URL: ${directUrls.slice(0, 3).join(", ")}`,
  ].join("\n");
}

export function prepareHtmlArtworkOptions(
  options: Record<string, any>,
  existingChild?: any,
  typography?: HtmlTypographyContext,
) {
  const prepared = { ...options };
  const parsedBindings = parseMaybeJsonObject(prepared.htmlBindings);
  const parsedFields = parseMaybeJsonObject(prepared.htmlTemplateFields);
  const parsedDefaultBindings = parseMaybeJsonObject(
    prepared.htmlTemplateDefaultBindings,
  );
  const parsedMeta = parseMaybeJsonObject(prepared.htmlTemplateMeta);

  if (parsedBindings !== undefined) prepared.htmlBindings = parsedBindings;
  if (parsedFields !== undefined) prepared.htmlTemplateFields = parsedFields;
  if (parsedDefaultBindings !== undefined) {
    prepared.htmlTemplateDefaultBindings = parsedDefaultBindings;
  }
  if (parsedMeta !== undefined) prepared.htmlTemplateMeta = parsedMeta;

  if (prepared.htmlContent && typography) {
    prepared.htmlContent = normalizeHtmlTypography(
      prepared.htmlContent,
      typography,
    ).htmlContent;
  }

  if (!hasFontBindings(prepared.htmlBindings) && hasFontBindings(existingChild?.htmlBindings)) {
    prepared.htmlBindings = existingChild.htmlBindings;
  }
  if (
    !hasResourceBindings(prepared.htmlBindings, "image") &&
    hasResourceBindings(existingChild?.htmlBindings, "image")
  ) {
    prepared.htmlBindings = {
      ...(existingChild.htmlBindings || {}),
      ...(prepared.htmlBindings || {}),
      image: existingChild.htmlBindings.image,
    };
  }

  if (prepared.htmlContent && hasFontBindings(prepared.htmlBindings)) {
    prepared.htmlContent = ensureHtmlReferencesBoundFonts(
      prepared.htmlContent,
      prepared.htmlBindings,
    );
  }
  if (prepared.htmlContent && hasResourceBindings(prepared.htmlBindings, "image")) {
    prepared.htmlContent = replaceDirectImageUrlsWithBindings(
      prepared.htmlContent,
      prepared.htmlBindings,
    );
  }

  const existingFields = Array.isArray(prepared.htmlTemplateFields)
    ? prepared.htmlTemplateFields
    : Array.isArray(existingChild?.htmlTemplateFields)
      ? existingChild.htmlTemplateFields
      : [];
  const inferredFields = inferHtmlTemplateFieldsFromContent(
    prepared.htmlContent || existingChild?.htmlContent || "",
    existingFields,
  );

  if (inferredFields.length > 0) {
    prepared.htmlTemplateFields = inferredFields;
    prepared.htmlBindings = normalizeHtmlTemplateBindings(
      inferredFields,
      prepared.htmlBindings || existingChild?.htmlBindings || {},
    );
    prepared.htmlTemplateDefaultBindings = normalizeHtmlTemplateBindings(
      inferredFields,
      prepared.htmlTemplateDefaultBindings ||
        existingChild?.htmlTemplateDefaultBindings ||
        prepared.htmlBindings ||
        {},
    );
  }

  return prepared;
}

export function updateExistingHtmlArtwork(ctx: any, options: Record<string, any>) {
  const htmlChildren = ctx
    .getCanvasChildren()
    .filter((child: any) => child.type === "html");

  if (htmlChildren.length === 0) return null;

  const target = htmlChildren[htmlChildren.length - 1];
  const preparedOptions = prepareHtmlArtworkOptions(
    options,
    target,
    getCanvasTypographyContext(ctx),
  );
  const directExternalResourceError = getDirectExternalResourceError(preparedOptions);
  if (directExternalResourceError) {
    return {
      id: target.id,
      rejected: true,
      message: directExternalResourceError,
    };
  }
  const currentLength = getHtmlContentLength(target);
  const nextLength = String(preparedOptions.htmlContent || "").trim().length;
  if (currentLength > 1200 && nextLength > 0 && nextLength < currentLength * 0.65) {
    return {
      id: target.id,
      rejected: true,
      message:
        "检测到已有完整 HTML 作品，本次 htmlContent 明显更短，像是局部片段。请重新提交一份包含背景、装饰、文字、印章等全部内容的完整 htmlContent。",
    };
  }

  for (const child of htmlChildren) {
    if (child.id !== target.id) {
      ctx.removeCanvasChild(child.id);
    }
  }

  for (const [key, value] of Object.entries(preparedOptions)) {
    ctx.setChildProperty(target.id, key, value);
  }
  ctx.setChildProperty(target.id, "zIndex", 0);
  ctx.selectChild(target.id);
  return { id: target.id, rejected: false };
}

registerOperation({
  id: "canvas.addChild",
  name: "添加元素",
  description:
    "向画布添加专业组件（图表、3D、流程图等）。【核心规则】所有基础设计（文字、图片、背景、形状）必须使用 canvas.addHtml 创建 HTML/CSS 实现，禁止使用此工具添加 text、image、rect、ellipse、background 类型！",
  group: "画布",
  params: [
    {
      name: "type",
      label: "元素类型",
      type: "select",
      required: true,
      options: [
        { label: "HTML 模板 (推荐)", value: "html" },
        { label: "图表 (ECharts)", value: "echart" },
        { label: "3D模型 (Three.js)", value: "threeScene" },
        { label: "数学公式 (KaTeX)", value: "math" },
        { label: "流程图 (Mermaid)", value: "mermaid" },
        { label: "代码块 (Shiki)", value: "codeBlock" },
        { label: "分子结构 (RDKit.js)", value: "molecule" },
        { label: "3D分子 (3Dmol.js)", value: "threeMol" },
        { label: "ASCII艺术字 (figlet)", value: "figlet" },
        { label: "噪声纹理 (Simplex Noise)", value: "simplexNoise" },
        { label: "字体转路径 (OpenType)", value: "opentypeText" },
        { label: "手绘图形 (Rough.js)", value: "roughShape" },
        { label: "图描述 (Graphviz)", value: "graphviz" },
        { label: "网络图 (Cytoscape)", value: "cytoscapeGraph" },
        { label: "图表 (Chart.js)", value: "chartjs" },
        { label: "简洁图表 (Frappe Charts)", value: "frappeChart" },
        { label: "有向图布局 (dagre)", value: "dagreGraph" },
        { label: "星图 (Astronomy)", value: "starChart" },
        { label: "手绘图表 (chart.xkcd)", value: "chartXkcd" },
        { label: "科学图表 (Plotly)", value: "plotlyChart" },
        { label: "音频波形 (Wavesurfer)", value: "waveform" },
        { label: "交互图表 (ApexCharts)", value: "apexChart" },
        { label: "图表语法 (Vega-Lite)", value: "vegaLite" },
        { label: "思维导图 (Markmap)", value: "markmapChart" },
        { label: "粒子效果 (Particles.js)", value: "particlesEffect" },
        { label: "桑基图 (D3-Sankey)", value: "d3Sankey" },
        { label: "词云 (D3-Cloud)", value: "d3Cloud" },
        { label: "撒花效果 (canvas-confetti)", value: "confetti" },
        { label: "三角纹理 (Trianglify)", value: "trianglify" },
        { label: "二维码", value: "qrcode" },
        { label: "条形码", value: "barcode" },
        { label: "乐谱 (abcjs)", value: "abcNotation" },
        { label: "五线谱 (VexFlow)", value: "vexFlow" },
        { label: "关系图 (Cytoscape.js)", value: "cytoscape" },
        { label: "数据图表 (vue-data-ui)", value: "vueDataUi" },
        { label: "自定义图表 (D3.js)", value: "d3" },
        // 基础元素 - 不推荐 AI 使用，优先用 HTML
        { label: "文字 (不推荐，用HTML)", value: "text" },
        { label: "背景 (不推荐，用HTML)", value: "background" },
        { label: "图片 (不推荐，用HTML)", value: "image" },
        { label: "矩形 (不推荐，用HTML)", value: "rect" },
        { label: "椭圆 (不推荐，用HTML)", value: "ellipse" },
      ],
      description:
        "要添加的元素类型。对于文字、矩形、背景、图片等基础元素，优先使用 HTML 类型。",
    },
    {
      name: "textContent",
      label: "文字内容",
      type: "string",
      placeholder: "输入文字内容",
      description: "仅文字类型有效",
    },
    {
      name: "fontColor",
      label: "文字颜色",
      type: "color",
      default: "#ffffff",
      description: "仅文字类型有效",
    },
    {
      name: "fontSize",
      label: "字号",
      type: "number",
      default: 160,
      min: 1,
      max: 2000,
      description: "仅文字类型有效",
    },
    {
      name: "backgroundColor",
      label: "背景颜色",
      type: "color",
      default: "#000000",
      description: "仅背景类型有效",
    },
    {
      name: "formula",
      label: "公式内容",
      type: "string",
      placeholder: String.raw`\frac{a}{b}=c 或 \ce{2H2 + O2 -> 2H2O}`,
      description:
        "仅数学公式类型有效，LaTeX/mhchem 公式字符串，化学式和反应式可用 \\ce{...}",
    },
    {
      name: "displayMode",
      label: "块级显示",
      type: "boolean",
      default: true,
      description: "仅数学公式类型有效",
    },
    {
      name: "throwOnError",
      label: "严格报错",
      type: "boolean",
      default: false,
      description: "仅数学公式类型有效",
    },
    {
      name: "mathFontColor",
      label: "公式颜色",
      type: "color",
      default: "#111111",
      description: "仅数学公式类型有效",
    },
    {
      name: "mathFontSize",
      label: "公式大小",
      type: "number",
      default: 180,
      min: 1,
      max: 10000,
      description: "仅数学公式类型有效，单位 px",
    },
    {
      name: "mermaidSource",
      label: "Mermaid 源码",
      type: "string",
      placeholder: "flowchart TD\\n  A[开始] --> B[完成]",
      description: "仅 Mermaid 类型有效，Mermaid DSL 源码",
    },
    {
      name: "mermaidTheme",
      label: "Mermaid 主题",
      type: "select",
      default: "default",
      options: [
        { label: "Default", value: "default" },
        { label: "Base", value: "base" },
        { label: "Dark", value: "dark" },
        { label: "Forest", value: "forest" },
        { label: "Neutral", value: "neutral" },
      ],
      description: "仅 Mermaid 类型有效",
    },
    {
      name: "codeBlockSource",
      label: "代码内容",
      type: "string",
      placeholder: "const message = 'Hello Shiki'",
      description: "仅代码块类型有效",
    },
    {
      name: "codeBlockLanguage",
      label: "代码语言",
      type: "string",
      default: "ts",
      description: "仅代码块类型有效，例如 ts、js、vue、python、go、rust",
    },
    {
      name: "codeBlockTheme",
      label: "代码主题",
      type: "string",
      default: "github-dark",
      description:
        "仅代码块类型有效，例如 github-dark、github-light、vitesse-dark、nord、dracula",
    },
    {
      name: "moleculeSource",
      label: "分子源码",
      type: "string",
      placeholder: "c1ccccc1",
      description: "仅分子结构类型有效，SMILES 或 MolBlock 字符串",
    },
    {
      name: "moleculeInputType",
      label: "输入类型",
      type: "select",
      default: "smiles",
      options: [
        { label: "SMILES", value: "smiles" },
        { label: "MolBlock", value: "molblock" },
      ],
      description: "仅分子结构类型有效",
    },
    {
      name: "threeMolData",
      label: "3D分子数据",
      type: "string",
      placeholder: "PDB/SDF/XYZ 数据",
      description: "仅3D分子类型有效",
    },
    {
      name: "threeMolFormat",
      label: "数据格式",
      type: "select",
      default: "pdb",
      options: [
        { label: "PDB", value: "pdb" },
        { label: "SDF", value: "sdf" },
        { label: "XYZ", value: "xyz" },
        { label: "MOL2", value: "mol2" },
      ],
      description: "仅3D分子类型有效",
    },
    {
      name: "threeMolPdbId",
      label: "PDB ID",
      type: "string",
      placeholder: "例如 1BNA",
      description: "仅3D分子类型有效，设置后自动下载",
    },
    {
      name: "threeMolStyle",
      label: "渲染样式",
      type: "select",
      default: "stick",
      options: [
        { label: "棍棒", value: "stick" },
        { label: "球体", value: "sphere" },
        { label: "卡通", value: "cartoon" },
        { label: "线条", value: "line" },
        { label: "十字", value: "cross" },
      ],
      description: "仅3D分子类型有效",
    },
    {
      name: "threeMolAiPrompt",
      label: "AI 生成描述",
      type: "string",
      placeholder: "描述分子，例如：血红蛋白、DNA 双螺旋",
      description: "仅3D分子类型有效，通过 AI 自动生成 PDB 数据",
    },
    {
      name: "figletText",
      label: "文字",
      type: "string",
      placeholder: "Hello",
      description: "仅ASCII艺术字类型有效",
    },
    {
      name: "figletFont",
      label: "字体",
      type: "select",
      default: "Standard",
      options: [
        { label: "Standard", value: "Standard" },
        { label: "Ghost", value: "Ghost" },
        { label: "Big", value: "Big" },
        { label: "Banner", value: "Banner" },
        { label: "Slant", value: "Slant" },
      ],
      description: "仅ASCII艺术字类型有效",
    },
    {
      name: "simplexNoiseScale",
      label: "缩放",
      type: "number",
      default: 50,
      description: "仅噪声纹理类型有效",
    },
    {
      name: "simplexNoiseOctaves",
      label: "八度",
      type: "number",
      default: 4,
      description: "仅噪声纹理类型有效",
    },
    {
      name: "simplexNoiseColor1",
      label: "颜色1",
      type: "color",
      default: "#000000",
      description: "仅噪声纹理类型有效",
    },
    {
      name: "simplexNoiseColor2",
      label: "颜色2",
      type: "color",
      default: "#ffffff",
      description: "仅噪声纹理类型有效",
    },
    {
      name: "opentypeTextContent",
      label: "文字",
      type: "string",
      placeholder: "Hello",
      description: "仅字体转路径类型有效",
    },
    {
      name: "opentypeFontUrl",
      label: "字体URL",
      type: "string",
      placeholder: "https://example.com/font.ttf",
      description: "仅字体转路径类型有效",
    },
    {
      name: "roughShape",
      label: "形状",
      type: "select",
      default: "rect",
      options: [
        { label: "矩形", value: "rect" },
        { label: "圆形", value: "circle" },
        { label: "线条", value: "line" },
        { label: "椭圆", value: "ellipse" },
      ],
      description: "仅手绘图形类型有效",
    },
    {
      name: "roughFill",
      label: "填充色",
      type: "color",
      default: "#4ECDC4",
      description: "仅手绘图形类型有效",
    },
    {
      name: "graphvizDot",
      label: "DOT语法",
      type: "string",
      placeholder: "digraph { a -> b }",
      description: "仅Graphviz类型有效",
    },
    {
      name: "cytoscapeElements2",
      label: "元素JSON",
      type: "string",
      placeholder: '{"nodes":[...],"edges":[...]}',
      description: "仅网络图类型有效",
    },
    {
      name: "chartjsType",
      label: "图表类型",
      type: "select",
      default: "bar",
      options: [
        { label: "柱状图", value: "bar" },
        { label: "折线图", value: "line" },
        { label: "饼图", value: "pie" },
        { label: "环形图", value: "doughnut" },
        { label: "雷达图", value: "radar" },
      ],
      description: "仅Chart.js图表类型有效",
    },
    {
      name: "chartjsData",
      label: "数据JSON",
      type: "string",
      placeholder: '{"labels":[...],"datasets":[...]}',
      description: "仅Chart.js图表类型有效",
    },
    {
      name: "frappeChartType",
      label: "Frappe图表类型",
      type: "select",
      default: "bar",
      options: [
        { label: "柱状图", value: "bar" },
        { label: "折线图", value: "line" },
        { label: "饼图", value: "pie" },
        { label: "环形图", value: "donut" },
        { label: "百分比柱状图", value: "percentage" },
        { label: "热力图", value: "heatmap" },
      ],
      description: "仅Frappe Charts类型有效",
    },
    {
      name: "frappeLabels",
      label: "Frappe标签",
      type: "string",
      placeholder: '["Jan","Feb","Mar"]',
      description: "仅Frappe Charts类型有效，JSON数组",
    },
    {
      name: "frappeDatasets",
      label: "Frappe数据",
      type: "string",
      placeholder: '[{"values":[30,50,20]}]',
      description: "仅Frappe Charts类型有效，JSON数组",
    },
    {
      name: "chartXkcdType",
      label: "手绘图表类型",
      type: "select",
      default: "bar",
      options: [
        { label: "柱状图", value: "bar" },
        { label: "折线图", value: "line" },
        { label: "饼图", value: "pie" },
        { label: "散点图", value: "scatter" },
      ],
      description: "仅chart.xkcd类型有效",
    },
    {
      name: "chartXkcdData",
      label: "手绘图表数据",
      type: "string",
      placeholder: '{"labels":["A","B"],"datasets":[{"label":"X","data":[10,20]}]}',
      description: "仅chart.xkcd类型有效，JSON格式",
    },
    {
      name: "dagreNodes",
      label: "节点JSON",
      type: "string",
      placeholder: '[{"id":"a","label":"A"}]',
      description: "仅有向图布局类型有效",
    },
    {
      name: "dagreEdges",
      label: "边JSON",
      type: "string",
      placeholder: '[{"from":"a","to":"b"}]',
      description: "仅有向图布局类型有效",
    },
    {
      name: "starChartDate",
      label: "日期",
      type: "string",
      placeholder: "2024-01-01",
      description: "仅星图类型有效",
    },
    {
      name: "starChartLat",
      label: "纬度",
      type: "number",
      default: 39.9,
      description: "仅星图类型有效",
    },
    {
      name: "starChartLng",
      label: "经度",
      type: "number",
      default: 116.4,
      description: "仅星图类型有效",
    },
    {
      name: "audioUrl",
      label: "音频URL",
      type: "string",
      placeholder: "https://example.com/audio.mp3",
      description: "仅音频波形类型有效",
    },
    {
      name: "vegaLiteSpec",
      label: "Vega-Lite Spec",
      type: "string",
      placeholder: '{"$schema":"...","mark":"bar",...}',
      description: "仅Vega-Lite类型有效",
    },
    {
      name: "markmapMarkdown",
      label: "Markdown",
      type: "string",
      placeholder: "# 主题\n## 分支",
      description: "仅思维导图类型有效",
    },
    {
      name: "abcSource",
      label: "ABC 记谱法",
      type: "string",
      placeholder: "X:1\nT:小星星\nM:4/4\nK:C\nC C G G | A A G2",
      description: "仅 ABC 乐谱类型有效",
    },
    {
      name: "vexFlowNotes",
      label: "音符",
      type: "string",
      placeholder:
        '[{"keys":["c/4"],"duration":"q"},{"keys":["d/4"],"duration":"q"}]',
      description: "仅 VexFlow 五线谱类型有效，JSON 格式的音符数组",
    },
    {
      name: "vexFlowClef",
      label: "谱号",
      type: "select",
      default: "treble",
      options: [
        { label: "高音谱号", value: "treble" },
        { label: "低音谱号", value: "bass" },
        { label: "中音谱号", value: "alto" },
        { label: "次中音谱号", value: "tenor" },
      ],
      description: "仅 VexFlow 五线谱类型有效",
    },
    {
      name: "vexFlowTimeSignature",
      label: "拍号",
      type: "string",
      default: "4/4",
      placeholder: "4/4",
      description: "仅 VexFlow 五线谱类型有效",
    },
    {
      name: "cytoscapeElements",
      label: "元素数据",
      type: "string",
      placeholder:
        '[{"data":{"id":"A","label":"开始"}},{"data":{"source":"A","target":"B"}}]',
      description: "仅 Cytoscape 关系图类型有效，JSON 格式的节点和边数组",
    },
    {
      name: "cytoscapeLayout",
      label: "布局算法",
      type: "select",
      default: "preset",
      options: [
        { label: "预设位置", value: "preset" },
        { label: "网格", value: "grid" },
        { label: "圆形", value: "circle" },
        { label: "同心圆", value: "concentric" },
        { label: "层级", value: "breadthfirst" },
        { label: "力导向", value: "cose" },
      ],
      description: "仅 Cytoscape 关系图类型有效",
    },
    {
      name: "vueDataUiComponent",
      label: "图表组件",
      type: "string",
      default: "VueUiDonut",
      placeholder: "VueUiDonut",
      description:
        "仅 vue-data-ui 类型有效，如 VueUiDonut、VueUiRadar、VueUiXy 等",
    },
    {
      name: "vueDataUiDataset",
      label: "数据集",
      type: "string",
      placeholder: '[{"name":"项目A","values":[30]}]',
      description: "仅 vue-data-ui 类型有效，JSON 格式的数据数组",
    },
    {
      name: "vueDataUiConfig",
      label: "组件配置",
      type: "string",
      placeholder: '{"style":{"chart":{"title":{"text":"标题"}}}}',
      description: "仅 vue-data-ui 类型有效，JSON 格式的配置对象",
    },
    {
      name: "d3Code",
      label: "D3.js 代码",
      type: "string",
      placeholder: "// D3.js 代码\nconst svg = d3.select(container)...",
      description: "仅 D3.js 类型有效，可用变量：d3, container, width, height",
    },
    {
      name: "particlesPreset",
      label: "粒子预设",
      type: "select",
      default: "stars",
      options: [
        { label: "星空", value: "stars" },
        { label: "气泡", value: "bubbles" },
        { label: "雪花", value: "snow" },
        { label: "火焰", value: "fire" },
        { label: "自定义", value: "custom" },
      ],
      description: "仅粒子效果类型有效",
    },
    {
      name: "d3SankeyNodes",
      label: "节点JSON",
      type: "string",
      placeholder: '[{"id":"A","name":"Node A"}]',
      description: "仅桑基图类型有效",
    },
    {
      name: "d3SankeyLinks",
      label: "链接JSON",
      type: "string",
      placeholder: '[{"source":"A","target":"B","value":10}]',
      description: "仅桑基图类型有效",
    },
    {
      name: "d3CloudWords",
      label: "词语JSON",
      type: "string",
      placeholder: '[{"text":"Hello","size":40}]',
      description: "仅词云类型有效",
    },
    {
      name: "confettiPreset",
      label: "撒花预设",
      type: "select",
      default: "default",
      options: [
        { label: "默认", value: "default" },
        { label: "烟花", value: "fireworks" },
        { label: "雪花", value: "snow" },
        { label: "庆祝", value: "celebration" },
        { label: "校园", value: "school" },
      ],
      description: "仅撒花效果类型有效",
    },
    {
      name: "trianglifyCellSize",
      label: "单元格大小",
      type: "number",
      default: 40,
      description: "仅三角纹理类型有效",
    },
    {
      name: "htmlContent",
      label: "HTML 代码",
      type: "string",
      placeholder: '<div style="...">...</div>',
      description: [
        "仅 HTML 类型有效。用内联 style 写 HTML，元素默认填满画布（width:100%;height:100%）。",
        "",
        "【画布坐标系】",
        "- 画布宽高等于 canvas.setSize 设置的值（如 1200x1200px）",
        "- HTML 已自动注入 --type-hero/title/primary/subtitle/body/caption/micro，按文字作用直接使用 var(--type-xxx)，不要重复定义",
        "- 用户要求展示的重要信息最低使用 body；caption/micro 只用于非关键信息；font-size 禁止 px、pt、rem、vw、vh",
        "- 主视觉只用于一个最重要的信息，长文/书法主体使用 primaryText，普通说明才使用 body/caption；中间容器不要设置 font-size",
        "",
        "【常用模式】",
        "居中文字: <div style='display:flex;align-items:center;justify-content:center;width:100%;height:100%;'><div style='font-size:var(--type-title);font-weight:900;color:#fff;'>标题</div></div>",
        "渐变背景: <div style='width:100%;height:100%;background:linear-gradient(135deg,#667eea,#764ba2);'></div>",
        "卡片: <div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;'><div style='background:#fff;border-radius:.5em;padding:2em;box-shadow:0 .25em 1em rgba(0,0,0,.1);width:80%;height:70%;box-sizing:border-box;'><div style='font-size:var(--type-title);font-weight:700;color:#1a1a2e;'>标题</div></div></div>",
        "",
        "【CSS 技巧】",
        "- 用 display:flex + align-items/justify-content 做对齐",
        "- 用 linear-gradient() 做渐变背景",
        "- 用 box-shadow 做阴影，text-shadow 做文字发光",
        "- 用 border-radius:50% 做圆形，999px 做胶囊",
        "- 用 object-fit:cover 让图片不变形填充",
        "- 禁止用纯黑 #000000 和纯白 #ffffff",
        "",
        "【引用外部资源】",
        "用 htmlBindings 传入图片/字体，HTML 中用 {{image.key.url}} 或 {{font.key.family}} 引用",
      ].join("\n"),
    },
    {
      name: "allowMultipleHtml",
      label: "允许多个 HTML 元素",
      type: "boolean",
      default: false,
      description:
        "仅 HTML 类型有效。默认 false：再次添加 HTML 会替换已有 HTML 作品并清理旧 HTML 层，避免全屏片段互相遮挡。只有明确需要多个独立 HTML 层时才设为 true。",
    },
    {
      name: "htmlBindings",
      label: "模板绑定",
      type: "object",
      description: [
        "仅 HTML 类型有效。绑定图片和字体资源，HTML 中用模板变量引用。",
        "",
        "【绑定图片】（配合 resource.searchImage 搜索结果使用）",
        '{ "image": { "photo": { "id":"搜到的id", "url":"搜到的url", "name":"名称" } } }',
        "HTML 引用: <img src='{{image.photo.url}}' style='width:100%;height:100%;object-fit:cover;'/>",
        "多张图片: image 对象中加多个 key（img1, img2, img3...）",
        "",
        "【绑定字体】（配合 resource.searchFont 搜索结果使用）",
        '{ "font": { "title": { "id":"搜到的id", "url":"搜到的url", "name":"名称" } } }',
        "HTML 引用: <div style='font-family:{{font.title.family}};font-size:var(--type-title);'>文字</div>",
        "",
        "【完整示例】",
        'htmlBindings: { image: { bg: { id:"123", url:"https://...", name:"背景图" } }, font: { main: { id:"456", url:"https://...", name:"字体名" } } }',
      ].join("\n"),
    },
    {
      name: "htmlTemplateFields",
      label: "模板字段定义",
      type: "array",
      description: "定义模板中可被用户替换的字段列表",
    },
    {
      name: "htmlTemplateDefaultBindings",
      label: "模板默认绑定",
      type: "object",
      description: "模板字段的默认值",
    },
    {
      name: "htmlTemplateMeta",
      label: "模板元信息",
      type: "object",
      description: "模板的元数据信息",
    },
    {
      name: "width",
      label: "宽度",
      type: "number",
      min: 1,
      max: 10000,
      description: "元素宽度（px）",
    },
    {
      name: "height",
      label: "高度",
      type: "number",
      min: 1,
      max: 10000,
      description: "元素高度（px）",
    },
  ],
  execute(params, ctx) {
    const {
      type,
      textContent,
      fontColor,
      fontSize,
      backgroundColor,
      formula,
      displayMode,
      throwOnError,
      mathFontColor,
      mathFontSize,
      mermaidSource,
      mermaidTheme,
      codeBlockSource,
      codeBlockLanguage,
      codeBlockTheme,
      moleculeSource,
      moleculeInputType,
      threeMolData,
      threeMolFormat,
      threeMolPdbId,
      threeMolStyle,
      threeMolAiPrompt,
      figletText,
      figletFont,
      simplexNoiseScale,
      simplexNoiseOctaves,
      simplexNoiseColor1,
      simplexNoiseColor2,
      opentypeTextContent,
      opentypeFontUrl,
      roughShape,
      roughFill,
      graphvizDot,
      cytoscapeElements2,
      chartjsType,
      chartjsData,
      frappeChartType,
      frappeLabels,
      frappeDatasets,
      chartXkcdType,
      chartXkcdData,
      dagreNodes,
      dagreEdges,
      starChartDate,
      starChartLat,
      starChartLng,
      audioUrl,
      vegaLiteSpec,
      markmapMarkdown,
      abcSource,
      vexFlowNotes,
      vexFlowClef,
      vexFlowTimeSignature,
      cytoscapeElements,
      cytoscapeLayout,
      vueDataUiComponent,
      vueDataUiDataset,
      vueDataUiConfig,
      d3Code,
      particlesPreset,
      d3SankeyNodes,
      d3SankeyLinks,
      d3CloudWords,
      confettiPreset,
      trianglifyCellSize,
      htmlContent,
      htmlBindings,
      htmlTemplateFields,
      htmlTemplateDefaultBindings,
      htmlTemplateMeta,
      allowMultipleHtml,
      width,
      height,
    } = params;

    const extraOptions: Record<string, any> = {};

    if (type === "text") {
      if (textContent !== undefined) extraOptions.textContent = textContent;
      if (fontColor !== undefined) extraOptions.fontColor = fontColor;
      if (fontSize !== undefined) extraOptions.fontSize = fontSize;
    }

    if (type === "background" && backgroundColor !== undefined) {
      extraOptions.backgroundColor = backgroundColor;
    }

    if (type === "html" && htmlContent !== undefined) {
      extraOptions.htmlContent = htmlContent;
      // 处理模板绑定
      if (params.htmlBindings !== undefined) {
        extraOptions.htmlBindings = parseMaybeJsonObject(params.htmlBindings) ?? params.htmlBindings;
      }
      if (params.htmlTemplateFields !== undefined) {
        extraOptions.htmlTemplateFields =
          parseMaybeJsonObject(params.htmlTemplateFields) ??
          params.htmlTemplateFields;
      }
      if (params.htmlTemplateDefaultBindings !== undefined) {
        extraOptions.htmlTemplateDefaultBindings =
          parseMaybeJsonObject(params.htmlTemplateDefaultBindings) ??
          params.htmlTemplateDefaultBindings;
      }
      if (params.htmlTemplateMeta !== undefined) {
        extraOptions.htmlTemplateMeta =
          parseMaybeJsonObject(params.htmlTemplateMeta) ??
          params.htmlTemplateMeta;
      }
    }

    if (type === "math") {
      if (formula !== undefined) extraOptions.formula = formula;
      if (displayMode !== undefined) extraOptions.displayMode = displayMode;
      if (throwOnError !== undefined) extraOptions.throwOnError = throwOnError;
      if (mathFontColor !== undefined)
        extraOptions.fontColor = { color: mathFontColor, type: "pure" };
      if (mathFontSize !== undefined)
        extraOptions.fontSize = { value: mathFontSize, unit: "px" };
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "mermaid") {
      if (mermaidSource !== undefined) extraOptions.source = mermaidSource;
      if (mermaidTheme !== undefined) {
        extraOptions.config = {
          theme: mermaidTheme,
          securityLevel: "strict",
          flowchart: {
            htmlLabels: true,
            curve: "basis",
          },
        };
      }
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "codeBlock") {
      if (codeBlockSource !== undefined) extraOptions.source = codeBlockSource;
      if (codeBlockLanguage !== undefined)
        extraOptions.language = codeBlockLanguage;
      if (codeBlockTheme !== undefined) extraOptions.theme = codeBlockTheme;
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "molecule") {
      if (moleculeSource !== undefined) extraOptions.source = moleculeSource;
      if (moleculeInputType !== undefined)
        extraOptions.inputType = moleculeInputType;
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "threeMol") {
      if (threeMolData !== undefined) extraOptions.data = threeMolData;
      if (threeMolFormat !== undefined) extraOptions.format = threeMolFormat;
      if (threeMolPdbId !== undefined) extraOptions.pdbId = threeMolPdbId;
      if (threeMolStyle !== undefined) extraOptions.style = threeMolStyle;
      if (threeMolAiPrompt !== undefined)
        extraOptions.aiPrompt = threeMolAiPrompt;
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "figlet") {
      if (figletText !== undefined) extraOptions.text = figletText;
      if (figletFont !== undefined) extraOptions.font = figletFont;
    }
    if (type === "simplexNoise") {
      if (simplexNoiseScale !== undefined)
        extraOptions.scale = simplexNoiseScale;
      if (simplexNoiseOctaves !== undefined)
        extraOptions.octaves = simplexNoiseOctaves;
      if (simplexNoiseColor1 !== undefined)
        extraOptions.color1 = simplexNoiseColor1;
      if (simplexNoiseColor2 !== undefined)
        extraOptions.color2 = simplexNoiseColor2;
    }
    if (type === "opentypeText") {
      if (opentypeTextContent !== undefined)
        extraOptions.text = opentypeTextContent;
      if (opentypeFontUrl !== undefined) extraOptions.fontUrl = opentypeFontUrl;
    }
    if (type === "roughShape") {
      if (roughShape !== undefined) extraOptions.shape = roughShape;
      if (roughFill !== undefined) extraOptions.fill = roughFill;
    }
    if (type === "graphviz") {
      if (graphvizDot !== undefined) extraOptions.dot = graphvizDot;
    }
    if (type === "cytoscapeGraph") {
      if (cytoscapeElements2 !== undefined) {
        try {
          extraOptions.elements = JSON.parse(cytoscapeElements2);
        } catch {}
      }
    }
    if (type === "chartjs") {
      if (chartjsType !== undefined) extraOptions.chartType = chartjsType;
      if (chartjsData !== undefined) {
        try {
          extraOptions.data = JSON.parse(chartjsData);
        } catch {}
      }
    }
    if (type === "frappeChart") {
      if (frappeChartType !== undefined) extraOptions.chartType = frappeChartType;
      if (frappeLabels !== undefined) {
        try { extraOptions.labels = JSON.parse(frappeLabels); } catch {}
      }
      if (frappeDatasets !== undefined) {
        try { extraOptions.datasets = JSON.parse(frappeDatasets); } catch {}
      }
    }
    if (type === "chartXkcd") {
      if (chartXkcdType !== undefined) extraOptions.chartType = chartXkcdType;
      if (chartXkcdData !== undefined) {
        try { extraOptions.data = JSON.parse(chartXkcdData); } catch {}
      }
    }
    if (type === "dagreGraph") {
      if (dagreNodes !== undefined) {
        try {
          extraOptions.nodes = JSON.parse(dagreNodes);
        } catch {}
      }
      if (dagreEdges !== undefined) {
        try {
          extraOptions.edges = JSON.parse(dagreEdges);
        } catch {}
      }
    }
    if (type === "starChart") {
      if (starChartDate !== undefined) extraOptions.date = starChartDate;
      if (starChartLat !== undefined) extraOptions.latitude = starChartLat;
      if (starChartLng !== undefined) extraOptions.longitude = starChartLng;
    }
    if (type === "waveform") {
      if (audioUrl !== undefined) extraOptions.audioUrl = audioUrl;
    }
    if (type === "vegaLite") {
      if (vegaLiteSpec !== undefined) {
        try {
          extraOptions.spec = JSON.parse(vegaLiteSpec);
        } catch {}
      }
    }
    if (type === "markmapChart") {
      if (markmapMarkdown !== undefined)
        extraOptions.markdown = markmapMarkdown;
    }

    if (type === "abcNotation") {
      if (abcSource !== undefined) extraOptions.source = abcSource;
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "vexFlow") {
      if (vexFlowNotes !== undefined) {
        try {
          extraOptions.notes = JSON.parse(vexFlowNotes);
        } catch {
          return { success: false, message: "音符 JSON 格式错误" };
        }
      }
      if (vexFlowClef !== undefined) extraOptions.clef = vexFlowClef;
      if (vexFlowTimeSignature !== undefined)
        extraOptions.timeSignature = vexFlowTimeSignature;
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "cytoscape") {
      if (cytoscapeElements !== undefined) {
        try {
          extraOptions.elements = JSON.parse(cytoscapeElements);
        } catch {
          return { success: false, message: "元素数据 JSON 格式错误" };
        }
      }
      if (cytoscapeLayout !== undefined) extraOptions.layout = cytoscapeLayout;
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "vueDataUi") {
      if (vueDataUiComponent !== undefined)
        extraOptions.component = vueDataUiComponent;
      if (vueDataUiDataset !== undefined) {
        try {
          extraOptions.dataset = JSON.parse(vueDataUiDataset);
        } catch {
          return { success: false, message: "数据集 JSON 格式错误" };
        }
      }
      if (vueDataUiConfig !== undefined) {
        try {
          extraOptions.config = JSON.parse(vueDataUiConfig);
        } catch {
          return { success: false, message: "配置 JSON 格式错误" };
        }
      }
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "d3") {
      if (d3Code !== undefined) extraOptions.code = d3Code;
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "particlesEffect") {
      if (particlesPreset !== undefined) extraOptions.preset = particlesPreset;
    }
    if (type === "d3Sankey") {
      if (d3SankeyNodes !== undefined) {
        try {
          extraOptions.nodes = JSON.parse(d3SankeyNodes);
        } catch {}
      }
      if (d3SankeyLinks !== undefined) {
        try {
          extraOptions.links = JSON.parse(d3SankeyLinks);
        } catch {}
      }
    }
    if (type === "d3Cloud") {
      if (d3CloudWords !== undefined) {
        try {
          extraOptions.d3Cloud = { words: JSON.parse(d3CloudWords) };
        } catch {}
      }
    }

    if (type === "confetti") {
      if (confettiPreset !== undefined) extraOptions.preset = confettiPreset;
    }
    if (type === "trianglify") {
      if (trianglifyCellSize !== undefined)
        extraOptions.cellSize = trianglifyCellSize;
    }

    if (type === "rect" || type === "ellipse") {
      if (width !== undefined)
        extraOptions.width = { value: width, unit: "px" };
      if (height !== undefined)
        extraOptions.height = { value: height, unit: "px" };
    }

    if (type === "qrcode" || type === "barcode") {
      if (width !== undefined) extraOptions.width = width;
      if (height !== undefined) extraOptions.height = height;
    }

    const replaceResult =
      isHtmlArtworkType(type) && !allowMultipleHtml
        ? updateExistingHtmlArtwork(ctx, extraOptions)
        : null;

    if (replaceResult?.rejected) {
      return {
        success: false,
        message:
          replaceResult.message ||
          "检测到局部 HTML 片段，请提交一份完整 htmlContent 替换现有 HTML 作品。",
        data: {
          id: replaceResult.id,
          type,
          rejected: true,
          reason: "partial_html_fragment",
        },
      };
    }

    const preparedExtraOptions = isHtmlArtworkType(type)
      ? prepareHtmlArtworkOptions(
          extraOptions,
          undefined,
          getCanvasTypographyContext(ctx),
        )
      : extraOptions;
    const directExternalResourceError = isHtmlArtworkType(type)
      ? getDirectExternalResourceError(preparedExtraOptions)
      : "";

    if (directExternalResourceError) {
      return {
        success: false,
        message: directExternalResourceError,
        data: {
          type,
          rejected: true,
          reason: "direct_external_resource_url",
        },
      };
    }

    const id =
      replaceResult?.id || ctx.addCanvasChild(type, preparedExtraOptions);
    const totalElements = ctx
      .getCanvasChildren()
      .filter((c: any) => c.type !== "canvas").length;
    const actionText = replaceResult ? "已更新现有" : "已添加";
    return {
      success: true,
      message: `${actionText} ${type} 元素 (id: ${id})，当前画布共 ${totalElements} 个元素。HTML 作品默认保持单元素；如需优化，请传入完整 htmlContent 替换，不要追加局部 HTML 片段。`,
      data: { id, type, totalElements, replaced: Boolean(replaceResult) },
    };
  },
});
