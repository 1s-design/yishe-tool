export type AgentTaskPresetId =
  | "standard"
  | "single"
  | "group"
  | "batch"
  | "reference"
  | "edit"
  | "analyze"
  | "optimize"
  | "custom";

export type AgentTaskSource = "blank" | "current-canvas" | "reference-image";
export type AgentTaskIntent = "create" | "edit" | "analyze" | "optimize";
export type AgentTaskOutputKind = "single" | "group" | "independent-batch";
export type AgentTaskDelivery = "canvas" | "save" | "export";
export type AgentTaskExecution = "interactive" | "automatic";

export interface AgentTaskOptions {
  preset?: AgentTaskPresetId;
  source?: AgentTaskSource;
  intent?: AgentTaskIntent;
  outputKind?: AgentTaskOutputKind;
  jobCount?: number;
  memberCount?: number;
  delivery?: AgentTaskDelivery;
  customInstructions?: string;
}

export interface ResolvedAgentTaskSpec {
  preset: AgentTaskPresetId;
  source: AgentTaskSource;
  intent: AgentTaskIntent;
  outputKind: AgentTaskOutputKind;
  jobCount: number;
  memberCount: number;
  delivery: AgentTaskDelivery;
  execution: AgentTaskExecution;
  createImageGroup: boolean;
  customInstructions: string;
}

export const AGENT_TASK_PRESETS: Array<{
  value: AgentTaskPresetId;
  label: string;
  automatic: boolean;
}> = [
  { value: "standard", label: "标准", automatic: true },
  { value: "single", label: "单图设计", automatic: true },
  { value: "group", label: "组图设计", automatic: true },
  { value: "batch", label: "批量变体", automatic: true },
  { value: "reference", label: "参考图复刻", automatic: false },
  { value: "edit", label: "修改当前", automatic: false },
  { value: "analyze", label: "分析评估", automatic: false },
  { value: "optimize", label: "优化当前", automatic: false },
  { value: "custom", label: "自定义", automatic: true },
];

function clampCount(value: unknown, min: number, max: number, fallback: number) {
  const count = Number(value);
  if (!Number.isFinite(count)) return fallback;
  return Math.max(min, Math.min(max, Math.round(count)));
}

