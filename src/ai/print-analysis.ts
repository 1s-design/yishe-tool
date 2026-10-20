/**
 * 印花图解构分析 — 输入一张印花/参考图（本地文件或图片 URL），
 * 视觉模型输出结构化拆解：文字、字体气质、辅助图形、色系、构图、印花适配。
 * 本模块只做「分析」，不落画布；复刻链路后续以结构化结果为硬约束再接。
 */
import { directChat } from "./direct-client";
import { prepareImageForAI } from "./image-preprocess";
import { extractContent, extractJSON } from "./shared/response-parser";
import { AI_TIMEOUTS } from "./shared/timeout";
import {
  isVisionAvailable,
  markVisionUnavailable,
  isVisionRelatedError,
} from "./vision-mode";

// ============ 类型定义 ============

export type PrintTextRole = "primary" | "secondary" | "badge" | "decoration";
export type PrintGraphicKind =
  | "illustration"
  | "pattern"
  | "ornament"
  | "border"
  | "icon"
  | "texture"
  | "other";
export type PrintColorRole =
  | "background"
  | "primary"
  | "secondary"
  | "accent"
  | "text";

/** 复刻落地方式：font=真实字体渲染 / image=外部图片素材 / css=纯几何代码 */
export type ElementImpl = "font" | "image" | "css";

export interface PrintTextItem {
  /** 逐字原样识别的文案 */
  content: string;
  role: PrintTextRole;
  /** 字体形态：书法 / 黑体 / 宋体 / 手写 / 圆体 等 */
  fontStyle: string;
  /** 主色 HEX（识别不到给空串） */
  color: string;
  /** 位置描述：居中/左上/环绕… */
  position: string;
  /** 描边、烫金、阴影等效果 */
  effects?: string[];
  /** 文字一律用真实字体渲染 */
  impl: "font";
  /** 字体库检索词（如 ["楷体","书法"]），供 resource.searchFont 命中 */
  fontSearchKeywords: string[];
}

export interface PrintGraphicItem {
  name: string;
  kind: PrintGraphicKind;
  description: string;
  position: string;
  count: number;
  /**
   * 落地方式：复杂插画/纹样/肌理/图标 → image（外部素材）；
   * 只有纯几何（矩形底、圆形、分割线、渐变）→ css
   */
  impl: ElementImpl;
  /** 素材库检索词（仅 impl=image 时给），供 sticker/素材搜索命中 */
  imageSearchKeywords: string[];
  /** 为什么必须用外部图片（仅 impl=image 时给） */
  implReason: string;
}

export interface PrintColorItem {
  hex: string;
  role: PrintColorRole;
  /** 用在什么地方：底色/主标题/点缀… */
  usage: string;
}

export interface PrintComposition {
  /** 构图骨架：中轴对称/居中/三分/环绕… */
  layout: string;
  /** 留白率估计，如 "12%" */
  whitespace: string;
  /** 元素层级：主文案 > 主体插画 > 辅助纹样 */
  hierarchy: string;
}

export interface PrintAdaptability {
  /** 是否可独立成印（不依赖画面边缘） */
  standalone: boolean;
  /** 边缘裁切风险 */
  cropRisk: string;
  notes: string;
}

/** 复刻资源清单：一眼看出要搜哪些字体/图片，哪些可代码画 */
export interface PrintResourcePlan {
  /** 需要检索的真实字体 */
  fonts: Array<{ keywords: string[]; usedBy: string }>;
  /** 必须用外部图片的元素 */
  images: Array<{ name: string; keywords: string[]; reason: string }>;
  /** 允许 CSS/纯几何实现的元素名 */
  cssElements: string[];
}

export interface PrintAnalysisResult {
  /** 全图文字逐条拆解 */
  texts: PrintTextItem[];
  /** 整体字体气质关键词 */
  fontTraits: string[];
  graphics: PrintGraphicItem[];
  colors: PrintColorItem[];
  composition: PrintComposition;
  adaptability: PrintAdaptability;
  /** 复刻资源清单（字体/外部图片/CSS 三分） */
  resourcePlan: PrintResourcePlan;
  /** 原图实际像素尺寸（复刻时画布必须用这个尺寸） */
  sourceSize: { width: number; height: number } | null;
  /** 一句话概括这张印花 */
  summary: string;
  /** 原始模型输出（调试/兜底） */
  raw: string;
}

// ============ 提示词 ============

