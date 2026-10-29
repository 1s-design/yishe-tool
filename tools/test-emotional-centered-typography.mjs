import { io } from "socket.io-client";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiYWNjb3VudCI6ImphY2tpZSIsInRlcm1pbmFsVHlwZSI6ImFkbWluIiwidG9rZW5JZCI6IjhiOWM0MDlmLWUyYWMtNDU3Mi1iMTA4LTEyZTE3MTQ3NjIxZCIsImlhdCI6MTc5MTEzMDY1MCwiZXhwIjoyMTA2NzA2NjUwfQ.Ebae-frV7NN98CT48hYHTLkn8ct7Efpc_5KAL9zLop8";
const RAW_TOKEN = TOKEN.replace("Bearer ", "");
const SERVER_URL = "http://localhost:1520";
const SCRATCH_DIR = "/Users/jackie/.gemini/antigravity-ide/brain/00fa42cd-f28a-432f-b735-d44a270f2b84/scratch";

if (!existsSync(SCRATCH_DIR)) {
  mkdirSync(SCRATCH_DIR, { recursive: true });
}

// =========================================================================
// 情绪价值 · 中间居中大文字设计矩阵 (Emotional Centered Big Typography)
// =========================================================================

const EMOTIONAL_CASES = [
  // 1. 《松弛感》- 晨曦森林绿治愈系 (1:1 方块贴纸)
  {
    key: "emotional_songchigan_1x1",
    name: "治愈系方贴 ·《松弛感》",
    form: "1:1 方贴 (2400×2400)",
    width: 2400,
    height: 2400,
    theme: "松弛放空 · 告别焦虑",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 48%, #0d281f 0%, #061510 60%, #020705 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:170px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 双重柔和翡翠光环与微弱噪点质感 -->
  <div style="position:absolute;inset:85px;border:1.5px solid rgba(52,211,153,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;inset:108px;border:1px dashed rgba(255,255,255,0.15);border-radius:50%;pointer-events:none;"></div>
  <!-- 柔光晕染核心 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:720px;height:720px;background:radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>

  <!-- 顶部治愈情绪微标 -->
  <div style="display:flex;align-items:center;gap:18px;z-index:2;margin-top:20px;">
    <div style="width:50px;height:2px;background:linear-gradient(90deg,transparent,#34d399);"></div>
    <span style="font-size:36px;letter-spacing:14px;color:#6ee7b7;font-weight:600;white-space:nowrap;">CHILL VIBES · 慢品人间烟火</span>
    <div style="width:50px;height:2px;background:linear-gradient(90deg,#34d399,transparent);"></div>
  </div>

  <!-- 居中绝对核心大字 (3字开阔大号排版，呼吸感极佳) -->
  <div style="display:flex;align-items:center;justify-content:center;width:86%;max-width:86%;margin:auto 0;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 22.5);font-weight:900;letter-spacing:42px;background:linear-gradient(135deg, #ffffff 0%, #d1fae5 35%, #34d399 70%, #059669 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 44px rgba(0,0,0,0.8), 0 0 36px rgba(52,211,153,0.38);white-space:nowrap;display:flex;justify-content:center;align-items:center;">
      松弛感
    </h1>
  </div>

  <!-- 底部情绪价值金句与治愈方印 -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:30px;z-index:2;margin-bottom:20px;">
    <div style="font-size:44px;letter-spacing:10px;color:#ecfdf5;font-weight:500;white-space:nowrap;text-shadow:0 4px 14px rgba(0,0,0,0.7);">
      不慌不忙 心有半亩花田
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center;padding:12px 30px;background:#065f46;border:2px solid #a7f3d0;border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,0.5);">
      <span style="font-size:30px;font-weight:bold;color:#d1fae5;letter-spacing:6px;">顺心自洽</span>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 2. 《拒绝内耗》- 克莱因蓝夜幕人间清醒 (9:16 手机壁纸)
  {
    key: "emotional_jujueneihao_9x16",
    name: "清醒手机壁纸 ·《拒绝内耗》",
    form: "9:16 手机壁纸 (1440×2560)",
    width: 1440,
    height: 2560,
    theme: "情绪自由 · 人间清醒",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 30%, #0c1836 0%, #060c1d 60%, #020409 100%);box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:180px 120px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 顶端情绪胶囊标头 -->
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid rgba(56,189,248,0.3);padding-bottom:30px;z-index:2;">
    <div style="display:inline-flex;align-items:center;gap:12px;padding:8px 20px;background:rgba(56,189,248,0.15);border-radius:30px;border:1px solid rgba(56,189,248,0.4);">
      <div style="width:10px;height:10px;border-radius:50%;background:#38bdf8;box-shadow:0 0 10px #38bdf8;"></div>
      <span style="font-size:26px;color:#bae6fd;font-weight:700;letter-spacing:4px;">NO OVERTHINKING</span>
    </div>
    <span style="font-size:26px;color:#94a3b8;letter-spacing:6px;">FOCUS ON SELF</span>
  </div>

  <!-- 居中超大两行折行大字 (极其霸气醒脑) -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin:auto 0;z-index:2;">
    <div style="font-size:36px;letter-spacing:18px;color:#38bdf8;font-weight:700;margin-bottom:36px;text-transform:uppercase;">
      · 人间清醒 · 情绪自由 ·
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 26);font-weight:900;letter-spacing:22px;background:linear-gradient(180deg, #ffffff 0%, #e0f2fe 35%, #38bdf8 70%, #0284c7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 44px rgba(0,0,0,0.85), 0 0 36px rgba(56,189,248,0.5);line-height:1.15;text-align:center;">
      拒绝<br>内耗
    </h1>
    <div style="width:160px;height:4px;background:linear-gradient(90deg,transparent,#38bdf8,transparent);margin-top:48px;"></div>
  </div>

  <!-- 底部豁达治愈金句 -->
  <div style="display:flex;flex-direction:column;gap:20px;border-top:1px solid rgba(255,255,255,0.12);padding-top:36px;z-index:2;">
    <div style="font-size:42px;color:#f8fafc;font-weight:600;letter-spacing:6px;line-height:1.4;">
      关关难过关关过<br><span style="color:#38bdf8;">事事不顺事事休</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
      <span style="font-size:26px;color:#94a3b8;letter-spacing:4px;">与其精神内耗 · 不如向阳盛开</span>
      <div style="padding:10px 24px;background:#0369a1;border:1.5px solid #7dd3fc;border-radius:4px;">
        <span style="font-size:28px;font-weight:bold;color:#f0f9ff;letter-spacing:6px;">自洽</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 3. 《允许一切发生》- 暖阳落日余晖 (16:9 宽屏桌面壁纸)
  {
    key: "emotional_yunxufasheng_16x9",
    name: "治愈宽屏壁纸 ·《允许一切发生》",
    form: "16:9 电脑壁纸 (2560×1440)",
    width: 2560,
    height: 1440,
    theme: "旷达从容 · 顺应自然",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 40%, #291207 0%, #150803 55%, #080301 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:110px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 落日暖阳大光晕 -->
  <div style="position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);width:960px;height:480px;background:radial-gradient(ellipse, rgba(245,158,11,0.18) 0%, transparent 70%);pointer-events:none;"></div>

  <!-- 顶部轻盈格言 -->
  <div style="display:flex;align-items:center;gap:20px;z-index:2;">
    <span style="font-size:26px;letter-spacing:14px;color:#fbbf24;font-weight:600;text-transform:uppercase;">LET IT BE // 顺应天意 · 随遇而安</span>
  </div>

  <!-- 中间通栏居中大字 (气魄宏阔，字字有安抚人心的力量) -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;margin:auto 0;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 14.8);font-weight:900;letter-spacing:32px;background:linear-gradient(180deg, #ffffff 0%, #fef3c7 35%, #f59e0b 70%, #b45309 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 38px rgba(0,0,0,0.85), 0 0 32px rgba(245,158,11,0.4);line-height:1;white-space:nowrap;">
      允许一切发生
    </h1>
    <div style="font-size:36px;letter-spacing:18px;color:#d97706;font-weight:700;margin-top:36px;">
      去吹吹晚风，所有的不如意都随风而散
    </div>
  </div>

  <!-- 底部安宁印鉴与状态 -->
  <div style="display:flex;align-items:center;justify-content:space-between;width:100%;border-top:1px solid rgba(245,158,11,0.25);padding-top:26px;z-index:2;">
    <span style="font-size:22px;color:#94a3b8;letter-spacing:6px;">PEACE OF MIND · MINDFULNESS</span>
    <div style="display:inline-flex;align-items:center;gap:12px;">
      <div style="padding:8px 22px;background:#92400e;border:1.5px solid #fef3c7;border-radius:4px;">
        <span style="font-size:24px;font-weight:bold;color:#fef3c7;letter-spacing:6px;">泰然自若</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 4. 《保持热爱》- 炽热赤金奔赴山海 (2:1 全景桌面桌垫)
  {
    key: "emotional_baochireai_2x1",
    name: "热血电竞桌垫 ·《保持热爱》",
    form: "2:1 桌垫 (3200×1600)",
    width: 3200,
    height: 1600,
    theme: "向上向光 · 奔赴山海",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #200707 0%, #0e0202 55%, #040101 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:120px 180px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 赤金边框纹理 -->
  <div style="position:absolute;inset:50px;border:1.5px solid rgba(239,68,68,0.3);pointer-events:none;"></div>
  <div style="position:absolute;top:65px;left:80px;font-size:24px;color:#ef4444;font-weight:800;letter-spacing:6px;">
    PASSION & GLORY // 热爱可抵岁月漫长
  </div>
  <div style="position:absolute;top:65px;right:80px;font-size:24px;color:#94a3b8;letter-spacing:6px;">
    RUN TOWARDS THE MOUNTAINS AND SEAS
  </div>

  <!-- 居中超大开阔大字 (震撼有力，直击人心) -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;margin:auto 0;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 20);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #ffffff 0%, #fecaca 30%, #ef4444 70%, #991b1b 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 48px rgba(0,0,0,0.9), 0 0 46px rgba(239,68,68,0.5);line-height:1;white-space:nowrap;">
      保持热爱
    </h1>
    <div style="font-size:38px;letter-spacing:22px;color:#f87171;font-weight:700;margin-top:40px;text-transform:uppercase;">
      星光不问赶路人 · 时光不负有心人
    </div>
  </div>

  <!-- 底部坚定印鉴与格言 -->
  <div style="display:flex;align-items:center;justify-content:space-between;width:100%;border-top:1px solid rgba(239,68,68,0.25);padding-top:28px;z-index:2;">
    <span style="font-size:26px;color:#e2e8f0;letter-spacing:6px;">生而有翼，为何甘做爬行之物？</span>
    <div style="padding:10px 28px;background:#991b1b;border:2px solid #fee2e2;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
      <span style="font-size:28px;font-weight:900;color:#fef2f2;letter-spacing:8px;">破晓而生</span>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 5. 《不被定义》- 极简黑白银冷峻独立 (9:16 手机海报)
  {
    key: "emotional_bubeidingyi_9x16",
    name: "态度手机海报 ·《不被定义》",
    form: "9:16 手机海报 (1440×2560)",
    width: 1440,
    height: 2560,
    theme: "独立自我 · 野生自洽",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:#0a0a0c;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:180px 120px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 极简先锋标尺线条 -->
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid rgba(255,255,255,0.18);padding-bottom:28px;z-index:2;">
    <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:6px;">STAND ALONE</span>
    <span style="font-size:24px;color:#64748b;letter-spacing:6px;">VOL.01 // UNTAGGED</span>
  </div>

  <!-- 居中超大巨幅大字 (黑白高反差，纯粹有力) -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin:auto 0;z-index:2;">
    <div style="font-size:32px;letter-spacing:18px;color:#94a3b8;font-weight:600;margin-bottom:40px;">
      · 做自己的标准答案 ·
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 26.5);font-weight:900;letter-spacing:20px;background:linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 40px rgba(0,0,0,0.9), 0 0 24px rgba(255,255,255,0.3);line-height:1.15;text-align:center;">
      不被<br>定义
    </h1>
    <div style="width:120px;height:3px;background:#ffffff;margin-top:44px;"></div>
  </div>

  <!-- 底部独立个性语录 -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,0.15);padding-top:36px;z-index:2;">
    <div style="max-width:68%;">
      <div style="font-size:40px;color:#ffffff;font-weight:700;letter-spacing:6px;line-height:1.35;">无需借光</div>
      <div style="font-size:28px;color:#94a3b8;margin-top:10px;letter-spacing:4px;">你就是自己宇宙的中心</div>
    </div>
    <div style="padding:10px 24px;border:2px solid #ffffff;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:6px;">
      野生
    </div>
  </div>
</div>
    `.trim(),
  },

  // 6. 《心有繁花》- 梦幻暮霭紫粉微醺 (1:1 方块贴纸/画芯)
  {
    key: "emotional_xinyoufan_hua_1x1",
    name: "浪漫治愈方贴 ·《心有繁花》",
    form: "1:1 方贴 (2400×2400)",
    width: 2400,
    height: 2400,
    theme: "浪漫治愈 · 繁花相送",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 48%, #230d2e 0%, #110518 60%, #05010a 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:170px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 紫粉柔和星芒同心圆 -->
  <div style="position:absolute;inset:90px;border:2px solid rgba(244,114,182,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;inset:115px;border:1px dashed rgba(255,255,255,0.18);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:780px;height:780px;background:radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>

  <!-- 顶部浪漫治愈小标 -->
  <div style="display:flex;align-items:center;gap:20px;z-index:2;margin-top:20px;">
    <div style="width:50px;height:2px;background:linear-gradient(90deg,transparent,#f472b6);"></div>
    <span style="font-size:38px;letter-spacing:14px;color:#f472b6;font-weight:600;white-space:nowrap;">BLOOM FROM WITHIN · 默默扎根 肆意盛开</span>
    <div style="width:50px;height:2px;background:linear-gradient(90deg,#f472b6,transparent);"></div>
  </div>

  <!-- 居中核心大字 (4字居中，诗意盎然) -->
  <div style="display:flex;align-items:center;justify-content:center;width:82%;max-width:82%;margin:auto 0;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17.5);font-weight:900;letter-spacing:26px;background:linear-gradient(135deg, #ffffff 0%, #fbcfe8 35%, #f472b6 70%, #db2777 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.8), 0 0 36px rgba(244,114,182,0.45);white-space:nowrap;display:flex;justify-content:center;align-items:center;">
      心有繁花
    </h1>
  </div>

  <!-- 底部治愈金句与朱砂印 -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:30px;z-index:2;margin-bottom:20px;">
    <div style="font-size:44px;letter-spacing:10px;color:#fdf2f8;font-weight:500;white-space:nowrap;text-shadow:0 4px 14px rgba(0,0,0,0.7);">
      愿你历经千帆，归来仍有花香满袖
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center;padding:12px 30px;background:#9d174d;border:2px solid #fbcfe8;border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,0.5);">
      <span style="font-size:30px;font-weight:bold;color:#fdf2f8;letter-spacing:6px;">繁花相送</span>
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
    query: { clientSource: "管理后台", clientId: `emotional-test-${Date.now()}` },
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

function sendRemoteCommand(connectionId, type, payload = {}, timeoutMs = 120_000) {
  return new Promise((resolve, reject) => {
    const requestId = `emo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
  if (!res.ok) throw new Error(`HTTP ${res.status} when fetching ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buf);
}

async function runEmotionalTests() {
  console.log("\n=======================================================");
  console.log("   💖 情绪价值 · 中间居中大文字系列专项设计测试");
  console.log("   🎯 重点考量: 居中绝对视觉重心、情绪共鸣、治愈色彩、多形态比例");
  console.log("=======================================================\n");

  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (!tools.length) {
    console.error("❌ 未检测到在线设计端工位！请确保设计工具保持连接。");
    process.exit(1);
  }
  const worker = tools[0];
  console.log(`✅ 成功接入在线设计端工位: [${worker.id}] (${worker.clientSource})`);

  const results = [];

  for (let i = 0; i < EMOTIONAL_CASES.length; i++) {
    const tc = EMOTIONAL_CASES[i];
    console.log(`\n───────────────────────────────────────────────────────`);
    console.log(`🚀 [情绪测试 ${i + 1}/${EMOTIONAL_CASES.length}] 正在创作: ${tc.name}`);
    console.log(`   📐 尺寸规格: ${tc.width} × ${tc.height} px (${tc.form})`);
    console.log(`   💭 情绪内核: ${tc.theme}`);
    const start = Date.now();

    try {
      // 1. 复位清空
      await sendRemoteCommand(worker.id, "resetAgent", {}, 10_000).catch(() => null);
      await sendRemoteCommand(worker.id, "executeOperation", { operation: "canvas.clear" }, 15_000).catch(() => null);

      // 2. 动态调节画板比例
      console.log(`   📐 设置画板几何: setSize(${tc.width}, ${tc.height})...`);
      await sendRemoteCommand(worker.id, "executeOperation", {
        operation: "canvas.setSize",
        parameters: { width: tc.width, height: tc.height, unit: "px" },
      });

      // 3. 注入居中大字自适应排版 HTML
      console.log(`   ✨ 注入居中大字与情绪治愈组件...`);
      const html = tc.generateHtml();
      await sendRemoteCommand(worker.id, "executeOperation", {
        operation: "canvas.addHtml",
        parameters: { htmlContent: html, htmlBindings: {} },
      });

      // 4. 保存为自定义设计/贴纸产物入库
      console.log(`   💾 正在高精渲染与云端落库: updateAndSaveSticker...`);
      const saveRes = await sendRemoteCommand(worker.id, "executeOperation", {
        operation: "canvas.updateAndSaveSticker",
        parameters: { name: tc.name },
      }, 60_000);

      const cost = ((Date.now() - start) / 1000).toFixed(1);
      const data = saveRes?.data;
      if (data?.customStickerId && data?.url) {
        console.log(`   ✅ [测试通过] 入库成功！耗时: ${cost}s, ID: ${data.customStickerId}`);
        console.log(`   🌐 云端 COS: ${data.url}`);
        
        // 5. 下载到本地供视觉质检与展示
        const localPath = join(SCRATCH_DIR, `${tc.key}.png`);
        await downloadFile(data.url, localPath);
        console.log(`   📥 已下载高清产物到本地: ${localPath}`);
        results.push({ ...tc, id: data.customStickerId, url: data.url, localPath, cost, status: "SUCCESS" });
      } else {
        console.warn(`   ⚠️ 响应数据异常:`, saveRes);
        results.push({ ...tc, status: "WARNING", err: JSON.stringify(saveRes) });
      }
    } catch (err) {
      console.error(`   ❌ 执行失败:`, err.message);
      results.push({ ...tc, status: "ERROR", err: err.message });
    }
  }

  console.log("\n=======================================================");
  console.log("   🎉 情绪价值·中间居中大文字系列测试汇总");
  console.log("=======================================================");
  for (const r of results) {
    console.log(`${r.status === "SUCCESS" ? "✅" : "❌"} ${r.name} | ${r.form} | 耗时: ${r.cost}s | 本地: ${r.localPath || "N/A"}`);
  }
  console.log("=======================================================\n");

  process.exit(0);
}

runEmotionalTests().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