function inferCount(text: string, fallback: number): number {
  if (!text) return fallback;

  // 1. 特殊关键词：正反面、双面、前后面固定为 2
  if (/正反面|正反两面|双面|前后面|前后两面|前后两页/.test(text)) {
    return 2;
  }

  // 2. 优先匹配显式总数声明（如“共2张”、“一共3张”、“总计4套”）
  const totalMatch = text.match(/(?:共|一共|总共|总计|合计)\s*(\d{1,3})\s*(?:张|页|幅|个|套|组)/);
  if (totalMatch) return clampCount(totalMatch[1], 1, 100, fallback);

  // 3. 过滤掉序号（如“第1张”、“第2页”、“第一幅”），避免序号数字被误判为总数
  const cleaned = text.replace(/第[0-9两一二三四五六七八九十]+\s*(?:张|页|幅|个|套|组|面)/g, " ");

  const arabicMatch = cleaned.match(/(\d{1,3})\s*(?:张|页|幅|个|套|组)/);
  if (arabicMatch) return clampCount(arabicMatch[1], 1, 100, fallback);

  const chineseNumbers: Record<string, number> = {
    两: 2,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  const chineseMatch = cleaned.match(/([两二三四五六七八九十])\s*(?:张|页|幅|个|套|组)/);
  return chineseMatch ? chineseNumbers[chineseMatch[1]] : fallback;
}

function inferStandardTask(
  userMessage: string,
  hasReferenceImage: boolean,
): Pick<
  ResolvedAgentTaskSpec,
  "source" | "intent" | "outputKind" | "delivery"
> {
  const text = String(userMessage || "");
  const groupRequested =
    /组图|套图|正反面|正反两面|前后面|前后页|多页设计|image group|image set/i.test(
      text,
    );
  const batchRequested =
    /批量|多个独立|多款|多个版本|多种方案|批量变体|batch|variations?/i.test(
      text,
    ) ||
    /(?:制作|生成|创建|实现|做).{0,16}(?:[2-9]\d?|两|二|三|四|五|六|七|八|九|十)\s*(?:张|幅|个)/i.test(
      text,
    );
  const editRequested =
    /修改|调整|替换|更换|改为|改成|移动|放大|缩小|保留现有|当前画布|继续/i.test(
      text,
    );
  const optimizeRequested = /优化|改进|润色|提升设计|重新排版/i.test(text);
  const analyzeRequested =
    /分析|评价|评估|打分|检查|review|analy[sz]e|evaluate/i.test(text) &&
    !/创建|生成|制作|实现|复刻|仿做|同款/i.test(text);
  const saveRequested = /保存|加入素材|存入素材|save/i.test(text);
  const exportRequested = /导出|下载|export/i.test(text);
  const creationRequested =
    /创建|新建|生成|制作|实现|设计一|做一|创作一|复刻|仿做|仿制|同款|create|generate|make|design/i.test(
      text,
    );
  const deliveryOnlyRequest =
    !creationRequested && (saveRequested || exportRequested);

  return {
    source: hasReferenceImage
      ? "reference-image"
      : editRequested ||
          optimizeRequested ||
          analyzeRequested ||
          deliveryOnlyRequest
        ? "current-canvas"
        : "blank",
    intent: analyzeRequested
      ? "analyze"
      : optimizeRequested
        ? "optimize"
        : editRequested || deliveryOnlyRequest
          ? "edit"
          : "create",
    outputKind: groupRequested
      ? "group"
      : batchRequested
        ? "independent-batch"
        : "single",
    delivery: exportRequested ? "export" : saveRequested ? "save" : "canvas",
  };
}

export function resolveAgentTaskSpec(
  userMessage: string,
  options: AgentTaskOptions = {},
  context: {
    hasReferenceImage?: boolean;
    execution?: AgentTaskExecution;
  } = {},
): ResolvedAgentTaskSpec {
  const preset = options.preset || "standard";
  const inferred = inferStandardTask(
    userMessage,
    Boolean(context.hasReferenceImage),
  );
  let source = inferred.source;
  let intent = inferred.intent;
  let outputKind = inferred.outputKind;
  let delivery = inferred.delivery;

  if (preset === "single") {
    // 若用户意图明确为修改/微调/优化，即使在 single 预设下也优先保留修改意图与画布来源
    if (inferred.intent === "edit" || inferred.intent === "optimize" || inferred.intent === "analyze") {
      source = "current-canvas";
      intent = inferred.intent;
    } else {
      source = "blank";
      intent = "create";
    }
    outputKind = "single";
    delivery = options.delivery || "save";
  } else if (preset === "group") {
    source = "blank";
    intent = "create";
    outputKind = "group";
    delivery = "save";
  } else if (preset === "batch") {
    source = "blank";
    intent = "create";
    outputKind = "independent-batch";
    delivery = "save";
  } else if (preset === "reference") {
    source = "reference-image";
    intent = "create";
    outputKind = "single";
  } else if (preset === "edit") {
    source = "current-canvas";
    intent = "edit";
    outputKind = "single";
  } else if (preset === "analyze") {
    source = "current-canvas";
    intent = "analyze";
    outputKind = "single";
    delivery = "canvas";
  } else if (preset === "optimize") {
    source = "current-canvas";
    intent = "optimize";
    outputKind = "single";
  } else if (preset === "custom") {
    source = options.source || source;
    intent = options.intent || intent;
    outputKind = options.outputKind || outputKind;
    delivery = options.delivery || delivery;
  }

  // 用户在弹窗中配置的显式参数具有最高优先级
  if (options.outputKind) outputKind = options.outputKind;
  if (options.source) source = options.source;
  if (options.intent) intent = options.intent;
  if (options.delivery) delivery = options.delivery;

  if (
    context.hasReferenceImage &&
    preset !== "custom" &&
    source !== "blank"
  ) {
    source = "reference-image";
  }

  const inferredCount = inferCount(userMessage, 2);
  const memberCount =
    outputKind === "group"
      ? clampCount(options.memberCount, 2, 12, inferredCount >= 2 ? inferredCount : 2)
      : 1;
  const jobCount = clampCount(options.jobCount, 1, 100, 1);

  return {
    preset,
    source,
    intent,
    outputKind,
    jobCount,
    memberCount,
    delivery: outputKind === "single" ? delivery : "save",
    execution: context.execution || "interactive",
    createImageGroup: outputKind === "group",
    customInstructions: String(options.customInstructions || "").trim(),
  };
}

export function buildAgentTaskConstraintPrompt(
  task: ResolvedAgentTaskSpec,
): string {
  const outputDescription =
    task.outputKind === "group"
      ? `一个包含 ${task.memberCount} 个有序成员的组图`
      : task.outputKind === "independent-batch"
        ? `${task.jobCount} 个互相独立的设计结果`
        : "一个单图设计结果";
  const deliveryDescription = task.createImageGroup
    ? "逐个保存成员，最后创建组图"
    : task.delivery === "save"
      ? "完成后保存到自定义贴纸库"
      : task.delivery === "export"
        ? "完成后导出 PNG"
        : "只完成当前画布，不自动保存或导出";
  const priorityRule =
    task.preset === "standard"
      ? "标准模式中的结构由系统根据提示词推断；如果用户明确列举了成员、数量或交付动作，以用户原文为准并校准计划。"
      : "该结构由用户明确选择，优先级高于对提示词的猜测。";

  return `\n\n## 标准任务协议
- 预设：${task.preset}
- 来源：${task.source}
- 意图：${task.intent}
- 输出：${outputDescription}
- 交付：${deliveryDescription}
- 执行：${task.execution}
${task.customInstructions ? `- 自定义约束：${task.customInstructions}\n` : ""}${priorityRule}内容、风格和排版仍以用户提示词为准。`;
}

export function validateAgentTaskSpec(
  task: ResolvedAgentTaskSpec,
  context: { hasReferenceImage?: boolean } = {},
): string {
  if (task.source === "reference-image" && !context.hasReferenceImage) {
    return "参考图复刻模式需要先上传参考图片";
  }
  if (task.outputKind === "group" && task.memberCount < 2) {
    return "组图至少需要 2 个成员";
  }
  return "";
}
