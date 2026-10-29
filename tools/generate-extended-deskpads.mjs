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

const EXTENDED_PRINTS = [
  // 6. 《保持清醒》- 极简黑白银冷峻现代风
  {
    key: "deskpad_baochi_qingxing",
    name: "长款桌垫印花 ·《保持清醒》",
    width: 3200,
    height: 1400,
    style: "极简黑白银冷光 · 极客理性",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #15181e 0%, #0c0e12 55%, #040507 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间微光与几何准心 (左右两侧极净) -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:900px;height:900px;background:radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:760px;height:760px;border:1px solid rgba(255,255,255,0.18);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:790px;height:790px;border:1px dashed rgba(255,255,255,0.08);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 26px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:30px;">
      <div style="width:8px;height:8px;border-radius:50%;background:#ffffff;box-shadow:0 0 10px #ffffff;"></div>
      <span style="font-size:24px;color:#f8fafc;font-weight:700;letter-spacing:8px;text-transform:uppercase;">STAY SHARP // 洞悉本质 · 保持饥饿</span>
    </div>

    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:48px;background:linear-gradient(180deg, #ffffff 0%, #f1f5f9 35%, #94a3b8 70%, #475569 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.95), 0 0 36px rgba(255,255,255,0.3);line-height:1;white-space:nowrap;text-indent:48px;">
      保持清醒
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:14px;color:#cbd5e1;font-weight:500;">
        在喧嚣中保持自洽 · 清醒者自渡
      </span>
      <div style="padding:8px 24px;background:#1e293b;border:1.5px solid #cbd5e1;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:24px;font-weight:900;color:#f8fafc;letter-spacing:6px;">洞悉</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 7. 《日进斗金》- 奢华黑金赤焰暴富开运风
  {
    key: "deskpad_rijin_doujin",
    name: "长款桌垫印花 ·《日进斗金》",
    width: 3200,
    height: 1400,
    style: "黑金赤焰流光 · 招财开运",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #201305 0%, #0d0701 55%, #030200 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Noto Serif SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间流光赤金环 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:960px;height:960px;background:radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:820px;height:820px;border:1.5px solid rgba(245,158,11,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:850px;height:850px;border:1px dashed rgba(254,240,138,0.18);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:flex;align-items:center;gap:20px;">
      <div style="width:50px;height:1px;background:#f59e0b;"></div>
      <span style="font-size:26px;letter-spacing:14px;color:#fbbf24;font-weight:700;text-transform:uppercase;">DAILY WEALTH // 聚沙成塔 · 财源广进</span>
      <div style="width:50px;height:1px;background:#f59e0b;"></div>
    </div>

    <!-- 居中四字金色大字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #fffbeb 0%, #fef08a 35%, #f59e0b 70%, #92400e 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.9), 0 0 42px rgba(245,158,11,0.45);line-height:1;white-space:nowrap;text-indent:42px;">
      日进斗金
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:14px;color:#fef08a;font-weight:500;">
        所得皆所期，所行化坦途 · 稳步向上
      </span>
      <div style="padding:8px 24px;background:#78350f;border:1.5px solid #fde68a;border-radius:4px;box-shadow:0 4px 18px rgba(0,0,0,0.6);">
        <span style="font-size:24px;font-weight:bold;color:#fffbeb;letter-spacing:6px;">大吉</span>
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
    query: { clientSource: "管理后台", clientId: `deskpad-ext-v2-${Date.now()}` },
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
    const requestId = `dp-ext-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timer = setTimeout(() => {
      pendingResolvers.delete(requestId);
      reject(new Error(`工位执行超时 (${timeoutMs / 1000}s)`));
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

async function run() {
  console.log("=== 启动扩展长款桌垫印花生成 ===");
  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (!tools.length) {
    console.error("无在线设计工具");
    process.exit(1);
  }
  const worker = tools[0];
  console.log(`使用设计端工位: ${worker.id}`);

  for (const tc of EXTENDED_PRINTS) {
    console.log(`\n>>> 正在渲染: ${tc.name} (${tc.style})`);
    await sendRemoteCommand(worker.id, "resetAgent", {}, 10_000).catch(() => null);
    await sendRemoteCommand(worker.id, "executeOperation", { operation: "canvas.clear" }, 10_000).catch(() => null);

    await sendRemoteCommand(worker.id, "executeOperation", {
      operation: "canvas.setSize",
      parameters: { width: tc.width, height: tc.height, unit: "px" },
    });

    const html = tc.generateHtml();
    await sendRemoteCommand(worker.id, "executeOperation", {
      operation: "canvas.addHtml",
      parameters: { htmlContent: html, htmlBindings: {} },
    });

    const saveRes = await sendRemoteCommand(worker.id, "executeOperation", {
      operation: "canvas.updateAndSaveSticker",
      parameters: { name: tc.name },
    }, 60_000);

    const data = saveRes?.data;
    if (data?.url) {
      console.log(`入库成功: ${data.customStickerId}, url: ${data.url}`);
      const localPath = join(SCRATCH_DIR, `${tc.key}.png`);
      await downloadFile(data.url, localPath);
      console.log(`本地保存成功: ${localPath}`);
    }
  }

  console.log("\n=== 扩展桌垫渲染入库完毕 ===");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