export const PRINT_ANALYSIS_SYSTEM_PROMPT = `你是资深印花/平面设计解构专家。用户给你一张印花设计图（可能是商品实拍或样机图），你的任务是**只做分析拆解**，不生成新设计。

## 识别原则

1. **穿透拍摄环境**：实拍图周围的桌面、地板、键盘、摄影背景布、阴影高光都不是设计本体，必须忽略；只提取印花画面内部的真实元素与配色。
2. **文字逐字原样**：图上所有文字逐字识别，不得改写、不得意译；识别不确定的字用「□」占位并在 effects 里注明。
3. **颜色给 HEX**：每个关键色给出十六进制色值（可用近似值），不要只给「红色」这类描述。
4. **诚实保守**：看不清的项给空字符串或空数组，不要编造。

## 输出格式

严格输出以下 JSON，不要写 JSON 之外的任何内容：

{
  "texts": [
    {
      "content": "逐字文案",
      "role": "primary|secondary|badge|decoration",
      "fontStyle": "书法/黑体/宋体/手写/圆体/衬线…",
      "color": "#RRGGBB",
      "position": "居中/左上/底部/环绕…",
      "effects": ["描边", "烫金", "阴影", "渐变"],
      "impl": "font",
      "fontSearchKeywords": ["楷体", "毛笔"]
    }
  ],
  "fontTraits": ["楷体笔触", "字重偏粗", "有细描边"],
  "graphics": [
    {
      "name": "元素名称",
      "kind": "illustration|pattern|ornament|border|icon|texture|other",
      "description": "形态与画法描述",
      "position": "位置",
      "count": 1,
      "impl": "image|css",
      "imageSearchKeywords": ["锦鲤", "中国风"],
      "implReason": "复杂插画笔触无法用代码还原，必须用外部图片素材"
    }
  ],
  "colors": [
    { "hex": "#7A1F2B", "role": "background|primary|secondary|accent|text", "usage": "底色" }
  ],
  "composition": {
    "layout": "中轴对称/居中/三分…",
    "whitespace": "12%",
    "hierarchy": "主文案 > 主体插画 > 辅助纹样"
  },
  "adaptability": {
    "standalone": true,
    "cropRisk": "低/中/高 + 原因",
    "notes": "印花适配备注"
  },
  "resourcePlan": {
    "fonts": [{ "keywords": ["楷体", "书法"], "usedBy": "主文案" }],
    "images": [{ "name": "锦鲤插画", "keywords": ["锦鲤", "中国风"], "reason": "复杂插画需外部素材" }],
    "cssElements": ["纯色背景", "底部渐变"]
  },
  "summary": "一句话概括这张印花的设计主题与气质"
}

## 复刻落地方式（impl）判定规则 —— 非常重要

复刻时**禁止把一切用 HTML/CSS 代码硬画**，按元素性质分派：

1. **文字 → impl="font"**：必须用真实字体渲染。每条文字给 fontSearchKeywords（字体库检索词，如 ["楷体","书法"] / ["黑体","粗"] / ["手写体"]），供后续搜索字体资源绑定。
2. **复杂视觉 → impl="image"（外部图片）**：主体插画、人物/动物/花卉插画、祥云/花枝等纹样、角饰、图标、纸纹/布纹肌理、烫金质感、任何带笔触/渐变细节的图形 —— 代码画不出来或画得很丑，**必须走外部图片素材**。给 imageSearchKeywords（素材库检索词，2-4 个，如 ["锦鲤","中国风","祥云"]）和 implReason。
3. **纯几何 → impl="css"**：只有矩形/圆形色块、纯色或线性渐变背景、分割线、简单描边框才允许 CSS 实现。

每个 graphics 条目必须明确 impl，impl=image 时 imageSearchKeywords 必填。resourcePlan 汇总三类清单，让复刻方一眼看清要搜什么资源。

## 维度说明

- **texts**：主文案 → role=primary；副文案 → secondary；角标/编号/小字 → badge；纯装饰小字 → decoration。
- **graphics**：主体插画、祥云/花枝等纹样、角饰、边框、图标、纸纹/布纹肌理分别列条。
- **colors**：按 底色 → 主色 → 辅色 → 点缀色 → 文字色 顺序，给 3-8 个关键色。
- **composition**：只描述印花画面内部的构图，不管样机摆拍角度。
- **adaptability**：主体是否集中居中、四周留边是否够裁切、远看能否识别主体。
- **resourcePlan**：汇总「要搜的字体」「要搜的外部图片」「可 CSS 实现」三份清单，与 texts/graphics 的 impl 字段一致。`;

// ============ 输入归一 ============

export type PrintAnalysisInput = File | string;

