import { reactive, ref, watch } from "vue";
import { directChat } from "../direct-client";
import { designAgent } from "./simple";
import { evaluateCanvasVisual } from "../visual-evaluate";
import { executeAITool } from "../shared/execute-tool";
import { currentEditingCustomStickerId } from "@/components/design/layout/canvas";
import { auditCurrentCanvas, repairCanvasLayout } from "../canvas-audit";
import {
  buildResourceContext,
  type DesignResourceRef,
} from "../resource-refs";
import { parseChatResponse } from "../shared/response-parser";
import { AI_TIMEOUTS, withTimeout } from "../shared/timeout";
import { websocketClient } from "@/services/websocketClient";
import {
  beginDesignTabTask,
  completeDesignTabTask,
} from "@/services/designTabStatus";
import {
  resolveAgentTaskSpec,
  type AgentTaskPresetId,
} from "./task-spec";
import {
  fetchInspirations,
  reportInspirationProduced,
  toInspirationDigest,
  type DesignInspirationItem,
} from "../inspiration-source";

// ============ Types ============

export type BatchSaveMode = "auto" | "draft";
export type BatchFailureStrategy = "skip" | "stop" | "save_anyway";

/** 批量任务来源：默认按描述生成；灵感模式从 design_inspiration 取待生产灵感 */
export type BatchTaskSource =
  | { kind: "description" }
  | {
      kind: "inspirations";
      /** 指定灵感 ID；不传则按 status=pending 拉取 */
      inspirationIds?: string[];
      /** 每条灵感产出几个变体（同系列不同构图/配色/文案侧重） */
      variantsPerInspiration?: number;
      /** 目标尺寸列表：每条灵感 × 每个尺寸 × 每个变体各出一张 */
      sizes?: Array<{ width: number; height: number; label?: string }>;
      /** 最多取多少条灵感 */
      limit?: number;
      /** 是否把生产状态回写到 design_inspiration，默认 true */
      reportBack?: boolean;
    }
  | {
      kind: "replicate";
      /** 源自定义贴纸 ID（会读取它的画布数据作为复刻基稿） */
      sourceStickerId?: string;
      /** 以当前画布为源 */
      useCurrentCanvas?: boolean;
      /** 产出多少个变体 */
      variants?: number;
      /** 扰动维度：配色 / 字体 / 构图 / 文案 */
      perturb?: { palette?: boolean; font?: boolean; layout?: boolean; copy?: boolean };
      /** 产出尺寸（不传则沿用源设计尺寸） */
      sizes?: Array<{ width: number; height: number; label?: string }>;
    }
  | {
      kind: "image";
      /** 参考图（COS 链接或 data URL），交给视觉模型读图复刻 */
      imageUrl: string;
      /** 产出几个变体 */
      variants?: number;
      /** 产出尺寸 */
      sizes?: Array<{ width: number; height: number; label?: string }>;
      /** 补充要求（例如「只提取印花图案，不要商品本身」） */
      instruction?: string;
    };

export interface AutoBatchConfig {
  description: string;
  count: number;
  /** 任务来源（不传=按 description 生成） */
  taskSource?: BatchTaskSource;
  /** 资源引用：灵感/字体/图片/贴纸/文案/文档/技巧/提示词，编译成「思路 + 绑定」给 agent */
  resources?: DesignResourceRef[];
  taskPreset?: AgentTaskPresetId;
  outputKind?: "independent-batch" | "group";
  membersPerGroup?: number;
  customInstructions?: string;
  enableAnalysisOptimization?: boolean;
  style?: string;
  width?: number;
  height?: number;
  /** 保持当前画布尺寸，不修改 */
  preserveCanvasSize?: boolean;
  transparentBackground?: boolean;
  qualityThreshold?: number;
  maxRevisions?: number;
  saveMode?: BatchSaveMode;
  failureStrategy?: BatchFailureStrategy;
}

export interface StickerBrief {
  title: string;
  prompt: string;
  width: number;
  height: number;
  /** 保持当前画布尺寸，不修改 */
  preserveCanvasSize?: boolean;
  transparentBackground: boolean;
  resourceHints: string[];
  saveName: string;
  description: string;
  keywords: string[];
  qualityTarget: number;
  groupIndex: number;
  memberIndex: number;
  /** 来源灵感 ID（灵感驱动模式），用于产出后回写状态 */
  inspirationId?: string;
  /** 复刻模式的基稿 HTML（保留视觉语言） */
  sourceHtml?: string;
  /** 图片复刻模式的参考图（喂给视觉模型） */
  referenceImage?: string;
  /** 严格文字白名单（防自创清单外文字），由带文案清单的复刻任务开启 */
  strictTextWhitelist?: boolean;
  /** 期望背景色 HEX（配色锁），由文案清单提取 */
  expectedBackground?: string;
  /** 主文案必须竖排单列 */
  expectVerticalMain?: boolean;
  /** 资源引用编译出的思路上下文（进 prompt） */
  resourceContext?: string;
  /** 资源引用编译出的绑定资源（agent 需传给 canvas.addHtml 的 htmlBindings） */
  htmlBindings?: Record<string, any>;
}

export interface BatchItem {
  index: number;
  prompt: string;
  brief: StickerBrief;
  score: number | null;
  status:
    | "pending"
    | "designing"
    | "evaluating"
    | "revising"
    | "saving"
    | "grouping"
    | "done"
    | "failed"
    | "skipped";
  revisionCount: number;
  error?: string;
  savedUrl?: string;
  saveResult?: any;
  groupId?: string;
}

export interface BatchProgress {
  status: "idle" | "preparing" | "running" | "paused" | "stopped" | "done";
  items: BatchItem[];
  current: number;
  config: AutoBatchConfig | null;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}

export interface BatchRuntimeSnapshot {
  requestId?: string | null;
  status: BatchProgress["status"];
  current: number;
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  description: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
  updatedAt: string;
  items: Array<{
    index: number;
    title: string;
    status: BatchItem["status"];
    score: number | null;
    revisionCount: number;
    error?: string;
    savedUrl?: string;
    groupId?: string;
  }>;
}

interface NormalizedBatchConfig {
  taskSource?: BatchTaskSource;
  resources?: DesignResourceRef[];
  style: string;
  description: string;
  count: number;
  taskPreset: AgentTaskPresetId;
  outputKind: "independent-batch" | "group";
  membersPerGroup: number;
  customInstructions: string;
  width?: number;
  height?: number;
  preserveCanvasSize: boolean;
  transparentBackground: boolean;
  enableAnalysisOptimization: boolean;
  qualityThreshold: number;
  maxRevisions: number;
  saveMode: BatchSaveMode;
  failureStrategy: BatchFailureStrategy;
}

// ============ Shared State ============

export const batchProgress = reactive<BatchProgress>({
  status: "idle",
  items: [],
  current: 0,
  config: null,
});

const controlSignal = ref<"running" | "paused" | "stopped">("running");
let pauseResolve: (() => void) | null = null;

export function getBatchRuntimeSnapshot(): BatchRuntimeSnapshot {
  const terminal = new Set(["done", "failed", "skipped"]);
  const configuredTotal = batchProgress.config
    ? batchProgress.config.count *
      (batchProgress.config.outputKind === "group"
        ? batchProgress.config.membersPerGroup || 2
        : 1)
    : 0;
  return {
    status: batchProgress.status,
    current: batchProgress.current,
    total: batchProgress.items.length || configuredTotal,
    completed: batchProgress.items.filter((item) => terminal.has(item.status))
      .length,
    succeeded: batchProgress.items.filter((item) => item.status === "done")
      .length,
    failed: batchProgress.items.filter((item) => item.status === "failed")
      .length,
    skipped: batchProgress.items.filter((item) => item.status === "skipped")
      .length,
    description: batchProgress.config?.description || "",
    error: batchProgress.error,
    startedAt: batchProgress.startedAt,
    finishedAt: batchProgress.finishedAt,
    updatedAt: new Date().toISOString(),
    items: batchProgress.items.map((item) => ({
      index: item.index,
      title: item.brief.title,
      status: item.status,
      score: item.score,
      revisionCount: item.revisionCount,
      error: item.error,
      savedUrl: item.savedUrl,
      groupId: item.groupId,
    })),
  };
}

watch(
  () => ({
    status: batchProgress.status,
    current: batchProgress.current,
    error: batchProgress.error,
    startedAt: batchProgress.startedAt,
    finishedAt: batchProgress.finishedAt,
    config: batchProgress.config,
    items: batchProgress.items.map((item) => ({
      status: item.status,
      score: item.score,
      revisionCount: item.revisionCount,
      error: item.error,
      savedUrl: item.savedUrl,
      groupId: item.groupId,
    })),
  }),
  () => websocketClient.setBatchProgress(getBatchRuntimeSnapshot()),
  { deep: true, immediate: true, flush: "post" },
);

function isStopped(signal = controlSignal): boolean {
  return signal.value === "stopped";
}

// ============ Config Helpers ============

