import {
  inferCanvasTypographyDensity,
  type CanvasTypographyDensity,
} from "../../operations/canvas-typography.ts";
import type { ResolvedAgentTaskSpec } from "./task-spec";

export type DesignPlanStepStatus = "pending" | "done" | "failed";

export interface DesignPlanStep {
  action: string;
  description: string;
  status: DesignPlanStepStatus;
  result?: string;
}

export interface DesignPlan {
  goal: string;
  steps: DesignPlanStep[];
  currentStep: number;
}

export interface ExplicitCanvasSize {
  width: number;
  height: number;
  unit: "px" | "mm" | "cm" | "in";
}

interface LocatedCanvasSize {
  size: ExplicitCanvasSize;
  index: number;
}

export interface ExecutionPlanResult {
  plan: DesignPlan | null;
  explicitCanvasSize: ExplicitCanvasSize | null;
  isNewDesign: boolean;
  shouldPreflightSize: boolean;
  typographyDensity: CanvasTypographyDensity;
  searchQueries: {
    assets: string;
    styles: string;
    layouts: string;
  };
}

const SIZE_ACTIONS = new Set([
  "canvas.setSize",
  "canvas.smartSize",
  "canvas.setSizeByPreset",
]);

const ARTWORK_ACTIONS = new Set([
  "canvas.addHtml",
  "canvas.addChild:html",
  "canvas.createSticker",
  "canvas.createFromDescription",
]);

const REUSABLE_ACTIONS = new Set([
  "resource.searchFont",
  "resource.searchSticker",
  "resource.searchSentence",
  "resource.searchTextDocument",
  "resource.searchCustomSticker",
  "canvas.loadCustomSticker",
]);

const REQUIRED_DELIVERY_ACTIONS = new Set([
  "canvas.updateAndSaveSticker",
  "canvas.exportPng",
  "material.createImageGroup",
]);

