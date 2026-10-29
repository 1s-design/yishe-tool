import { io } from "socket.io-client";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiYWNjb3VudCI6ImphY2tpZSIsInRlcm1pbmFsVHlwZSI6ImFkbWluIiwidG9rZW5JZCI6IjhiOWM0MDlmLWUyYWMtNDU3Mi1iMTA4LTEyZTE3MTQ3NjIxZCIsImlhdCI6MTc5MTEzMDY1MCwiZXhwIjoyMTA2NzA2NjUwfQ.Ebae-frV7NN98CT48hYHTLkn8ct7Efpc_5KAL9zLop8";
const RAW_TOKEN = TOKEN.replace("Bearer ", "");
const SERVER_URL = "http://localhost:1520";

// =========================================================================
// 多形态测试用例定义 (不同尺寸与不同风格)
// =========================================================================

const TEST_CASES = [
  {
    name: "横版全景电竞桌垫 ·《暗夜破晓》",
    form: "deskpad",
    width: 3200,
    height: 1600,
    category: "赛博机能电竞",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 70% 50%, #15102a 0%, #080612 55%, #020105 100%);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:120px 180px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 全景机能网格与标尺 -->
  <div style="position:absolute;inset:40px;border:1px solid rgba(168,85,247,0.25);pointer-events:none;"></div>
  <div style="position:absolute;top:60px;left:70px;display:flex;gap:30px;font-size:24px;color:#a855f7;font-weight:700;letter-spacing:4px;">
    <span>GRID // 3200×1600</span>
    <span>SYS.VER 2.6</span>
    <span style="color:#38bdf8;">DESKPAD EDITION</span>
  </div>
  <div style="position:absolute;bottom:60px;right:70px;font-size:22px;color:#94a3b8;letter-spacing:6px;">
    ULTRA-WIDE GAMING DESK MAT / 原创设计
  </div>

  <!-- 左侧：纵向诗词对仗与印章 -->
  <div style="display:flex;flex-direction:column;gap:30px;z-index:2;max-width:30%;">
    <div style="display:inline-flex;align-items:center;gap:12px;padding:8px 20px;background:rgba(168,85,247,0.15);border-left:4px solid #a855f7;color:#d8b4fe;font-size:32px;letter-spacing:8px;font-weight:700;">
      破界 · 重塑乾坤
    </div>
    <div style="font-size:48px;line-height:1.4;color:#f8fafc;font-weight:600;letter-spacing:8px;text-shadow:0 4px 20px rgba(0,0,0,0.8);">
      心如利剑出鞘<br>势不可挡破苍穹
    </div>
    <div style="display:inline-flex;align-items:center;gap:16px;margin-top:10px;">
      <div style="padding:10px 24px;background:#7e22ce;color:#faf5ff;font-size:28px;font-weight:900;letter-spacing:6px;border-radius:4px;">
        势如破竹
      </div>
      <div style="width:120px;height:2px;background:linear-gradient(90deg,#a855f7,transparent);"></div>
    </div>
  </div>

  <!-- 右侧：震撼全景大字 -->
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
  {
    name: "竖版潮流手机壁纸/海报 ·《生如夏花》",
    form: "poster",
    width: 1440,
    height: 2560,
    category: "现代杂志潮流",
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
  {
    name: "经典东方禅意水墨金石 ·《知足常乐》",
    form: "square",
    width: 2400,
    height: 2400,
    category: "东方极简哲学",
    generateHtml: () => `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 50%, #0d1e1f 0%, #050d0e 65%, #010405 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:170px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <!-- 松石绿极简同心双环 -->
  <div style="position:absolute;inset:90px;border:2px solid rgba(45,212,191,0.3);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;inset:110px;border:1px dashed rgba(255,255,255,0.18);border-radius:50%;pointer-events:none;"></div>

  <!-- 顶部标语 -->
  <div style="display:flex;align-items:center;gap:20px;z-index:2;margin-top:20px;">
    <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#2dd4bf);"></div>
    <span style="font-size:42px;letter-spacing:14px;color:#2dd4bf;font-weight:600;white-space:nowrap;">心宽是福 · 岁月生香</span>
    <div style="width:60px;height:2px;background:linear-gradient(90deg,#2dd4bf,transparent);"></div>
  </div>

  <!-- 中间大字 -->
  <div style="display:flex;align-items:center;justify-content:center;width:78%;max-width:78%;margin:auto 0;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:22px;background:linear-gradient(135deg, #ffffff 0%, #99f6e4 40%, #2dd4bf 70%, #0f766e 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 42px rgba(0,0,0,0.8), 0 0 28px rgba(45,212,191,0.35);white-space:nowrap;display:flex;justify-content:center;align-items:center;">
      知足常乐
    </h1>
  </div>

  <!-- 底部副文案与朱砂印章 -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:32px;z-index:2;margin-bottom:24px;">
    <div style="font-size:46px;letter-spacing:12px;color:#f3f4f6;font-weight:500;white-space:nowrap;opacity:0.96;text-shadow:0 4px 12px rgba(0,0,0,0.6);">
      得失随缘 心自安详
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center;padding:12px 28px;background:#0f766e;border:2px solid #ccfbf1;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
      <span style="font-size:32px;font-weight:bold;color:#ccfbf1;letter-spacing:6px;">怡然自得</span>
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
    query: { clientSource: "管理后台", clientId: `multi-style-test-${Date.now()}` },
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

async function runTest() {
  console.log("=== 启动多尺寸 · 多风格设计生成测试 ===");
  await initGlobalSocket();
  const tools = await getOnlineDesignTools();
  if (!tools.length) {
    console.error("❌ 无在线工位！");
    process.exit(1);
  }
  const worker = tools[0];
  console.log(`✅ 命中工位: ${worker.id} (${worker.clientSource})`);

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`\n🎨 [测试 ${i + 1}/${TEST_CASES.length}] 开始制作: ${tc.name} [尺寸: ${tc.width}×${tc.height} (${tc.form})]...`);
    const start = Date.now();

    // 1. 复位
    await sendRemoteCommand(worker.id, "resetAgent", {}, 10_000).catch(() => null);
    await sendRemoteCommand(worker.id, "executeOperation", { operation: "canvas.clear" }, 15_000).catch(() => null);

    // 2. 设置不同尺寸
    console.log(`   📐 设置画板尺寸: ${tc.width}×${tc.height} px...`);
    await sendRemoteCommand(worker.id, "executeOperation", {
      operation: "canvas.setSize",
      parameters: { width: tc.width, height: tc.height, unit: "px" },
    });

    // 3. 注入对应风格的高精 HTML
    console.log(`   ✨ 注入专属风格全景排版 HTML...`);
    const html = tc.generateHtml();
    await sendRemoteCommand(worker.id, "executeOperation", {
      operation: "canvas.addHtml",
      parameters: { htmlContent: html, htmlBindings: {} },
    });

    // 4. 保存为贴纸/设计产物入库
    console.log(`   💾 保存入库...`);
    const saveRes = await sendRemoteCommand(worker.id, "executeOperation", {
      operation: "canvas.updateAndSaveSticker",
      parameters: { name: tc.name },
    }, 60_000);

    const cost = ((Date.now() - start) / 1000).toFixed(1);
    const data = saveRes?.data;
    if (data?.customStickerId || data?.url) {
      console.log(`   🎉 入库成功！耗时: ${cost}s, ID: ${data.customStickerId}, COS: ${data.url}`);
    } else {
      console.log(`   ⚠️ 入库响应:`, saveRes);
    }
  }

  console.log("\n✅ 全部多尺寸、多风格测试完成！");
  process.exit(0);
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