function normalizeConfig(config: AutoBatchConfig): NormalizedBatchConfig {
  const description = config.description || "";
  const explicitSize = extractSize(description);
  const enableAnalysisOptimization = Boolean(config.enableAnalysisOptimization);
  const taskPreset = config.taskPreset || "standard";
  const resolvedTask = resolveAgentTaskSpec(
    description,
    {
      preset: taskPreset,
      outputKind: config.outputKind,
      jobCount: config.count,
      memberCount: config.membersPerGroup,
      customInstructions: config.customInstructions,
    },
    { execution: "automatic" },
  );
  const outputKind =
    taskPreset === "group"
      ? "group"
      : taskPreset === "batch" || taskPreset === "single"
        ? "independent-batch"
        : taskPreset === "custom"
          ? config.outputKind || "independent-batch"
          : resolvedTask.outputKind === "group"
            ? "group"
            : "independent-batch";
  const membersPerGroup =
    outputKind === "group"
      ? clampNumber(config.membersPerGroup, 2, 12, 2)
      : 1;
  const maxJobs = Math.max(1, Math.floor(100 / membersPerGroup));

  return {
    taskSource: config.taskSource,
    resources: config.resources,
    style: config.style || "",
    description,
    count: clampNumber(config.count, 1, maxJobs, 5),
    taskPreset,
    outputKind,
    membersPerGroup,
    customInstructions: String(config.customInstructions || "").trim(),
    width: getOptionalSize(config.width, explicitSize?.width),
    height: getOptionalSize(config.height, explicitSize?.height),
    preserveCanvasSize: Boolean(config.preserveCanvasSize),
    transparentBackground:
      Boolean(config.transparentBackground) ||
      shouldUseStickerBackground(description),
    enableAnalysisOptimization,
    qualityThreshold:
      config.qualityThreshold ?? inferQualityThreshold(description),
    maxRevisions: clampNumber(
      config.maxRevisions,
      0,
      3,
      enableAnalysisOptimization ? inferMaxRevisions(description) || 1 : 0,
    ),
    saveMode: "auto",
    failureStrategy: "save_anyway",
  };
}

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function getTotalDesignCount(config: NormalizedBatchConfig): number {
  return config.count * config.membersPerGroup;
}

function getOptionalSize(...values: unknown[]): number | undefined {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return clampNumber(n, 128, 6000, 1024);
    }
  }
  return undefined;
}

function extractSize(text: string): { width: number; height: number } | null {
  const match = String(text || "").match(/(\d{3,5})\s*[x×*]\s*(\d{3,5})/i);
  if (!match) return null;
  return {
    width: clampNumber(match[1], 128, 6000, 1024),
    height: clampNumber(match[2], 128, 6000, 1024),
  };
}

function shouldUseStickerBackground(text: string): boolean {
  return /透明|抠图|白边|异形|贴纸化|die[-\s]?cut/i.test(text);
}

function inferQualityThreshold(text: string): number {
  const match = String(text || "").match(
    /(?:质量|评分|分数|门槛)[^\d]*(\d{1,2})/,
  );
  return clampNumber(match?.[1], 1, 10, 7);
}

