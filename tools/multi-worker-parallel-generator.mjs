import { io } from "socket.io-client";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiYWNjb3VudCI6ImphY2tpZSIsInRlcm1pbmFsVHlwZSI6ImFkbWluIiwidG9rZW5JZCI6IjhiOWM0MDlmLWUyYWMtNDU3Mi1iMTA4LTEyZTE3MTQ3NjIxZCIsImlhdCI6MTc5MTEzMDY1MCwiZXhwIjoyMTA2NzA2NjUwfQ.Ebae-frV7NN98CT48hYHTLkn8ct7Efpc_5KAL9zLop8";
const RAW_TOKEN = TOKEN.replace("Bearer ", "");
const SERVER_URL = "http://localhost:1520";
const SCRATCH_DIR = "/Users/jackie/.gemini/antigravity-ide/brain/00fa42cd-f28a-432f-b735-d44a270f2b84/scratch";

if (!existsSync(SCRATCH_DIR)) {
  mkdirSync(SCRATCH_DIR, { recursive: true });
}

// 3 个新款式，同时派发给用户打开的 3 个设计端窗口！
const PARALLEL_TASKS = [
  // 工位 1：可爱少女风第二款 ·《保持心动》
  {
    key: "deskpad_girly_heartbeat",
    name: "长款桌垫印花 ·《保持心动》",
    width: 3200,
    height: 1400,
    style: "少女心樱花粉 · 浪漫治愈",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #260c1c 0%, #13050d 55%, #070205 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Yuanti SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:950px;height:950px;background:radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:800px;border:2px dashed rgba(244,114,182,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:inline-flex;align-items:center;gap:16px;padding:8px 28px;background:rgba(244,114,182,0.12);border:1.5px solid rgba(244,114,182,0.35);border-radius:30px;white-space:nowrap;">
      <span style="font-size:22px;color:#f472b6;">♥</span>
      <span style="font-size:22px;color:#fbcfe8;font-weight:700;letter-spacing:6px;text-transform:uppercase;">STAY IN LOVE // 保持心动 · 永远对生活充满期待</span>
      <span style="font-size:22px;color:#f472b6;">♥</span>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #ffffff 0%, #fce7f3 30%, #f472b6 65%, #c026d3 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 38px rgba(244,114,182,0.45);line-height:1;white-space:nowrap;text-indent:42px;">
      保持心动
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#fdf2f8;font-weight:500;">心之所向，素履以往 · 生如繁花灿烂</span>
      <div style="padding:6px 22px;background:#9d174d;border:1.5px solid #fbcfe8;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-size:22px;font-weight:bold;color:#fff1f2;letter-spacing:4px;">怦然</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 工位 2：小清新森系第二款 ·《山海平》
  {
    key: "deskpad_fresh_shanhai",
    name: "长款桌垫印花 ·《山海平》",
    width: 3200,
    height: 1400,
    style: "小清新薄荷森系 · 静谧山海",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0d1e18 0%, #06110d 55%, #020504 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Songti SC','PingFang SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1px solid rgba(52,211,153,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#34d399;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#a7f3d0;font-weight:500;text-transform:uppercase;">PEACEFUL HORIZON // 所念皆所愿 · 岁月长安</span>
      <div style="width:40px;height:1px;background:#34d399;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 20.5);font-weight:900;letter-spacing:58px;background:linear-gradient(180deg, #ffffff 0%, #d1fae5 35%, #34d399 70%, #047857 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 36px rgba(52,211,153,0.4);line-height:1;white-space:nowrap;text-indent:58px;">
      山海平
    </h1>
    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#ecfdf5;font-weight:400;">山海自有归期，风雨自有相逢</span>
      <div style="padding:6px 20px;border:1.5px solid #a7f3d0;background:rgba(52,211,153,0.15);border-radius:4px;">
        <span style="font-size:22px;color:#d1fae5;font-weight:bold;letter-spacing:6px;">静笃</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 工位 3：书法复古第二款 ·《行云流水》
  {
    key: "deskpad_calligraphy_xingyun",
    name: "长款桌垫印花 ·《行云流水》",
    width: 3200,
    height: 1400,
    style: "书法复古古墨 · 逸兴遄飞",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #1c150e 0%, #0e0a06 55%, #030201 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Kaiti SC','Songti SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(217,119,6,0.14) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1.5px solid rgba(217,119,6,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#d97706;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#fde68a;font-weight:500;text-transform:uppercase;">FREE FLOWING // 飘若浮云 · 矫若惊龙</span>
      <div style="width:40px;height:1px;background:#d97706;"></div>
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #fffbeb 0%, #fef3c7 35%, #d97706 70%, #78350f 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.9), 0 0 40px rgba(217,119,6,0.4);line-height:1;white-space:nowrap;text-indent:44px;">
      行云流水
    </h1>
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#fef3c7;font-weight:400;">心无挂碍，大化流行 · 处处皆通达</span>
      <div style="padding:6px 20px;background:#991b1b;border:1.5px solid #fecaca;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:bold;color:#fef2f2;letter-spacing:6px;">通达</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },
];

async function postApi(path, body) {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: TOKEN },
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

let globalSocket = null;
const pendingResolvers = new Map();

async function initGlobalSocket() {
  if (globalSocket?.connected) return globalSocket;
  globalSocket = io(`${SERVER_URL.replace(/^http/, "ws")}/ws`, {
    transports: ["websocket"],
    auth: { token: RAW_TOKEN },
    query: { clientSource: "管理后台", clientId: `deskpad-multiworker-${Date.now()}` },
    reconnection: true,
  });

  globalSocket.on("remote-result", (data) => {
    const reqId = data?.requestId;
    if (!reqId) return;
    const resolver = pendingResolvers.get(reqId);
    if (!resolver) return;
    if (data?.phase === "accepted") return;
    pendingResolvers.delete(reqId);
    resolver.resolve(data);
  });

  await new Promise((resolve) => globalSocket.on("connect", resolve));
  return globalSocket;
}

function sendRemoteCommand(connectionId, type, payload = {}, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const requestId = `dp-mw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timer = setTimeout(() => {
      pendingResolvers.delete(requestId);
      reject(new Error(`工位 ${connectionId} 执行超时 (${timeoutMs / 1000}s)`));
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
      headers: { "Content-Type": "application/json", Authorization: TOKEN },
      body: JSON.stringify({ connectionId, command: { type, payload, requestId } }),
    }).catch(reject);
  });
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buf);
}

// 单工位执行作业
async function executeWorkerJob(workerId, workerIndex, task) {
  const start = Date.now();
  console.log(`⚡ [工位 ${workerIndex + 1}: ${workerId}] 并发启动制作: ${task.name} (${task.style})`);

  await sendRemoteCommand(workerId, "resetAgent", {}, 10_000).catch(() => null);
  await sendRemoteCommand(workerId, "executeOperation", { operation: "canvas.clear" }, 10_000).catch(() => null);

  await sendRemoteCommand(workerId, "executeOperation", {
    operation: "canvas.setSize",
    parameters: { width: task.width, height: task.height, unit: "px" },
  });

  const html = task.generateHtml();
  await sendRemoteCommand(workerId, "executeOperation", {
    operation: "canvas.addHtml",
    parameters: { htmlContent: html, htmlBindings: {} },
  });

  const saveRes = await sendRemoteCommand(workerId, "executeOperation", {
    operation: "canvas.updateAndSaveSticker",
    parameters: { name: task.name },
  }, 60_000);

  const cost = ((Date.now() - start) / 1000).toFixed(1);
  const data = saveRes?.data;
  if (data?.url) {
    console.log(`   ✨ [工位 ${workerIndex + 1} 成功完成] 耗时 ${cost}s, ID: ${data.customStickerId}`);
    const localPath = join(SCRATCH_DIR, `${task.key}.png`);
    await downloadFile(data.url, localPath);
    console.log(`   💾 [工位 ${workerIndex + 1} 保存成功]: ${localPath}`);
    return { task, workerId, cost, url: data.url, localPath };
  } else {
    throw new Error(`工位 ${workerId} 保存失败: ${JSON.stringify(saveRes)}`);
  }
}

async function run() {
  console.log("\n=======================================================");
  console.log("   🚀 多工位同时制作 · 并发分布式桌垫印花流水线");
  console.log("=======================================================\n");

  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  console.log(`检测到当前同时在线的设计端工位数量: ${tools.length}`);
  tools.forEach((t, idx) => console.log(`   - 工位 ${idx + 1}: [${t.id}] (${t.clientSource})`));

  if (tools.length === 0) {
    console.error("❌ 无在线工位");
    process.exit(1);
  }

  // 并发派发：3个工位同时开工！
  const concurrentPromises = PARALLEL_TASKS.map((task, i) => {
    // 轮询分配给在线工位
    const worker = tools[i % tools.length];
    return executeWorkerJob(worker.id, i % tools.length, task);
  });

  const totalStart = Date.now();
  const results = await Promise.all(concurrentPromises);
  const totalCost = ((Date.now() - totalStart) / 1000).toFixed(1);

  console.log(`\n🎉 【全部并发制作完成！】总计耗时: ${totalCost}s，制作数量: ${results.length}`);
  results.forEach((r, idx) => {
    console.log(`   ${idx + 1}. ${r.task.name} -> 工位 [${r.workerId}] 耗时 ${r.cost}s`);
  });

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
