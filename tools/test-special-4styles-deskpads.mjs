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

// =========================================================================
// 用户指定定向探索:
// 1. 可爱少女风 (Sweet Girly & Cream Pastel)
// 2. 小清新森系 (Fresh Mint & Breeze)
// 3. 理智/秩序 (Rational Logic & Order)
// 4. 书法复古 (Classical Calligraphy & Vintage Inks)
// 统一规格: 3200 × 1400 px, 纯中间居中
// =========================================================================

const TARGET_STYLES = [
  // 1. 可爱少女风 ·《天天开心》
  {
    key: "deskpad_girly_sweet",
    name: "长款桌垫印花 ·《天天开心》",
    width: 3200,
    height: 1400,
    style: "可爱少女风 · 奶油蜜桃草莓",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #260e18 0%, #15060d 55%, #080205 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Yuanti SC','Hiragino Sans GB',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间蜜桃粉雾光晕与柔和同心双圆 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:950px;height:950px;background:radial-gradient(circle, rgba(244,114,182,0.18) 0%, rgba(251,113,133,0.06) 50%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:800px;border:2px dashed rgba(244,114,182,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:840px;height:840px;border:1px solid rgba(255,255,255,0.12);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心组件 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <!-- 顶部可爱徽标 -->
    <div style="display:inline-flex;align-items:center;gap:16px;padding:8px 28px;background:rgba(244,114,182,0.12);border:1.5px solid rgba(244,114,182,0.35);border-radius:30px;white-space:nowrap;">
      <span style="font-size:22px;color:#f472b6;">♥</span>
      <span style="font-size:22px;color:#fbcfe8;font-weight:700;letter-spacing:6px;text-transform:uppercase;">SWEET EVERYDAY // 做自己的头号甜心 · 永远热烈</span>
      <span style="font-size:22px;color:#f472b6;">♥</span>
    </div>

    <!-- 圆润饱满软糖少女字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #ffffff 0%, #fce7f3 30%, #f472b6 65%, #db2777 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 38px rgba(244,114,182,0.45);line-height:1;white-space:nowrap;text-indent:42px;">
      天天开心
    </h1>

    <!-- 底部暖心情绪金句 -->
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#fdf2f8;font-weight:500;">
        保持热爱，奔赴山海 · 所见皆是温柔
      </span>
      <div style="padding:6px 22px;background:#be185d;border:1.5px solid #fbcfe8;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-size:22px;font-weight:bold;color:#fff1f2;letter-spacing:4px;">甜心</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 2. 小清新森系 ·《风也温柔》
  {
    key: "deskpad_fresh_breeze",
    name: "长款桌垫印花 ·《风也温柔》",
    width: 3200,
    height: 1400,
    style: "小清新森系 · 薄荷浅青微风",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0d1e18 0%, #06110d 55%, #020504 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Songti SC','PingFang SC','Noto Serif SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间薄荷微露柔光 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(110,231,183,0.14) 0%, rgba(52,211,153,0.05) 50%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1px solid rgba(110,231,183,0.22);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:810px;height:810px;border:1px dashed rgba(255,255,255,0.1);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心视线 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#6ee7b7;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#a7f3d0;font-weight:500;text-transform:uppercase;">SUMMER BREEZE // 去吹吹风 · 把心放平</span>
      <div style="width:40px;height:1px;background:#6ee7b7;"></div>
    </div>

    <!-- 纤美清爽文艺宋黑字体 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #ffffff 0%, #ecfdf5 35%, #6ee7b7 70%, #059669 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.85), 0 0 34px rgba(110,231,183,0.35);line-height:1;white-space:nowrap;text-indent:44px;">
      风也温柔
    </h1>

    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:12px;color:#ecfdf5;font-weight:400;">
        愿你眼里有星辰，心中有山海 · 步履不停
      </span>
      <div style="padding:6px 20px;border:1.5px solid #a7f3d0;background:rgba(110,231,183,0.15);border-radius:4px;">
        <span style="font-size:22px;color:#d1fae5;font-weight:bold;letter-spacing:6px;">清欢</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 3. 理智与秩序 ·《绝对理性》
  {
    key: "deskpad_rational_logic",
    name: "长款桌垫印花 ·《绝对理性》",
    width: 3200,
    height: 1400,
    style: "绝对理智秩序 · 冷凝青灰机能",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0b1524 0%, #060b13 55%, #020407 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Helvetica Neue',Consolas,sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间极简冷凝准星与精细网格圈 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:900px;height:900px;background:radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:760px;height:760px;border:1px solid rgba(96,165,250,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:790px;height:790px;border:1px dashed rgba(255,255,255,0.1);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:60%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 24px;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.3);border-radius:4px;white-space:nowrap;">
      <div style="width:8px;height:8px;background:#60a5fa;border-radius:50%;"></div>
      <span style="font-size:22px;color:#bfdbfe;font-weight:700;letter-spacing:8px;text-transform:uppercase;">RATIONAL ORDER // 保持客观 · 远离非理性</span>
    </div>

    <!-- 冷冽利落无衬线硬核大字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:48px;background:linear-gradient(180deg, #ffffff 0%, #eff6ff 35%, #93c5fd 70%, #1d4ed8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.95), 0 0 36px rgba(96,165,250,0.4);line-height:1;white-space:nowrap;text-indent:48px;">
      绝对理性
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#dbeafe;font-weight:500;">
        万象澄明，心如明镜 · 情绪退场 逻辑至上
      </span>
      <div style="padding:6px 20px;background:#1e3a8a;border:1.5px solid #93c5fd;border-radius:3px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:900;color:#eff6ff;letter-spacing:6px;">秩序</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 4. 书法复古金石 ·《清风徐来》
  {
    key: "deskpad_calligraphy_vintage",
    name: "长款桌垫印花 ·《清风徐来》",
    width: 3200,
    height: 1400,
    style: "书法复古金石 · 魏碑古墨朱砂",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #1c150e 0%, #0e0a06 55%, #030201 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Kaiti SC','Songti SC','PingFang SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间古墨烘染光晕与金石双环 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(217,119,6,0.14) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1.5px solid rgba(217,119,6,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:810px;height:810px;border:1px dashed rgba(254,243,199,0.12);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#d97706;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#fde68a;font-weight:500;text-transform:uppercase;">CLASSICAL RHYME // 笔走龙蛇 · 气象万千</span>
      <div style="width:40px;height:1px;background:#d97706;"></div>
    </div>

    <!-- 苍劲挺拔魏碑汉简书法大字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #fffbeb 0%, #fef3c7 35%, #d97706 70%, #78350f 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.9), 0 0 40px rgba(217,119,6,0.4);line-height:1;white-space:nowrap;text-indent:44px;">
      清风徐来
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;white-space:nowrap;">
      <span style="font-size:36px;letter-spacing:14px;color:#fef3c7;font-weight:400;">
        静水流深，沧笙踏歌 · 自有万钧之力
      </span>
      <div style="padding:6px 20px;background:#991b1b;border:1.5px solid #fecaca;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:bold;color:#fef2f2;letter-spacing:6px;">古拙</span>
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
    query: { clientSource: "管理后台", clientId: `deskpad-target4-${Date.now()}` },
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
    const requestId = `dp-t4-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timer = setTimeout(() => {
      pendingResolvers.delete(requestId);
      reject(new Error(`工位超时 (${timeoutMs / 1000}s)`));
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
  console.log("=== 启动四大指定风格长款桌垫印花测试 ===");
  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (!tools.length) {
    console.error("无在线设计端");
    process.exit(1);
  }
  const worker = tools[0];
  console.log(`工位就绪: ${worker.id}`);

  for (let i = 0; i < TARGET_STYLES.length; i++) {
    const tc = TARGET_STYLES[i];
    console.log(`\n>>> [${i + 1}/${TARGET_STYLES.length}] 正在渲染: ${tc.name} (${tc.style})`);
    const start = Date.now();

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

    const cost = ((Date.now() - start) / 1000).toFixed(1);
    const data = saveRes?.data;
    if (data?.url) {
      console.log(`   ✅ 渲染入库成功 (${cost}s), ID: ${data.customStickerId}`);
      console.log(`   🌐 COS URL: ${data.url}`);
      const localPath = join(SCRATCH_DIR, `${tc.key}.png`);
      await downloadFile(data.url, localPath);
      console.log(`   💾 已下载本地: ${localPath}`);
    } else {
      console.error(`   ❌ 保存异常:`, saveRes);
    }
  }

  console.log("\n=== 4 款指定风格长款桌垫全部渲染入库成功 ===");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
