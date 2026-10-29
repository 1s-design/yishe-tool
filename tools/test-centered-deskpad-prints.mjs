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
// 纯中间居中 · 长款鼠标垫/桌垫印花设计方案
// 规格: 3200 × 1400 px (~2.3:1 比例，黄金标准 800x350 / 900x400 mm 桌垫)
// 特征: 两侧大面积纯净留白供键盘与鼠标顺滑使用，视觉重心 100% 聚焦正中大字与情绪文案
// =========================================================================

const DESKPAD_PRINTS = [
  // 1. 《慢慢来》- 极简治愈打工人桌面 (松弛与耐心)
  {
    key: "deskpad_manmanlai",
    name: "长款桌垫印花 ·《慢慢来》",
    width: 3200,
    height: 1400,
    style: "极简晨曦微光 · 温润治愈",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #0d1e19 0%, #060e0c 55%, #020504 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 中间柔和圆形光晕 (左右纯净留白，无杂物干扰鼠标) -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:920px;height:920px;background:radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1px solid rgba(52,211,153,0.2);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:810px;height:810px;border:1px dashed rgba(255,255,255,0.1);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中视线容器 (宽度约 55%，左右两侧极净) -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:58%;">
    <!-- 顶部情绪微标 -->
    <div style="display:flex;align-items:center;gap:20px;">
      <div style="width:60px;height:1.5px;background:linear-gradient(90deg,transparent,#34d399);"></div>
      <span style="font-size:26px;letter-spacing:14px;color:#6ee7b7;font-weight:600;white-space:nowrap;text-transform:uppercase;">STEADY & PATIENT // 一切都在路上</span>
      <div style="width:60px;height:1.5px;background:linear-gradient(90deg,#34d399,transparent);"></div>
    </div>

    <!-- 居中核心超大字 (气势温和但字重开阔，呼吸感拉满) -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:42px;background:linear-gradient(180deg, #ffffff 0%, #d1fae5 35%, #34d399 70%, #059669 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.85), 0 0 38px rgba(52,211,153,0.35);line-height:1;white-space:nowrap;text-indent:42px;">
      慢慢来
    </h1>

    <!-- 底部治愈金句与雅印 -->
    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:12px;color:#f3f4f6;font-weight:500;text-shadow:0 4px 14px rgba(0,0,0,0.8);">
        不慌不忙，心向远方 · 做个有松弛感的人
      </span>
      <div style="padding:8px 22px;background:#065f46;border:1.5px solid #a7f3d0;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-size:24px;font-weight:bold;color:#d1fae5;letter-spacing:6px;">顺遂</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 2. 《专注》- 极客/交易员深空理性质感 (沉浸心流)
  {
    key: "deskpad_zhuanzhu",
    name: "长款桌垫印花 ·《专注》",
    width: 3200,
    height: 1400,
    style: "极客午夜深蓝 · 绝对理性",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #081426 0%, #040913 55%, #010307 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 居中精细同心发光罗盘 (高科技极客风) -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:820px;height:820px;background:radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:720px;height:720px;border:1.5px solid rgba(56,189,248,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:750px;height:750px;border:1px dashed rgba(255,255,255,0.12);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;z-index:2;max-width:55%;">
    <div style="display:inline-flex;align-items:center;gap:16px;padding:8px 24px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.35);border-radius:30px;">
      <div style="width:10px;height:10px;border-radius:50%;background:#38bdf8;box-shadow:0 0 10px #38bdf8;"></div>
      <span style="font-size:24px;color:#bae6fd;font-weight:700;letter-spacing:6px;">DEEP FOCUS // 过滤噪音 · 保持理性</span>
    </div>

    <!-- 居中超大两字 (震撼、凝练、心如止水) -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 20.5);font-weight:900;letter-spacing:64px;background:linear-gradient(180deg, #ffffff 0%, #e0f2fe 35%, #38bdf8 70%, #0369a1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.9), 0 0 42px rgba(56,189,248,0.45);line-height:1;white-space:nowrap;text-indent:64px;">
      专注
    </h1>

    <div style="display:flex;align-items:center;gap:24px;margin-top:6px;">
      <span style="font-size:36px;letter-spacing:14px;color:#f1f5f9;font-weight:500;">心如磐石 · 顺境不骄 逆境不躁</span>
      <div style="padding:8px 20px;background:#0284c7;color:#f0f9ff;font-size:22px;font-weight:900;letter-spacing:6px;border-radius:3px;">纯粹</div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 3. 《允许一切发生》- 暖暮落日余晖 (旷达与包容)
  {
    key: "deskpad_yunxufasheng",
    name: "长款桌垫印花 ·《允许一切发生》",
    width: 3200,
    height: 1400,
    style: "暖暮琥珀赤金 · 旷达从容",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #261106 0%, #120702 55%, #050200 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 居中落日暖阳微光 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:1100px;height:550px;background:radial-gradient(ellipse, rgba(245,158,11,0.16) 0%, transparent 70%);pointer-events:none;"></div>

  <!-- 居中视线容器 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:68%;">
    <div style="display:flex;align-items:center;gap:20px;">
      <span style="font-size:26px;letter-spacing:14px;color:#fbbf24;font-weight:600;text-transform:uppercase;">LET IT BE // 顺应天意 · 随遇而安</span>
    </div>

    <!-- 居中六字通栏巨幅排版 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 14.8);font-weight:900;letter-spacing:32px;background:linear-gradient(180deg, #ffffff 0%, #fef3c7 35%, #f59e0b 70%, #b45309 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 40px rgba(0,0,0,0.85), 0 0 36px rgba(245,158,11,0.4);line-height:1;white-space:nowrap;text-indent:32px;">
      允许一切发生
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:10px;">
      <span style="font-size:36px;letter-spacing:12px;color:#fef08a;font-weight:600;">去吹吹晚风，所有的不如意都随风而散</span>
      <div style="padding:8px 22px;background:#92400e;border:1.5px solid #fef3c7;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        <span style="font-size:24px;font-weight:bold;color:#fef3c7;letter-spacing:6px;">安然</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 4. 《破局》- 暗夜熔岩赤金电竞风 (热血与突破)
  {
    key: "deskpad_poju",
    name: "长款桌垫印花 ·《破局》",
    width: 3200,
    height: 1400,
    style: "暗夜熔岩赤金 · 锐意突破",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #1f0606 0%, #0d0202 55%, #030000 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 居中锐角多边形与熔岩光芒 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:900px;height:900px;background:radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:780px;height:780px;border:1.5px solid rgba(239,68,68,0.3);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:55%;">
    <div style="display:flex;align-items:center;gap:18px;">
      <span style="font-size:26px;letter-spacing:14px;color:#f87171;font-weight:800;text-transform:uppercase;">BREAKTHROUGH // 逆风翻盘 · 敢为人先</span>
    </div>

    <!-- 居中超大两字 (刚劲雄浑，充满冲击力) -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 21.5);font-weight:900;letter-spacing:64px;background:linear-gradient(180deg, #ffffff 0%, #fee2e2 35%, #ef4444 70%, #991b1b 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 46px rgba(0,0,0,0.9), 0 0 46px rgba(239,68,68,0.5);line-height:1;white-space:nowrap;text-indent:64px;">
      破局
    </h1>

    <div style="display:flex;align-items:center;gap:26px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:14px;color:#f1f5f9;font-weight:600;">在绝境中撕开一道光 · 惟强者从容</span>
      <div style="padding:8px 24px;background:#991b1b;border:2px solid #fee2e2;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:24px;font-weight:900;color:#fef2f2;letter-spacing:6px;">无畏</span>
      </div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // 5. 《得闲》- 东方禅意水墨玄青 (闲适与自在)
  {
    key: "deskpad_dexian",
    name: "长款桌垫印花 ·《得闲》",
    width: 3200,
    height: 1400,
    style: "东方水墨玄青 · 闲适自得",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 50%, #111a1d 0%, #080d0e 55%, #020404 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 100px;font-family:'PingFang SC','Noto Serif SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 水墨双环留白微光 -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:820px;height:820px;background:radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:720px;height:720px;border:1.5px solid rgba(56,189,248,0.25);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:750px;height:750px;border:1px dashed rgba(255,255,255,0.12);border-radius:50%;pointer-events:none;"></div>

  <!-- 居中核心排版 -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;z-index:2;max-width:55%;">
    <div style="display:flex;align-items:center;gap:20px;">
      <div style="width:50px;height:1px;background:#38bdf8;"></div>
      <span style="font-size:26px;letter-spacing:14px;color:#7dd3fc;font-weight:500;">PEACE OF MIND // 偷得浮生半日闲</span>
      <div style="width:50px;height:1px;background:#38bdf8;"></div>
    </div>

    <!-- 居中超大楷篆大字 -->
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 20.5);font-weight:900;letter-spacing:60px;background:linear-gradient(180deg, #ffffff 0%, #bae6fd 40%, #38bdf8 75%, #0284c7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.85), 0 0 36px rgba(56,189,248,0.4);line-height:1;white-space:nowrap;text-indent:60px;">
      得闲
    </h1>

    <div style="display:flex;align-items:center;gap:28px;margin-top:8px;">
      <span style="font-size:36px;letter-spacing:12px;color:#f1f5f9;font-weight:400;">万事尽心尽力，其余且随风去</span>
      <div style="padding:8px 24px;background:#0c4a6e;border:1.5px solid #7dd3fc;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
        <span style="font-size:24px;font-weight:bold;color:#e0f2fe;letter-spacing:6px;">自在</span>
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
    query: { clientSource: "管理后台", clientId: `deskpad-centered-${Date.now()}` },
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
    const requestId = `dp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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

async function runDeskpadSuite() {
  console.log("\n=======================================================");
  console.log("   🖱️ 纯中间居中 · 长款鼠标垫印花专项设计测试");
  console.log("   📐 画布规格: 3200 × 1400 px (~2.3:1 桌面长垫黄金尺寸)");
  console.log("   ✨ 视觉法则: 左右绝对留白，中间纯净聚焦，大字+情绪价值金句");
  console.log("=======================================================\n");

  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (!tools.length) {
    console.error("❌ 未检测到在线设计端工位！请确保设计工具已启动。");
    process.exit(1);
  }
  const worker = tools[0];
  console.log(`✅ 成功接入在线设计端工位: [${worker.id}] (${worker.clientSource})`);

  const results = [];

  for (let i = 0; i < DESKPAD_PRINTS.length; i++) {
    const tc = DESKPAD_PRINTS[i];
    console.log(`\n───────────────────────────────────────────────────────`);
    console.log(`🚀 [桌垫印花 ${i + 1}/${DESKPAD_PRINTS.length}] 正在设计: ${tc.name}`);
    console.log(`   📐 尺寸比例: ${tc.width} × ${tc.height} px (纯中间居中长垫)`);
    console.log(`   🎨 视觉质感: ${tc.style}`);
    const start = Date.now();

    try {
      // 1. 复位清空
      await sendRemoteCommand(worker.id, "resetAgent", {}, 10_000).catch(() => null);
      await sendRemoteCommand(worker.id, "executeOperation", { operation: "canvas.clear" }, 15_000).catch(() => null);

      // 2. 动态调节画板比例
      console.log(`   📐 调节长垫尺寸: setSize(${tc.width}, ${tc.height})...`);
      await sendRemoteCommand(worker.id, "executeOperation", {
        operation: "canvas.setSize",
        parameters: { width: tc.width, height: tc.height, unit: "px" },
      });

      // 3. 注入纯中间居中排版 HTML
      console.log(`   ✨ 注入纯正中大字与情绪氛围组件...`);
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
  console.log("   🎉 纯中间居中长款桌垫印花测试汇总");
  console.log("=======================================================");
  for (const r of results) {
    console.log(`${r.status === "SUCCESS" ? "✅" : "❌"} ${r.name} | ${r.style} | 耗时: ${r.cost}s | 本地: ${r.localPath || "N/A"}`);
  }
  console.log("=======================================================\n");

  process.exit(0);
}

runDeskpadSuite().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
