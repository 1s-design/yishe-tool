/**
 * 多设计工具批量操控与协同并行设计验证脚本
 * 
 * 验证功能：
 * 1. 自动发现当前浏览器中打开的所有 1s 设计工具窗口连接
 * 2. 多端广播控制（Broadcast Command）：批量探测各工位状态与尺寸
 * 3. 多工位批量并行协同设计（Multi-tool Parallel Collaborative Design）：
 *    同时向 N 个独立的设计工具窗口派发不同的国潮超清满幅贴纸任务，
 *    并发执行、实时监控、各自导出入库、统一汇总成果。
 */

import { io } from "socket.io-client";
import { writeFileSync } from "fs";
import { join } from "path";

const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiYWNjb3VudCI6ImphY2tpZSIsInRlcm1pbmFsVHlwZSI6ImFkbWluIiwidG9rZW5JZCI6IjhiOWM0MDlmLWUyYWMtNDU3Mi1iMTA4LTEyZTE3MTQ3NjIxZCIsImlhdCI6MTc5MTEzMDY1MCwiZXhwIjoyMTA2NzA2NjUwfQ.Ebae-frV7NN98CT48hYHTLkn8ct7Efpc_5KAL9zLop8";
const SERVER_URL = "http://localhost:1520";

async function postApi(path, body) {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: TOKEN,
    },
    body: JSON.stringify(body || {}),
  });
  return res.json();
}

async function getOnlineDesignTools() {
  const res = await postApi("/api/websocket/connections");
  const list = Array.isArray(res) ? res : (res.data || []);
  return list.filter((c) => {
    const src = String(c?.clientSource || c?.query?.clientSource || "").trim();
    const app = String(c?.clientInfo?.app?.name || "").trim();
    const id = String(c?.id || "").trim();
    return src === "设计工具" || src === "设计端" || app === "yishe-tool" || id.startsWith("designtool-");
  });
}

const RAW_TOKEN = TOKEN.replace("Bearer ", "");

let globalSocket = null;
const pendingResolvers = new Map();

async function initGlobalSocket() {
  if (globalSocket?.connected) return globalSocket;
  globalSocket = io(`${SERVER_URL.replace(/^http/, "ws")}/ws`, {
    transports: ["websocket"],
    auth: { token: RAW_TOKEN },
    query: { clientSource: "管理后台", clientId: `parallel-monitor-${Date.now()}` },
    reconnection: true,
  });

  globalSocket.on("remote-result", (data) => {
    const reqId = data?.requestId;
    if (!reqId) return;
    const resolver = pendingResolvers.get(reqId);
    if (!resolver) return;

    if (data?.phase === "accepted") {
      console.log(`  [工位 ${String(data?.connectionId || "").slice(-6)}] 指令已接收，开始处理...`);
      return;
    }

    pendingResolvers.delete(reqId);
    resolver.resolve(data);
  });

  await new Promise((resolve) => globalSocket.on("connect", resolve));
  console.log("✅ 管理后台 WebSocket 监控长连接已建立\n");
  return globalSocket;
}