function inferMaxRevisions(text: string): number {
  return /修订|优化|迭代|自检|合格|质量|评分|分数|门槛|revise|improve/i.test(
    text,
  )
    ? 1
    : 0;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,，、\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function truncateText(text: string, max = 80): string {
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > max
    ? `${normalized.slice(0, max)}...`
    : normalized;
}

// ============ Brief Generation ============

async function generateBriefs(
  configInput: AutoBatchConfig,
): Promise<StickerBrief[]> {
  const config = normalizeConfig(configInput);

  // 灵感驱动：从 design_inspiration 取待生产灵感并编译成 brief
  if (config.taskSource?.kind === "inspirations") {
    return attachResources(await generateInspirationBriefs(config), config);
  }

  // 复刻驱动：以某张已有设计为基稿，产出带扰动的变体
  if (config.taskSource?.kind === "replicate") {
    return attachResources(await generateReplicateBriefs(config), config);
  }

  // 图片复刻：以用户提供的图（商品图/印花图）为视觉参考重建设计
  if (config.taskSource?.kind === "image") {
    return attachResources(await generateImageBriefs(config), config);
  }

  const totalDesignCount = getTotalDesignCount(config);
  const outputInstruction =
    config.outputKind === "group"
      ? `共制作 ${config.count} 套组图，每套包含 ${config.membersPerGroup} 个成员，总计 ${totalDesignCount} 个 brief。同组（同一套）成员必须强制使用完全相同的画布尺寸、配色方案（如背景色/主调/辅色）、字体名称、边框样式和视觉语言，严禁成员之间随机更换背景色或装饰风格。各成员仅在核心文字文案或主要表达主体上有明确区分（如对联的上联与下联，名片正面与背面）。`
      : `共制作 ${config.count} 个互相独立的设计 brief。`;

  let response: any;
  try {
    response = await directChat({
      messages: [
        {
          role: "system",
          content: `你是设计生产任务策划助手。根据用户的生产需求，生成一组可以逐张执行的结构化设计 brief。

输出必须是 JSON 数组，不要写 Markdown 或解释。数组里每项格式如下：
{
  "title": "短标题",
  "prompt": "给设计 agent 的完整自然语言需求",
  "width": 1024,
  "height": 1024,
  "transparentBackground": true,
  "resourceHints": ["素材或字体检索方向"],
  "saveName": "保存到自定义贴纸库的名称",
  "description": "保存到自定义贴纸库的简短描述",
  "keywords": ["关键词1", "关键词2"],
  "qualityTarget": 7
}

要求：
- ${outputInstruction}
- 输出必须正好为 ${totalDesignCount} 项；如果用户文本里出现其他数量，以结构化配置为准。
- 从用户完整提示词里理解尺寸、风格、题材、是否透明、是否保存、质量要求等，不要依赖额外表单字段。
- ${config.preserveCanvasSize ? "用户要求保持当前画布尺寸，brief 中不要指定 width/height 字段。" : "如果用户没有指定尺寸，默认使用 1024x1024。"}
${
  config.outputKind === "group"
    ? "- 【组图极高优先级规约】：对于套图/组图任务，同组的所有成员必须使用 100% 相同的背景色彩、边框阴影、字号规范与视觉主题，绝对不要为同一组内的不同成员改变视觉风格或色彩风格。"
    : "- 如果用户要求同一系列，保持统一视觉语言，但每张主题、构图或元素要有差异，避免只是换颜色。"
}
- prompt 要自然，像真实用户提出的设计需求。
- 如需要图片、字体、文案资源，只写检索方向，不要编造 URL 或资源 ID。
- 不要在 brief 里要求保存，保存由生产流水线处理。`,
        },
        {
          role: "user",
          content: `请根据下面的完整生产提示词生成 ${totalDesignCount} 个设计 brief。

完整生产提示词：
${config.description || config.style || "自由发挥"}

默认参数（仅在提示词没有说明时使用）：
- 尺寸：${config.preserveCanvasSize ? "保持当前画布尺寸不变，brief 中不要指定 width/height" : (config.width && config.height ? `${config.width}x${config.height}` : "1024x1024")}
- 背景：${config.transparentBackground ? "适合贴纸、透明/白边/抠边优先" : "按提示词自由处理"}
- 分析优化：${config.enableAnalysisOptimization ? `开启，质量目标 ${config.qualityThreshold}/10` : "关闭，生成完成后直接保存"}
- 输出结构：${outputInstruction}
${config.customInstructions ? `- 自定义约束：${config.customInstructions}` : ""}

每个 brief 都需要适合持续制作和保存到自定义贴纸库，且 prompt 必须可以直接交给设计 agent 执行。`,
        },
      ],
      temperature: 0.8,
      maxTokens: 2400,
      timeoutMs: AI_TIMEOUTS.brief,
    });
  } catch (error) {
    console.warn("[Batch] brief 生成失败，使用本地 fallback:", error);
    return fallbackBriefs(config);
  }

  const parsed = parseChatResponse(response);
  const content = parsed?.content || "";
  const rawItems = parseJsonArray(content);

  if (!rawItems.length) {
    return fallbackBriefs(config);
  }

  const briefs: StickerBrief[] = [];
  for (const rawItem of rawItems) {
    const brief = normalizeBrief(rawItem, briefs.length, config);
    if (hasSimilarBrief(brief, briefs)) continue;
    briefs.push(brief);
    if (briefs.length >= totalDesignCount) break;
  }

  return ensureExactBriefs(briefs, config);
}

/**
 * 灵感驱动：从 design_inspiration 取待生产灵感，用 LLM 把每条灵感编译成
 * variantsPerInspiration 个可执行 brief（同系列、有差异），并记录来源灵感 ID。
 */
interface InspirationSlot {
  inspirationIndex: number;
  inspirationId: string;
  size: { width: number; height: number; label: string };
  variant: number;
}

function ratioLabel(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const d = gcd(Math.round(width), Math.round(height)) || 1;
  const w = Math.round(width) / d;
  const h = Math.round(height) / d;
  if (w <= 40 && h <= 40) return `${w}:${h}`;
  return `${(width / height).toFixed(2)}:1`;
}

/** 归一化目标尺寸列表；未指定时退回 config 尺寸或长款鼠标垫默认值 */
function normalizeInspirationSizes(
  sizes: Array<{ width: number; height: number; label?: string }> | undefined,
  config: NormalizedBatchConfig,
) {
  const list = (sizes || []).filter(
    (item) => Number(item?.width) > 0 && Number(item?.height) > 0,
  );
  const normalized = list.map((item) => {
    const width = Math.round(Number(item.width));
    const height = Math.round(Number(item.height));
    return {
      width,
      height,
      label: String(item.label || "").trim() || ratioLabel(width, height),
    };
  });
  if (normalized.length) return normalized;
  const width = config.width || 3000;
  const height = config.height || 1376;
  return [{ width, height, label: ratioLabel(width, height) }];
}

/** 取复刻基稿：当前画布 或 已保存的自定义贴纸（meta.data 里有完整画布数据） */
async function loadReplicateSource(source: {
  sourceStickerId?: string;
  useCurrentCanvas?: boolean;
}): Promise<{
  htmlContent: string;
  name: string;
  description: string;
  width?: number;
  height?: number;
} | null> {
  const pickHtml = (children: any[]): string =>
    String(children?.find?.((c: any) => c?.type === "html")?.htmlContent || "");

  if (source.useCurrentCanvas) {
    try {
      const mod: any = await import("@/components/design/layout/canvas");
      const children = mod.canvasStickerOptions?.value?.children || [];
      const htmlContent = pickHtml(children);
      if (htmlContent) {
        return { htmlContent, name: "当前画布", description: "" };
      }
    } catch (error) {
      console.warn("[Batch] 读取当前画布失败:", error);
    }
    return null;
  }

  if (source.sourceStickerId) {
    try {
      const api: any = await import("@/api");
      const rec = await api.getCustomSticker(String(source.sourceStickerId));
      const data = rec?.meta?.data || rec?.meta || {};
      const htmlContent = pickHtml(data?.children || []);
      if (htmlContent) {
        return {
          htmlContent,
          name: String(rec?.name || "源贴纸"),
          description: String(rec?.description || ""),
          width: Number(rec?.width) || undefined,
          height: Number(rec?.height) || undefined,
        };
      }
    } catch (error) {
      console.warn("[Batch] 读取源贴纸失败:", error);
    }
    return null;
  }
  return null;
}

/**
 * 复刻驱动：以基稿 HTML 为底，产出带扰动（配色/字体/构图/文案）的变体 brief。
 * 复刻是「保留视觉语言」而非像素级复制，扰动维度可由调用方指定。
 */
async function generateReplicateBriefs(
  config: NormalizedBatchConfig,
): Promise<StickerBrief[]> {
  const source = config.taskSource;
  if (source?.kind !== "replicate") return [];

  const variants = clampNumber(source.variants, 1, 10, 2);
  const sizes = normalizeInspirationSizes(source.sizes, config);
  const base = await loadReplicateSource(source);
  if (!base) {
    throw new Error("复刻模式：未能取到基稿 HTML（请提供 sourceStickerId 或 useCurrentCanvas）");
  }

  const perturb = source.perturb || {};
  const dims: string[] = [];
  if (perturb.palette !== false) dims.push("配色");
  if (perturb.font !== false) dims.push("字体");
  if (perturb.layout !== false) dims.push("构图");
  if (perturb.copy !== false) dims.push("文案");
  if (!dims.length) dims.push("配色", "字体");

  const total = variants * sizes.length;
  const plan = sizes
    .map((size, si) =>
      Array.from({ length: variants }, (_, v) =>
        `${si * variants + v + 1}. 尺寸 ${size.width}x${size.height}（${size.label}） 变体${v + 1}（扰动：${dims[(si * variants + v) % dims.length]}）`,
      ).join("\n"),
    )
    .join("\n");

  let response: any;
  try {
    response = await directChat({
      messages: [
        {
          role: "system",
          content: `你是设计复刻策划助手。用户会给你一张「基稿设计 HTML」和一张「变体槽位表」。请为每个槽位产出一个复刻变体 brief。

要求：
- 【同系列兄弟款·硬性】变体必须与基稿属于同一主题、同一气质：主文案含义保持相近或相同，不得换成完全不同的主题/情绪（例如基稿是「小猪存钱罐·可爱治愈」，变体不能变成「紫金神秘·偏财运」）。
- 【保持不变】主题、配色家族（同一色系内可微调色相/明度）、字体气质、构图骨架、装饰逻辑。
- 【只在指定维度变化·幅度有限】换配色=同色系内换色相/明度/冷暖；换字体=同气质字体族内替换（如手写↔手写、宋↔宋）；换构图=镜像/主文案微移/装饰换位换形；换文案=同义改写（不换主题）。不是简单换背景色，也不是整套重来。
- 主文案几何中心必须落在画布正中心 (50%,50%)，只对主文案容器用 translate(-50%,-50%)；副文案挂在正下方；不要把主+副整体居中。
- 文字必须完整显示、不得截断；字号不超过画布高度的 26%（两行时每行 ≤14%）；禁止 vw/vh/clamp 做字号。
- 背景至少三层（渐变底 + 纹理肌理 + 至少两个具象插画/光影），不要大片纯色空白。
- 不要画外框/圆环/角括号等边框装饰。
- 输出必须是 JSON 数组，顺序与槽位表一致，共 ${total} 项。每项格式：
{ "title": "短标题", "prompt": "给设计 agent 的完整自然语言需求", "width": 0, "height": 0, "transparentBackground": false, "resourceHints": [], "saveName": "保存名称", "description": "简短描述", "keywords": [], "qualityTarget": 7 }
- 不要在 brief 里要求保存，保存由生产流水线处理。`,
        },
        {
          role: "user",
          content: `基稿名称：${base.name}\n${base.description ? `基稿说明：${base.description}\n` : ""}\n变体槽位表（共 ${total} 项，输出顺序必须与此一致）：\n${plan}\n\n基稿 HTML：\n${base.htmlContent.slice(0, 20000)}`,
        },
      ],
      temperature: 0.8,
      maxTokens: 5000,
      timeoutMs: AI_TIMEOUTS.brief,
    });
  } catch (error) {
    console.warn("[Batch] 复刻 brief 编译失败，改用本地模板:", error);
    return buildReplicateFallbackBriefs(base, sizes, variants, dims, config);
  }

  const parsed = parseChatResponse(response);
  const rawItems = parseJsonArray(parsed?.content || "");
  if (!rawItems.length) {
    console.warn("[Batch] 复刻 brief 解析为空，改用本地模板");
    return buildReplicateFallbackBriefs(base, sizes, variants, dims, config);
  }

  const briefs: StickerBrief[] = [];
  rawItems.forEach((rawItem, i) => {
    const sizeIndex = Math.floor(i / variants);
    const variantIndex = i % variants;
    const size = sizes[sizeIndex] || sizes[0];
    if (!size) return;
    const brief = normalizeBrief(rawItem, briefs.length, config);
    brief.width = size.width;
    brief.height = size.height;
    brief.sourceHtml = base.htmlContent;
    brief.saveName = truncateText(
      `复刻·${base.name.slice(0, 8)}·${size.label}·v${variantIndex + 1}`,
      30,
    );
    brief.title = brief.saveName;
    briefs.push(brief);
  });

  if (!briefs.length) {
    console.warn("[Batch] 复刻 brief 全部被丢弃，改用本地模板");
    return buildReplicateFallbackBriefs(base, sizes, variants, dims, config);
  }
  console.log(`[Batch] 复刻：「${base.name}」→ ${briefs.length} 个变体`);
  return briefs;
}

/** 复刻本地兜底：直接按槽位生成扰动 brief */
function buildReplicateFallbackBriefs(
  base: { htmlContent: string; name: string; description: string },
  sizes: Array<{ width: number; height: number; label: string }>,
  variants: number,
  dims: string[],
  config: NormalizedBatchConfig,
): StickerBrief[] {
  const briefs: StickerBrief[] = [];
  sizes.forEach((size) => {
    for (let v = 0; v < variants; v++) {
      const dim = dims[(briefs.length) % dims.length];
      const saveName = truncateText(`复刻·${base.name.slice(0, 8)}·${size.label}·v${v + 1}`, 30);
      briefs.push({
        title: saveName,
        prompt: [
          `请复刻下面这张设计，产出一个「${dim}」维度有明显变化的变体。`,
          `基稿说明：${base.description || base.name}。`,
          `要求：保留基稿的配色气质/字体气质/构图骨架；这次主要在【${dim}】上做变化，不要只是换背景色。`,
          `画布 ${size.width}x${size.height}（${size.label}）；主文案几何中心落在画布正中心(50%,50%)，副文案挂其下；文字完整不截断、字号不超过画布高度的 26%；背景至少三层、不要大片纯色空白；不要画边框。`,
          `基稿 HTML：\n${base.htmlContent.slice(0, 12000)}`,
        ].join("\n"),
        width: size.width,
        height: size.height,
        transparentBackground: false,
        resourceHints: [],
        saveName,
        description: `复刻「${base.name}」的${dim}变体`,
        keywords: ["复刻", dim, base.name],
        qualityTarget: 7,
        groupIndex: 0,
        memberIndex: v,
        sourceHtml: base.htmlContent,
      });
    }
  });
  return briefs;
}

/**
 * 图片复刻：以用户提供的图片为视觉参考（作为 referenceImage 喂给视觉模型），
 * 让模型读图后重建出 HTML 设计（神似路线，不直接贴图）。
 */
async function generateImageBriefs(
  config: NormalizedBatchConfig,
): Promise<StickerBrief[]> {
  const source = config.taskSource;
  if (source?.kind !== "image") return [];

  const imageUrl = String(source.imageUrl || "").trim();
  if (!imageUrl) throw new Error("图片复刻模式：缺少 imageUrl");

  const variants = clampNumber(source.variants, 1, 10, 1);
  const sizes = normalizeInspirationSizes(source.sizes, config);

  const briefs: StickerBrief[] = [];
  // 带文案清单的 instruction：开启文字白名单 + 尽量提取期望背景色做配色锁
  const instruction = String(source.instruction || "");
  const bgMatch = instruction.match(/底色?\s*(#[0-9a-fA-F]{6})|background:\s*(#[0-9a-fA-F]{6})/);
  const expectedBackground = bgMatch ? (bgMatch[1] || bgMatch[2]) : undefined;
  const hasCopyList = /文案清单|文案唯一来源/.test(instruction);
  const expectVerticalMain = /竖排|writing-mode/.test(instruction);

  sizes.forEach((size) => {
    for (let v = 0; v < variants; v++) {
      const saveName = truncateText(`图片复刻·${size.label}·v${v + 1}`, 30);
      // instruction 带文案清单时：清单是唯一文案来源；否则回落到「照抄图上文字」
      const hasCustomCopy = Boolean(source.instruction);
      const prompt = [
        "参考图是用户提供的设计参考（可能是商品图或印花图）。请仔细看图，提取其中的印花图案、配色、字体气质与构图，重建成一份完整的 HTML 设计。",
        hasCustomCopy
          ? "【文案唯一来源·最高优先级】「补充要求」里的文案清单是本设计唯一文案来源，必须逐字使用清单文本；禁止重新解读/OCR 参考图上的文字来替代清单（图上书法/狂草极易误读）；禁止自创、增删或改写清单之外的任何文字（含拼音、英文、年份、口号、落款等装饰文字）。"
          : "【主副文案必须照抄·最高优先级】参考图上出现的文字必须**逐字原样保留**（主文案就是参考图的主文案，副文案同理），严禁自创主题、换词或改成别的句子。若参考图上确实没有任何文字，才允许自行拟一句贴合其气质的文案。",
        "【配色与气质以参考图为准】必须提取参考图的主色、明暗关系与整体氛围（例如暗棕/电影感/低饱和/金色点缀），严禁换成其它色系或更鲜艳的通用风格。",
        "【字体气质对齐】参考图是宋体就用宋体、是手写就用同气质手写体。",
        "【重要】不要直接把参考图贴进画布，也不要出现商品本体、包装、拍摄背景；只重建「印花图案本身」。",
        "【禁止搜索空转】每类资源（字体/贴纸）最多检索 2 次；仍无果就选最接近候选，或用 CSS/SVG 兜底（印章/箭头等纯装饰允许 SVG），然后立即继续。禁止反复重搜同一类资源。必须在 10 次工具调用以内调用 canvas.addHtml 输出作品，addHtml 之前禁止宣告完成。",
        source.instruction
          ? `【补充要求（文案与布局以此为准，优先级高于下方默认布局建议）】\n${source.instruction}`
          : "",
        `画布尺寸必须为 ${size.width}x${size.height}（${size.label}）。`,
        hasCustomCopy
          ? "主文案几何中心落在画布正中心 (50%,50%)；文案位置关系按补充要求执行。"
          : "主文案的几何中心必须落在画布正中心 (50%,50%)，只对主文案容器用 position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)；副文案挂在主文案正下方；不要把主+副整体居中。",
        "文字必须完整显示、不截断；字号不超过画布高度的 26%（两行时每行 ≤14%）；禁止用 vw/vh/clamp 做字号。",
        hasCustomCopy
          ? "背景配色与装饰按补充要求执行；无要求的部分可加主题色渐变底与纹理肌理。"
          : "背景至少三层（主题色渐变底 + 纹理肌理 + 至少两个具象插画/光影），不要大片纯色空白；不要画外框/圆环/角括号。",
        "用 canvas.addHtml 输出完整 HTML/CSS；完成后不要保存，保存由流水线处理。",
      ]
        .filter(Boolean)
        .join("\n");

      briefs.push({
        title: saveName,
        prompt,
        width: size.width,
        height: size.height,
        transparentBackground: false,
        resourceHints: [],
        saveName,
        description: `图片复刻（${size.label} v${v + 1}）`,
        keywords: ["图片复刻", size.label],
        qualityTarget: 7,
        groupIndex: 0,
        memberIndex: v,
        referenceImage: imageUrl,
        strictTextWhitelist: hasCopyList,
        expectedBackground,
        expectVerticalMain,
      });
    }
  });

  console.log(`[Batch] 图片复刻：${imageUrl.slice(0, 60)} → ${briefs.length} 个 brief`);
  return briefs;
}

async function generateInspirationBriefs(
  config: NormalizedBatchConfig,
): Promise<StickerBrief[]> {
  const source = config.taskSource;
  if (source?.kind !== "inspirations") return [];

  const variants = clampNumber(source.variantsPerInspiration, 1, 10, 1);
  const limit = clampNumber(source.limit, 1, 50, 10);

  const items = await fetchInspirations({
    ids: source.inspirationIds,
    limit,
  });
  if (!items.length) {
    throw new Error(
      `灵感模式：未取到待生产灵感（指定 ids=${source.inspirationIds?.length ?? 0} 个，limit=${limit}）`,
    );
  }

  // 尺寸组合在代码里确定性生成，不依赖 LLM 自觉
  const sizes = normalizeInspirationSizes(source.sizes, config);
  const slots: InspirationSlot[] = [];
  items.forEach((item, inspirationIndex) => {
    sizes.forEach((size) => {
      for (let variant = 0; variant < variants; variant++) {
        slots.push({ inspirationIndex, inspirationId: item.id, size, variant });
      }
    });
  });
  const total = slots.length;

  const slotPlan = slots
    .map(
      (slot, i) =>
        `${i + 1}. 灵感#${slot.inspirationIndex + 1}「${
          items[slot.inspirationIndex].title
        }」 尺寸 ${slot.size.width}x${slot.size.height}（${slot.size.label}） 变体${
          slot.variant + 1
        }`,
    )
    .join("\n");

  const digests = items.map((item, index) => toInspirationDigest(item, index));

  let response: any;
  try {
    response = await directChat({
      messages: [
        {
          role: "system",
          content: `你是设计生产任务策划助手。用户会给你一组「设计灵感」和一张「生产槽位表」，请为每个槽位编译一个可直接执行的设计 brief。

输出必须是 JSON 数组，不要写 Markdown 或解释。数组里每项格式如下：
{
  "title": "短标题",
  "prompt": "给设计 agent 的完整自然语言需求",
  "width": 3000,
  "height": 2000,
  "transparentBackground": false,
  "resourceHints": ["素材或字体检索方向"],
  "saveName": "保存名称",
  "description": "保存到自定义贴纸库的简短描述",
  "keywords": ["关键词1", "关键词2"],
  "qualityTarget": 7
}

要求：
- 必须输出正好 ${total} 项，顺序与槽位表严格一一对应（第 N 项对应槽位表第 N 行）。
- 每项 width/height 必须与所属槽位尺寸一致，并在 prompt 里明确写出画布尺寸。
- 【带参考图的灵感·最高优先级】digest 里有 referenceImages 的灵感，后续设计 agent 会**看图执行**。这类灵感的 brief 严禁发明主题、主副文案、配色、字体：prompt 里只写「严格按参考图重建其印花设计：图上文字逐字保留、提取印花本体内部真实底色与配色（严禁被周边桌面/键盘等外部拍摄场景干扰）、字体气质对齐参考图、构图与装饰逻辑复现参考图」+ 本条灵感的 promptHints/avoidNotes + 版式尺寸要求。把你对画面的猜测全部省略，交给看图环节。
- 不带图的灵感才允许把模糊想法落成明确的执行指令：主文案、副文案、配色（给具体色值）、字体方向、构图、装饰元素。
- 同一灵感的不同尺寸/变体必须同系列（配色与字体气质一致），但构图、装饰元素、文案侧重要有差异；方形与横向构图要分别重新设计版面，不要简单拉伸。
- 必须遵守每条灵感的 avoidNotes（避让事项）。
- 【主文案居中·硬性】主文案的**几何中心**必须落在画布正中心 (50%,50%)，只对主文案容器用 translate(-50%,-50%)；副文案挂在主文案正下方。**绝不能把主+副文案整体居中**（那样主文案会偏上、视觉不居中）。这两行文字是画面主角，字号要有明显主次。
- 设计请大胆自由发挥，不要过度限制：装饰、纹样、光影、边框、材质肌理、插画元素、配色与字体风格都鼓励尝试，画面要丰富、有层次、有氛围，避免空洞单调。
- 只避免与主题无关的杂乱填充文字（无意义编号、水印、乱码英文）；如确有必要，允许少量呼应主题的英文或拼音点缀。
- 背景要有内容、不要大片空白。
- 【文字必须完整显示】主副文案必须完整落在画布内、不得溢出或被裁切：长文案要允许换行（white-space:normal; overflow-wrap:anywhere）或按字数减小字号；禁止使用 text-overflow:ellipsis、white-space:nowrap 等会把文案截断的写法。
- 【字号上限·硬性】主文案单行高度不得超过画布高度的 26%（两行时每行 ≤14%），副文案约为主文案的 1/4-1/3；字号用 var(--type-xxx) 或基于画布尺寸的 px，**禁止用 vw/vh/clamp（那是浏览器视口单位，会和画布尺寸不匹配）**；整体文字块宽度不得超过画布宽度的 84%。
- 如需要图片或字体资源，只写检索方向，不要编造 URL 或资源 ID。
- 不要在 brief 里要求保存，保存由生产流水线处理。`,
        },
        {
          role: "user",
          content: `灵感列表（JSON）：
${JSON.stringify(digests, null, 2)}

生产槽位表（共 ${total} 项，输出顺序必须与此一致）：
${slotPlan}

${config.customInstructions ? `额外约束：${config.customInstructions}\n` : ""}请输出 ${total} 个 brief。`,
        },
      ],
      temperature: 0.85,
      maxTokens: 6000,
      timeoutMs: AI_TIMEOUTS.brief,
    });
  } catch (error) {
    console.warn("[Batch] 灵感 brief 编译失败，改用本地模板:", error);
    batchProgress.error = `灵感模式：LLM 编译失败（${
      (error as any)?.message || error
    }），已用本地模板生成 brief`;
    return buildInspirationFallbackBriefs(items, slots, config);
  }

  const parsed = parseChatResponse(response);
  const rawItems = parseJsonArray(parsed?.content || "");
  if (!rawItems.length) {
    console.warn("[Batch] 灵感 brief 解析为空，改用本地模板");
    batchProgress.error =
      "灵感模式：LLM 未返回可用 brief，已用本地模板生成 brief";
    return buildInspirationFallbackBriefs(items, slots, config);
  }

  const briefs: StickerBrief[] = [];
  rawItems.forEach((rawItem, i) => {
    const slot = slots[i];
    if (!slot) return;
    const brief = normalizeBrief(rawItem, briefs.length, config);
    // 尺寸以槽位为准，避免 LLM 写错
    brief.width = slot.size.width;
    brief.height = slot.size.height;
    brief.inspirationId = slot.inspirationId;
    brief.groupIndex = 0;
    brief.memberIndex = slot.variant;
    // 灵感带图时必须作为视觉参考传给设计 agent：像「鼠标垫印花」这种正文只有标题、
    // 设计意图全在图里的灵感，丢了图就等于丢了全部信息。
    const refImages = items[slot.inspirationIndex].images || [];
    if (refImages.length) {
      brief.referenceImage = refImages[0];
    }
    const base = truncateText(items[slot.inspirationIndex].title, 10);
    brief.saveName = truncateText(
      `${base}·${slot.size.label}${variants > 1 ? `·v${slot.variant + 1}` : ""}`,
      30,
    );
    brief.title = brief.saveName;
    briefs.push(brief);
  });

  if (!briefs.length) {
    console.warn("[Batch] 灵感 brief 全部被丢弃，改用本地模板");
    batchProgress.error =
      "灵感模式：LLM 返回的 brief 无法对应到槽位，已用本地模板生成 brief";
    return buildInspirationFallbackBriefs(items, slots, config);
  }

  console.log(
    `[Batch] 灵感驱动：${items.length} 条灵感 × ${sizes.length} 尺寸 × ${variants} 变体 → ${briefs.length} 个 brief`,
  );
  return briefs;
}

const INSPIRATION_VARIATIONS = [
  "主文案居中偏上，副文案紧跟其下，背景用远山与雾霭铺满，整体留白克制",
  "主文案居中，四周用花枝草木与柔和光晕环绕，画面饱满通透",
  "主文案居中，背景用大面积渐变天光加地景剪影，情绪开阔",
  "主文案居中，背景用细密纸纹肌理与淡雅水波，安静内敛",
];

/**
 * LLM 编译失败时的本地兜底：按槽位表直接用灵感字段拼出可执行 brief，
 * 保证「灵感 → 生产」不断链。
 */
function buildInspirationFallbackBriefs(
  items: DesignInspirationItem[],
  slots: InspirationSlot[],
  config: NormalizedBatchConfig,
): StickerBrief[] {
  return slots.map((slot, index) => {
    const item = items[slot.inspirationIndex];
    const variation =
      INSPIRATION_VARIATIONS[index % INSPIRATION_VARIATIONS.length];
    const hasImage = (item.images || []).length > 0;
    const prompt = hasImage
      ? [
          `请设计一张 ${slot.size.width}x${slot.size.height}（${slot.size.label}）的设计作品。`,
          `参考图是本灵感的唯一事实来源，必须严格按参考图重建其印花设计：图上出现的文字逐字原样保留（主文案=参考图主文案），配色、字体气质、构图与装饰逻辑全部对齐参考图，严禁自行发明主题或换成别的色系；不要把参考图直接贴进画布，也不要出现商品本体、包装、拍摄背景。`,
          item.promptHints ? `补充要求：${item.promptHints}` : "",
          item.avoidNotes ? `必须避让：${item.avoidNotes}` : "",
          `画布尺寸严格为 ${slot.size.width}x${slot.size.height}，主文案几何中心落在画布正中心(50%,50%)，只对主文案容器用 translate(-50%,-50%)，副文案挂其正下方；文字完整不截断；背景要有内容不要大片空白；不要画边框。`,
        ]
          .filter(Boolean)
          .join("\n")
      : [
          `请设计一张 ${slot.size.width}x${slot.size.height}（${slot.size.label}）的设计作品，主题：${item.title}。`,
          `灵感描述：${item.content}`,
          item.promptHints ? `明确要求：${item.promptHints}` : "",
          item.keywords?.length ? `关键词：${item.keywords.join("、")}` : "",
          `构图方向：${variation}。`,
          item.avoidNotes ? `必须避让：${item.avoidNotes}` : "",
          "主文案与副文案从灵感描述中提炼，主文案水平垂直居中，副文案紧贴其下；只允许主副文案两行文字，不要印章、编号、英文、落款；背景要有内容不要大片空白；不要画边框。",
        ]
          .filter(Boolean)
          .join("\n");

    const base = truncateText(item.title, 10);
    const saveName = truncateText(
      `${base}·${slot.size.label}${
        slot.variant > 0 ? `·v${slot.variant + 1}` : ""
      }`,
      30,
    );

    return {
      title: saveName,
      prompt,
      width: slot.size.width,
      height: slot.size.height,
      transparentBackground: false,
      resourceHints: [...(item.keywords || []), item.category || ""].filter(
        Boolean,
      ),
      saveName,
      description: `${item.title}（灵感驱动自动生产 · ${slot.size.label}）`,
      keywords: item.keywords || [],
      qualityTarget: 7,
      groupIndex: 0,
      memberIndex: slot.variant,
      inspirationId: item.id,
      referenceImage: (item.images || [])[0],
    };
  });
}

/**
 * 产出后回写灵感状态（成功置 done 并累计数量；失败保持 pending 以便下次重试）。
 */
async function reportInspirationIfNeeded(
  item: BatchItem,
  config: NormalizedBatchConfig,
) {
  const source = config.taskSource;
  if (source?.kind !== "inspirations") return;
  if (source.reportBack === false) return;
  const id = item.brief?.inspirationId;
  if (!id) return;

  if (item.status === "done") {
    await reportInspirationProduced(id, {
      status: "done",
      productUrl: item.savedUrl,
      producedDelta: 1,
    });
  } else {
    console.warn(
      `[Batch] 灵感 ${id} 本轮未产出（${item.status}），保持待生产以便重试`,
    );
  }
}

function parseJsonArray(content: string): any[] {
  const text = content.trim();
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {}

  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch {}
  }

  return [];
}

function fallbackBriefs(config: NormalizedBatchConfig): StickerBrief[] {
  return ensureExactBriefs([], config);
}

const FALLBACK_VARIATIONS = [
  "主体居中，强调清晰轮廓、白边和第一眼识别度",
  "使用不同姿态或动作，加入一个有记忆点的小道具",
  "做成局部特写或近景构图，突出材质、表情或笔触细节",
  "加入一句短文案，让画面更像可收藏的社交贴纸",
  "采用场景化小插画构图，加入不同前景和背景装饰",
  "换成徽章、印章或异形贴纸构图，增强系列变化",
];

function buildFallbackBriefRaw(
  config: NormalizedBatchConfig,
  index: number,
): Record<string, any> {
  const base = config.description || config.style || "创意贴纸";
  const variation = FALLBACK_VARIATIONS[index % FALLBACK_VARIATIONS.length];
  const groupIndex = Math.floor(index / config.membersPerGroup);
  const memberIndex = index % config.membersPerGroup;
  const positionLabel =
    config.outputKind === "group"
      ? `第 ${groupIndex + 1} 套的第 ${memberIndex + 1}/${config.membersPerGroup} 个成员`
      : `第 ${index + 1} 个独立设计`;

  return {
    title: `${truncateText(base, 18)} ${positionLabel}`,
    prompt: [
      `做一张${config.style || "自由风格"}的贴纸，主题来自：${base}。`,
      `这是${positionLabel}，变化方向：${variation}。`,
      "需要和同系列其他贴纸在主体姿态、构图、装饰元素或短文案上明显不同，画面完整、有识别度。",
    ].join(""),
    resourceHints: [base, config.style].filter(Boolean),
    saveName: `${truncateText(base, 18)} ${positionLabel}`,
    description: `${truncateText(base, 36)}自动制作，${positionLabel}`,
    keywords: [base, config.style, "自动制作", positionLabel].filter(Boolean),
  };
}

function ensureExactBriefs(
  briefs: StickerBrief[],
  config: NormalizedBatchConfig,
): StickerBrief[] {
  const result: StickerBrief[] = [];
  const totalDesignCount = getTotalDesignCount(config);

  for (const brief of briefs) {
    if (result.length >= totalDesignCount) break;
    if (!hasSimilarBrief(brief, result)) {
      result.push(brief);
    }
  }

  while (result.length < totalDesignCount) {
    result.push(
      normalizeBrief(
        buildFallbackBriefRaw(config, result.length),
        result.length,
        config,
      ),
    );
  }

  return ensureUniqueBriefLabels(result.slice(0, totalDesignCount));
}

function hasSimilarBrief(
  brief: StickerBrief,
  existing: StickerBrief[],
): boolean {
  const key = comparableBriefKey(brief);
  const promptKey = comparablePromptKey(brief);
  return existing.some(
    (item) =>
      comparableBriefKey(item) === key ||
      comparablePromptKey(item) === promptKey,
  );
}

function comparableBriefKey(brief: StickerBrief): string {
  return normalizeComparable(`${brief.title}\n${brief.prompt}`).slice(0, 180);
}

function comparablePromptKey(brief: StickerBrief): string {
  return normalizeComparable(brief.prompt).slice(0, 180);
}

function normalizeComparable(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。、“”‘’：:；;,.!?！？【】\[\]()（）「」]/g, "");
}

