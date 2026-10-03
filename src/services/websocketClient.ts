import { io, type Socket } from "socket.io-client";
import { reactive } from "vue";
import { getDesignRuntimeSnapshot } from "./designRuntime";
import { useLoginStatusStore } from "@/store/stores/login";

type WsStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

const CLIENT_SOURCE = "设计端";
const HEARTBEAT_INTERVAL = 15_000;
const HEARTBEAT_TIMEOUT = 30_000;
const REMOTE_COMMAND_TIMEOUT = 30_000;
const AGENT_STATUS_COALESCE_MS = 300;
const AGENT_STATUS_REFRESH_MS = 30_000;
const LAUNCH_RUNTIME_KEY = "yishe_tool_launch_runtime";
const LAUNCH_PROMPT_RUNTIME_KEY = "yishe_tool_launch_prompt_runtime";
const designRuntime = getDesignRuntimeSnapshot();

function getCurrentUserId(): string | null {
  try {
    const loginStore = useLoginStatusStore();
    return loginStore.userInfo?.id ? String(loginStore.userInfo.id) : null;
  } catch {
    return null;
  }
}

function generateClientId() {
  return `designtool-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAccessToken(): string | undefined {
  try {
    const raw = localStorage.getItem("token");
    if (!raw) return undefined;
    const cleaned = raw
      .replace(/^"|"$/g, "")
      .replace(/^Bearer\s+/i, "")
      .trim();
    return cleaned || undefined;
  } catch {
    return undefined;
  }
}

function getDefaultWsUrl() {
  const explicitUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (explicitUrl) return explicitUrl;

  const apiBase = String(import.meta.env.VITE_API || "").trim();
  let origin = "";
  if (apiBase) {
    try {
      if (/^https?:\/\//i.test(apiBase)) {
        origin = new URL(apiBase).origin;
      } else if (typeof window !== "undefined") {
        origin = new URL(apiBase, window.location.origin).origin;
      }
    } catch {
      // Fall through.
    }
  }

  if (!origin) {
    origin = typeof window === "undefined" ? "" : window.location.origin;
  }

  if (!origin) return "";

  // 服务端 WebSocketGateway 使用 namespace: "/ws"，
  // socket.io-client 需要在 URL 中带上 namespace 路径才能正确连接。
  return origin.replace(/\/+$/, "") + "/ws";
}

function parseBrowserInfo(ua: string) {
  if (ua.includes("Edg/"))
    return { name: "Edge", version: ua.match(/Edg\/([\d.]+)/)?.[1] };
  if (ua.includes("Chrome/"))
    return { name: "Chrome", version: ua.match(/Chrome\/([\d.]+)/)?.[1] };
  if (ua.includes("Firefox/"))
    return { name: "Firefox", version: ua.match(/Firefox\/([\d.]+)/)?.[1] };
  if (ua.includes("Safari/") && ua.includes("Version/"))
    return { name: "Safari", version: ua.match(/Version\/([\d.]+)/)?.[1] };
  return { name: "Unknown" };
}

function parseOsInfo(ua: string) {
  if (ua.includes("Windows NT 10")) return { name: "Windows", version: "10" };
  if (ua.includes("Windows NT 6.3")) return { name: "Windows", version: "8.1" };
  if (ua.includes("Mac OS X"))
    return {
      name: "macOS",
      version: ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, "."),
    };
  if (ua.includes("Linux")) return { name: "Linux" };
  return { name: "Unknown" };
}

function buildScreenInfo() {
  if (typeof window === "undefined") return undefined;
  return {
    width: window.screen?.width,
    height: window.screen?.height,
    availWidth: window.screen?.availWidth,
    availHeight: window.screen?.availHeight,
    pixelRatio: window.devicePixelRatio,
    colorDepth: window.screen?.colorDepth,
  };
}

function readLaunchRuntimeInfo() {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = sessionStorage.getItem(LAUNCH_RUNTIME_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (
      parsed?.source !== "admin-design-tool" ||
      !String(parsed?.clientId || "").trim() ||
      !String(parsed?.profileId || "").trim()
    ) {
      return undefined;
    }

    return {
      source: "admin-design-tool",
      clientId: String(parsed.clientId).trim(),
      profileId: String(parsed.profileId).trim(),
      profileName: String(parsed.profileName || "").trim() || undefined,
      machineCode: String(parsed.machineCode || "").trim() || undefined,
      workspaceId:
        String(parsed.workspaceId || designRuntime.workspaceId).trim() ||
        designRuntime.workspaceId,
      launchedAt: String(parsed.launchedAt || "").trim() || undefined,
    };
  } catch {
    return undefined;
  }
}

function consumeLaunchPrompt() {
  if (typeof window === "undefined") return "";

  try {
    const raw = sessionStorage.getItem(LAUNCH_PROMPT_RUNTIME_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    const prompt = String(parsed?.prompt || "").trim();
    if (!prompt || parsed?.consumed === true) return "";
    sessionStorage.setItem(
      LAUNCH_PROMPT_RUNTIME_KEY,
      JSON.stringify({
        ...parsed,
        consumed: true,
        consumedAt: new Date().toISOString(),
      }),
    );
    return prompt;
  } catch {
    sessionStorage.removeItem(LAUNCH_PROMPT_RUNTIME_KEY);
    return "";
  }
}

export type WebsocketEvents = {
  log: { level: "info" | "warn" | "error"; message: string };
  statusChanged: WsStatus;
};

type EventHandler<T = any> = (event: T) => void;

function createEmitter<T extends Record<string, any>>() {
  const listeners = new Map<keyof T, Set<EventHandler<any>>>();
  return {
    on<K extends keyof T>(type: K, handler: EventHandler<T[K]>) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler);
    },
    off<K extends keyof T>(type: K, handler: EventHandler<T[K]>) {
      listeners.get(type)?.delete(handler);
    },
    emit<K extends keyof T>(type: K, event: T[K]) {
      listeners.get(type)?.forEach((handler) => handler(event));
    },
  };
}

const clientId = generateClientId();

const clientInfo = reactive({
  clientId,
  source: CLIENT_SOURCE,
  screenSharing: false,
  timestamp: new Date().toISOString(),
  app: {
    name: "yishe-tool",
    displayName: "设计端",
    version:
      (import.meta.env.VITE_APP_VERSION as string | undefined) || undefined,
    mode: import.meta.env.MODE,
  },
  language: typeof navigator !== "undefined" ? navigator.language : "unknown",
  uiLanguage: typeof navigator !== "undefined" ? navigator.language : "unknown",
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  browser:
    typeof navigator !== "undefined"
      ? parseBrowserInfo(navigator.userAgent)
      : { name: "Unknown" },
  os:
    typeof navigator !== "undefined"
      ? parseOsInfo(navigator.userAgent)
      : { name: "Unknown" },
  device: {
    memory:
      typeof navigator !== "undefined"
        ? (navigator as any).deviceMemory
        : undefined,
    hardwareConcurrency:
      typeof navigator !== "undefined"
        ? navigator.hardwareConcurrency
        : undefined,
    touchPoints:
      typeof navigator !== "undefined" ? navigator.maxTouchPoints : undefined,
  },
  machine: {
    code: `DESIGN-TOOL-${clientId.slice(-12).toUpperCase()}`,
    platform: typeof navigator !== "undefined" ? navigator.platform : undefined,
  },
  screen: buildScreenInfo(),
  designTool: {
    type: "sticker-design",
    canvasEnabled: true,
    operationsVersion: "1.0",
  },
  designWorker: {
    workerId: designRuntime.workerId,
    workspaceId: designRuntime.workspaceId,
    capacity: 1,
    activeRequestId: null as string | null,
    state: "idle",
    batch: null as Record<string, any> | null,
    updatedAt: new Date().toISOString(),
  },
  launch: readLaunchRuntimeInfo(),
});

const emitter = createEmitter<WebsocketEvents>();

let socket: Socket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
let lastPingTimestamp: number | null = null;
let intentionalDisconnect = false;
let lastAuthToken: string | undefined;
let launchPromptDispatching = false;
let activeRemoteRequestId: string | null = null;
const cancelledRemoteRequestIds = new Set<string>();
let pendingAgentStatus: Record<string, any> | null = null;
let agentStatusTimer: ReturnType<typeof setTimeout> | null = null;
let lastAgentStatusFingerprint = "";
let lastAgentStatusSentAt = 0;
let pendingBatchProgress: Record<string, any> | null = null;
let batchProgressTimer: ReturnType<typeof setTimeout> | null = null;

const wsState = reactive({
  endpoint: getDefaultWsUrl(),
  status: "idle" as WsStatus,
  connectedAt: null as string | null,
  lastPingAt: null as string | null,
  lastPongAt: null as string | null,
  lastLatencyMs: null as number | null,
  lastError: null as string | null,
  retryCount: 0,
  connectionId: null as string | null,
});

function updateState(patch: Partial<typeof wsState>) {
  Object.assign(wsState, patch);
  emitter.emit("statusChanged", wsState.status);
}

function startHeartbeatLoop() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (!socket?.connected) return;
    lastPingTimestamp = Date.now();
    updateState({ lastPingAt: new Date(lastPingTimestamp).toISOString() });
    socket.emit("ping");

    heartbeatTimeoutTimer = setTimeout(() => {
      if (wsState.status === "connected") {
        emitter.emit("log", {
          level: "warn",
          message: "[ws] heartbeat timeout, forcing reconnect",
        });
        socket?.disconnect();
        socket?.connect();
      }
    }, HEARTBEAT_TIMEOUT);
  }, HEARTBEAT_INTERVAL);
}

function clearHeartbeatTimeout() {
  if (heartbeatTimeoutTimer) {
    clearTimeout(heartbeatTimeoutTimer);
    heartbeatTimeoutTimer = null;
  }
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  clearHeartbeatTimeout();
}

function cleanupSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.io.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  stopHeartbeat();
}

function emitClientInfo() {
  if (!socket?.connected) return;
  clientInfo.timestamp = new Date().toISOString();
  clientInfo.screen = buildScreenInfo();
  clientInfo.launch = readLaunchRuntimeInfo();
  socket.emit("client-info", clientInfo);
}

function flushBatchProgress() {
  if (batchProgressTimer) {
    clearTimeout(batchProgressTimer);
    batchProgressTimer = null;
  }
  if (!pendingBatchProgress) return;
  const progress = pendingBatchProgress;
  pendingBatchProgress = null;
  clientInfo.designWorker.batch = progress;
  emitClientInfo();
  if (socket?.connected && activeRemoteRequestId) {
    socket.emit("remote-result", {
      requestId: activeRemoteRequestId,
      success: true,
      phase: "progress",
      batch: progress,
      message: `自动制作 ${progress.completed || 0}/${progress.total || 0}`,
      workerId: designRuntime.workerId,
      workspaceId: designRuntime.workspaceId,
      reportedAt: new Date().toISOString(),
    });
  }
}

function setBatchProgress(progress: Record<string, any>) {
  const active = ["preparing", "running", "paused"].includes(
    progress?.status,
  );
  const currentRequestId = clientInfo.designWorker.activeRequestId;
  let batchRequestId =
    activeRemoteRequestId || String(currentRequestId || "").trim() || null;
  if (active && !activeRemoteRequestId && !currentRequestId) {
    batchRequestId = `local-batch-${progress?.startedAt || Date.now()}`;
    clientInfo.designWorker.state = "busy";
    clientInfo.designWorker.activeRequestId = batchRequestId;
    clientInfo.designWorker.updatedAt = new Date().toISOString();
  } else if (
    !active &&
    !activeRemoteRequestId &&
    String(currentRequestId || "").startsWith("local-batch-")
  ) {
    clientInfo.designWorker.state = "idle";
    clientInfo.designWorker.activeRequestId = null;
    clientInfo.designWorker.updatedAt = new Date().toISOString();
  }
  const normalizedProgress = {
    ...progress,
    requestId: progress?.requestId || batchRequestId,
  };
  pendingBatchProgress = normalizedProgress;
  clientInfo.designWorker.batch = normalizedProgress;
  const terminal = ["idle", "done", "stopped"].includes(progress?.status);
  if (terminal) {
    flushBatchProgress();
    return;
  }
  if (!batchProgressTimer) {
    batchProgressTimer = setTimeout(flushBatchProgress, 160);
  }
}

function setRemoteWorkerState(
  state: "idle" | "busy" | "cancelling",
  requestId: string | null,
) {
  Object.assign(clientInfo.designWorker, {
    state,
    activeRequestId: requestId,
    updatedAt: new Date().toISOString(),
  });
  emitClientInfo();
}

function getAgentStatusFingerprint(status: Record<string, any>) {
  const { updatedAt: _updatedAt, ...stableStatus } = status;
  return JSON.stringify(stableStatus);
}

function flushAgentStatus(force = false) {
  if (agentStatusTimer) {
    clearTimeout(agentStatusTimer);
    agentStatusTimer = null;
  }
  if (!pendingAgentStatus || !socket?.connected) return;

  const status = {
    ...pendingAgentStatus,
    workerId: designRuntime.workerId,
    workspaceId: designRuntime.workspaceId,
    requestId: activeRemoteRequestId,
  };
  const fingerprint = getAgentStatusFingerprint(status);
  const now = Date.now();
  if (
    !force &&
    fingerprint === lastAgentStatusFingerprint &&
    now - lastAgentStatusSentAt < AGENT_STATUS_REFRESH_MS
  ) {
    pendingAgentStatus = null;
    return;
  }

  socket.emit("agent-status", status);
  pendingAgentStatus = null;
  lastAgentStatusFingerprint = fingerprint;
  lastAgentStatusSentAt = now;
}

function queueAgentStatus(status: Record<string, any>) {
  pendingAgentStatus = status;
  const terminal = status.agentState === "idle" || status.agentState === "error";
  if (terminal) {
    flushAgentStatus(true);
    return;
  }
  if (!agentStatusTimer) {
    agentStatusTimer = setTimeout(
      () => flushAgentStatus(),
      AGENT_STATUS_COALESCE_MS,
    );
  }
}

async function syncCurrentAgentStatus() {
  try {
    const { designAgent } = await import("@/ai/langgraph");
    const state = designAgent.state;
    const plan = state.plan;
    const completedSteps = Array.isArray(plan?.steps)
      ? plan.steps.filter((step: any) =>
          ["done", "failed", "skipped"].includes(step?.status),
        ).length
      : 0;
    queueAgentStatus({
      available: state.status === "idle",
      agentState: state.status === "done" ? "idle" : state.status,
      plan: plan
        ? {
            goal: plan.goal,
            totalSteps: plan.steps.length,
            currentStep: completedSteps,
          }
        : null,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Agent UI can still be loading during the first socket connection.
  }
}

function buildQuery() {
  return {
    clientSource: CLIENT_SOURCE,
    clientId,
    machineCode: clientInfo.machine?.code || "",
  };
}

function bindSocketEvents(currentSocket: Socket) {
  currentSocket.on("connect", () => {
    const socketId = currentSocket.id;
    lastAuthToken = getAccessToken();
    updateState({
      status: "connected",
      connectedAt: new Date().toISOString(),
      lastError: null,
      retryCount: 0,
      connectionId: clientId,
    });
    emitter.emit("log", {
      level: "info",
      message: `[ws] connected (socket: ${socketId}, connection: ${clientId})`,
    });
    emitClientInfo();
    startHeartbeatLoop();
    flushAgentStatus(true);
    void syncCurrentAgentStatus();
    void dispatchLaunchPromptIfNeeded();
  });

  currentSocket.on("disconnect", (reason) => {
    emitter.emit("log", {
      level: "warn",
      message: `[ws] disconnected: ${reason}`,
    });
    stopHeartbeat();
    updateState({
      status: intentionalDisconnect ? "disconnected" : "error",
      lastError: reason || null,
      connectedAt: null,
      connectionId: null,
    });
  });

  currentSocket.on("pong", () => {
    clearHeartbeatTimeout();
    const now = Date.now();
    updateState({
      status: "connected",
      lastPongAt: new Date(now).toISOString(),
      lastLatencyMs: lastPingTimestamp ? now - lastPingTimestamp : null,
      lastError: null,
    });
    lastPingTimestamp = null;
  });

  currentSocket.on("connect_error", (error) => {
    emitter.emit("log", {
      level: "error",
      message: `[ws] connect_error: ${error?.message || "Unknown error"}`,
    });
    updateState({
      status: "error",
      lastError: error?.message || "Unknown error",
    });
  });

  currentSocket.on("admin-message", (data: any) => {
    emitter.emit("log", {
      level: "info",
      message: `[ws] admin-message: ${typeof data === "string" ? data : JSON.stringify(data)}`,
    });
  });

  // 监听来自 admin 的远程命令
  currentSocket.on("remote-command", (data: any) => {
    // 防御性校验：验证发送者身份（服务端已做权限校验，此处为纵深防御）
    const sender = data?.sender;
    if (sender && sender.id) {
      const myUserId = getCurrentUserId();
      if (myUserId && String(sender.id) !== String(myUserId) && !sender.isAdmin) {
        emitter.emit("log", {
          level: "warn",
          message: `[ws] remote-command 拒绝: 发送者 ${sender.id} 非当前用户且非管理员`,
        });
        return;
      }
    }

    emitter.emit("log", {
      level: "info",
      message: `[ws] remote-command: ${data?.type} ${data?.requestId || ""}`,
    });
    handleRemoteCommand(data);
  });

  // 监听页面监控相关信令（轻量级，只交换 Peer ID，媒体流走 WebRTC P2P）
  currentSocket.on("canvas-monitor-request", (data: any) => {
    emitter.emit("log", {
      level: "info",
      message: `[ws] canvas-monitor-request from ${data?.adminPeerId || "unknown"}`,
    });
    handleCanvasMonitorRequest(data);
  });

  currentSocket.on("page-monitor-request", (data: any) => {
    emitter.emit("log", {
      level: "info",
      message: `[ws] page-monitor-request from ${data?.adminPeerId || "unknown"}`,
    });
    handleCanvasMonitorRequest(data);
  });
}

async function dispatchLaunchPromptIfNeeded() {
  if (launchPromptDispatching) return;

  const prompt = consumeLaunchPrompt();
  if (!prompt) return;

  // 安全加固：URL 参数中的 prompt 不再自动执行，需用户确认
  // 防止恶意链接通过 ?prompt=xxx 操控 AI Agent
  const confirmed = window.confirm(
    `检测到启动指令，是否执行？\n\n内容: ${prompt.slice(0, 200)}${prompt.length > 200 ? "..." : ""}`,
  );
  if (!confirmed) return;

  launchPromptDispatching = true;
  activeRemoteRequestId = "launch-prompt";
  setRemoteWorkerState("busy", "launch-prompt");
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    const { designAgent } = await import("@/ai/langgraph");
    await designAgent.chat(prompt, {
      allowInteraction: true,
      deliveryHandledExternally: false,
    });
  } catch (error: any) {
    if (socket?.connected) {
      socket.emit("remote-result", {
        requestId: `launch-prompt-${Date.now()}`,
        success: false,
        error: error?.message || "启动指令执行失败",
        message: "启动指令执行失败",
      });
    }
  } finally {
    launchPromptDispatching = false;
    if (activeRemoteRequestId === "launch-prompt") {
      activeRemoteRequestId = null;
      setRemoteWorkerState("idle", null);
    }
  }
}

/**
 * 处理页面监控请求（轻量级信令，只交换 Peer ID）
 */
async function handleCanvasMonitorRequest(data: any) {
  const { adminPeerId, requestId } = data || {};
  
  try {
    const response = await preparePageMonitorStream(data);
    
    if (socket?.connected && response.designToolPeerId) {
      socket.emit("remote-result", {
        requestId,
        success: true,
        designToolPeerId: response.designToolPeerId,
        adminPeerId,
        streamMode: "page",
        message: "页面监控流已准备好",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error("[ws] Failed to handle page monitor request:", error);
    if (socket?.connected) {
      socket.emit("remote-result", {
        requestId,
        success: false,
        error: error?.message || "Failed to prepare page stream",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

async function preparePageMonitorStream(payload: any = {}) {
  const { canvasStreamService } = await import("./canvasStream");
  const adminPeerId = String(payload?.adminPeerId || "").trim();
  if (!adminPeerId) {
    throw new Error("缺少管理端 Peer ID");
  }

  const peerId = await canvasStreamService.startMonitoring({
    allowedAdminPeerId: adminPeerId,
  });

  const designToolPeerId = canvasStreamService.getPeerId() || peerId;
  if (!designToolPeerId) {
    throw new Error("页面监控 Peer ID 未准备好");
  }

  return {
    designToolPeerId,
    streamMode: "page",
  };
}

async function handleRemoteCommand(data: any) {
  const { type, payload, requestId } = data || {};
  const result: Record<string, any> = {
    requestId,
    success: false,
    phase: "completed",
  };
  let ownsRemoteWorker = false;
  let ownedRemoteRequestId: string | null = null;

  const runWithTimeout = <T>(task: Promise<T>, timeoutMs = REMOTE_COMMAND_TIMEOUT) =>
    Promise.race([
      task,
      new Promise<T>((_, reject) => {
        window.setTimeout(() => {
          reject(new Error(`远程命令执行超时 (${timeoutMs / 1000}s): ${type}`));
        }, timeoutMs);
      }),
    ]);

  try {
    switch (type) {
      case "ping":
      case "getAgentStatus": {
        const { designAgent } = await import("@/ai/langgraph");
        result.success = true;
        result.clientId = clientId;
        result.wsStatus = wsState.status;
        result.connectedAt = wsState.connectedAt;
        result.agentStatus = {
          status: designAgent.state.status,
          plan: designAgent.state.plan,
          error: designAgent.state.error,
          messageCount: designAgent.state.messages.length,
        };
        result.message = "设计工具在线";
        break;
      }
      case "canvas-monitor-request":
      case "page-monitor-request": {
        // 处理页面监控请求。服务端只转发 JSON 命令，媒体流走 WebRTC P2P。
        const adminPeerId = payload?.adminPeerId;
        
        try {
          const stream = await preparePageMonitorStream(payload);
          
          result.success = true;
          result.designToolPeerId = stream.designToolPeerId;
          result.adminPeerId = adminPeerId;
          result.streamMode = stream.streamMode;
          result.message = "页面监控流已准备好";
        } catch (streamError: any) {
          console.error("[ws] Failed to prepare page stream:", streamError);
          result.success = false;
          result.error = streamError?.message || "Failed to prepare page stream";
        }
        break;
      }
      case "page-monitor-stop": {
        const { canvasStreamService } = await import("./canvasStream");
        canvasStreamService.stopMonitoring();
        result.success = true;
        result.message = "页面监控已停止";
        break;
      }
      case "chat": {
        const { designAgent } = await import("@/ai/langgraph");
        const message = payload?.message;
        const automatic = payload?.executionMode === "automatic";
        const taskOptions = payload?.taskOptions || payload?.task || undefined;
        if (!message) throw new Error("缺少 message 参数");
        if (activeRemoteRequestId || designAgent.state.status !== "idle") {
          result.phase = "rejected";
          result.error = "当前设计实例正在执行其他指令";
          result.message = result.error;
          break;
        }

        activeRemoteRequestId = String(requestId || `remote-${Date.now()}`);
        ownedRemoteRequestId = activeRemoteRequestId;
        ownsRemoteWorker = true;
        setRemoteWorkerState("busy", activeRemoteRequestId);
        if (socket?.connected) {
          socket.emit("remote-result", {
            requestId,
            success: true,
            phase: "accepted",
            message: "指令已接收，Agent 开始处理",
            workerId: designRuntime.workerId,
            workspaceId: designRuntime.workspaceId,
            reportedAt: new Date().toISOString(),
          });
        }

        await designAgent.chat(
          message,
          {
            task: taskOptions,
            allowInteraction: !automatic,
            deliveryHandledExternally: false,
          },
        );
        if (designAgent.state.error) {
          throw new Error(designAgent.state.error);
        }
        if (
          ownedRemoteRequestId &&
          cancelledRemoteRequestIds.delete(ownedRemoteRequestId)
        ) {
          result.success = false;
          result.phase = "cancelled";
          result.message = "Agent 制作已停止";
          break;
        }
        result.success = true;
        result.phase = "completed";
        // 提取 Agent 最后的回复（只统计当前请求的工具调用）
        const msgs = designAgent.state.messages;
        const lastUserIdx = [...msgs]
          .map((m, i) => ({ m, i }))
          .filter(({ m }) => m.role === "user")
          .pop()?.i ?? -1;
        const currentMsgs = msgs.slice(lastUserIdx + 1);
        const lastAssistant = [...currentMsgs]
          .reverse()
          .find((m: any) => m.role === "assistant" && m.content);
        result.agentResponse = lastAssistant?.content || "";
        result.toolCallsCount = currentMsgs.filter(
          (m: any) => m.role === "tool",
        ).length;

        // 提取生成的产物数据 (贴纸 / 组图)
        const outputs: Array<{
          type: "sticker" | "image-group";
          name?: string;
          url?: string;
          customStickerId?: string;
          stickerId?: string;
          groupId?: string;
          stickersCount?: number;
        }> = [];

        for (const m of currentMsgs) {
          if (m.role === "tool") {
            // 从 meta.toolResult 或 content JSON 中提取保存结果
            let tr = (m.meta as any)?.toolResult;
            if (!tr && typeof m.content === "string") {
              try { tr = JSON.parse(m.content); } catch {}
            }
            if (tr?.success && tr?.data) {
              if (tr.data.customStickerId || tr.data.url) {
                outputs.push({
                  type: "sticker",
                  name: tr.data.name,
                  url: tr.data.url,
                  customStickerId: tr.data.customStickerId,
                  stickerId: tr.data.stickerId,
                });
              }
              if (tr.data.groupId) {
                outputs.push({
                  type: "image-group",
                  name: tr.data.name,
                  groupId: tr.data.groupId,
                  stickersCount: tr.data.stickersCount || tr.data.stickerIds?.length,
                });
              }
            }
          }
        }
        result.outputs = outputs;

        result.message = lastAssistant?.content
          ? `Agent 已完成，共 ${result.toolCallsCount} 次工具调用`
          : "Agent 对话已完成";
        break;
      }
      case "snapshot": {
        const { captureCanvasForAI } = await import("@/ai/capture");
        const snapshot = await captureCanvasForAI();
        result.success = true;
        result.snapshot = snapshot;
        result.message = "已获取当前画布截图";
        break;
      }
      case "batch-start": {
        const {
          batchProgress,
          getBatchRuntimeSnapshot,
          resetBatch,
          startBatch,
        } = await import("@/ai/agent/batch");
        if (
          activeRemoteRequestId ||
          ["preparing", "running", "paused"].includes(batchProgress.status)
        ) {
          result.phase = "rejected";
          result.error = "当前设计实例正在执行其他自动制作任务";
          result.message = result.error;
          break;
        }

        const description = String(
          payload?.description || payload?.message || "",
        ).trim();
        const count = Math.max(1, Math.min(100, Number(payload?.count) || 1));
        const taskPresetValues = [
          "standard",
          "single",
          "group",
          "batch",
          "custom",
        ] as const;
        const taskPreset =
          taskPresetValues.find((value) => value === payload?.taskPreset) ||
          "standard";
        const outputKind =
          payload?.outputKind === "group" ? "group" : "independent-batch";
        const membersPerGroup = Math.max(
          2,
          Math.min(12, Number(payload?.membersPerGroup) || 2),
        );
        if (!description) throw new Error("缺少自动制作需求");

        resetBatch();
        setBatchProgress(getBatchRuntimeSnapshot());
        activeRemoteRequestId = String(requestId || `batch-${Date.now()}`);
        ownedRemoteRequestId = activeRemoteRequestId;
        ownsRemoteWorker = true;
        setRemoteWorkerState("busy", activeRemoteRequestId);
        if (socket?.connected) {
          socket.emit("remote-result", {
            requestId,
            success: true,
            phase: "accepted",
            message: `自动制作已接收，共 ${count} 个生产任务`,
            workerId: designRuntime.workerId,
            workspaceId: designRuntime.workspaceId,
            reportedAt: new Date().toISOString(),
          });
        }

        await startBatch({
          description,
          count,
          taskPreset,
          outputKind,
          membersPerGroup,
          customInstructions: String(payload?.customInstructions || ""),
          enableAnalysisOptimization:
            payload?.enableAnalysisOptimization === true,
          saveMode: "auto",
          failureStrategy: "save_anyway",
        });
        const batch = getBatchRuntimeSnapshot();
        const allSaved =
          batch.status === "done" &&
          batch.failed === 0 &&
          batch.skipped === 0 &&
          batch.succeeded === batch.total;
        result.batch = batch;
        result.success = allSaved;
        result.phase =
          allSaved
            ? "completed"
            : batch.error || batch.status === "done"
              ? "failed"
              : "cancelled";
        result.error =
          batch.error ||
          (batch.status === "done" && !allSaved
            ? `有 ${batch.failed + batch.skipped} 张未成功上传图库`
            : undefined);
        result.message =
          allSaved
            ? `自动制作完成，成功 ${batch.succeeded}/${batch.total}`
            : result.error || "自动制作已停止";
        break;
      }
      case "batch-control": {
        const action = String(payload?.action || "").trim();
        const {
          batchProgress,
          getBatchRuntimeSnapshot,
          pauseBatch,
          resetBatch,
          resumeBatch,
          stopBatch,
        } = await import("@/ai/agent/batch");
        if (action === "pause") pauseBatch();
        else if (action === "resume") resumeBatch();
        else if (action === "stop") stopBatch();
        else if (action === "reset") resetBatch();
        else throw new Error(`未知批次操作: ${action}`);
        result.success = true;
        result.batch = getBatchRuntimeSnapshot();
        result.message = `批次已${
          action === "pause"
            ? "暂停"
            : action === "resume"
              ? "继续"
              : action === "stop"
                ? "停止"
                : "重置"
        }`;
        result.batchStatus = batchProgress.status;
        break;
      }
      case "batch-get-state": {
        const { getBatchRuntimeSnapshot } = await import("@/ai/agent/batch");
        result.success = true;
        result.batch = getBatchRuntimeSnapshot();
        result.message = "已获取自动制作状态";
        break;
      }
      case "stop": {
        const { designAgent } = await import("@/ai/langgraph");
        const targetRequestId = String(
          payload?.requestId || activeRemoteRequestId || "",
        ).trim();
        if (!targetRequestId || targetRequestId !== activeRemoteRequestId) {
          result.phase = "rejected";
          result.message = "当前没有匹配的执行中指令";
          break;
        }
        cancelledRemoteRequestIds.add(targetRequestId);
        setRemoteWorkerState("cancelling", targetRequestId);
        designAgent.stop();
        result.success = true;
        result.message = "已发送停止指令";
        break;
      }
      case "clear": {
        const { designAgent } = await import("@/ai/langgraph");
        if (activeRemoteRequestId) {
          cancelledRemoteRequestIds.add(activeRemoteRequestId);
          setRemoteWorkerState("cancelling", activeRemoteRequestId);
        }
        designAgent.clearMessages();
        result.success = true;
        result.message = "已清空";
        break;
      }
      case "submitResponse": {
        const { designAgent } = await import("@/ai/langgraph");
        const response = payload?.response;
        if (!response) throw new Error("缺少 response 参数");
        designAgent.submitUserResponse(response);
        result.success = true;
        result.message = "已提交用户响应";
        break;
      }
      case "getState": {
        const { executeOperation } = await import("@/operations");
        const { createDesignOperationContext } = await import("@/operations");
        const ctx = createDesignOperationContext();
        const stateResult = await runWithTimeout(
          executeOperation("canvas.getState", {}, ctx),
        );
        result.success = stateResult.success;
        result.canvasState = stateResult.data;
        result.message = stateResult.message;
        break;
      }
      case "getConversation": {
        const { designAgent } = await import("@/ai/langgraph");
        const msgs = designAgent.state.messages;
        result.success = true;
        result.conversation = msgs.map((m: any) => ({
          id: m.id,
          role: m.role,
          content:
            typeof m.content === "string"
              ? m.content
              : JSON.stringify(m.content),
          timestamp: m.timestamp,
          tool_calls: m.tool_calls?.map((tc: any) => ({
            id: tc.id,
            name: tc.function?.name,
            arguments:
              typeof tc.function?.arguments === "string"
                ? (() => {
                    try {
                      return JSON.parse(tc.function.arguments);
                    } catch {
                      return tc.function.arguments;
                    }
                  })()
                : tc.function?.arguments,
          })),
          tool_call_id: m.tool_call_id,
          tool_name: m.tool_name,
          meta: m.meta
            ? {
                iteration: m.meta.iteration,
                duration: m.meta.duration,
                plan: m.meta.plan,
                toolArgs: m.meta.toolArgs,
                toolResult: m.meta.toolResult,
                type: m.meta.type,
              }
            : undefined,
        }));
        result.agentStatus = {
          status: designAgent.state.status,
          plan: designAgent.state.plan,
          error: designAgent.state.error,
        };
        result.message = `共 ${msgs.length} 条消息`;
        break;
      }
      default:
        throw new Error(`未知命令类型: ${type}`);
    }
  } catch (error: any) {
    result.error = error?.message || "执行失败";
    result.phase = "failed";
  } finally {
    if (ownsRemoteWorker) {
      activeRemoteRequestId = null;
      setRemoteWorkerState("idle", null);
    }
  }

  if (socket?.connected) {
    socket.emit("remote-result", result);
  }
}

function connect(endpoint?: string) {
  const targetEndpoint = endpoint || wsState.endpoint || getDefaultWsUrl();
  wsState.endpoint = targetEndpoint;
  const token = getAccessToken();

  if (socket?.connected) {
    if (lastAuthToken !== token) {
      cleanupSocket();
    } else {
      return;
    }
  }

  cleanupSocket();
  intentionalDisconnect = false;

  updateState({
    status: "connecting",
    lastError: null,
    retryCount: 0,
  });

  lastAuthToken = token;

  socket = io(targetEndpoint, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 12_000,
    timeout: 8000,
    query: buildQuery(),
    auth: token ? { token } : undefined,
  });

  bindSocketEvents(socket);
}

function disconnect() {
  intentionalDisconnect = true;
  cleanupSocket();
  updateState({
    status: "disconnected",
    lastError: null,
    retryCount: 0,
    connectedAt: null,
    connectionId: null,
  });
}

function reconnect() {
  intentionalDisconnect = false;
  cleanupSocket();
  connect();
}

function sendMessage(event: string, data: any) {
  if (!socket?.connected) throw new Error("WebSocket 未连接");
  socket.emit(event, data);
}

export const websocketClient = {
  state: wsState,
  profile: clientInfo,
  connect,
  disconnect,
  reconnect,
  sendMessage,
  events: emitter,
  setBatchProgress,

  sendAgentStatus(status: {
    available: boolean;
    agentState: "idle" | "thinking" | "executing" | "waiting_user" | "error";
    step?: string;
    userInput?: string;
    plan?: { goal: string; totalSteps: number; currentStep: number } | null;
    iteration?: number;
    lastToolCall?: string;
    lastError?: string;
    startedAt?: string;
    updatedAt: string;
  }) {
    queueAgentStatus(status);
  },

  setScreenSharing(active: boolean) {
    clientInfo.screenSharing = active;
    emitClientInfo();
  },
};
