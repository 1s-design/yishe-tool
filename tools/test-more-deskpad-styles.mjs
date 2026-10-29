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
// 长款桌垫印花（3200 × 1400 px）· 纯中间居中 · 更多先锋风格与字体实测矩阵
// 1. 赛博故障霓虹 (Cyber Glitch)
// 2. 复古古典高阶衬线 (Vintage Editorial Serif)
// 3. 先锋酸性液态镀铬 (Acid Liquid Chrome)
// 4. 日系暖杏软萌治愈 (Kawaii Pastel Chill)
// 5. 极简工业黑黄警戒 (Industrial Hazard Utility)
// 6. 暗夜苍劲行楷墨染 (Dark Chinese Ink Calligraphy)
// =========================================================================

const NOVEL_STYLES = [
  // 1. 赛博朋克双色故障重影 ·《永动机》
  {
    key: "deskpad_cyber_glitch",
    name: "长款桌垫印花 ·《永动机》",
    width: 3200,
    height: 1400,
    style: "赛博霓虹双色故障 · 极客超频",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0d0f2b 0%, #060814 55%, #020308 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Courier New',Consolas,monospace,sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间蓝粉交叠光晕 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:960px;height:960px;background:radial-gradient(circle, rgba(0,242,254,0.12) 0%, rgba(254,9,121,0.08) 50%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:820px;height:820px;border:1.5px solid rgba(0,242,254,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:860px;height:860px;border:1px dashed rgba(254,9,121,0.25);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心组件 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:58%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 24px;background:rgba(0,242,254,0.1);border:1px solid rgba(0,242,254,0.35);border-radius:4px;">
      <span style="font-size:24px;color:#00f2fe;font-weight:700;letter-spacing:8px;text-transform:uppercase;">SYS_OVERCLOCK // 无限算力 · 驱动未来</span>
    </div>

    <!-- 赛博大字 (双层故障重影效果) -->
    <div style="position:relative;display:inline-block;">
      <!-- 底层洋红重影偏移 -->
      <h1 style="position:absolute;top:3px;left:-4px;margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17.5);font-weight:900;letter-spacing:46px;color:#fe0979;opacity:0.85;filter:blur(1px);line-height:1;white-space:nowrap;text-indent:46px;font-family:'PingFang SC','Impact',sans-serif;">
        永动机
      </h1>
      <!-- 底层青蓝重影偏移 -->
      <h1 style="position:absolute;top:-3px;left:4px;margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17.5);font-weight:900;letter-spacing:46px;color:#00f2fe;opacity:0.85;filter:blur(1px);line-height:1;white-space:nowrap;text-indent:46px;font-family:'PingFang SC','Impact',sans-serif;">
        永动机
      </h1>
      <!-- 顶层主字 -->
      <h1 style="position:relative;margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17.5);font-weight:900;letter-spacing:46px;background:linear-gradient(180deg, #ffffff 0%, #e0f2fe 40%, #00f2fe 75%, #0284c7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.95), 0 0 40px rgba(0,242,254,0.5);line-height:1;white-space:nowrap;text-indent:46px;font-family:'PingFang SC','Impact',sans-serif;">
        永动机
      </h1>
    </div>

    <div style="display:flex;align-items:center;gap:28px;margin-top:10px;">
      <span style="font-size:36px;letter-spacing:12px;color:#f8fafc;font-weight:600;font-family:'PingFang SC',sans-serif;">能量不灭，心焰不息 · 突破算力极限</span>
      <div style="padding:6px 20px;background:rgba(254,9,121,0.2);border:1.5px solid #fe0979;border-radius:4px;">
        <span style="font-size:22px;font-weight:bold;color:#f472b6;letter-spacing:4px;">BOOST</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 2. 复古报刊高阶衬线 ·《平常心》
  {
    key: "deskpad_vintage_editorial",
    name: "长款桌垫印花 ·《平常心》",
    width: 3200,
    height: 1400,
    style: "复古古典高阶衬线 · 墨绿典雅",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0f1c16 0%, #08100d 55%, #020403 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Songti SC','Baskerville','Times New Roman',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间古铜米金细纹光晕 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1px solid rgba(212,175,55,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:810px;height:810px;border:1px dashed rgba(254,243,199,0.15);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中视线容器 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;z-index:2;max-width:58%;">
    <!-- 顶部复古优雅衬线副标 -->
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:40px;height:1px;background:#d4af37;"></div>
      <span style="font-size:22px;letter-spacing:10px;color:#fde68a;font-style:italic;font-weight:500;text-transform:uppercase;white-space:nowrap;">STILL WATERS RUN DEEP // 岁月漫长 · 值得等待</span>
      <div style="width:40px;height:1px;background:#d4af37;"></div>
    </div>

    <!-- 典雅宋体大字 (挺拔瘦金神韵与清代榜书融合) -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:48px;background:linear-gradient(180deg, #fffbeb 0%, #fef3c7 35%, #d4af37 70%, #854d0e 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.85), 0 0 32px rgba(212,175,55,0.3);line-height:1;white-space:nowrap;text-indent:48px;">
      平常心
    </h1>

    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:14px;color:#fef9c3;font-weight:400;">
        流水不争先，争的是滔滔不绝
      </span>
      <div style="padding:6px 20px;border:1.5px solid #d4af37;background:rgba(212,175,55,0.15);border-radius:3px;">
        <span style="font-size:22px;color:#fef3c7;font-weight:bold;letter-spacing:6px;">从容</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 3. 先锋酸性镀铬液态水银 ·《野蛮生长》
  {
    key: "deskpad_acid_metal",
    name: "长款桌垫印花 ·《野蛮生长》",
    width: 3200,
    height: 1400,
    style: "先锋酸性液态镀铬 · 前卫高街",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #160a22 0%, #0b0412 55%, #030106 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Impact',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间紫银液态发光光斑 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:950px;height:950px;background:radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:800px;border:1.5px solid rgba(192,132,252,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:830px;height:830px;border:1px dashed rgba(255,255,255,0.1);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 (张力拉满的扁平拉伸大字) -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:64%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 24px;background:rgba(216,180,254,0.1);border:1px solid rgba(216,180,254,0.3);border-radius:24px;">
      <span style="font-size:24px;color:#e9d5ff;font-weight:700;letter-spacing:8px;text-transform:uppercase;">UNSTOPPABLE // 打破边界 · 自由蔓延</span>
    </div>

    <!-- 超扁宽酸性重金属质感大字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:46px;transform:scale(1, 0.88);background:linear-gradient(180deg, #ffffff 0%, #f3e8ff 25%, #c084fc 55%, #7e22ce 85%, #3b0764 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 48px rgba(0,0,0,0.95), 0 0 46px rgba(168,85,247,0.45);line-height:1;white-space:nowrap;text-indent:46px;">
      野蛮生长
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:6px;">
      <span style="font-size:36px;letter-spacing:14px;color:#f3e8ff;font-weight:500;">
        像风一样穿过旷野 · 没有任何事物能定义你
      </span>
      <div style="padding:6px 22px;background:#581c87;border:1.5px solid #d8b4fe;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:900;color:#f3e8ff;letter-spacing:6px;">原生</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 4. 日系暖杏软萌治愈 ·《快乐万岁》
  {
    key: "deskpad_kawaii_chill",
    name: "长款桌垫印花 ·《快乐万岁》",
    width: 3200,
    height: 1400,
    style: "日系暖杏软萌治愈 · 温暖解压",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #201712 0%, #100b08 55%, #050302 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Yuanti SC','Comic Sans MS',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间奶杏暖阳柔和圆晕 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(251,146,60,0.15) 0%, rgba(253,230,138,0.08) 50%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:2px dashed rgba(251,146,60,0.25);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心组件 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:62%;">
    <div style="display:inline-flex;align-items:center;gap:16px;padding:8px 26px;background:rgba(251,146,60,0.12);border:1.5px solid rgba(251,146,60,0.3);border-radius:30px;">
      <span style="font-size:24px;color:#fdba74;font-weight:700;letter-spacing:6px;">STAY HAPPY ★ 每一天都有好心情</span>
    </div>

    <!-- 软萌圆润泡泡糖大字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:44px;background:linear-gradient(180deg, #fffbeb 0%, #ffedd5 35%, #fb923c 70%, #c2410c 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 36px rgba(251,146,60,0.4);line-height:1;white-space:nowrap;text-indent:44px;">
      快乐万岁
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:12px;color:#fed7aa;font-weight:500;">
        吃好睡好，烦恼全消 · 做个快乐的普通人
      </span>
      <div style="padding:6px 20px;background:#9a3412;border:1.5px solid #fed7aa;border-radius:18px;">
        <span style="font-size:22px;font-weight:bold;color:#fff7ed;letter-spacing:4px;">元气</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 5. 极简工业黑黄警戒 ·《勿扰》
  {
    key: "deskpad_industrial_hazard",
    name: "长款桌垫印花 ·《勿扰》",
    width: 3200,
    height: 1400,
    style: "极简工业黑黄警戒 · 极度硬核",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #171508 0%, #0c0b03 55%, #030301 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Impact',Arial,sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间工业斜纹警戒光晕 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(250,204,21,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:2px solid rgba(250,204,21,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:810px;height:810px;border:1px dashed rgba(255,255,255,0.15);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:55%;">
    <div style="display:inline-flex;align-items:center;gap:18px;padding:8px 24px;background:#facc15;color:#000000;border-radius:3px;">
      <span style="font-size:24px;font-weight:900;letter-spacing:6px;text-transform:uppercase;">⚠ CAUTION // 心流模式 · 严禁打扰</span>
    </div>

    <!-- 超硬朗重装工业大字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 21.5);font-weight:900;letter-spacing:64px;background:linear-gradient(180deg, #ffffff 0%, #fef08a 35%, #facc15 70%, #854d0e 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 46px rgba(0,0,0,0.95), 0 0 46px rgba(250,204,21,0.45);line-height:1;white-space:nowrap;text-indent:64px;">
      勿扰
    </h1>

    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:14px;color:#fef08a;font-weight:600;">思维全速运转中 · 非请勿触</span>
      <div style="padding:6px 20px;background:#713f12;border:1.5px solid #fef08a;border-radius:3px;">
        <span style="font-size:22px;font-weight:900;color:#fef08a;letter-spacing:4px;">LOCK</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 6. 暗夜苍劲行楷墨染 ·《如风》
  {
    key: "deskpad_gothic_ink",
    name: "长款桌垫印花 ·《如风》",
    width: 3200,
    height: 1400,
    style: "暗夜苍劲行楷墨染 · 逍遥纵情",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #151b1e 0%, #0a0e10 55%, #020405 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'Kaiti SC','Songti SC','PingFang SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间水墨幽蓝发光光环 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:760px;height:760px;border:1px solid rgba(56,189,248,0.22);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中视线容器 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:55%;">
    <div style="display:flex;align-items:center;gap:20px;white-space:nowrap;">
      <div style="width:50px;height:1px;background:#38bdf8;"></div>
      <span style="font-size:24px;letter-spacing:10px;color:#7dd3fc;font-weight:500;white-space:nowrap;">BE LIKE THE WIND // 行至水穷 · 坐看云起</span>
      <div style="width:50px;height:1px;background:#38bdf8;"></div>
    </div>

    <!-- 苍劲行楷大字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 21.5);font-weight:900;letter-spacing:64px;background:linear-gradient(180deg, #ffffff 0%, #bae6fd 35%, #38bdf8 70%, #0369a1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 44px rgba(0,0,0,0.9), 0 0 38px rgba(56,189,248,0.4);line-height:1;white-space:nowrap;text-indent:64px;">
      如风
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:14px;color:#f0f9ff;font-weight:400;">山水一程，三生有幸 · 纵情四海任我行</span>
      <div style="padding:6px 20px;background:#0369a1;border:1.5px solid #7dd3fc;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:22px;font-weight:bold;color:#f0f9ff;letter-spacing:6px;">逍遥</span>
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
    query: { clientSource: "管理后台", clientId: `deskpad-novel-${Date.now()}` },
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
    const requestId = `dp-nv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
  console.log("=== 启动全新风格长款桌垫印花测试 ===");
  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (!tools.length) {
    console.error("无在线设计端");
    process.exit(1);
  }
  const worker = tools[0];
  console.log(`工位就绪: ${worker.id}`);

  for (let i = 0; i < NOVEL_STYLES.length; i++) {
    const tc = NOVEL_STYLES[i];
    console.log(`\n>>> [${i + 1}/${NOVEL_STYLES.length}] 正在渲染: ${tc.name} (${tc.style})`);
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

  console.log("\n=== 全部 6 款新风格长款桌垫渲染完成 ===");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
