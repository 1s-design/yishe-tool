import { reactive, ref, watch } from "vue";
import { apiInstance } from "@/api/apiInstance";
import { executeAITool } from "../shared/execute-tool";
import { websocketClient } from "@/services/websocketClient";
import { useLoginStatusStore } from "@/store/stores/login";
import { currentEditingCustomStickerId } from "@/components/design/layout/canvas";
import { auditCurrentCanvas } from "../canvas-audit";
import { analyzePrintImage, type PrintAnalysisResult } from "../print-analysis";
import { buildReplicateBrief, type ReplicateMode } from "../print-replicate";
import { evaluateCanvasVisual, evaluateReplicationVisual, type ReplicationEvaluation } from "../visual-evaluate";
import { isVisionAvailable } from "../vision-mode";

export interface StationLogItem {
  id: string;
  time: string;
  type: "info" | "success" | "warn" | "error";
  text: string;
}

export interface DesignJobRecord {
  id: string;
  inspirationId?: string;
  type: "produce" | "variant" | "rework";
  sourceStickerId?: string;
  feedbackPrompt?: string;
  sizeSpec?: { width: number; height: number };
  leaseToken?: string;
  attempt?: number;
  inspiration?: {
    id: string;
    title: string;
    content: string;
    keywords?: string[];
    images?: string[];
    promptHints?: string;
    avoidNotes?: string;
    feedbackDigest?: string;
  };
}

