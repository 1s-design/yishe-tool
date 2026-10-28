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

/**
 * 每标签页稳定 ID：
 * - 用 sessionStorage 持久化，同一标签页刷新/重连后 ID 不变（服务端可识别同一工作端）
 * - sessionStorage 按标签页隔离，多个设计端标签页各自独立 ID
 */
function getStableClientId() {
  const KEY = "yishe-designtool-client-id";
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved && /^designtool-/.test(saved)) return saved;
    const id = generateClientId();
    sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    // sessionStorage 不可用（隐私模式等）时退化为随机 ID
    return generateClientId();
  }
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

const clientId = getStableClientId();

// 页面加载时间戳：用于验证「刷新是否真的生效」
const CLIENT_LOADED_AT = new Date().toISOString();

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
  const beat = () => {
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
    
    // Use recursive setTimeout instead of setInterval
    // This is less affected by tab throttling
    heartbeatTimer = setTimeout(beat, HEARTBEAT_INTERVAL) as any;
  };
  beat();
}

function clearHeartbeatTimeout() {
  if (heartbeatTimeoutTimer) {
    clearTimeout(heartbeatTimeoutTimer);
    heartbeatTimeoutTimer = null;
  }
}


// 处理标签页可见性变化，防止后台标签页心跳超时
let visibilityHandler: (() => void) | null = null;
function setupVisibilityHandler() {
  if (visibilityHandler) return;
  visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      // 标签页变为可见时，立即发送心跳并重置超时
      if (socket?.connected) {
        lastPingTimestamp = Date.now();
        socket.emit('ping');
        clearHeartbeatTimeout();
      }
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);
}


// Web Worker 保活 - 不受标签页节流影响
let keepAliveWorker: Worker | null = null;

function startKeepAliveWorker() {
  try {
    keepAliveWorker = new Worker(
      new URL('../workers/keepAlive.worker.ts', import.meta.url),
      { type: 'module' }
    );
    keepAliveWorker.onmessage = (e) => {
      if (e.data.type === 'heartbeat' && socket?.connected) {
        socket.emit('ping');
      }
    };
    keepAliveWorker.postMessage({ type: 'start', interval: HEARTBEAT_INTERVAL });
  } catch (err) {
    console.warn('[ws] Failed to start keepAlive worker:', err);
  }
}


// 页面卸载时发送 beacon，防止连接被意外断开
function setupBeaconHandler() {
  window.addEventListener('beforeunload', () => {
    if (socket?.connected) {
      // 使用 sendBeacon 确保消息发送
      const data = JSON.stringify({ type: 'ping', timestamp: Date.now() });
      navigator.sendBeacon('/api/websocket/ping', data);
    }
  });
}

function stopKeepAliveWorker() {
  if (keepAliveWorker) {
    keepAliveWorker.postMessage({ type: 'stop' });
    keepAliveWorker.terminate();
    keepAliveWorker = null;
  }
}