function ensureUniqueBriefLabels(briefs: StickerBrief[]): StickerBrief[] {
  const seenTitles = new Map<string, number>();
  const seenNames = new Map<string, number>();

  return briefs.map((brief, index) => {
    const titleCount = seenTitles.get(brief.title) || 0;
    const nameCount = seenNames.get(brief.saveName) || 0;
    seenTitles.set(brief.title, titleCount + 1);
    seenNames.set(brief.saveName, nameCount + 1);

    return {
      ...brief,
      title:
        titleCount > 0
          ? truncateText(`${brief.title} ${index + 1}`, 28)
          : brief.title,
      saveName:
        nameCount > 0
          ? truncateText(`${brief.saveName} ${index + 1}`, 30)
          : brief.saveName,
    };
  });
}

function normalizeBrief(
  raw: any,
  index: number,
  config: NormalizedBatchConfig,
): StickerBrief {
  const groupIndex = Math.floor(index / config.membersPerGroup);
  const memberIndex = index % config.membersPerGroup;
  const title =
    truncateText(
      raw?.title ||
        raw?.saveName ||
        `${config.description || "贴纸"} ${index + 1}`,
      28,
    ) || `贴纸 ${index + 1}`;
  const prompt =
    String(raw?.prompt || raw?.description || title).trim() ||
    `做一张主题为「${title}」的贴纸。`;
  const keywords = asStringArray(raw?.keywords);
  const resourceHints = asStringArray(raw?.resourceHints || raw?.resources);
  const width =
    getOptionalSize(raw?.width, raw?.size?.width, config.width) || (config.preserveCanvasSize ? 0 : 1024);
  const height =
    getOptionalSize(raw?.height, raw?.size?.height, config.height) || (config.preserveCanvasSize ? 0 : 1024);
  const transparentBackground =
    typeof raw?.transparentBackground === "boolean"
      ? raw.transparentBackground
      : config.transparentBackground;

  return {
    title,
    prompt,
    width,
    height,
    preserveCanvasSize: config.preserveCanvasSize,
    transparentBackground,
    resourceHints,
    saveName: truncateText(raw?.saveName || title, 30),
    description: truncateText(raw?.description || prompt, 120),
    keywords: keywords.length
      ? keywords
      : [title, config.style, "贴纸"].filter(Boolean),
    qualityTarget: clampNumber(
      raw?.qualityTarget,
      1,
      10,
      config.qualityThreshold,
    ),
    groupIndex,
    memberIndex,
  };
}