export interface ResolvedPrintImage {
  /** 喂给视觉模型的 URL 或 data URL */
  url: string;
  sourceType: "file" | "url";
  /** 实际像素尺寸（尽量测出，测不到为 null） */
  width: number | null;
  height: number | null;
}

function isDataUrl(value: string): boolean {
  return /^data:image\//i.test(value.trim());
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** 用 Image 元素量出图片像素尺寸（跨域 URL 也可量 naturalWidth/Height） */
function measureImage(
  url: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** 文件 → 压缩后的 data URL + 尺寸；URL/data URL → 原样透传 + 尽量量尺寸 */
export async function resolvePrintImage(
  input: PrintAnalysisInput,
): Promise<ResolvedPrintImage> {
  if (typeof input === "string") {
    const url = input.trim();
    if (!url) throw new Error("图片地址为空");
    if (!isDataUrl(url) && !isHttpUrl(url)) {
      throw new Error("图片地址必须是 http(s) 链接或 data URL");
    }
    const size = await measureImage(url);
    return {
      url,
      sourceType: isDataUrl(url) ? "file" : "url",
      width: size?.width ?? null,
      height: size?.height ?? null,
    };
  }

  if (typeof File !== "undefined" && input instanceof File) {
    if (!input.type.startsWith("image/")) {
      throw new Error("请选择图片文件");
    }
    const prepared = await prepareImageForAI(input);
    return {
      url: prepared.preview,
      sourceType: "file",
      width: prepared.width ?? null,
      height: prepared.height ?? null,
    };
  }

  throw new Error("不支持的图片输入类型");
}

// ============ 结果归一 ============

const TEXT_ROLES: PrintTextRole[] = [
  "primary",
  "secondary",
  "badge",
  "decoration",
];
const GRAPHIC_KINDS: PrintGraphicKind[] = [
  "illustration",
  "pattern",
  "ornament",
  "border",
  "icon",
  "texture",
  "other",
];
const COLOR_ROLES: PrintColorRole[] = [
  "background",
  "primary",
  "secondary",
  "accent",
  "text",
];

function pickEnum<T extends string>(
  value: unknown,
  allowed: T[],
  fallback: T,
): T {
  const v = String(value || "").trim().toLowerCase() as T;
  return allowed.includes(v) ? v : fallback;
}

function toHex(value: unknown): string {
  const s = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    const r = s[1],
      g = s[2],
      b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return "";
}

function toCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 1;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x || "").trim()).filter(Boolean);
}

