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
// 6 种迥异尺寸与多元设计风格矩阵
// =========================================================================

const TEST_MATRIX = [
  // 1. 横版 2:1 超宽电竞桌面垫
  {
    key: "case1_deskpad_3200x1600",
    name: "横版全景电竞桌垫 ·《暗夜破晓》",
    form: "2:1 桌垫 (Desk Pad)",
    width: 3200,
    height: 1600,
    style: "赛博机能电竞风 (Cyber Mecha & Esports)",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 70% 50%, #15102a 0%, #080612 55%, #020105 100%);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:120px 180px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 机能网格与标尺 -->
  <div style="position:absolute;inset:40px;border:1px solid rgba(168,85,247,0.25);pointer-events:none;"></div>
  <div style="position:absolute;top:60px;left:70px;display:flex;gap:30px;font-size:24px;color:#a855f7;font-weight:700;letter-spacing:4px;">
    <span>GRID // 3200×1600</span>
    <span>SYS.VER 2.6</span>
    <span style="color:#38bdf8;">DESKPAD EDITION</span>
  </div>
  <div style="position:absolute;bottom:60px;right:70px;font-size:22px;color:#94a3b8;letter-spacing:6px;">
    ULTRA-WIDE GAMING DESK MAT / 原创设计
  </div>

  <!-- 左侧：纵向对仗诗句与朱砂机能印 -->
  <div style="display:flex;flex-direction:column;gap:30px;z-index:2;max-width:32%;">
    <div style="display:inline-flex;align-items:center;gap:12px;padding:8px 20px;background:rgba(168,85,247,0.15);border-left:4px solid #a855f7;color:#d8b4fe;font-size:32px;letter-spacing:8px;font-weight:700;">
      破界 · 重塑乾坤
    </div>
    <div style="font-size:48px;line-height:1.45;color:#f8fafc;font-weight:600;letter-spacing:8px;text-shadow:0 4px 20px rgba(0,0,0,0.8);">
      心如利剑出鞘<br>势不可挡破苍穹
    </div>
    <div style="display:inline-flex;align-items:center;gap:16px;margin-top:10px;">
      <div style="padding:10px 24px;background:#7e22ce;color:#faf5ff;font-size:28px;font-weight:900;letter-spacing:6px;border-radius:4px;">
        势如破竹
      </div>
      <div style="width:120px;height:2px;background:linear-gradient(90deg,#a855f7,transparent);"></div>
    </div>
  </div>

  <!-- 右侧：震撼全景大字 (右侧黄金留白) -->
  <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 19.5);font-weight:900;letter-spacing:24px;background:linear-gradient(135deg, #ffffff 0%, #f0abfc 35%, #c084fc 70%, #7e22ce 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 48px rgba(0,0,0,0.85), 0 0 40px rgba(192,132,252,0.45);line-height:1;white-space:nowrap;">
      暗夜破晓
    </h1>
    <div style="font-size:36px;letter-spacing:18px;color:#94a3b8;font-weight:700;margin-top:28px;text-transform:uppercase;">
      BREAK THROUGH THE DARKNESS
    </div>
  </div>
</div>
    `.trim(),
  },

  // 2. 横版 16:9 超清宽屏电脑壁纸 / 横幅
  {
    key: "case2_banner_2560x1440",
    name: "横版宽屏壁纸/Banner ·《赛博浪潮》",
    form: "16:9 宽屏壁纸 (Ultra-Wide Banner)",
    width: 2560,
    height: 1440,
    style: "复古蒸汽波霓虹风 (80s Retro Synthwave)",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 35%, #2a0845 0%, #15002b 50%, #080014 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:100px 140px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 蒸汽波地平线渐变网格 -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:45%;background:linear-gradient(to top, rgba(236,72,153,0.18) 0%, transparent 100%);border-top:2px solid #ec4899;perspective:600px;pointer-events:none;">
    <div style="width:100%;height:100%;background:repeating-linear-gradient(90deg, rgba(236,72,153,0.2) 0px, rgba(236,72,153,0.2) 2px, transparent 2px, transparent 80px);"></div>
  </div>

  <!-- 发光同心悬日 -->
  <div style="position:absolute;top:22%;left:50%;transform:translate(-50%, -50%);width:420px;height:420px;background:linear-gradient(to bottom, #fde047 0%, #f43f5e 60%, #a855f7 100%);border-radius:50%;opacity:0.85;box-shadow:0 0 100px rgba(244,63,94,0.6);pointer-events:none;"></div>

  <!-- 顶部英文标头 -->
  <div style="display:flex;align-items:center;gap:24px;z-index:2;margin-top:10px;">
    <span style="font-size:26px;letter-spacing:14px;color:#f472b6;font-weight:700;text-transform:uppercase;">SYNTHWAVE 1984 // RETRO HORIZON</span>
  </div>

  <!-- 中央蒸汽波大字 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;margin:auto 0;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:26px;background:linear-gradient(180deg, #ffffff 0%, #fed7aa 30%, #f43f5e 70%, #831843 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.9), 0 0 42px rgba(244,63,94,0.6);line-height:1;white-space:nowrap;">
      赛博浪潮
    </h1>
    <div style="font-size:36px;letter-spacing:16px;color:#38bdf8;font-weight:800;margin-top:28px;text-transform:uppercase;text-shadow:0 0 20px #38bdf8;">
      CHASING THE NEON FUTURE
    </div>
  </div>

  <!-- 底部微标与状态条 -->
  <div style="display:flex;align-items:center;justify-content:space-between;width:100%;border-top:1px solid rgba(244,63,94,0.3);padding-top:24px;z-index:2;">
    <span style="font-size:22px;color:#94a3b8;letter-spacing:6px;">FREQUENCY: 104.5 MHz</span>
    <span style="font-size:22px;color:#f472b6;letter-spacing:6px;font-weight:600;">IMMERSIVE DESKTOP AUDIOVISUAL</span>
  </div>
</div>
    `.trim(),
  },

  // 3. 竖版 9:16 潮流手机壁纸 / 艺术海报
  {
    key: "case3_poster_1440x2560",
    name: "竖版潮流海报/壁纸 ·《生如夏花》",
    form: "9:16 手机海报 (Editorial Poster)",
    width: 1440,
    height: 2560,
    style: "现代先锋杂志风 (Avant-Garde Editorial)",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 30%, #201305 0%, #100801 60%, #050200 100%);box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:180px 120px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 顶部杂志式超大期号与日期 -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid rgba(245,158,11,0.4);padding-bottom:28px;z-index:2;">
    <div>
      <div style="font-size:72px;font-weight:900;color:#f59e0b;letter-spacing:6px;line-height:1;">VOL.26</div>
      <div style="font-size:26px;color:#94a3b8;letter-spacing:8px;margin-top:8px;">EDITORIAL POSTER</div>
    </div>
    <div style="text-align:right;font-size:28px;color:#fef3c7;letter-spacing:4px;">
      AUTUMN / 2026<br><span style="color:#f59e0b;font-weight:700;">LIMITLESS LIFE</span>
    </div>
  </div>

  <!-- 中间纵向大字排版 (极具张力) -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin:auto 0;z-index:2;">
    <div style="font-size:38px;letter-spacing:16px;color:#fbbf24;font-weight:600;margin-bottom:30px;">
      · 绚烂之境 · 肆意盛开 ·
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 23.5);font-weight:900;letter-spacing:18px;background:linear-gradient(180deg, #ffffff 0%, #fde68a 40%, #f59e0b 80%, #b45309 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 40px rgba(0,0,0,0.8), 0 0 30px rgba(245,158,11,0.4);line-height:1.15;text-align:center;">
      生如<br>夏花
    </h1>
    <div style="width:140px;height:4px;background:#f59e0b;margin-top:40px;border-radius:2px;"></div>
  </div>

  <!-- 底部哲学短语与精美印章 -->
  <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.15);padding-top:36px;z-index:2;">
    <div style="max-width:65%;">
      <div style="font-size:42px;color:#ffffff;font-weight:600;letter-spacing:6px;">生如夏花之绚烂</div>
      <div style="font-size:28px;color:#94a3b8;margin-top:10px;letter-spacing:4px;">不负韶华 活出真我本色</div>
    </div>
    <div style="padding:14px 28px;background:#b91c1c;border:2px solid #fde047;border-radius:6px;box-shadow:0 6px 20px rgba(0,0,0,0.6);">
      <span style="font-size:32px;font-weight:900;color:#fef08a;letter-spacing:6px;">心向光明</span>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 4. 竖版 3:4 文艺装裱画 / 展览画芯
  {
    key: "case4_wallart_1800x2400",
    name: "竖版装裱画/画芯 ·《空山新雨》",
    form: "3:4 艺术画芯 (Fine Art Wall Scroll)",
    width: 1800,
    height: 2400,
    style: "东方侘寂极简水墨 (Oriental Zen & Wabi-Sabi)",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 40%, #0f1c24 0%, #060c10 65%, #020406 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:200px 140px;font-family:'PingFang SC','Noto Serif SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 水墨双环留白 -->
  <div style="position:absolute;inset:100px;border:1px solid rgba(56,189,248,0.2);pointer-events:none;"></div>
  <div style="position:absolute;inset:120px;border:1px dashed rgba(255,255,255,0.12);pointer-events:none;"></div>

  <!-- 顶部清幽小标 -->
  <div style="display:flex;align-items:center;gap:20px;z-index:2;">
    <div style="width:50px;height:1px;background:#38bdf8;"></div>
    <span style="font-size:36px;letter-spacing:14px;color:#7dd3fc;font-weight:500;">心如止水 · 鉴照万物</span>
    <div style="width:50px;height:1px;background:#38bdf8;"></div>
  </div>

  <!-- 中间纵向古典楷篆大字 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;margin:auto 0;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17.5);font-weight:900;letter-spacing:22px;background:linear-gradient(180deg, #ffffff 0%, #bae6fd 40%, #38bdf8 75%, #0284c7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.85), 0 0 32px rgba(56,189,248,0.4);line-height:1;white-space:nowrap;">
      空山新雨
    </h1>
    <div style="font-size:32px;letter-spacing:12px;color:#94a3b8;margin-top:36px;font-weight:400;">
      天气晚来秋 · 明月松间照
    </div>
  </div>

  <!-- 底部侘寂雅印与诗句 -->
  <div style="display:flex;align-items:center;gap:36px;z-index:2;">
    <div style="padding:12px 28px;background:#0c4a6e;border:2px solid #7dd3fc;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
      <span style="font-size:28px;font-weight:bold;color:#e0f2fe;letter-spacing:6px;">静观自得</span>
    </div>
    <span style="font-size:32px;color:#f1f5f9;letter-spacing:8px;font-weight:500;">清泉石上流</span>
  </div>
</div>
    `.trim(),
  },

  // 5. 超长横向 3:1 工业机箱拉花 / 灯箱标牌
  {
    key: "case5_industrial_3000x1000",
    name: "超长机箱拉花/标牌 ·《机能觉醒》",
    form: "3:1 极长横幅 (Industrial Strip)",
    width: 3000,
    height: 1000,
    style: "潮牌黑金工业风 (Industrial Techwear & Warning)",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:#0a0a0c;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:80px 140px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 顶部黄色工业警戒条 -->
  <div style="position:absolute;top:0;left:0;right:0;height:18px;background:repeating-linear-gradient(-45deg, #facc15 0px, #facc15 20px, #000 20px, #000 40px);pointer-events:none;"></div>
  <!-- 底部工业警戒条 -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:18px;background:repeating-linear-gradient(-45deg, #facc15 0px, #facc15 20px, #000 20px, #000 40px);pointer-events:none;"></div>

  <!-- 左侧：技术规格与状态参数 -->
  <div style="display:flex;flex-direction:column;gap:18px;z-index:2;max-width:35%;">
    <div style="display:inline-flex;align-items:center;gap:12px;padding:6px 18px;background:#facc15;color:#000;font-size:24px;font-weight:900;letter-spacing:4px;">
      CAUTION // SPEC 01
    </div>
    <div style="font-size:38px;color:#ffffff;font-weight:700;letter-spacing:6px;line-height:1.3;">
      超限机能模块<br><span style="color:#facc15;">LIMITLESS SYSTEM</span>
    </div>
    <div style="font-size:22px;color:#94a3b8;letter-spacing:4px;">
      BARCODE: 8849-TECH-2026 // AUTHENTIC
    </div>
  </div>

  <!-- 右侧：超宽机能震撼大字 -->
  <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 22);font-weight:900;letter-spacing:26px;background:linear-gradient(135deg, #ffffff 0%, #fef08a 40%, #facc15 75%, #ca8a04 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 10px 30px rgba(0,0,0,0.8), 0 0 36px rgba(250,204,21,0.45);line-height:1;white-space:nowrap;">
      机能觉醒
    </h1>
    <div style="font-size:28px;letter-spacing:14px;color:#facc15;font-weight:800;margin-top:20px;text-transform:uppercase;">
      HIGH PERFORMANCE TECHWEAR
    </div>
  </div>
</div>
    `.trim(),
  },

  // 6. 经典 1:1 艺术方块标贴 / 潮牌徽章
  {
    key: "case6_square_2400x2400",
    name: "经典方块标贴 ·《紫气东来》",
    form: "1:1 艺术贴纸 (Square Art Sticker)",
    width: 2400,
    height: 2400,
    style: "皇家玄紫重彩金石 (Royal Gold & Imperial Purple)",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 48%, #1f0d38 0%, #110520 60%, #07010e 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:170px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 外同心金环 -->
  <div style="position:absolute;inset:90px;border:2px solid rgba(192,132,252,0.4);border-radius:50%;pointer-events:none;"></div>
  <!-- 内同心细金环 -->
  <div style="position:absolute;inset:116px;border:1px solid rgba(255,255,255,0.22);border-radius:50%;pointer-events:none;"></div>
  <!-- 四极光晕圆 -->
  <div style="position:absolute;top:170px;left:170px;width:130px;height:130px;border:1px solid rgba(192,132,252,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:170px;right:170px;width:130px;height:130px;border:1px solid rgba(192,132,252,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;bottom:170px;left:170px;width:130px;height:130px;border:1px solid rgba(192,132,252,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;bottom:170px;right:170px;width:130px;height:130px;border:1px solid rgba(192,132,252,0.3);border-radius:50%;pointer-events:none;"></div>

  <!-- 顶部雅正标语 -->
  <div style="display:flex;align-items:center;gap:20px;z-index:2;margin-top:24px;">
    <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#c084fc);"></div>
    <span style="font-size:42px;letter-spacing:14px;color:#c084fc;font-weight:600;white-space:nowrap;">紫气东升 · 金玉满堂</span>
    <div style="width:60px;height:2px;background:linear-gradient(90deg,#c084fc,transparent);"></div>
  </div>

  <!-- 中间核心大字 (自适应字号，气势雄浑) -->
  <div style="display:flex;align-items:center;justify-content:center;width:78%;max-width:78%;margin:auto 0;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:22px;background:linear-gradient(135deg, #ffffff 0%, #fef08a 35%, #e9d5ff 70%, #c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 42px rgba(0,0,0,0.75), 0 0 28px rgba(192,132,252,0.4);white-space:nowrap;display:flex;justify-content:center;align-items:center;">
      紫气东来
    </h1>
  </div>

  <!-- 底部副文案与朱砂印章 -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:32px;z-index:2;margin-bottom:24px;">
    <div style="font-size:46px;letter-spacing:12px;color:#f3f4f6;font-weight:500;white-space:nowrap;opacity:0.96;text-shadow:0 4px 12px rgba(0,0,0,0.6);">
      富贵盈门 岁岁安康
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center;padding:12px 28px;background:#7e22ce;border:2px solid #f3e8ff;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
      <span style="font-size:32px;font-weight:bold;color:#f3e8ff;letter-spacing:6px;">大吉金堂</span>
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
    query: { clientSource: "管理后台", clientId: `dimension-matrix-test-${Date.now()}` },
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
    const requestId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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

async function runMatrix() {
  console.log("\n=======================================================");
  console.log("   🎨 全形态 · 全风格高阶自主设计矩阵自动化测试");
  console.log("   📐 尺寸覆盖: 2:1 桌垫, 16:9 电脑宽屏, 9:16 手机海报, 3:4 艺术画, 3:1 工业标牌, 1:1 方块贴纸");
  console.log("   ✨ 风格覆盖: 赛博机能电竞, 蒸汽波霓虹, 现代先锋杂志, 东方侘寂水墨, 潮牌工业重工, 皇家玄紫金石");
  console.log("=======================================================\n");

  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (!tools.length) {
    console.error("❌ 未检测到在线设计端工位！请确保 1s 设计工具已启动并连接至服务器。");
    process.exit(1);
  }
  const worker = tools[0];
  console.log(`✅ 成功接入在线设计端工位: [${worker.id}] (${worker.clientSource})`);

  const results = [];

  for (let i = 0; i < TEST_MATRIX.length; i++) {
    const tc = TEST_MATRIX[i];
    console.log(`\n───────────────────────────────────────────────────────`);
    console.log(`🚀 [矩阵测试 ${i + 1}/${TEST_MATRIX.length}] 正在设计: ${tc.name}`);
    console.log(`   📐 尺寸规格: ${tc.width} × ${tc.height} px (${tc.form})`);
    console.log(`   🎨 视觉风格: ${tc.style}`);
    const start = Date.now();

    try {
      // 1. 复位清空
      await sendRemoteCommand(worker.id, "resetAgent", {}, 10_000).catch(() => null);
      await sendRemoteCommand(worker.id, "executeOperation", { operation: "canvas.clear" }, 15_000).catch(() => null);

      // 2. 动态调节画板比例与像素尺寸
      console.log(`   📐 正在重构画板几何拓扑: setSize(${tc.width}, ${tc.height})...`);
      await sendRemoteCommand(worker.id, "executeOperation", {
        operation: "canvas.setSize",
        parameters: { width: tc.width, height: tc.height, unit: "px" },
      });

      // 3. 注入高精响应式全景排版 HTML
      console.log(`   ✨ 正在注入自适应排版与视口流光组件...`);
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
        console.log(`   📥 已保存高清渲染物到本地: ${localPath}`);
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
  console.log("   🎉 全尺寸 · 全风格矩阵测试结果汇总");
  console.log("=======================================================");
  for (const r of results) {
    console.log(`${r.status === "SUCCESS" ? "✅" : "❌"} ${r.name} | ${r.form} | ${r.style} | 耗时: ${r.cost}s | 本地: ${r.localPath || "N/A"}`);
  }
  console.log("=======================================================\n");

  process.exit(0);
}

runMatrix().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