// ============ Single Item Pipeline ============

/**
 * 保存前自动审查：直接测量画布 DOM，检查尺寸/主文案居中/文字溢出/字号上限。
 * 无法测量时返回通过（不阻塞生产）。
 */
/** 从 brief 的 prompt 里提取主/副文案，用于「文案是否真的在画面上」的检查 */
function extractBriefTexts(brief: StickerBrief): string[] {
  const prompt = brief?.prompt || "";
  const out: string[] = [];
  const main = prompt.match(/(?:主文案|主标题|大标题)[「"'\[]([^」"'\]]+)[」"'\]]/);
  const sub = prompt.match(/(?:副文案|副标题|小标题)[「"'\[]([^」"'\]]+)[」"'\]]/);
  if (main?.[1]) out.push(main[1]);
  if (sub?.[1]) {
    // 确保副文案在 out 中永远处于 index > 0（副文案缺失只作建议，不作硬伤拦截）
    if (!main?.[1]) out.push("");
    out.push(sub[1]);
  }
  // 严格白名单场景：把 prompt 里所有「」引号文案全部纳入期望（徽章单字、竖排列等）
  if (brief?.strictTextWhitelist) {
    // 元词（提示词自身的措辞）不算文案，避免误报「缺副文案」或污染白名单
    const META = /补充要求|文案清单|文案|清单|参考图|印花图|画布|禁止|检索|布局|骨架|色值|主文案|副文案|标题|圆圈|印章|箭头|背景|保存|检索词|像素|单位|骨架|HTML|searchFont|searchSticker|font|image|复刻|名称|收尾|含/i;
    const all = prompt.match(/「([^」]{1,40})」/g) || [];
    for (const q of all) {
      const t = q.slice(1, -1);
      if (!t || META.test(t)) continue;
      if (!out.includes(t)) out.push(t);
    }
  }
  return out;
}

