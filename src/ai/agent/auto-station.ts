import { reactive, ref, watch } from "vue";
import { apiInstance } from "@/api/apiInstance";
import { executeAITool } from "../shared/execute-tool";
import { websocketClient } from "@/services/websocketClient";
import { useLoginStatusStore } from "@/store/stores/login";
import { currentEditingCustomStickerId } from "@/components/design/layout/canvas";
import { auditCurrentCanvas } from "../canvas-audit";

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

async function executeProduceJob(job: DesignJobRecord) {
  stationState.status = "producing";
  const insp = job.inspiration;
  const jobTitle = insp?.title || `灵感任务 #${job.inspirationId}`;
  addStationLog(
    `认领到【${job.type === "variant" ? "变体制作" : "新灵感制作"}】：${jobTitle}`,
    "info",
  );

  stationState.currentStage = "设置画布";

  // 1. 设置尺寸
  const targetWidth = job.sizeSpec?.width || 800;
  const targetHeight = job.sizeSpec?.height || 800;
  await executeAITool("canvas.setSize", { width: targetWidth, height: targetHeight });
  await executeAITool("canvas.clear", {});
  currentEditingCustomStickerId.value = null;

  stationState.currentStage = "Agent 排版生成";

  // 2. 组装自然语言提示词
  const digestHint = insp?.feedbackDigest
    ? `\n【历史审核反馈要求】\n${insp.feedbackDigest}\n`
    : "";
  const promptHints = insp?.promptHints ? `\n参考元素/风格：${insp.promptHints}` : "";
  const avoidNotes = insp?.avoidNotes ? `\n避免出现：${insp.avoidNotes}` : "";

  const designPrompt = [
    `请为设计灵感【${jobTitle}】制作一款精致贴纸作品。`,
    insp?.content ? `灵感详述：${insp.content}` : "",
    insp?.keywords?.length ? `关键词标签：${insp.keywords.join(", ")}` : "",
    promptHints,
    avoidNotes,
    digestHint,
    `画布尺寸已设为 ${targetWidth}x${targetHeight}。`,
    `要求：使用 canvas.addHtml 注入现代视觉排版，主标题突出，层级分明，色彩协调且自成一体，构图饱满且居中。完成后请严格调用 canvas.updateAndSaveSticker 保存入库。`,
  ].filter(Boolean).join("\n");

  const { designAgent } = await import("@/ai/langgraph");
  designAgent.state.messages.length = 0;
  designAgent.state.plan = null;

  await designAgent.chat(designPrompt, {
    allowInteraction: false,
    deliveryHandledExternally: false,
  });

  stationState.currentStage = "内容审查与交付";

  // 3. 画布审计（如果未保存则兜底调用保存）
  const auditRes = await auditCurrentCanvas({
    expectedWidth: targetWidth,
    expectedHeight: targetHeight,
  });

  let customStickerId = currentEditingCustomStickerId.value;

  // 兜底：如果 Agent 没调用保存，工位自动补发 updateAndSaveSticker
  if (!customStickerId) {
    stationState.currentStage = "自动补发保存";
    const saveRes = await executeAITool("canvas.updateAndSaveSticker", {
      name: `${jobTitle.slice(0, 20)}·${job.type === "variant" ? "变体" : "v1"}`,
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

  // 4. 提交完成
  stationState.currentStage = "上报完成";
  await apiInstance.post("/api/design-job/complete", {
    jobId: job.id,
    leaseToken: job.leaseToken,
    resultStickerId: String(customStickerId),
  });

  stationState.todayProduced++;
  addStationLog(`【制作成功】贴纸 #${customStickerId} 已入库并提交审核 (硬伤: ${auditRes.criticalIssues.length})`, "success");
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