function getStableStationWorkerId(): string {
  const KEY = "yishe-auto-station-worker-id";
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved && /^station-/.test(saved)) return saved;
    const id = `station-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    return `station-${Date.now().toString(36)}`;
  }
}

export const stationState = reactive({
  enabled: false,
  status: "idle" as "idle" | "claiming" | "producing" | "reworking" | "saving" | "waiting" | "paused_error",
  workerId: getStableStationWorkerId(),
  currentJob: null as DesignJobRecord | null,
  currentStage: "",
  todayProduced: 0,
  todayReworked: 0,
  consecutiveErrors: 0,
  heartbeatRemaining: 45,
  logs: [] as StationLogItem[],
});

export interface RemoteAgentOpRecord {
  id: string;
  time: string;
  op: string;
  opLabel?: string;
  paramsSummary?: string;
  durationMs?: number;
  success: boolean;
  message?: string;
}

export interface RemoteAgentState {
  active: boolean;
  isExecuting: boolean;
  caller: string;
  lastOp: string;
  lastOpLabel: string;
  lastOpParamsSummary: string;
  lastOpDurationMs: number;
  totalOps: number;
  lastActiveTime: number;
  currentMessage: string;
  recentOps: RemoteAgentOpRecord[];
}

export const remoteAgentState = reactive<RemoteAgentState>({
  active: false,
  isExecuting: false,
  caller: "外部 Agent (MCP)",
  lastOp: "",
  lastOpLabel: "",
  lastOpParamsSummary: "",
  lastOpDurationMs: 0,
  totalOps: 0,
  lastActiveTime: 0,
  currentMessage: "",
  recentOps: [],
});

let remoteActiveResetTimer: any = null;

export function getOpFriendlyInfo(opName: string, params?: any): { label: string; summary: string; icon: string } {
  const op = String(opName || "").trim();
  switch (op) {
    case "canvas.setSize": {
      const w = params?.width ?? 800;
      const h = params?.height ?? 800;
      return { label: "调整画布尺寸", summary: `${w} × ${h} px`, icon: "📐" };
    }
    case "canvas.clear":
      return { label: "清空重置画布", summary: "重置所有图层与样式", icon: "🧹" };
    case "canvas.addHtml": {
      const html = String(params?.htmlContent || params?.html || "");
      const lengthInfo = html ? `${html.length} 字符` : "HTML图层";
      return { label: "注入排版图层", summary: `国潮排版 · ${lengthInfo}`, icon: "🎨" };
    }
    case "system.design_tool.audit_canvas":
      return { label: "设计规范质检", summary: "图层结构与设计硬伤审计", icon: "🛡️" };
    case "canvas.updateAndSaveSticker": {
      const name = params?.name || params?.title || "自定义贴纸";
      return { label: "导出并保存贴纸", summary: `${name} · UPNG 256色压缩`, icon: "💾" };
    }
    case "canvas.captureThumbnail":
      return { label: "截取缩略预览", summary: "生成高清画布快照", icon: "🖼️" };
    case "canvas.getState":
      return { label: "读取画布状态", summary: "解析图层树与背景元数据", icon: "🔍" };
    case "canvas.deleteElement":
      return { label: "删除图层", summary: `图层: ${params?.id || "目标"}`, icon: "🗑️" };
    case "canvas.updateElement":
      return { label: "更新图层属性", summary: `图层: ${params?.id || "目标"}`, icon: "✏️" };
    case "canvas.addText":
      return { label: "置入文本元素", summary: `"${params?.text || ""}"`, icon: "🔤" };
    case "canvas.addImage":
      return { label: "置入图像素材", summary: "图片素材图层", icon: "🖼️" };
    case "canvas.eval":
      return { label: "执行动态脚本", summary: "实时交互逻辑", icon: "⚡" };
    default: {
      let paramSnippet = "";
      if (params && typeof params === "object") {
        try {
          paramSnippet = JSON.stringify(params);
          if (paramSnippet.length > 28) paramSnippet = paramSnippet.slice(0, 25) + "...";
        } catch {}
      }
      return { label: op || "设计指令", summary: paramSnippet, icon: "⚡" };
    }
  }
}

export function notifyRemoteAgentOperation(
  opName: string,
  result?: { success: boolean; message?: string; durationMs?: number; data?: any },
  caller = "外部 Agent (MCP)",
  params?: any,
) {
  const info = getOpFriendlyInfo(opName, params);

  remoteAgentState.active = true;
  remoteAgentState.caller = caller;
  remoteAgentState.lastOp = opName;
  remoteAgentState.lastOpLabel = info.label;
  remoteAgentState.lastOpParamsSummary = info.summary;
  remoteAgentState.lastActiveTime = Date.now();

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  if (result === undefined) {
    remoteAgentState.isExecuting = true;
    remoteAgentState.totalOps++;
    remoteAgentState.currentMessage = `正在执行: ${info.label} (${opName})`;
  } else {
    remoteAgentState.isExecuting = false;
    remoteAgentState.lastOpDurationMs = result.durationMs || 0;
    remoteAgentState.currentMessage = result.success
      ? `执行成功: ${info.label}${result.durationMs ? ` (${result.durationMs}ms)` : ""}`
      : `执行失败: ${info.label} (${result.message || "执行异常"})`;

    remoteAgentState.recentOps.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: timeStr,
      op: opName,
      opLabel: info.label,
      paramsSummary: info.summary,
      durationMs: result.durationMs,
      success: result.success,
      message: result.message,
    });
    if (remoteAgentState.recentOps.length > 30) {
      remoteAgentState.recentOps.pop();
    }
  }

  if (remoteActiveResetTimer) {
    clearTimeout(remoteActiveResetTimer);
  }
  // 保持高亮展示 6.5 秒，让用户有充足的时间看清全局边框与执行结果，避免一闪而过
  remoteActiveResetTimer = setTimeout(() => {
    remoteAgentState.active = false;
    remoteAgentState.isExecuting = false;
    remoteAgentState.currentMessage = `外部 Agent 创作完成 (累计 ${remoteAgentState.totalOps} 步操作)`;
  }, 6500);
}

export function dismissRemoteAgentHUD() {
  remoteAgentState.active = false;
  remoteAgentState.isExecuting = false;
}

let loopAbortController: AbortController | null = null;
let heartbeatTimer: any = null;

export function addStationLog(text: string, type: StationLogItem["type"] = "info") {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  stationState.logs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time: timeStr,
    type,
    text,
  });
  if (stationState.logs.length > 100) {
    stationState.logs.pop();
  }
}

function startHeartbeat(job: DesignJobRecord) {
  stopHeartbeat();
  stationState.heartbeatRemaining = 45;

  heartbeatTimer = setInterval(async () => {
    stationState.heartbeatRemaining--;
    if (stationState.heartbeatRemaining <= 0) {
      stationState.heartbeatRemaining = 45;
      if (!job.id || !job.leaseToken) return;
      try {
        await apiInstance.post("/api/design-job/renew", {
          jobId: job.id,
          leaseToken: job.leaseToken,
          stage: stationState.currentStage || "executing",
          progress: 50,
        });
      } catch (err: any) {
        addStationLog(`租约续期异常: ${err?.message || "网络波动"}`, "warn");
      }
    }
  }, 1000);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  stationState.heartbeatRemaining = 45;
}

export async function startStation() {
  if (stationState.enabled) return;
  const loginStore = useLoginStatusStore();
  if (!loginStore.isLogin) {
    addStationLog("请先登录设计端后再开启自动制作工位", "error");
    return;
  }

  stationState.enabled = true;
  stationState.consecutiveErrors = 0;
  addStationLog(`工位 [${stationState.workerId}] 启动挂机自动制作`, "info");
  runStationLoop();
}

export function stopStation(reason = "用户手动停止") {
  stationState.enabled = false;
  stationState.status = "idle";
  stationState.currentJob = null;
  stopHeartbeat();
  if (loopAbortController) {
    loopAbortController.abort();
    loopAbortController = null;
  }
  addStationLog(`自动制作工位已停止 (${reason})`, "warn");
}

export function clearStationLogs() {
  stationState.logs = [];
}

async function runStationLoop() {
  loopAbortController = new AbortController();

  while (stationState.enabled) {
    // 刹车 3：连续 5 次报错自动熔断停止，防止空转刷爆模型 API 或服务
    if (stationState.consecutiveErrors >= 5) {
      stationState.status = "paused_error";
      stationState.enabled = false;
      addStationLog(
        "【工位熔断保护】连续 5 次执行报错，工位已自动紧急暂停！请检查网络连接、模型配额后手动恢复。",
        "error",
      );
      break;
    }

    try {
      stationState.status = "claiming";
      stationState.currentStage = "认领任务中";

      const claimRes = await apiInstance.post("/api/design-job/claim", {
        workerId: stationState.workerId,
        connectionId: websocketClient.state.connectionId || undefined,
        brain: "client-agent",
      });

      const job: DesignJobRecord | null = claimRes.data?.data?.job || claimRes.data?.job || null;

      if (!job) {
        stationState.status = "waiting";
        stationState.currentStage = "等待新灵感任务";
        await sleep(5000);
        continue;
      }

      stationState.currentJob = job;
      startHeartbeat(job);

      if (job.type === "rework") {
        await executeReworkJob(job);
      } else {
        await executeProduceJob(job);
      }

      stopHeartbeat();
      stationState.consecutiveErrors = 0;
      stationState.currentJob = null;
      stationState.status = "idle";

      // 任务间休眠 2 秒，给 UI 与画布留出喘息与刷新间歇
      await sleep(2000);
    } catch (loopErr: any) {
      stopHeartbeat();
      const errorMsg = loopErr?.message || String(loopErr);
      stationState.consecutiveErrors++;
      addStationLog(`任务处理异常 (${stationState.consecutiveErrors}/5): ${errorMsg}`, "error");

      // 释放租约
      if (stationState.currentJob?.id && stationState.currentJob?.leaseToken) {
        try {
          await apiInstance.post("/api/design-job/release", {
            jobId: stationState.currentJob.id,
            leaseToken: stationState.currentJob.leaseToken,
            error: errorMsg,
          });
        } catch {}
      }

      stationState.currentJob = null;
      await sleep(4000);
    }
  }
}

function resolveJobDimensions(sizeSpec: any): { width: number; height: number } {
  // 默认超清规格（用户未指定尺寸时采用 2400x2400 300DPI）
  const DEFAULT_SIZE = 2400;
  if (!sizeSpec) {
    return { width: DEFAULT_SIZE, height: DEFAULT_SIZE };
  }

  if (typeof sizeSpec === "object" && sizeSpec.width && sizeSpec.height) {
    return {
      width: Math.max(100, Math.round(Number(sizeSpec.width)) || DEFAULT_SIZE),
      height: Math.max(100, Math.round(Number(sizeSpec.height)) || DEFAULT_SIZE),
    };
  }

  if (typeof sizeSpec === "string" && sizeSpec.trim()) {
    const s = sizeSpec.trim();
    // 匹配如 3000x1376, 900x400, 2400*2400
    const m = s.match(/(\d+(?:\.\d+)?)\s*[x×X＊*]\s*(\d+(?:\.\d+)?)/);
    if (m) {
      return {
        width: Math.round(parseFloat(m[1])),
        height: Math.round(parseFloat(m[2])),
      };
    }
    // 匹配比例如 16:9, 3:1, 3:4, 2:1 等
    const r = s.match(/(\d+(?:\.\d+)?)\s*[:：\/]\s*(\d+(?:\.\d+)?)/);
    if (r) {
      const rw = parseFloat(r[1]);
      const rh = parseFloat(r[2]);
      if (rw > 0 && rh > 0) {
        // 短边至少 2400px，确保超清印刷质量
        const minSide = 2400;
        if (rw >= rh) {
          return { width: Math.round((rw / rh) * minSide), height: minSide };
        } else {
          return { width: minSide, height: Math.round((rh / rw) * minSide) };
        }
      }
    }
  }

  return { width: DEFAULT_SIZE, height: DEFAULT_SIZE };
}

async function executeProduceJob(job: DesignJobRecord) {
  stationState.status = "producing";
  const insp = job.inspiration;
  const jobTitle = insp?.title || `灵感任务 #${job.inspirationId}`;
  const primaryImage = Array.isArray(insp?.images)
    ? insp.images.find((u) => typeof u === "string" && u.trim())?.trim() || undefined
    : undefined;
  const replicateMode: ReplicateMode = job.type === "variant" ? "similar" : "same";

  addStationLog(
    `认领到【${job.type === "variant" ? "变体制作" : "新灵感制作"}${primaryImage ? "·带参考图" : ""}】：${jobTitle}`,
    "info",
  );

  // 1. 若灵感带参考图且视觉能力可用，先走印花视觉解构提取文案/HEX底色/构图骨架
  let printAnalysis: PrintAnalysisResult | null = null;
  if (primaryImage && isVisionAvailable()) {
    stationState.currentStage = "视觉解构参考图";
    try {
      printAnalysis = await analyzePrintImage(primaryImage);
      addStationLog(
        `参考图解构完成：文案 ${printAnalysis.texts.length} 条、配色 ${printAnalysis.colors.length} 个`,
        "info",
      );
    } catch (err: any) {
      addStationLog(
        `参考图解构降级为直传视觉参考：${err?.message || "分析失败"}`,
        "warn",
      );
    }
  }

  stationState.currentStage = "设置画布";

  // 2. 设置尺寸：优先显式 sizeSpec，其次参考图印花本体尺寸，最后默认 2400x2400 超清规格
  const analysisCanvas = (printAnalysis as any)?.designCanvas;
  const effectiveSizeSpec =
    job.sizeSpec ||
    (analysisCanvas?.width > 0 && analysisCanvas?.height > 0
      ? { width: Math.round(analysisCanvas.width), height: Math.round(analysisCanvas.height) }
      : undefined);
  const { width: targetWidth, height: targetHeight } = resolveJobDimensions(effectiveSizeSpec);
  await executeAITool("canvas.setSize", { width: targetWidth, height: targetHeight });
  await executeAITool("canvas.clear", {});
  currentEditingCustomStickerId.value = null;

  stationState.currentStage = "Agent 排版生成";

  // 3. 组装设计指令（带图解构成功走 buildReplicateBrief；否则走常规/带参考图指令）
  const digestHint = insp?.feedbackDigest
    ? `\n【历史审核反馈要求】\n${insp.feedbackDigest}\n`
    : "";
  const promptHints = insp?.promptHints ? `\n参考元素/风格：${insp.promptHints}` : "";
  const avoidNotes = insp?.avoidNotes ? `\n避免出现：${insp.avoidNotes}` : "";

  let designPrompt: string;
  if (printAnalysis) {
    const brief = buildReplicateBrief(printAnalysis, replicateMode);
    designPrompt = [
      brief,
      promptHints,
      avoidNotes,
      digestHint,
      `【工位交付模式】本次由工位在质检通过后统一保存，请先完成画布设计与细节打磨（无需调用 canvas.updateAndSaveSticker）。`,
    ]
      .filter(Boolean)
      .join("\n");
  } else {
    designPrompt = [
      `请为设计灵感【${jobTitle}】制作一款精致贴纸作品。`,
      insp?.content ? `灵感详述：${insp.content}` : "",
      insp?.keywords?.length ? `关键词标签：${insp.keywords.join(", ")}` : "",
      promptHints,
      avoidNotes,
      digestHint,
      primaryImage
        ? `已附带视觉参考图，请严格参考其印花本体的主文案、配色与构图气质（忽略周围拍摄背景）；若文字描述与参考图冲突，以参考图为准。`
        : "",
      `画布尺寸已设为 ${targetWidth}x${targetHeight}（超清高分辨率印刷级标准）。`,
      `要求：优先使用 resource.searchFont 绑定真实字体、resource.searchSticker 绑定外部插画/纹样素材，再用 canvas.addHtml 注入现代视觉排版，主标题突出、构图饱满居中。本次由工位在质检后统一保存。`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const { designAgent } = await import("@/ai/langgraph");
  designAgent.state.messages.length = 0;
  designAgent.state.plan = null;

  await designAgent.chat(designPrompt, {
    allowInteraction: false,
    deliveryHandledExternally: true,
    referenceImage: primaryImage,
  });

  // 4. 保存前质检：硬伤审计 + 视觉评分/双图对照验收，不达标则自动定向修订一轮
  const expectedTexts = printAnalysis?.texts?.map((t) => t.content).filter(Boolean);
  const expectedBackground = printAnalysis?.colors?.find((c) => c.role === "background")?.hex;

  stationState.currentStage = "画布硬伤审计";
  let auditRes = await auditCurrentCanvas({
    expectedWidth: targetWidth,
    expectedHeight: targetHeight,
    expectedTexts: expectedTexts?.length ? expectedTexts : undefined,
    expectedBackground,
  });

  stationState.currentStage = primaryImage ? "复刻双图对照验收" : "视觉质量评分";
  const visualEval = primaryImage
    ? await evaluateReplicationVisual(primaryImage, {
        mode: replicateMode,
        expectedBackground,
        expectedTexts,
      })
    : await evaluateCanvasVisual();

  const needsRevision =
    auditRes.criticalIssues.length > 0 || Boolean(visualEval?.shouldIterate);

  if (needsRevision) {
    const fixLines: string[] = [];
    if (auditRes.criticalIssues.length > 0) {
      fixLines.push(
        `【画布硬伤必须修复】\n${auditRes.criticalIssues.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      );
    }
    if (visualEval?.shouldIterate) {
      const repEval = "colorFidelity" in visualEval ? (visualEval as ReplicationEvaluation) : null;
      const scoreLabel = repEval
        ? `综合 ${repEval.score}/10 · 配色 ${repEval.colorFidelity}/10 · 构图 ${repEval.layoutFidelity}/10 · 文案 ${repEval.textFidelity}/10`
        : `视觉评分 ${visualEval.score}/10`;
      fixLines.push(
        `【视觉质检未达标（${scoreLabel}）】${visualEval.iterationFocus ? `\n重点：${visualEval.iterationFocus}` : ""}${visualEval.suggestions.length ? `\n修正建议：\n${visualEval.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}` : ""}`,
      );
    }

    stationState.currentStage = "质检未通过·自动修订";
    addStationLog(
      `质检触发自动修订（硬伤 ${auditRes.criticalIssues.length} 条，视觉分 ${visualEval?.score ?? "-"}/10）`,
      "warn",
    );

    const fixPrompt = [
      `请针对当前画布设计执行一次精准修订，逐项解决以下质检问题（保留已有优秀结构，不要推倒重做）：`,
      ...fixLines,
      `修订完成后保持画布即可，无需保存，由工位统一落库。`,
    ].join("\n\n");

    await designAgent.chat(fixPrompt, {
      allowInteraction: false,
      deliveryHandledExternally: true,
      referenceImage: primaryImage,
    });

    auditRes = await auditCurrentCanvas({
      expectedWidth: targetWidth,
      expectedHeight: targetHeight,
      expectedTexts: expectedTexts?.length ? expectedTexts : undefined,
      expectedBackground,
    });
  }

  stationState.currentStage = "保存入库";
  let customStickerId = currentEditingCustomStickerId.value;

  // 5. 工位统一保存入库
  if (!customStickerId) {
    const saveRes = await executeAITool("canvas.updateAndSaveSticker", {
      name: `${jobTitle.slice(0, 20)}·${job.type === "variant" ? "变体" : primaryImage ? "复刻" : "v1"}`,
      description: insp?.content?.slice(0, 100) || "自动制作贴纸作品",
      keywords: (insp?.keywords || ["贴纸", "AI自动制作"]).join(","),
      jobId: job.id,
      inspirationId: job.inspirationId,
      reviewStatus: "pending",
    });

    customStickerId = saveRes?.data?.customStickerId || saveRes?.data?.id || currentEditingCustomStickerId.value;
  }

  if (!customStickerId) {
    throw new Error("制作完成但未能生成有效的自定义贴纸 ID");
  }

  // 6. 提交完成
  stationState.currentStage = "上报完成";
  await apiInstance.post("/api/design-job/complete", {
    jobId: job.id,
    leaseToken: job.leaseToken,
    resultStickerId: String(customStickerId),
  });

  stationState.todayProduced++;
  addStationLog(
    `【制作成功】贴纸 #${customStickerId} 已入库并提交审核 (硬伤: ${auditRes.criticalIssues.length}，视觉分: ${visualEval?.score ?? "-"}/10)`,
    "success",
  );
}

async function executeReworkJob(job: DesignJobRecord) {
  stationState.status = "reworking";
  addStationLog(`认领到【返工微调任务】：源贴纸 #${job.sourceStickerId}`, "warn");

  stationState.currentStage = "加载原稿设计";

  // 1. 加载原贴纸基稿
  const loadRes = await executeAITool("canvas.loadCustomSticker", {
    customStickerId: job.sourceStickerId,
  });

  if (!loadRes?.success) {
    throw new Error(`加载原设计失败: ${loadRes?.message || "未找到基稿画布数据"}`);
  }

  // 确保本次保存作为新贴纸版本，不直接覆盖原图 ID
  currentEditingCustomStickerId.value = null;

  stationState.currentStage = "根据反馈微调";

  const reworkPrompt = [
    `【返工微调任务】针对当前画布作品，用户在快速审核时提出了以下改进要求：`,
    `反馈指示：${job.feedbackPrompt || "请调整细节层次与文字排版"}`,
    `要求：请基于当前画布现有内容进行 Targeted 微调（例如调整文字大小、对比色、元素位置、去除重叠或修饰边距），保持整体设计与主视觉稳定，切勿从零推倒重做。完成后调用 canvas.updateAndSaveSticker 保存交付。`,
  ].join("\n\n");

  const { designAgent } = await import("@/ai/langgraph");
  designAgent.state.messages.length = 0;

  await designAgent.chat(reworkPrompt, {
    allowInteraction: false,
    deliveryHandledExternally: false,
  });

  stationState.currentStage = "保存微调成品";

  // 2. 检查或补发保存
  let customStickerId = currentEditingCustomStickerId.value;
  if (!customStickerId) {
    const saveRes = await executeAITool("canvas.updateAndSaveSticker", {
      name: `${loadRes.data?.name || "原稿"} (微调版)`,
      jobId: job.id,
      inspirationId: job.inspirationId,
      parentId: job.sourceStickerId,
      reviewStatus: "pending",
    });
    customStickerId = saveRes?.data?.customStickerId || saveRes?.data?.id || currentEditingCustomStickerId.value;
  }

  if (!customStickerId) {
    throw new Error("微调完成但未能保存为有效的新贴纸");
  }

  // 3. 提交完成
  stationState.currentStage = "交付闭环";
  await apiInstance.post("/api/design-job/complete", {
    jobId: job.id,
    leaseToken: job.leaseToken,
    resultStickerId: String(customStickerId),
  });

  stationState.todayReworked++;
  addStationLog(`【返工完成】已生成优化版贴纸 #${customStickerId}，旧版本已自动标记为 superseded`, "success");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