function cleanupVisibilityHandler() {
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
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
  setupVisibilityHandler();
  startKeepAliveWorker();
  setupBeaconHandler();
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
    const willAutoReconnect = !intentionalDisconnect && reason !== "io client disconnect";
    updateState({
      status: willAutoReconnect ? "reconnecting" : intentionalDisconnect ? "disconnected" : "error",
      lastError: reason || null,
      connectedAt: null,
      connectionId: null,
    });
    // 服务端主动断开（如 ping 鉴权抖动）时强制重连一次
    if (willAutoReconnect && (reason === "io server disconnect" || reason === "ping timeout")) {
      setTimeout(() => {
        if (!socket?.connected && !intentionalDisconnect) {
          emitter.emit("log", { level: "warn", message: "[ws] 强制重连" });
          socket?.connect();
        }
      }, 1200 + Math.random() * 1500);
    }
  });

  currentSocket.io.on("reconnect_attempt", (attempt: number) => {
    updateState({ status: "reconnecting", retryCount: attempt });
    emitter.emit("log", {
      level: "warn",
      message: `[ws] reconnect attempt ${attempt}`,
    });
  });

  currentSocket.io.on("reconnect_failed", () => {
    updateState({ status: "error", lastError: "reconnect_failed" });
    emitter.emit("log", {
      level: "error",
      message: "[ws] reconnect failed, will keep trying",
    });
    setTimeout(() => {
      if (!socket?.connected && !intentionalDisconnect) socket?.connect();
    }, 8000);
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

        if (payload?.resetConversation || automatic) {
          designAgent.state.messages.length = 0;
          designAgent.state.searchHistory.length = 0;
          designAgent.state.plan = null;
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
            if (!tr && typeof m.content === "string") {
              // content 带 progressHint 后缀时截掉再解析
              const jsonMatch = m.content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try { tr = JSON.parse(jsonMatch[0]); } catch {}
              }
            }
            // 兼容 envelope 嵌套 data.data / result.data
            const payload =
              tr?.data?.customStickerId || tr?.data?.url || tr?.data?.groupId
                ? tr.data
                : tr?.data?.data && typeof tr.data.data === "object"
                  ? tr.data.data
                  : tr?.result?.data || tr?.data || null;

            const toolName = (m as any)?.tool_name || (m as any)?.toolName || "";
            const isSaveTool =
              String(toolName).includes("updateAndSaveSticker") ||
              String(toolName).includes("createImageGroup");

            if (payload && (tr?.success !== false || isSaveTool)) {
              if (payload.customStickerId || payload.url) {
                if (
                  !outputs.some(
                    (o) => o.customStickerId && o.customStickerId === payload.customStickerId,
                  )
                ) {
                  outputs.push({
                    type: "sticker",
                    name: payload.name,
                    url: payload.url,
                    customStickerId: payload.customStickerId,
                    stickerId: payload.stickerId,
                  });
                }
              }
              if (payload.groupId) {
                outputs.push({
                  type: "image-group",
                  name: payload.name,
                  groupId: payload.groupId,
                  stickersCount: payload.stickersCount || payload.stickerIds?.length,
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
        // 中文 web 字体 base64 嵌入后的渲染较慢，给足预算（否则稳定 60s 超时）
        const requestedTimeout = Number(payload?.timeoutMs) || 0;
        const snapshot = await captureCanvasForAI({
          timeoutMs: Math.max(requestedTimeout, 120_000),
        });
        result.success = true;
        result.snapshot = snapshot;
        const { renderDiagnostics } = await import("@/ai/render-diagnostics");
        result.message = `已获取当前画布截图 ${JSON.stringify(renderDiagnostics)}`;
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
        const taskSource = payload?.taskSource as
          | { kind?: string }
          | undefined;
        // 任务来源模式（灵感驱动 / 复刻驱动）不需要描述文本
        const isTaskSourceMode = ["inspirations", "replicate", "image"].includes(
          String(taskSource?.kind || ""),
        );
        if (!description && !isTaskSourceMode) {
          throw new Error("缺少自动制作需求");
        }

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
          taskSource: payload?.taskSource,
          resources: Array.isArray(payload?.resources) ? payload.resources : undefined,
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
      case "station-start": {
        const { startStation, stationState } = await import("@/ai/agent/auto-station");
        await startStation();
        result.success = stationState.enabled;
        result.station = {
          enabled: stationState.enabled,
          workerId: stationState.workerId,
          status: stationState.status,
          currentStage: stationState.currentStage,
          todayProduced: stationState.todayProduced,
        };
        result.message = stationState.enabled
          ? `工位 [${stationState.workerId}] 已启动自动制作`
          : "工位启动未成功，请检查是否已登录";
        break;
      }
      case "station-stop": {
        const { stopStation, stationState } = await import("@/ai/agent/auto-station");
        stopStation(String(payload?.reason || "远程指令停止"));
        result.success = true;
        result.station = {
          enabled: stationState.enabled,
          workerId: stationState.workerId,
          status: stationState.status,
        };
        result.message = `工位 [${stationState.workerId}] 已停止`;
        break;
      }
      case "station-status": {
        const { stationState } = await import("@/ai/agent/auto-station");
        result.success = true;
        result.station = {
          enabled: stationState.enabled,
          workerId: stationState.workerId,
          status: stationState.status,
          currentStage: stationState.currentStage,
          todayProduced: stationState.todayProduced,
          todayReworked: stationState.todayReworked,
          currentJob: stationState.currentJob
            ? {
                id: stationState.currentJob.id,
                type: stationState.currentJob.type,
                title: stationState.currentJob.inspiration?.title,
              }
            : null,
        };
        result.message = `工位状态: ${stationState.status} (累计已制作 ${stationState.todayProduced})`;
        break;
      }
      case "audit": {
        const { auditCurrentCanvas } = await import("@/ai/canvas-audit");
        const auditResult = await auditCurrentCanvas({
          expectedWidth: Number(payload?.expectedWidth) || undefined,
          expectedHeight: Number(payload?.expectedHeight) || undefined,
          expectedTexts: Array.isArray(payload?.expectedTexts)
            ? payload.expectedTexts.map((x: any) => String(x))
            : undefined,
        });
        result.success = auditResult.ok;
        result.phase = auditResult.ok ? "completed" : "failed";
        result.audit = {
          ok: auditResult.ok,
          issues: auditResult.issues,
          criticalIssues: auditResult.criticalIssues,
          advisoryIssues: auditResult.advisoryIssues,
          metrics: auditResult.metrics,
          measured: auditResult.measured,
        };
        result.message = auditResult.measured
          ? auditResult.ok
            ? `审查通过（硬伤 0）· 画布 ${auditResult.metrics.width}x${auditResult.metrics.height} · 可见图层 ${auditResult.metrics.visualLayers}${
                auditResult.advisoryIssues.length
                  ? ` · 建议 ${auditResult.advisoryIssues.length} 条：${auditResult.advisoryIssues.join("；")}`
                  : ""
              }`
            : `审查未通过（硬伤 ${auditResult.criticalIssues.length} 条）：${auditResult.criticalIssues.join("；")}${
                auditResult.advisoryIssues.length
                  ? ` · 建议：${auditResult.advisoryIssues.join("；")}`
                  : ""
              }`
          : "无法测量画布，已按通过处理";
        break;
      }

      case "list-resources": {
        // 按类型分页列资源，供外部 agent「挑资源再下单」
        const type = String(payload?.type || "").trim();
        const keyword = String(payload?.keyword || "").trim();
        const page = Math.max(1, Number(payload?.page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(payload?.pageSize) || 20));
        const api: any = await import("@/api");
        const { apiInstance } = await import("@/api/apiInstance");
        let list: any[] = [];
        let total = 0;

        const pick = (d: any) => {
          const items = d?.list || d?.items || d?.records || (Array.isArray(d) ? d : []);
          return { items, total: Number(d?.total) || items.length };
        };

        switch (type) {
          case "inspiration": {
            const r = await apiInstance.post("/api/design-inspiration/page", {
              currentPage: page, pageSize, keyword: keyword || undefined,
            });
            const d = r?.data?.data ?? r?.data ?? r;
            const p = pick(d);
            list = p.items; total = p.total;
            break;
          }
          case "font": {
            const p = pick(
              await api.getFontList({
                currentPage: page,
                page,
                pageSize,
                searchKeyword: keyword || undefined,
                keyword: keyword || undefined,
                name: keyword || undefined,
              }),
            );
            list = p.items; total = p.total;
            break;
          }
          case "sticker":
          case "image": {
            const p = pick(
              await api.getCustomStickerList({
                currentPage: page,
                page,
                pageSize,
                searchText: keyword || undefined,
                keyword: keyword || undefined,
              }),
            );
            list = p.items; total = p.total;
            break;
          }
          case "sentence": {
            const p = pick(
              await api.getSentenceList({
                currentPage: page,
                page,
                pageSize,
                search: keyword || undefined,
                keyword: keyword || undefined,
              }),
            );
            list = p.items; total = p.total;
            break;
          }
          case "document": {
            const p = pick(await api.getTextDocumentList({ currentPage: page, page, pageSize, keyword: keyword || undefined }));
            list = p.items; total = p.total;
            break;
          }
          case "tip": {
            const p = pick(await api.getDesignKnowledgePage({ currentPage: page, page, pageSize, keyword: keyword || undefined }));
            list = p.items; total = p.total;
            break;
          }
          case "prompt": {
            const mod: any = await import("@/ai/design-prompts/api");
            const p = pick(await mod.queryDesignPromptPage({ currentPage: page, page, pageSize, keyword: keyword || undefined }));
            list = p.items; total = p.total;
            break;
          }
          default:
            result.phase = "failed";
            result.error = `不支持的资源类型：${type || "(空)"}`;
            result.message = result.error;
            break;
        }

        if (result.phase !== "failed") {
          const refs = list.map((it: any) => ({
            type: type || "inspiration",
            id: String(it.id || ""),
            label: String(it.name || it.title || it.text || it.id || "").slice(0, 40),
            payload: {
              name: it.name || it.title || undefined,
              url: it.url || it.previewUrl || undefined,
              content: it.content || it.text || it.description || undefined,
            },
          }));
          result.success = true;
          result.phase = "completed";
          result.resources = refs;
          result.total = total;
          result.message = `${type} 共 ${total} 条，本页 ${refs.length} 条`;
        }
        break;
      }

      case "version": {
        result.success = true;
        result.version = {
          appVersion:
            (import.meta.env.VITE_APP_VERSION as string | undefined) || null,
          mode: import.meta.env.MODE,
          dev: import.meta.env.DEV,
          loadedAt: CLIENT_LOADED_AT,
          clientId,
          connectedAt: wsState.connectedAt,
        };
        result.message = `客户端 ${import.meta.env.MODE} · 页面加载于 ${CLIENT_LOADED_AT}`;
        break;
      }

      case "reset": {
        const { designAgent } = await import("@/ai/langgraph");
        const { batchProgress, resetBatch, stopBatch } = await import(
          "@/ai/agent/batch"
        );
        const busy =
          ["thinking", "executing"].includes(
            String(designAgent.state.status || ""),
          ) ||
          ["preparing", "running", "paused"].includes(batchProgress.status);
        if (busy && payload?.force !== true) {
          result.phase = "rejected";
          result.error = "设计实例正在执行任务，如需强制复位请传 force=true";
          result.message = result.error;
          break;
        }
        // 顺序很重要：先 reset 清状态，最后 stop 停信号
        // （反过来会被 resetBatch() 把 controlSignal 重新置为 running，等于撤销停止）
        resetBatch();
        stopBatch();
        try {
          const { stopStation } = await import("@/ai/agent/auto-station");
          stopStation("复位停止");
        } catch {}
        try {
          const { currentEditingCustomStickerId } = await import(
            "@/components/design/layout/canvas"
          );
          currentEditingCustomStickerId.value = null;
        } catch {}
        result.success = true;
        result.message = "已复位：Agent 停止、批次重置、编辑态清空";
        break;
      }

      case "reload": {
        const { designAgent } = await import("@/ai/langgraph");
        const { batchProgress } = await import("@/ai/agent/batch");
        const busy =
          ["thinking", "executing"].includes(
            String(designAgent.state.status || ""),
          ) ||
          ["preparing", "running", "paused"].includes(batchProgress.status);
        if (busy && payload?.force !== true) {
          result.phase = "rejected";
          result.error = "设计实例正在执行任务，暂不刷新（可传 force=true 强制）";
          result.message = result.error;
          break;
        }
        result.success = true;
        result.message = "将在 300ms 后刷新页面";
        result.version = { loadedAt: CLIENT_LOADED_AT };
        // 先让结果发出去，再刷新
        setTimeout(() => window.location.reload(), 300);
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
      case "clearCanvas": {
        // 直连操作层清画布（不依赖 Agent 工具调用），用于清理残留设计/缓存
        const { executeOperation } = await import("@/operations");
        const { createDesignOperationContext } = await import("@/operations");
        const { notifyRemoteAgentOperation, addStationLog } = await import(
          "@/ai/agent/auto-station"
        );
        const caller = String(payload?.caller || "外部 Agent (MCP)");
        const startTime = performance.now();
        notifyRemoteAgentOperation("canvas.clear", undefined, caller, {});
        addStationLog("[外部 Agent] 开始执行: canvas.clear", "info");

        const ctx = createDesignOperationContext();
        const clearResult = await runWithTimeout(
          executeOperation("canvas.clear", {}, ctx),
        );
        const durationMs = Math.round(performance.now() - startTime);
        result.success = clearResult.success;
        result.message = clearResult.message || "画布已清空";
        notifyRemoteAgentOperation(
          "canvas.clear",
          { success: Boolean(clearResult.success), message: result.message, durationMs },
          caller,
          {},
        );
        const stateAfter = await runWithTimeout(
          executeOperation("canvas.getState", {}, ctx),
        ).catch(() => null);
        result.canvasState = stateAfter?.data || null;
        break;
      }
      case "executeOperation":
      case "execute-operation": {
        const { executeOperation } = await import("@/operations");
        const { createDesignOperationContext } = await import("@/operations");
        const { notifyRemoteAgentOperation, addStationLog } = await import(
          "@/ai/agent/auto-station"
        );
        const ctx = createDesignOperationContext();
        const opName = String(
          payload?.operation || payload?.toolName || payload?.name || "",
        ).trim();
        const opParams = payload?.parameters || payload?.params || payload?.args || {};
        const timeoutMs = Number(payload?.timeoutMs) || 45_000;
        const caller = String(payload?.caller || "外部 Agent (MCP)");

        const startTime = performance.now();
        notifyRemoteAgentOperation(opName, undefined, caller, opParams);
        addStationLog(`[外部 Agent] 开始执行: ${opName}`, "info");

        const opResult = await runWithTimeout(
          executeOperation(opName, opParams, ctx),
          timeoutMs,
        );
        const durationMs = Math.round(performance.now() - startTime);
        result.success = opResult.success;
        result.data = opResult.data;
        result.message = opResult.message;
        result.error = opResult.error;

        notifyRemoteAgentOperation(
          opName,
          {
            success: Boolean(opResult.success),
            message: opResult.message || opResult.error,
            durationMs,
            data: opResult.data,
          },
          caller,
          opParams,
        );
        if (opResult.success) {
          addStationLog(`[外部 Agent] 操作成功: ${opName} (${durationMs}ms)`, "success");
        } else {
          addStationLog(
            `[外部 Agent] 操作失败: ${opName} (${opResult.message || opResult.error || "执行错误"})`,
            "warn",
          );
        }
        break;
      }
      case "timeline": {
        // Agent 时间线（内存级）：payload.action = get | clear | summary
        const tl = await import("@/ai/agent-timeline");
        const action = String(payload?.action || "get").toLowerCase();
        if (action === "clear") {
          tl.timelineClear();
          result.success = true;
          result.message = "时间线已清空";
        } else if (action === "summary") {
          result.success = true;
          result.summary = tl.timelineSummary();
          result.message = "时间线摘要";
        } else {
          const limit = Number(payload?.limit) || 200;
          result.success = true;
          result.timeline = tl.timelineSnapshot(limit);
          result.summary = tl.timelineSummary();
          result.message = `时间线最近 ${limit} 条`;
        }
        break;
      }
      case "setAiSettings": {
        const { updateAiSettings, getAiSettings } = await import("@/ai/settings");
        if (payload?.mode) {
          updateAiSettings({ mode: payload.mode });
        }
        result.success = true;
        result.settings = getAiSettings();
        result.message = `AI 模式当前为: ${result.settings.mode}`;
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
      case "eval": {
        try {
          const fn = new Function("return " + (payload?.code || "null"));
          result.data = await fn();
          result.success = true;
          result.message = "eval 执行成功";
        } catch (evalErr: any) {
          result.success = false;
          result.error = evalErr?.message || String(evalErr);
        }
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
    reconnectionDelay: 1500,
    reconnectionDelayMax: 15_000,
    // 随机抖动，避免服务端重启时所有设计端同时重连（惊群）
    randomizationFactor: 0.5,
    timeout: 10000,
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