function sendRemoteCommand(connectionId, type, payload = {}, timeoutMs = 300_000) {
  return new Promise((resolve, reject) => {
    const requestId = `test-parallel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timer = setTimeout(() => {
      pendingResolvers.delete(requestId);
      reject(new Error(`工位 [${connectionId}] 执行超时 (${timeoutMs}ms)`));
    }, timeoutMs);

    pendingResolvers.set(requestId, {
      resolve: (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      reject: (err) => {
        clearTimeout(timer);
        reject(err);
      },
    });

    fetch(`${SERVER_URL}/api/websocket/remote-command`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: TOKEN,
      },
      body: JSON.stringify({
        connectionId,
        command: {
          type,
          payload,
          requestId,
        },
      }),
    }).then(async (r) => {
      const res = await r.json();
      if (res?.success === false) {
        clearTimeout(timer);
        pendingResolvers.delete(requestId);
        reject(new Error(res?.message || "发送远程命令失败"));
      }
    }).catch((err) => {
      clearTimeout(timer);
      pendingResolvers.delete(requestId);
      reject(err);
    });
  });
}

async function main() {
  console.log("=================================================");
  console.log("   多设计工具批量操控与协同并行设计自动化验证   ");
  console.log("=================================================\n");

  await initGlobalSocket();

  // 1. 探测在线设计工具
  const tools = await getOnlineDesignTools();
  console.log(`[1] 探测到 ${tools.length} 个在线设计工具实例:`);
  tools.forEach((t, i) => {
    console.log(`   工位 #${i + 1}: ${t.id} (在线: ${t.isOnline !== false}, 状态: ${t.clientInfo?.designWorker?.state || "idle"})`);
  });

  if (tools.length === 0) {
    console.error("❌ 未检测到在线设计工具，请在浏览器中打开设计端页面。");
    process.exit(1);
  }

  // 2. 多端广播控制测试：批量重置/状态探测
  console.log("\n[2] 测试多端广播指令 (broadcast-remote-command): 批量软复位并获取状态...");
  const broadcastRes = await postApi("/api/websocket/broadcast-remote-command", {
    command: { type: "reset", payload: { force: true } },
  });
  console.log(`   广播发送结果: 成功数=${broadcastRes.sentCount}/${broadcastRes.total}`);
  await new Promise((r) => setTimeout(r, 1000));

  // 3. 多工位并行协同设计任务分发
  console.log("\n[3] 启动多工位批量并行设计 (3个工位同时并行创作):");

  const TASKS = [
    {
      title: "《日进斗金》超清国潮书法贴纸",
      prompt: "请设计一张'日进斗金'超清国潮书法贴纸，采用黑金流光质感，包含大号行楷书法主文案、朱砂小印章、铜钱祥云暗纹装饰，满幅完整图案，绝不要透明外边框，设计完成后务必调用 canvas.updateAndSaveSticker 保存入库。",
      expectText: "日进斗金",
    },
    {
      title: "《紫气东来》超清国潮吉祥贴纸",
      prompt: "请设计一张'紫气东来'超清国潮吉祥贴纸，采用皇家紫金配色，包含庄重大气的紫金主文案、仙鹤祥云环绕构图，满幅完整图案，绝不要透明外边框，设计完成后务必调用 canvas.updateAndSaveSticker 保存入库。",
      expectText: "紫气东来",
    },
    {
      title: "《一帆风顺》超清国潮开运贴纸",
      prompt: "请设计一张'一帆风顺'超清国潮开运贴纸，采用深海靛蓝与金箔点缀，包含苍劲有力的主文案、乘风破浪帆船线条暗纹、红色锦鲤吉祥印章，满幅完整图案，绝不要透明外边框，设计完成后务必调用 canvas.updateAndSaveSticker 保存入库。",
      expectText: "一帆风顺",
    },
  ];

  const assignedWorkers = tools.slice(0, Math.min(tools.length, TASKS.length));
  console.log(`   已分配 ${assignedWorkers.length} 个工位进行并行制作：`);

  const startTime = Date.now();
  const parallelPromises = assignedWorkers.map(async (worker, idx) => {
    const task = TASKS[idx];
    const shortId = worker.id.slice(-6);
    console.log(`   🚀 [工位 #${idx + 1} (${shortId})] 派发任务: ${task.title}`);

    const taskStart = Date.now();
    try {
      const res = await sendRemoteCommand(worker.id, "chat", {
        message: task.prompt,
        executionMode: "automatic",
        resetConversation: true,
      });

      const duration = ((Date.now() - taskStart) / 1000).toFixed(1);
      let outputs = res?.outputs || [];
      let stickerOutput = outputs.find((o) => o.type === "sticker" || o.customStickerId || o.url);

      if (!stickerOutput) {
        console.log(`   ⚙️ [工位 #${idx + 1} (${shortId})] 触发保底自动落库工具...`);
        const saveRes = await sendRemoteCommand(worker.id, "executeOperation", {
          operation: "canvas.updateAndSaveSticker",
          parameters: { name: task.title },
        }, 60_000).catch(() => null);

        if (saveRes?.data?.customStickerId || saveRes?.data?.url) {
          stickerOutput = {
            type: "sticker",
            name: task.title,
            customStickerId: saveRes.data.customStickerId,
            url: saveRes.data.url,
          };
        }
      }

      console.log(`   ✅ [工位 #${idx + 1} (${shortId})] 创作完成！耗时: ${duration}s, 工具调用: ${res?.toolCallsCount || 0} 次`);
      if (stickerOutput) {
        console.log(`      📦 产出贴纸: ID=${stickerOutput.customStickerId || stickerOutput.stickerId}, 名称=${stickerOutput.name || task.title}`);
        console.log(`      🔗 COS 地址: ${stickerOutput.url}`);
      }

      // 查询最终画布状态
      const stateRes = await sendRemoteCommand(worker.id, "getState", {}, 30_000);
      const canvasSize = stateRes?.canvasState?.canvasSize || {};
      console.log(`      📐 画布尺寸规格: ${canvasSize.width} × ${canvasSize.height} px`);

      return {
        workerIndex: idx + 1,
        connectionId: worker.id,
        task: task.title,
        success: res.success !== false,
        duration,
        output: stickerOutput,
        canvasSize,
      };
    } catch (err) {
      console.error(`   ❌ [工位 #${idx + 1} (${shortId})] 执行失败:`, err.message);
      return {
        workerIndex: idx + 1,
        connectionId: worker.id,
        task: task.title,
        success: false,
        error: err.message,
      };
    }
  });

  const parallelResults = await Promise.all(parallelPromises);
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n=================================================");
  console.log(`🎉 多工位协同并行设计执行完毕！总耗时: ${totalDuration}s`);
  console.log("=================================================");
  parallelResults.forEach((r) => {
    console.log(`- 工位 #${r.workerIndex} (${r.task}): ${r.success ? "成功 ✅" : "失败 ❌"} · 耗时 ${r.duration}s · 尺寸 ${r.canvasSize?.width || "?"}x${r.canvasSize?.height || "?"}px · 贴纸ID: ${r.output?.customStickerId || r.output?.stickerId || "无"}`);
  });
}

main().catch(console.error);