/** 保存前审查（调用共享审查模块：尺寸/文案/居中/溢出/字号/背景丰富度） */
async function auditCanvasBeforeSave(item: BatchItem) {
  // 尺寸确定性归一：不依赖模型自觉，审查前强制把画布设回 brief 尺寸
  // （实测出现过画布卡在默认 158×158、模型 setSize 重复旧值的失败）
  const w = Number(item.brief.width) || 0;
  const h = Number(item.brief.height) || 0;
  if (w > 0 && h > 0 && !item.brief.preserveCanvasSize) {
    try {
      await executeAITool("canvas.setSize", { width: w, height: h, unit: "px" });
    } catch (error) {
      console.warn("[Batch] 审查前强制 setSize 失败:", error);
    }
  }
  const result = await auditCurrentCanvas({
    expectedWidth: Number(item.brief.width) || undefined,
    expectedHeight: Number(item.brief.height) || undefined,
    expectedTexts: extractBriefTexts(item.brief),
    strictTextWhitelist: item.brief.strictTextWhitelist,
    expectedBackground: item.brief.expectedBackground,
    expectVerticalMain: item.brief.expectVerticalMain,
  });
  if (result.measured && result.issues.length) {
    console.log(
      `[Batch] 第 ${item.index + 1} 张审查指标:`,
      JSON.stringify(result.metrics),
    );
  }
  return result;
}

function buildAuditFixPrompt(brief: StickerBrief, issues: string[]): string {
  const hasCustomLayout =
    /HTML 骨架|writing-mode|竖排|右侧一列|左侧一列/.test(brief?.prompt || "");
  return [
    "上一版设计未通过自动审查，请只做必要修正，用 canvas.addHtml 重新输出完整 HTML 覆盖当前画面，不要更换主题。",
    `【必须修正】${issues.join("；")}`,
    hasCustomLayout
      ? "【硬性要求】保持原 brief 的布局骨架（竖排列关系按 brief 执行）；主文案几何中心落在画布正中心 (50%,50%)；所有文字与元素不得超出画布边界；文字完整不截断（不要 ellipsis/nowrap）。禁止自创清单外文字，配色按 brief 色值。"
      : "【硬性要求】主文案的几何中心落在画布正中心 (50%,50%)，只对主文案容器用 position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)，副文案挂在主文案正下方；所有文字与元素不得超出画布边界；文字完整不截断（不要 ellipsis/nowrap）；主文案字高不超过画布高度的 26%。",
    brief?.expectVerticalMain
      ? "【主文案竖排·必须】主文案必须是【一个容器一条竖列】：writing-mode:vertical-rl + text-orientation:upright + white-space:nowrap（防换列），文本直接写在一个 div 里，容器 height 给足（≥65%）；禁止拆成多个块/禁止 2+1 群组/禁止横排。"
      : "",
    "【禁止装饰文字】画面上不得出现清单之外的任何文字——包括拼音（如 RONGYIDE）、英文、年份、口号、落款、编号。发现一律删除。",
    `画布尺寸必须为 ${brief.width}x${brief.height}。主题：${brief.title}。`,
    // 重做必须沿用参考资源，否则会把已绑定的图片/字体/思路一并丢掉
    brief.resourceContext ? `【参考资源·必须保留】\n${brief.resourceContext}` : "",
    brief.htmlBindings && Object.keys(brief.htmlBindings).length
      ? `【资源绑定·必须继续使用】这些绑定必须原样传给 canvas.addHtml 的 htmlBindings，并在 HTML 中继续使用（图片 {{image.键.url}}、字体 font-family:{{font.键.family}}）：\n${JSON.stringify(brief.htmlBindings)}`
      : "",
  ].filter(Boolean).join("\n");
}

/**
 * 保存前审查：不通过则重做一次；仍不通过返回 false（调用方跳过保存）。
 */
async function ensureAuditPassed(
  item: BatchItem,
  signal: typeof controlSignal,
): Promise<boolean> {
  let audit = await auditCanvasBeforeSave(item);
  if (audit.ok) {
    if (audit.advisoryIssues.length) {
      console.log(`[Batch] 第 ${item.index + 1} 张审查建议：${audit.advisoryIssues.join("；")}`);
    }
    return true;
  }

  // ① 机械修复：缩小过大的主文案字号、给溢出文字限宽换行（改动会体现在随后渲染保存的成品里）
  try {
    const mod: any = await import("@/components/design/layout/canvas");
    const root: HTMLElement | null =
      (mod.currentCanvasControllerInstance?.value?.el as HTMLElement) ||
      (document.querySelector("#this_is_canvas_id") as HTMLElement | null);
    if (root) {
      const fixes = repairCanvasLayout(root, {
        allowTallMain: item.brief.expectVerticalMain,
      });
      if (fixes.length) {
        console.log(`[Batch] 第 ${item.index + 1} 张自动修复：${fixes.join("；")}`);
        audit = await auditCanvasBeforeSave(item);
        if (audit.ok) return true;
      }
    }
  } catch (error) {
    console.warn("[Batch] 自动修复失败:", error);
  }

  // ② 仍不通过则让模型重做（最多 2 次）
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (isStopped(signal)) return false;
    console.warn(
      `[Batch] 第 ${item.index + 1} 张审查未通过：${audit.issues.join("；")}，重做一次`,
    );
    item.status = "revising";
    try {
      await withTimeout(
        designAgent._runBatchItem(buildAuditFixPrompt(item.brief, audit.issues), {
          referenceImage: item.brief.referenceImage,
        }),
        AI_TIMEOUTS.batchDesign,
        `第 ${item.index + 1} 张审查修正`,
      );
    } catch (error) {
      console.warn("[Batch] 审查修正失败:", error);
      break;
    }
    audit = await auditCanvasBeforeSave(item);
    if (audit.ok) return true;
  }

  item.error = `审查未通过：${audit.issues.join("；")}`;
  return false;
}