function compactText(value: string, maxLength = 180): string {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function shouldAllowCanvasAnalysis(
  userMessage: string,
  task?: ResolvedAgentTaskSpec,
): boolean {
  if (task && task.preset !== "standard") {
    return task.intent === "analyze" || task.intent === "optimize";
  }
  const text = String(userMessage || "");
  const analysisIntent =
    /分析|评价|评估|打分|看看效果|看一下效果|检查(?:效果|画面|设计|素材|文字|排版|构图|加载)?|自检|自测|测试|review|analy[sz]e|evaluate|score/i;
  const deniedAnalysisIntent =
    /(不要|不用|无需|别|禁止|不需要).{0,12}(分析|评价|评估|打分|检查|自检|自测|测试|review|analy[sz]e|evaluate|score)/i;

  return analysisIntent.test(text) && !deniedAnalysisIntent.test(text);
}

/**
 * 检测是否为纯文字回复需求（不需要任何工具/画布操作）
 * 
 * 命中时 Agent 不应传入工具定义，避免 LLM 看到工具就调用
 */
export function isPureTextResponse(userMessage: string): boolean {
  const text = String(userMessage || "").trim();
  if (!text) return false;

  // 明确要求只回复文字/不要调用工具（排除"不要调用保存工具"这类特定工具限制）
  const explicitTextOnly =
    /请(?:只)?(?:回复|回|说|回答)(?:一句|一下|一句话|一句号)|不要(?:调用|使用|执行)(?:任何|所有)?工具|不要(?:修改|改动|更改|调整)(?:任何)?(?:画布|设计|排版|布局|元素)|只(?:回复|回|说)(?:文字|文本)|no\s+(?:tool|canvas)/i;
  if (explicitTextOnly.test(text)) return true;

  // 简单问候/寒暄
  const greeting =
    /^(?:你好|您好|哈喽|hello|hi|hey|嗨|早上好|下午好|晚上好|在吗|在不在)[!！。.？?\s]*$/i;
  if (greeting.test(text)) return true;

  // 询问身份/能力/用法/自我介绍（不涉及设计操作）
  const aboutMe =
    /(?:你是谁|你是什么|你是什么模型|你是什么AI|介绍(?:一下)?(?:你|您)?(?:自己)?|自我介绍|你能(?:做什么|干嘛|干什么)|你有(?:什么|哪些)(?:能力|功能)|怎么(?:使用|用|操作)(?:你|这个)|你的(?:能力|功能|用法)|what\s+can\s+you\s+do|who\s+are\s+you)/i;
  if (aboutMe.test(text)) return true;

  return false;
}

export function shouldContinueAfterArtwork(
  userMessage: string,
  task?: ResolvedAgentTaskSpec,
): boolean {
  if (
    task &&
    (task.outputKind !== "single" ||
      task.delivery !== "canvas" ||
      task.intent === "analyze" ||
      task.intent === "optimize")
  ) {
    return true;
  }
  const continuationIntent =
    /继续|再改|优化|调整|迭代|保存|导出|save|export/i;
  const deniedContinuationIntent =
    /(不要|不用|无需|别|禁止|不需要).{0,12}(继续|再改|优化|调整|迭代|保存|导出|save|export)/i;
  return (
    (continuationIntent.test(userMessage) &&
      !deniedContinuationIntent.test(userMessage)) ||
    isImageGroupRequest(userMessage) ||
    shouldAllowCanvasAnalysis(userMessage)
  );
}

export function isImageGroupRequest(
  userMessage: string,
  task?: ResolvedAgentTaskSpec,
): boolean {
  if (task) return task.outputKind === "group";
  const groupIntent =
    /组图|套图|正反面|正反两面|前后面|前后页|多页设计|image group|image set/i;
  const deniedGroupIntent =
    /(不要|不用|无需|别|禁止|不需要).{0,12}(组图|套图|正反面|前后面|前后页|多页|image group|image set)/i;
  return groupIntent.test(userMessage) && !deniedGroupIntent.test(userMessage);
}

function inferImageGroupMemberCount(userMessage: string): number {
  const arabicMatch = userMessage.match(/(\d{1,3})\s*(?:张|页|幅|个)/);
  if (arabicMatch) {
    return Math.max(2, Math.min(12, Number(arabicMatch[1])));
  }

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
  const chineseMatch = userMessage.match(/([两二三四五六七八九十])\s*(?:张|页|幅|个)/);
  return chineseMatch ? chineseNumbers[chineseMatch[1]] : 2;
}

function extractExplicitCanvasSizes(userMessage: string): ExplicitCanvasSize[] {
  const text = String(userMessage || "");
  const located: LocatedCanvasSize[] = [];
  const patterns: Array<{
    pattern: RegExp;
    normalize: (match: RegExpMatchArray) => ExplicitCanvasSize;
  }> = [
    {
      pattern:
        /(\d+(?:\.\d+)?)\s*[x×X＊*]\s*(\d+(?:\.\d+)?)\s*(px|mm|cm|in)?\b/gi,
      normalize: (match) => ({
        width: Number(match[1]),
        height: Number(match[2]),
        unit: (match[3] || "px").toLowerCase() as ExplicitCanvasSize["unit"],
      }),
    },
    {
      pattern:
        /(\d+(?:\.\d+)?)\s*(px|mm|cm|in)\s*[x×X＊*]\s*(\d+(?:\.\d+)?)\b/gi,
      normalize: (match) => ({
        width: Number(match[1]),
        height: Number(match[3]),
        unit: match[2].toLowerCase() as ExplicitCanvasSize["unit"],
      }),
    },
  ];

  for (const { pattern, normalize } of patterns) {
    for (const match of text.matchAll(pattern)) {
      located.push({
        size: normalize(match),
        index: match.index || 0,
      });
    }
  }

  const seen = new Set<string>();
  return located
    .sort((a, b) => a.index - b.index)
    .map((item) => item.size)
    .filter((size) => {
      const key = `${size.width}x${size.height}${size.unit}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function extractExplicitCanvasSize(
  userMessage: string,
): ExplicitCanvasSize | null {
  return extractExplicitCanvasSizes(userMessage)[0] || null;
}

export function isModificationRequest(userMessage: string): boolean {
  const text = String(userMessage || "");
  return (
    /基于当前(?:设计|画布)|现有设计|保留现有|不要清空|继续修改|修改当前|调整当前|替换当前|在此基础上|微调|修改|调整|优化|改一下|调一下|变一下|换个|把.{0,20}(?:改|换|调|移|放|加|删|设|做成|变成)|字体|字号|颜色|文字|文案|间距|透明度|居中|对齐|缩小|放大|加粗|变浅|变深|背景色|位置|排版|再加|添加一个|补充|润色|based on (?:the )?current|update (?:the )?current|edit|modify|tweak|adjust|change/i.test(
      text,
    ) &&
    !/清空(?:画布)?|全部重做|重新设计|重新来|新建|重新做/i.test(text)
  );
}

export function isNewDesignRequest(
  userMessage: string,
  task?: ResolvedAgentTaskSpec,
): boolean {
  const text = String(userMessage || "");

  // 1. 如果用户显式输入了微调/修改/调整类意图，且非明确清空重做，绝不清空画布
  if (isModificationRequest(text)) {
    return false;
  }

  // 2. 如果任务明确设置了修改或分析意图，不是新设计
  if (task && (task.intent === "edit" || task.intent === "analyze" || task.intent === "optimize" || task.source === "current-canvas")) {
    return false;
  }

  // 3. standard 模式或默认推断模式：根据自然语言意图判定
  if (task?.preset === "standard" || !task) {
    if (
      shouldAllowCanvasAnalysis(text) &&
      !/创建|生成|制作|设计一|做一|创作一|新建|复刻|仿做|仿制|同款/i.test(text)
    ) {
      return false;
    }

    return /创建|新建|生成|制作|实现|(?:设计|做|创作|画)[一]?(?:张|个|套|款|幅|枚|组)?\S{1,12}(?:贴纸|海报|名片|贺卡|封面|横幅|标签|卡片|卡|图|画|插画|壁纸|请柬|邀请函|菜单|Banner|banner|logo|LOGO|匾额|印章|对联|横批|明信片|宣传|横版|竖版|方形|包装)|清空画布.*(?:添加|创建)|复刻|仿做|仿制|做同款|相同款|照着.{0,12}(?:做|制作)|create|generate|make a|design a/i.test(
      text,
    );
  }

  // 4. 其他显式模式（如 single、group、batch）
  return (
    task.intent === "create" &&
    (task.source === "blank" || task.source === "reference-image")
  );
}

function shouldApplyExplicitSize(
  userMessage: string,
  explicitCanvasSize: ExplicitCanvasSize | null,
  isNewDesign: boolean,
): boolean {
  if (!explicitCanvasSize) return false;
  if (isNewDesign) return true;

  return /设置|改为|调整|保持|保留|set|resize|keep/i.test(userMessage);
}

function hasExplicitResourceRequest(
  userMessage: string,
  type: string,
): boolean {
  const patterns: Record<string, RegExp> = {
    customSticker:
      /模板库|自定义贴纸|搜索.{0,10}模板|使用.{0,10}模板|参考.{0,10}模板|基于.{0,10}模板|同款|现有作品/i,
    font: /字体库|搜索.{0,10}字体|检索.{0,10}字体|使用.{0,10}(手写体|标题字|字体资源)/i,
    image:
      /素材库|贴纸库|搜索.{0,12}(图片|贴纸|插画|素材)|检索.{0,12}(图片|贴纸|插画|素材)|抠图素材/i,
    sentence: /文案库|搜索.{0,10}(文案|句子|广告词)|检索.{0,10}(文案|句子)/i,
    document: /文档库|搜索.{0,10}(文档|资料)|检索.{0,10}(文档|资料)/i,
  };
  return patterns[type]?.test(userMessage) || false;
}

function getPrimaryArtworkAction(
  userMessage: string,
  task?: ResolvedAgentTaskSpec,
): string | null {
  if (task?.intent === "analyze") return null;
  if (
    /(?:设置|调整|修改|改为|改成).{0,12}画布基础字号|画布基础字号.{0,12}(?:设置|调整|修改|改为|改成)/i.test(
      userMessage,
    ) &&
    !/同时|并且|以及|创建|生成|制作|设计一|做一|创作一/i.test(userMessage)
  ) {
    return null;
  }

  const analysisOnly =
    shouldAllowCanvasAnalysis(userMessage) &&
    !/创建|生成|制作|(?:设计|做|创作|画)[一]?(?:张|个|套|款|幅|枚|组)?\S{1,12}(?:贴纸|海报|名片|贺卡|封面|横幅|标签|卡片|图|画|插画|设计|壁纸|请柬|邀请函|菜单|Banner|banner|logo|LOGO)|新建|复刻|仿做|仿制|同款|基于当前|修改当前|调整当前/i.test(
      userMessage,
    );
  if (analysisOnly) return null;

  const deniedMutation =
    /(不要|不用|无需|别|禁止|不需要).{0,12}(修改|调整|替换|更换|添加|创建|生成|制作)/i.test(
      userMessage,
    );
  const positiveMutation =
    !deniedMutation &&
    (/修改|调整|替换|更换|添加|改为|改成|移到|移动/i.test(userMessage) ||
      isModificationRequest(userMessage));
  const positiveCreation = isNewDesignRequest(userMessage, task);

  if (
    !positiveCreation &&
    !positiveMutation &&
    (!task || task.preset === "standard")
  ) {
    return null;
  }

  if (/流程图|思维导图|关系图|mermaid|flowchart|mind ?map/i.test(userMessage)) {
    return "canvas.addDiagram";
  }
  if (/数据图表|柱状图|折线图|饼图|雷达图|echarts?|chart/i.test(userMessage)) {
    return "canvas.addChart";
  }
  return "canvas.addHtml";
}

function hasPositiveCommandIntent(
  userMessage: string,
  intent: RegExp,
  deniedIntent: RegExp,
): boolean {
  return intent.test(userMessage) && !deniedIntent.test(userMessage);
}

function createStep(action: string, description: string): DesignPlanStep {
  return { action, description, status: "pending" };
}

export function buildExecutionPlan(
  userMessage: string,
  task?: ResolvedAgentTaskSpec,
): ExecutionPlanResult {
  const normalized = compactText(userMessage);
  const explicitCanvasSizes = extractExplicitCanvasSizes(userMessage);
  const imageGroupRequest = isImageGroupRequest(userMessage, task);
  const independentBatchRequest = task?.outputKind === "independent-batch";
  const perOutputCanvasSize =
    imageGroupRequest || independentBatchRequest;
  const explicitCanvasSize = perOutputCanvasSize
    ? null
    : explicitCanvasSizes[0] || null;
  const typographyDensity = inferCanvasTypographyDensity(userMessage);
  const isNewDesign = isNewDesignRequest(userMessage, task);
  const shouldPreflightSize = shouldApplyExplicitSize(
    userMessage,
    explicitCanvasSize,
    isNewDesign,
  );
  const steps: DesignPlanStep[] = [];

  if (isNewDesign) {
    steps.push(createStep("canvas.clear", "创建新设计前清空现有画布"));
  }

  if (!perOutputCanvasSize) {
    if (shouldPreflightSize && explicitCanvasSize) {
      steps.push(
        createStep(
          "canvas.setSize",
          `设置画布为 ${explicitCanvasSize.width}×${explicitCanvasSize.height} ${explicitCanvasSize.unit}，并按内容密度设置基础字号`,
        ),
      );
    } else if (isNewDesign) {
      steps.push(
        createStep("canvas.smartSize", "根据当前设计内容选择合适的画布尺寸"),
      );
    }
  }

  if (
    !isNewDesign &&
    /(?:设置|调整|修改|改为|改成).{0,12}画布基础字号|画布基础字号.{0,12}(?:设置|调整|修改|改为|改成)/i.test(
      userMessage,
    )
  ) {
    steps.push(
      createStep("canvas.setBaseFontSize", "调整 HTML 设计的画布基础字号"),
    );
  }

  if (hasExplicitResourceRequest(userMessage, "customSticker")) {
    steps.push(
      createStep(
        "resource.searchCustomSticker",
        "搜索用户的自定义贴纸/成品设计模板",
      ),
    );
  }
  if (hasExplicitResourceRequest(userMessage, "font")) {
    steps.push(createStep("resource.searchFont", "搜索用户明确要求的字体资源"));
  }
  if (hasExplicitResourceRequest(userMessage, "image")) {
    steps.push(
      createStep("resource.searchSticker", "搜索用户明确要求的图片或贴纸素材"),
    );
  }
  if (hasExplicitResourceRequest(userMessage, "sentence")) {
    steps.push(
      createStep("resource.searchSentence", "搜索用户明确要求的短文案"),
    );
  }
  if (hasExplicitResourceRequest(userMessage, "document")) {
    steps.push(
      createStep("resource.searchTextDocument", "搜索用户明确要求的文档资料"),
    );
  }

  const artworkAction = getPrimaryArtworkAction(userMessage, task);
  if (artworkAction && (imageGroupRequest || independentBatchRequest)) {
    const setsCount = imageGroupRequest ? (task?.jobCount || 1) : 1;
    const memberCount = imageGroupRequest
      ? task?.memberCount || inferImageGroupMemberCount(userMessage)
      : task?.jobCount || 1;
    const totalCount = setsCount * memberCount;
    const outputLabel = imageGroupRequest ? "组图" : "独立设计";

    let globalIndex = 0;
    for (let setIdx = 0; setIdx < setsCount; setIdx++) {
      for (let mIdx = 0; mIdx < memberCount; mIdx++) {
        globalIndex++;
        if (globalIndex > 1) {
          steps.push(createStep("canvas.clear", `制作第 ${globalIndex} 张前清空画布`));
        }
        steps.push(
          createStep(
            explicitCanvasSizes.length > 0
              ? "canvas.setSize"
              : "canvas.smartSize",
            explicitCanvasSizes.length > 0
              ? `根据用户原始要求设置第 ${globalIndex}/${totalCount} 张的对应画布尺寸`
              : `根据当前内容选择第 ${globalIndex}/${totalCount} 张的合适画布尺寸`,
          ),
        );
        steps.push(
          createStep(
            artworkAction,
            setsCount > 1
              ? `制作第 ${setIdx + 1} 套第 ${mIdx + 1}/${memberCount} 张（总第 ${globalIndex}/${totalCount} 张）`
              : `按需求制作${outputLabel}第 ${mIdx + 1}/${memberCount} 张`,
          ),
        );
        steps.push(
          createStep(
            "canvas.updateAndSaveSticker",
            `保存第 ${globalIndex}/${totalCount} 张并记录 stickerId`,
          ),
        );
      }
      if (imageGroupRequest) {
        steps.push(
          createStep(
            "material.createImageGroup",
            setsCount > 1
              ? `将第 ${setIdx + 1} 套的 ${memberCount} 张图片创建为独立组图`
              : `按保存顺序将 ${memberCount} 张图片创建为组图`,
          ),
        );
      }
    }
  } else if (artworkAction) {
    const description =
      artworkAction === "canvas.addDiagram"
        ? "创建完整图示"
        : artworkAction === "canvas.addChart"
          ? "创建完整数据图表"
          : "根据用户要求生成完整 HTML/CSS 作品";
    steps.push(createStep(artworkAction, description));
  }

  if (
    shouldAllowCanvasAnalysis(userMessage, task) &&
    task?.source !== "reference-image"
  ) {
    steps.push(createStep("canvas.analyze", "分析当前画布并给出评价"));
  }

  // 是否真的有设计/交付工作要做。
  // 任务预设里的 delivery 只在“确有设计工作”时才追加交付步骤；
  // 否则闲聊/问答（如 “hi”、“你是什么模型”）会被 AiPanel 默认的 delivery:save
  // 绑上一个“保存当前设计”，导致计划永远完不成、agent 死循环。
  const explicitSave = hasPositiveCommandIntent(
    userMessage,
    /保存|save/i,
    /(不要|不用|无需|别|禁止|不需要).{0,12}(保存|save)/i,
  );
  const deniedSave = /(不要|不用|无需|别|禁止|不需要).{0,12}(保存|save)/i.test(userMessage);
  const explicitExport = hasPositiveCommandIntent(
    userMessage,
    /导出|export/i,
    /(不要|不用|无需|别|禁止|不需要).{0,12}(导出|export)/i,
  );
  const deniedExport = /(不要|不用|无需|别|禁止|不需要).{0,12}(导出|export)/i.test(userMessage);
  const hasResourceStep = steps.some((step) =>
    REUSABLE_ACTIONS.has(step.action),
  );
  const hasDesignWork =
    isNewDesign ||
    Boolean(artworkAction) ||
    imageGroupRequest ||
    independentBatchRequest ||
    hasResourceStep ||
    steps.some((step) => step.action === "canvas.analyze") ||
    explicitSave ||
    explicitExport;

  if (hasDesignWork) {
    if (
      !imageGroupRequest &&
      !independentBatchRequest &&
      !deniedSave &&
      (explicitSave || (task?.delivery === "save" && Boolean(artworkAction)))
    ) {
      steps.push(createStep("canvas.updateAndSaveSticker", "保存当前设计"));
    }
    if (!deniedExport && (explicitExport || (task?.delivery === "export" && Boolean(artworkAction)))) {
      steps.push(createStep("canvas.exportPng", "导出当前设计"));
    }
  }

  // 闲聊/纯问答：不建计划，让 agent 直接回复文字后结束
  const plan = steps.length
    ? {
        goal: normalized,
        steps,
        currentStep: 0,
      }
    : null;

  const query = normalized.replace(
    /\d+(?:\.\d+)?\s*[x×X＊*]\s*\d+(?:\.\d+)?\s*(?:px|mm|cm|in)?/gi,
    " ",
  );

  return {
    plan,
    explicitCanvasSize,
    isNewDesign,
    shouldPreflightSize,
    typographyDensity,
    searchQueries: {
      assets: compactText(query, 120),
      styles: compactText(query, 160),
      layouts: compactText(query, 160),
    },
  };
}

export function planActionsMatch(
  plannedAction: string,
  actualAction: string,
): boolean {
  if (plannedAction === actualAction) return true;
  if (SIZE_ACTIONS.has(plannedAction) && SIZE_ACTIONS.has(actualAction))
    return true;
  if (ARTWORK_ACTIONS.has(plannedAction) && ARTWORK_ACTIONS.has(actualAction)) {
    return true;
  }
  return false;
}

export function ensurePlanStep(
  plan: DesignPlan,
  action: string,
  description: string,
): number {
  const pendingIndex = plan.steps.findIndex(
    (step) =>
      step.status === "pending" && planActionsMatch(step.action, action),
  );
  if (pendingIndex >= 0) return pendingIndex;

  if (REUSABLE_ACTIONS.has(action) || REQUIRED_DELIVERY_ACTIONS.has(action)) {
    const existingIndex = plan.steps.findIndex((step) =>
      planActionsMatch(step.action, action),
    );
    if (existingIndex >= 0) return existingIndex;
  }

  const failedIndex = plan.steps.findIndex(
    (step) => step.status === "failed" && planActionsMatch(step.action, action),
  );
  if (failedIndex >= 0) return failedIndex;

  plan.steps.push(createStep(action, description));
  return plan.steps.length - 1;
}

export function settlePlanStep(
  plan: DesignPlan,
  action: string,
  status: Exclude<DesignPlanStepStatus, "pending">,
  result?: string,
  description = action,
): number {
  const index = ensurePlanStep(plan, action, description);
  plan.steps[index].status = status;
  plan.steps[index].result = result;
  plan.currentStep = plan.steps.filter(
    (step) => step.status !== "pending",
  ).length;
  return index;
}

export function failPendingPlanSteps(plan: DesignPlan, reason: string): void {
  for (const step of plan.steps) {
    if (step.status === "pending") {
      step.status = "failed";
      step.result = reason;
    }
  }
  plan.currentStep = plan.steps.length;
}

export function getPlanProgress(plan: DesignPlan | null): {
  settled: number;
  done: number;
  failed: number;
  total: number;
} {
  if (!plan) return { settled: 0, done: 0, failed: 0, total: 0 };
  const done = plan.steps.filter((step) => step.status === "done").length;
  const failed = plan.steps.filter((step) => step.status === "failed").length;
  return {
    settled: done + failed,
    done,
    failed,
    total: plan.steps.length,
  };
}

export function getIncompleteDeliveryActions(
  plan: DesignPlan | null,
): string[] {
  if (!plan) return [];
  // 只把仍是 pending 的交付步骤视为未完成。
  // failed/done 都是终态 —— 若把 failed 也算进去，保存失败会被反复强制重试，形成死循环。
  return Array.from(REQUIRED_DELIVERY_ACTIONS).filter((action) =>
    plan.steps.some((step) => step.action === action && step.status === "pending"),
  );
}