/** 把模型 JSON 归一成 PrintAnalysisResult；字段缺失时给安全默认值 */
export function normalizePrintAnalysis(
  json: any,
  raw: string,
  sourceSize?: { width: number; height: number } | null,
): PrintAnalysisResult {
  const texts: PrintTextItem[] = Array.isArray(json?.texts)
    ? json.texts.map((t: any) => ({
        content: String(t?.content || "").trim(),
        role: pickEnum(t?.role, TEXT_ROLES, "decoration"),
        fontStyle: String(t?.fontStyle || "").trim(),
        color: toHex(t?.color),
        position: String(t?.position || "").trim(),
        effects: toStringArray(t?.effects),
        impl: "font" as const,
        fontSearchKeywords: toStringArray(t?.fontSearchKeywords),
      }))
    : [];

  const graphics: PrintGraphicItem[] = Array.isArray(json?.graphics)
    ? json.graphics.map((g: any) => {
        // 缺省一律外部图片；仅当模型明确声明 css（纯几何）才允许代码实现
        const impl: ElementImpl = String(g?.impl || "").trim() === "css" ? "css" : "image";
        return {
          name: String(g?.name || "").trim(),
          kind: pickEnum(g?.kind, GRAPHIC_KINDS, "other"),
          description: String(g?.description || "").trim(),
          position: String(g?.position || "").trim(),
          count: toCount(g?.count),
          impl,
          imageSearchKeywords: toStringArray(g?.imageSearchKeywords),
          implReason: String(g?.implReason || "").trim(),
        };
      })
    : [];

  const colors: PrintColorItem[] = Array.isArray(json?.colors)
    ? json.colors
        .map((c: any) => ({
          hex: toHex(c?.hex),
          role: pickEnum(c?.role, COLOR_ROLES, "accent"),
          usage: String(c?.usage || "").trim(),
        }))
        .filter((c: PrintColorItem) => c.hex)
    : [];

  // resourcePlan：模型给了就用，否则从 texts/graphics 推导
  const planFonts =
    Array.isArray(json?.resourcePlan?.fonts) && json.resourcePlan.fonts.length
      ? json.resourcePlan.fonts.map((f: any) => ({
          keywords: toStringArray(f?.keywords),
          usedBy: String(f?.usedBy || "").trim(),
        }))
      : dedupeByText(
          texts.map((t) => ({
            keywords: t.fontSearchKeywords.length
              ? t.fontSearchKeywords
              : t.fontStyle
                ? [t.fontStyle]
                : [],
            usedBy: t.content || t.role,
          })),
        );

  const planImages =
    Array.isArray(json?.resourcePlan?.images) && json.resourcePlan.images.length
      ? json.resourcePlan.images.map((im: any) => ({
          name: String(im?.name || "").trim(),
          keywords: toStringArray(im?.keywords),
          reason: String(im?.reason || "").trim(),
        }))
      : graphics
          .filter((g) => g.impl === "image")
          .map((g) => ({
            name: g.name,
            keywords: g.imageSearchKeywords,
            reason: g.implReason || "复杂图形需外部图片素材",
          }));

  const planCss =
    Array.isArray(json?.resourcePlan?.cssElements) && json.resourcePlan.cssElements.length
      ? toStringArray(json.resourcePlan.cssElements)
      : graphics.filter((g) => g.impl === "css").map((g) => g.name);

  return {
    texts,
    fontTraits: toStringArray(json?.fontTraits),
    graphics,
    colors,
    composition: {
      layout: String(json?.composition?.layout || "").trim(),
      whitespace: String(json?.composition?.whitespace || "").trim(),
      hierarchy: String(json?.composition?.hierarchy || "").trim(),
    },
    adaptability: {
      standalone: Boolean(json?.adaptability?.standalone),
      cropRisk: String(json?.adaptability?.cropRisk || "").trim(),
      notes: String(json?.adaptability?.notes || "").trim(),
    },
    resourcePlan: {
      fonts: planFonts.filter((f: { keywords: string[] }) => f.keywords.length),
      images: planImages,
      cssElements: planCss,
    },
    sourceSize:
      sourceSize && sourceSize.width > 0 && sourceSize.height > 0
        ? sourceSize
        : null,
    summary: String(json?.summary || "").trim(),
    raw,
  };
}

function dedupeByText(
  items: Array<{ keywords: string[]; usedBy: string }>,
): Array<{ keywords: string[]; usedBy: string }> {
  const seen = new Set<string>();
  const out: Array<{ keywords: string[]; usedBy: string }> = [];
  for (const it of items) {
    const key = it.keywords.join("|");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

// ============ 主入口 ============

export interface AnalyzePrintOptions {
  timeoutMs?: number;
  /** 取消信号 */
  signal?: AbortSignal;
}

/**
 * 分析印花图，返回结构化解构结果。
 * 输入本地图片文件，或 http(s)/data 图片地址。
 */
export async function analyzePrintImage(
  input: PrintAnalysisInput,
  options: AnalyzePrintOptions = {},
): Promise<PrintAnalysisResult> {
  if (!isVisionAvailable()) {
    throw new Error("视觉能力当前不可用，无法分析图片");
  }

  const { url, width, height } = await resolvePrintImage(input);
  const sourceSize =
    width && height && width > 0 && height > 0 ? { width, height } : null;

  const messages = [
    {
      role: "system" as const,
      content: PRINT_ANALYSIS_SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: [
        {
          type: "text",
          text: `请解构这张印花图，按系统要求输出结构化 JSON。${
            sourceSize
              ? `（原图实际像素尺寸：${sourceSize.width}×${sourceSize.height}）`
              : ""
          }`,
        },
        {
          type: "image_url",
          image_url: { url, detail: "high" },
        },
      ],
    },
  ];

  let response: any;
  try {
    response = await directChat({
      messages,
      temperature: 0.2,
      maxTokens: 4096,
      timeoutMs: options.timeoutMs ?? AI_TIMEOUTS.quickEvaluate,
      enableThinking: false,
    });
  } catch (error: any) {
    if (isVisionRelatedError?.(error)) {
      markVisionUnavailable(error?.message);
      throw new Error(
        `视觉分析失败（视觉能力已降级）：${error?.message || "未知错误"}`,
      );
    }
    throw error;
  }

  const text = extractContent(response);
  if (!text) {
    throw new Error("分析结果为空，请重试");
  }

  const json = extractJSON(text);
  if (!json) {
    throw new Error("分析结果不是有效 JSON，请重试");
  }

  return normalizePrintAnalysis(json, text, sourceSize);
}
