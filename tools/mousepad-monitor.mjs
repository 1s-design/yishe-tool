#!/usr/bin/env node
/**
 * 监听设计工具 remote-result — 查看 agent 任务真实执行结果
 */
import { io } from "socket.io-client";
import { readFileSync, appendFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const SERVER_URL = "http://localhost:1520";
const LOG_DIR = join(__dirname, "..", ".batch-logs");
mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = join(LOG_DIR, "mousepad-results.log");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

const socket = io(SERVER_URL.replace(/^http/, "ws") + "/ws", {
  transports: ["websocket"],
  auth: { token: TOKEN },
  query: { clientSource: "管理后台", clientId: `mimo-mousepad-monitor-${Date.now()}` },
});

socket.on("connect", () => {
  log("✅ 监听已连接");
});

socket.on("connect_error", (e) => {
  log(`连接错误: ${e.message}`);
});

socket.on("remote-result", (data) => {
  const phase = data?.phase || "?";
  const ok = data?.success;
  const msg = (data?.message || data?.error || "").slice(0, 140);
  const worker = data?.workerId || data?.connectionId || "";
  log(`remote-result phase=${phase} success=${ok} worker=${String(worker).slice(0, 18)} | ${msg}`);

  if (data?.agentStatus) {
    log(`  agentStatus: ${JSON.stringify(data.agentStatus).slice(0, 200)}`);
  }
  if (data?.result) {
    log(`  result keys: ${Object.keys(data.result).join(",")}`);
  }
  if (data?.agentResponse) {
    log(`  agentResponse: ${String(data.agentResponse).slice(0, 300)}`);
  }
  if (data?.toolCallsCount !== undefined) {
    log(`  toolCallsCount: ${data.toolCallsCount}`);
  }
  if (data?.outputs?.length) {
    log(`  outputs: ${JSON.stringify(data.outputs).slice(0, 300)}`);
  }
});

socket.on("batch-progress", (data) => {
  log(`batch-progress: ${JSON.stringify(data).slice(0, 220)}`);
});

log("🎧 等待 remote-result 事件…");