async function runSingleDesign(
  item: BatchItem,
  config: NormalizedBatchConfig,
  signal: typeof controlSignal,
): Promise<void> {
  await waitIfPaused();
  if (isStopped(signal)) {
    markStopped(item);
    return;
  }

  item.status = "designing";
  try {
    // 带视觉参考图的任务读图+设计更耗时，超时预算上浮 50%
    const designTimeout = item.brief.referenceImage
      ? Math.round(AI_TIMEOUTS.batchDesign * 1.5)
      : AI_TIMEOUTS.batchDesign;
    await withTimeout(
      designAgent._runBatchItem(
        buildDesignPrompt(item.brief, item.index, config),
        { referenceImage: item.brief.referenceImage },
      ),
      designTimeout,
      `第 ${item.index + 1} 张设计`,
    );
  } catch (e: any) {
    failItem(item, `生成失败: ${e?.message || e}`);
    return;
  }

  await waitIfPaused();
  if (isStopped(signal)) {
    markStopped(item);
    return;
  }

  if (!config.enableAnalysisOptimization) {
    if (config.saveMode === "draft") {
      item.status = "done";
      return;
    }
    // 保存前自动审查：不通过则重做一次，仍不通过则不保存
    const passed = await ensureAuditPassed(item, signal);
    if (!passed) {
      failItem(item, item.error || "审查未通过，已跳过保存");
      return;
    }
    await saveItem(item, config);
    return;
  }

  const firstScore = await evaluateItem(item);
  let score = firstScore;

  while (
    score !== null &&
    score < item.brief.qualityTarget &&
    item.revisionCount < config.maxRevisions
  ) {
    await waitIfPaused();
    if (isStopped(signal)) {
      markStopped(item);
      return;
    }

    item.status = "revising";
    item.revisionCount += 1;
    try {
      await withTimeout(
        designAgent._runBatchItem(buildRevisionPrompt(score, item.brief), {
          referenceImage: item.brief.referenceImage,
        }),
        AI_TIMEOUTS.batchDesign,
        `第 ${item.index + 1} 张修订`,
      );
      score = await evaluateItem(item);
    } catch (e: any) {
      console.warn("[Batch] 修订失败:", e);
      break;
    }
  }

  if (
    item.score !== null &&
    item.score < item.brief.qualityTarget &&
    config.failureStrategy === "skip"
  ) {
    item.status = "skipped";
    item.error = `评分 ${item.score}/10 低于门槛 ${item.brief.qualityTarget}/10`;
    return;
  }

  if (
    item.score !== null &&
    item.score < item.brief.qualityTarget &&
    config.failureStrategy === "stop"
  ) {
    failItem(
      item,
      `评分 ${item.score}/10 低于门槛 ${item.brief.qualityTarget}/10`,
    );
    controlSignal.value = "stopped";
    batchProgress.status = "stopped";
    return;
  }

  if (config.saveMode === "draft") {
    item.status = "done";
    return;
  }

  // 保存前自动审查（与无优化分支同一套硬指标）
  const passed = await ensureAuditPassed(item, signal);
  if (!passed) {
    failItem(item, item.error || "审查未通过，已跳过保存");
    return;
  }

  await saveItem(item, config);
}

function buildDesignPrompt(
  brief: StickerBrief,
  index: number,
  config?: NormalizedBatchConfig,
): string {
  const resourceHint = brief.resourceHints.length
    ? `可以按需要搜索这些资源方向：${brief.resourceHints.join("、")}。`
    : "可以按需要自行搜索图片、字体、文案或设计知识资源。";

  const groupContext =
    config?.outputKind === "group"
      ? `这是第 ${brief.groupIndex + 1} 套组图的第 ${brief.memberIndex + 1}/${config.membersPerGroup} 个成员。【组图视觉一致性极高要求】：同组内所有成员必须${brief.preserveCanvasSize ? '保持当前画布尺寸不变' : `使用完全相同的画布尺寸（${brief.width}x${brief.height}）`}、完全相同的背景色彩/渐变/红纸底色、完全相同的字体和边框边距，严禁自由发挥替换颜色或更换排版风格！请仅替换核心文字文案或主画面主体内容。`
      : "这是一个独立设计，不要与其他结果合并为组图。";

  const sizeInstruction = brief.preserveCanvasSize
    ? `尺寸：保持当前画布尺寸不变。【严格禁止】调用 canvas.setSize 或任何修改画布尺寸的操作。`
    : `尺寸：${brief.width}x${brief.height}`;

  return `制作第 ${index + 1} 张设计。

${sizeInstruction}
${brief.transparentBackground ? "背景要求：适合贴纸使用，可以做透明感、白边或便于抠边的主体。" : "背景要求：按设计效果自由处理。"}
${buildSizeGuide(brief)}
主题：${brief.title}
需求：${brief.prompt}
${resourceHint}
${groupContext}
${brief.referenceImage ? `【视觉参考图·必须先看图】参考图是本次设计的唯一事实来源，动手前必须仔细读图并严格执行：
- 【冲突裁决】上方 brief 里的主题/主副文案/配色若与参考图冲突，**一律以参考图为准，忽略 brief 的冲突部分**。
- 【印花底色防干扰】参考图常为商品拍摄图（如鼠标垫平铺在桌面上，周围有木桌、键盘、摄影背景或反光）。**必须只关注印花主体本身**：提取印花内部的真实底色（如深酒红/暗红/墨色），**严禁把周边的桌面、键盘、环境光等外部场景色当作背景底色**，严禁漂移为无关的蓝橙色！
- 参考图上出现的文字必须**逐字原样保留**（主文案=参考图主文案，副文案同理），严禁自创主题、换词或改写成别的句子；只有参考图确实无文字时才可自拟一句贴合气质的文案。
- 配色以参考图为准：提取印花核心主色、明暗关系与整体氛围，严禁换成别的色系或更鲜艳的通用风格。
- 字体气质对齐：参考图是宋体就用宋体、是手写就用同气质手写体。
- 构图与装饰逻辑（印花图案、元素布局、留白节奏）尽量复现参考图的视觉语言。
- 不要直接把参考图贴进画布，也不要出现商品本体、包装、拍摄背景；只重建设计/印花本身。` : ""}
${brief.sourceHtml ? `【复刻基稿】以下是原设计 HTML，请在保留其视觉语言（配色气质/字体气质/构图骨架/装饰逻辑）的基础上完成本次变体：\n${brief.sourceHtml.slice(0, 16000)}` : ""}
${brief.resourceContext ? `【参考资源·设计思路】\n${brief.resourceContext}` : ""}
${brief.htmlBindings && Object.keys(brief.htmlBindings).length ? `【资源绑定·必须使用】请把这些绑定原样传给 canvas.addHtml 的 htmlBindings 参数，并在 HTML 中至少各使用一次（图片用 {{image.键.url}}，字体用 font-family:{{font.键.family}}）。绑定资源未被使用视为不合格：\n${JSON.stringify(brief.htmlBindings)}` : ""}
${config?.customInstructions ? `附加约束：${config.customInstructions}` : ""}

只制作这一张，不要启动批量任务。请完成画布设计即可，不要询问用户，不要请求反馈，不要调用分析、评估、保存或导出工具。`;
}

async function evaluateItem(item: BatchItem): Promise<number | null> {
  item.status = "evaluating";
  try {
    const evaluation = await withTimeout(
      evaluateCanvasVisual(),
      AI_TIMEOUTS.batchEvaluate,
      `第 ${item.index + 1} 张评估`,
    );
    if (evaluation) {
      item.score = evaluation.score;
      return evaluation.score;
    }
  } catch (e: any) {
    console.warn("[Batch] 评估失败，跳过:", e);
  }
  return null;
}

/**
 * 把资源引用编译出的「思路上下文 + 绑定资源 + 视觉参考」附到每个 brief 上。
 * 编译一次、全部 brief 共用；取数失败只告警不阻塞。
 */
async function attachResources(
  briefs: StickerBrief[],
  config: NormalizedBatchConfig,
): Promise<StickerBrief[]> {
  const refs = config.resources || [];
  // 诊断：把资源接入情况写进 batchProgress.error，便于外部（MCP）观测
  batchProgress.error = `资源诊断: resources=${refs.length} 任务来源=${config.taskSource?.kind || "description"}`;
  if (!refs.length) return briefs;

  const ctx = await buildResourceContext(refs);
  ctx.warnings.forEach((w) => console.warn("[Batch][资源] " + w));
  batchProgress.error = `资源诊断: resources=${refs.length} 上下文=${ctx.promptContext.length}字 绑定=${JSON.stringify(ctx.htmlBindings).length}字 警告=${ctx.warnings.length}`;

  return briefs.map((brief) => ({
    ...brief,
    resourceContext: [brief.resourceContext, ctx.promptContext].filter(Boolean).join("\n\n"),
    htmlBindings: { ...(brief.htmlBindings || {}), ...ctx.htmlBindings },
    resourceHints: Array.from(new Set([...(brief.resourceHints || []), ...ctx.resourceHints])),
    referenceImage: brief.referenceImage || ctx.referenceImage,
  }));
}

/** 按画布尺寸给出具体字号/内边距建议（比抽象描述更易被模型遵守） */
function buildSizeGuide(brief: StickerBrief): string {
  const W = Number(brief.width) || 3000;
  const H = Number(brief.height) || 1376;
  const short = Math.min(W, H);
  const mainPx = Math.round(short * 0.16);
  const mainMaxPx = Math.round(H * 0.24);
  const subPx = Math.max(16, Math.round(mainPx * 0.34));
  const pad = Math.round(short * 0.10);
  return [
    `【尺寸与字号建议·画布 ${W}x${H} px】`,
    `主文案 font-size 建议 ${mainPx}px（不得超过 ${mainMaxPx}px，即画布高的 24%）；副文案约 ${subPx}px；四周内边距约 ${pad}px；文字块宽度不超过画布宽的 84%。`,
    `字号请优先用 var(--type-xxx)（已按画布短边自动换算），如需绝对值请用上述 px；禁止用 vw/vh/clamp。`,
  ].join("\n");
}

function buildRevisionPrompt(score: number, brief: StickerBrief): string {
  return [
    `当前这张「${brief.title}」贴纸评分为 ${score}/10，目标是 ${brief.qualityTarget}/10。`,
    "请基于当前画布做一次关键优化，优先处理构图、层级、文字可读性和素材融合问题。保持主题不变，不要重新开始，不要询问用户，也不要保存。",
    brief.resourceContext ? `【参考资源·必须保留】\n${brief.resourceContext}` : "",
    brief.htmlBindings && Object.keys(brief.htmlBindings).length
      ? `【资源绑定·必须继续使用】${JSON.stringify(brief.htmlBindings)}`
      : "",
  ].filter(Boolean).join("\n\n");
}

async function saveItem(
  item: BatchItem,
  config?: NormalizedBatchConfig,
): Promise<void> {
  item.status = "saving";
  // 兜底：确保本次保存是「新建」而不是覆盖上一张
  currentEditingCustomStickerId.value = null;
  let lastError = "保存失败";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await withTimeout(
        executeAITool("canvas.updateAndSaveSticker", {
          name: item.brief.saveName,
          description: item.brief.description,
          keywords: item.brief.keywords.join(","),
          autoTrim: config?.outputKind === "group" ? false : undefined,
        }),
        AI_TIMEOUTS.batchSave,
        `第 ${item.index + 1} 张保存（第 ${attempt}/3 次）`,
      );

      item.saveResult = result;
      if (result?.success) {
        item.savedUrl = result?.data?.url;
        item.status = "done";
        item.error = undefined;
        return;
      }
      lastError = result?.message || "保存失败";
    } catch (e: any) {
      lastError = e?.message || String(e);
    }
    if (attempt < 3) {
      item.error = `上传失败，正在重试 ${attempt}/3`;
      // COS 偶发 502/503，需要更长退避才能恢复
      await new Promise((resolve) => setTimeout(resolve, attempt * 4000));
    }
  }
  failItem(item, `保存失败，已重试 3 次: ${lastError}`);
}

async function createSavedImageGroup(
  items: BatchItem[],
  groupIndex: number,
  config: NormalizedBatchConfig,
): Promise<void> {
  const customStickerIds = items
    .map((item) => String(item.saveResult?.data?.customStickerId || "").trim())
    .filter(Boolean);
  if (customStickerIds.length !== items.length) {
    const lastSuccessfulItem = [...items]
      .reverse()
      .find((item) => item.status === "done");
    if (lastSuccessfulItem && !items.some((item) => item.status === "failed")) {
      failItem(lastSuccessfulItem, "组图成员未全部保存，无法创建组图");
    }
    return;
  }

  // 组图关系引用 sticker 表，因此组图交付前才把自定义贴纸复制进素材库。
  const stickerIds: string[] = [];
  for (const customStickerId of customStickerIds) {
    const imported: any = await executeAITool("material.importCustomStickerToLibrary", {
      customStickerId,
    });
    const stickerId = String(imported?.data?.stickerId || "").trim();
    if (!imported?.success || !stickerId) {
      const failedItem = items.find((item) => item.saveResult?.data?.customStickerId === customStickerId) || items[items.length - 1];
      failItem(failedItem, imported?.message || "自定义贴纸导入素材库失败，无法创建组图");
      return;
    }
    stickerIds.push(stickerId);
  }

  const baseName =
    truncateText(config.description || config.style || "自动组图", 24) ||
    "自动组图";
  const groupName =
    config.count > 1 ? `${baseName} ${groupIndex + 1}` : baseName;
  const lastItem = items[items.length - 1];
  lastItem.status = "grouping";

  try {
    const result = await withTimeout(
      executeAITool("material.createImageGroup", {
        name: groupName,
        description: `${baseName}，第 ${groupIndex + 1}/${config.count} 套，共 ${items.length} 个成员`,
        stickerIds,
      }),
      AI_TIMEOUTS.batchSave,
      `第 ${groupIndex + 1} 套组图创建`,
    );
    if (!result?.success) {
      throw new Error(result?.message || "创建组图失败");
    }
    const groupId = String(result?.data?.groupId || "").trim();
    if (!groupId) {
      throw new Error("组图接口未返回 groupId");
    }
    for (const item of items) {
      item.groupId = groupId;
    }
    lastItem.status = "done";
  } catch (error: any) {
    failItem(lastItem, `创建组图失败: ${error?.message || error}`);
  }
}

function failItem(item: BatchItem, error: string): void {
  item.status = "failed";
  item.error = error;
}

function markStopped(item: BatchItem): void {
  if (
    item.status !== "done" &&
    item.status !== "failed" &&
    item.status !== "skipped"
  ) {
    item.status = "failed";
    item.error = "用户停止";
  }
}

// ============ Pause / Resume ============

function waitIfPaused(): Promise<void> {
  if (controlSignal.value !== "paused") {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    pauseResolve = resolve;
  });
}

// ============ Public Runner ============

export async function startBatch(configInput: AutoBatchConfig): Promise<void> {
  if (["preparing", "running", "paused"].includes(batchProgress.status)) {
    console.warn("[Batch] 已在运行中");
    return;
  }

  const config = normalizeConfig(configInput);
  batchProgress.status = "preparing";
  batchProgress.items = [];
  batchProgress.current = 0;
  batchProgress.config = config;
  batchProgress.error = undefined;
  batchProgress.startedAt = Date.now();
  batchProgress.finishedAt = undefined;
  controlSignal.value = "running";
  beginDesignTabTask();

  try {
    const briefs = await generateBriefs(config);
    batchProgress.items = briefs.map((brief, index) => ({
      index,
      prompt: brief.prompt,
      brief,
      score: null,
      status: "pending" as const,
      revisionCount: 0,
    }));

    batchProgress.status = "running";

    for (let i = 0; i < batchProgress.items.length; i++) {
      if (isStopped()) {
        batchProgress.status = "stopped";
        break;
      }

      await waitIfPaused();
      if (isStopped()) {
        batchProgress.status = "stopped";
        break;
      }

      batchProgress.current = i;
      // 每张都必须新建 custom_sticker：清掉残留的「编辑中」ID，
      // 否则本张保存会变成更新上一张的记录（多尺寸批量会丢图）
      currentEditingCustomStickerId.value = null;
      try {
        await runSingleDesign(batchProgress.items[i], config, controlSignal);
      } catch (error: any) {
        console.error("[Batch] 单张制作异常，继续下一张:", error);
        failItem(
          batchProgress.items[i],
          error?.message || "单张制作异常，已跳过",
        );
      }

      await reportInspirationIfNeeded(batchProgress.items[i], config);

      if (
        config.outputKind === "group" &&
        (i + 1) % config.membersPerGroup === 0
      ) {
        const groupIndex = Math.floor(i / config.membersPerGroup);
        const groupItems = batchProgress.items.slice(
          i + 1 - config.membersPerGroup,
          i + 1,
        );
        await createSavedImageGroup(groupItems, groupIndex, config);
      }

      if (isStopped()) {
        batchProgress.status = "stopped";
        break;
      }
    }

    if (batchProgress.status !== "stopped") {
      batchProgress.status = "done";
    }
  } catch (error: any) {
    console.error("[Batch] 批量制作失败:", error);
    batchProgress.error = error?.message || "批量制作失败";
    batchProgress.status = "stopped";
  } finally {
    batchProgress.finishedAt = Date.now();
    const snapshot = getBatchRuntimeSnapshot();
    completeDesignTabTask(
      snapshot.status === "done" &&
        snapshot.failed === 0 &&
        snapshot.skipped === 0 &&
        snapshot.succeeded === snapshot.total,
    );
  }
}

export function pauseBatch(): void {
  if (batchProgress.status === "running") {
    controlSignal.value = "paused";
    batchProgress.status = "paused";
  }
}

export function resumeBatch(): void {
  if (batchProgress.status === "paused") {
    controlSignal.value = "running";
    batchProgress.status = "running";
    if (pauseResolve) {
      pauseResolve();
      pauseResolve = null;
    }
  }
}

export function stopBatch(): void {
  controlSignal.value = "stopped";
  batchProgress.status = "stopped";
  designAgent.stop();
  if (pauseResolve) {
    pauseResolve();
    pauseResolve = null;
  }
}

export function resetBatch(): void {
  // 注意：这里必须置为 stopped。历史上设成 running 会把「先 stop 再 reset」的清理动作
  // 变成撤销停止，导致僵尸批次一直占用设计端。
  // startBatch 开始新批次时会显式把它置回 running。
  controlSignal.value = "stopped";
  batchProgress.status = "idle";
  batchProgress.items = [];
  batchProgress.current = 0;
  batchProgress.config = null;
  batchProgress.error = undefined;
  batchProgress.startedAt = undefined;
  batchProgress.finishedAt = undefined;
}
