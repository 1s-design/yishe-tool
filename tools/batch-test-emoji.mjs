#!/usr/bin/env node
/**
 * 情绪文案设计批量测试 — 贴合文案意境的字体 + 装饰
 * - 自动发现所有在线设计端，多端并行
 * - 每个任务完成后核对内容
 *
 * 用法:
 *   node tools/batch-test-emoji.mjs           # 全部
 *   node tools/batch-test-emoji.mjs 20        # 跑 20 个
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
const LOG_FILE = join(LOG_DIR, "emoji-text.log");

const WIDTH = 3000;
const HEIGHT = 1376;

const TOTAL = Number(process.argv[2]) || 36;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

/**
 * 情绪文案任务 — 每条都给出「符合文案意境」的字体与装饰方向
 */
const TASKS = [
  {
    text: "平安喜乐",
    sub: "愿你岁岁常欢愉",
    font: "圆润饱满的书法/楷体，笔画柔和",
    mood: "暖杏色底 + 朱红/暖棕主字",
    deco: "四角或两侧点缀祥云纹、小灯笼、如意结等中式吉祥装饰（CSS/SVG 实现），整体温馨安定",
  },
  {
    text: "好运常来",
    sub: "好事正在路上",
    font: "有笔锋的行楷或轻复古衬线",
    mood: "浅金/香槟底 + 墨绿或暗金主字",
    deco: "点缀小铜钱、麦穗、锦鲤剪影等「好运」意象装饰，精致不杂乱",
  },
  {
    text: "万事胜意",
    sub: "所求皆如愿",
    font: "优雅细衬线/宋体",
    mood: "奶油白 + 酒红主字",
    deco: "细线框、小星芒或月桂枝点缀，仪式感轻奢",
  },
  {
    text: "岁岁平安",
    sub: "年年皆胜意",
    font: "温润楷体",
    mood: "米白 + 中国红主字",
    deco: "红绳结、小爆竹/灯笼剪影点缀，春节氛围但克制",
  },
  {
    text: "喜乐安康",
    sub: "顺遂无虞",
    font: "圆体或圆润黑体",
    mood: "淡青/浅绿 + 深青主字",
    deco: "小苹果、如意、灵芝等安康意象小图形点缀",
  },
  {
    text: "顺遂无忧",
    sub: "自在随心",
    font: "清瘦细黑体",
    mood: "浅灰蓝 + 藏蓝主字",
    deco: "流水曲线、小云朵、飞鸟剪影，轻盈通透",
  },
  {
    text: "心想事成",
    sub: "所愿皆所得",
    font: "圆润手写体",
    mood: "暖黄 + 深棕主字",
    deco: "小星星、流星、小爱心点缀，闪亮许愿感",
  },
  {
    text: "日子甜甜",
    sub: "今天也很可爱",
    font: "软萌圆体",
    mood: "浅粉 + 玫瑰主字",
    deco: "小蛋糕、草莓、糖果、爱心等甜系小图形点缀",
  },
  {
    text: "今天开心",
    sub: "把快乐调到最大",
    font: "活力黑体/胖胖体",
    mood: "柠檬黄 + 深灰主字",
    deco: "小太阳、笑脸、彩带碎屑点缀，元气快乐",
  },
  {
    text: "一切顺利",
    sub: "稳稳的幸福",
    font: "简洁但有骨的黑体",
    mood: "浅杏 + 深咖主字",
    deco: "小飞机、平滑曲线、对勾等「顺」意象点缀",
  },
  {
    text: "知足常乐",
    sub: "小满胜万全",
    font: "文人楷体/瘦金感",
    mood: "宣纸米 + 墨色主字",
    deco: "淡墨竹叶、茶杯、小石子点缀，禅意留白",
  },
  {
    text: "自在欢喜",
    sub: "随心而行",
    font: "轻盈细黑体",
    mood: "浅藕粉 + 藕紫主字",
    deco: "小花瓣、蝴蝶、飘带点缀，轻松愉悦",
  },
  {
    text: "未来可期",
    sub: "慢慢来比较快",
    font: "现代圆体",
    mood: "淡紫 + 深紫主字",
    deco: "小山丘、日出、路标/星星点缀，充满希望",
  },
  {
    text: "生活明朗",
    sub: "万物可爱",
    font: "暖调黑体",
    mood: "浅橙 + 焦糖主字",
    deco: "小太阳、树叶、小鸟点缀，清新明朗",
  },
  {
    text: "保持热爱",
    sub: "奔赴山海",
    font: "坚定有力的黑体",
    mood: "浅蓝 + 海军蓝主字",
    deco: "小山峰、海浪、指南针/罗盘元素点缀，热血但克制",
  },
  {
    text: "得偿所愿",
    sub: "如你所期",
    font: "轻奢衬线体",
    mood: "米金 + 古铜主字",
    deco: "小皇冠、丝带、星芒点缀，圆满达成感",
  },
  {
    text: "健康平安",
    sub: "这就是最大的福气",
    font: "温润黑体",
    mood: "浅绿 + 松绿主字",
    deco: "小叶子、心形、苹果点缀，生命力",
  },
  {
    text: "温柔半两",
    sub: "从容一生",
    font: "细腻宋体/细明体",
    mood: "浅杏粉 + 豆沙主字",
    deco: "羽毛、月牙、细线花枝点缀，轻柔安静",
  },
];

function buildPrompt(t) {
  return [
    `设计一张有情绪价值的文字设计（贴纸/鼠标垫），完成后保存到贴纸库。`,
    ``,
    `【主题】主文案「${t.text}」，副文案「${t.sub}」`,
    `【字体】${t.font}。请先用 resource.searchFont 搜索匹配的字体并通过 htmlBindings 使用，让字形贴合文案气质`,
    `【配色】${t.mood}`,
    `【装饰】${t.deco}`,
    ``,
    `【硬性要求】`,
    `1. 画布 canvas.setSize 宽 ${WIDTH}、高 ${HEIGHT}，不要改成其他尺寸`,
    `2. 【最重要·按此精确执行】主文案「${t.text}」这一行字的几何中心必须落在画布的 (50%, 50%) 点上。副文案「${t.sub}」放在主文案正下方（允许低于画布中线），绝不能让副文案把主文案顶高。禁止把主+副整体居中。`,
    `   推荐结构：<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center"><div>主文案</div><div>副文案</div></div>（translate 的参照是包含主+副的块，需给主文案行更大 line-height 或用 margin 抵消副文案高度，保证主文案行中心 = 画布中心；更稳妥：只包主文案做 translate(-50%,-50%)，副文案用 absolute top:100% 跟随在下方）`,
    `   最稳妥写法：` +
      `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">主文案</div>` +
      `<div style="position:absolute;left:50%;top:calc(50% + 主文案半高 + 间距);transform:translateX(-50%)">副文案</div>`,
    `3. 装饰元素用 position:absolute 铺在四角/边缘/背景，z-index 低于文字，绝对不能改变主文案的居中位置`,
    `4. 四周留足内边距（左右 ≥8% 画布宽），不贴边不溢出；主文案完整显示、不换行不截断`,
    `5. 用 canvas.addHtml 的 HTML/CSS 实现（装饰可用 CSS 图形/渐变/SVG）`,
    `6. 【必须保存】设计完成后必须调用 canvas.updateAndSaveSticker，name 用「${t.text}·情绪文字」。不保存就不算完成，禁止直接结束`,
  ].join("\n");
}

// ── socket 监听 + request 匹配 ──
const pending = new Map();

const socket = io(SERVER_URL.replace(/^http/, "ws") + "/ws", {
  transports: ["websocket"],
  auth: { token: TOKEN },
  query: {
    clientSource: "管理后台",
    clientId: `mimo-emoji-batch-${Date.now()}`,
  },
});

socket.on("remote-result", (data) => {
  const rid = data?.requestId;
  const phase = data?.phase;
  if (phase === "accepted") {
    log(`  [accepted] ${(data?.message || "").slice(0, 60)}`);
    return;
  }
  if (rid && pending.has(rid)) {
    pending.get(rid)(data);
    pending.delete(rid);
    return;
  }
  if (phase && phase !== "completed") {
    log(`  [event] ${phase}: ${(data.message || "").slice(0, 90)}`);
  }
});

await new Promise((resolve, reject) => {
  socket.on("connect", resolve);
  socket.on("connect_error", reject);
  setTimeout(() => reject(new Error("socket connect timeout")), 15000);
});
log("✅ 管理后台 WebSocket 已连接");

function waitForResult(requestId, timeoutMs = 300_000) {
  return new Promise((resolve) => {
    pending.set(requestId, resolve);
    setTimeout(() => {
      if (pending.has(requestId)) {
        pending.delete(requestId);
        resolve({ phase: "timeout", success: false });
      }
    }, timeoutMs);
  });
}

async function api(path, body) {
  try {
    const res = await fetch(`${SERVER_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body || {}),
      signal: AbortSignal.timeout(20000),
    });
    return await res.json();
  } catch (e) {
    log(`   [api] ${path} 失败: ${e.message}`);
    return { data: null, status: false };
  }
}

async function getDesignTools() {
  const data = await api("/api/websocket/connections", {});
  return (data?.data || [])
    .filter((c) => c.query?.clientSource === "设计端")
    .map((c) => c.id);
}

async function sendAndWait(toolId, type, payload, timeoutMs) {
  const requestId = `emoji-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const waiter = waitForResult(requestId, timeoutMs);
  await api("/api/websocket/remote-command", {
    connectionId: toolId,
    command: { type, payload, requestId },
  });
  return waiter;
}

/** 内容核对：画布状态 / 保存产物中是否含主文案 */
function verifyContent(result, canvasState, expectedText, subText) {
  const raw = JSON.stringify({ ...result, canvasState });
  const textOk = raw.includes(expectedText);
  const subOk = !subText || raw.includes(subText);
  const w = canvasState?.width ?? canvasState?.canvas?.width;
  const h = canvasState?.height ?? canvasState?.canvas?.height;
  return {
    textOk,
    subOk,
    size: w != null ? `${Math.round(w)}x${Math.round(h)}` : "unknown",
    sizeOk: w == null || (Math.abs(Number(w) - WIDTH) < 2 && Math.abs(Number(h) - HEIGHT) < 2),
  };
}

async function runOneTask(toolId, t, index, total) {
  try {
    return await runOneTaskInner(toolId, t, index, total);
  } catch (e) {
    log(`   [${index}] 任务异常: ${e.message}`);
    return false;
  }
}

async function runOneTaskInner(toolId, t, index, total) {
  const label = `[${index}/${total}] 「${t.text}」`;
  log(`📤 ${label} → ${toolId.slice(0, 22)}`);

  let result = null;
  for (let attempt = 1; attempt <= 8; attempt++) {
    // 每次尝试前清空会话，避免历史污染导致模型空转
    try {
      await sendAndWait(toolId, "clear", {}, 15_000);
    } catch {}
    result = await sendAndWait(
      toolId,
      "chat",
      { message: buildPrompt(t), executionMode: "manual" },
      360_000,
    );
    if (result?.phase !== "rejected") break;
    log(`   ⏳ 设计端忙碌，${12 * attempt}s 后重试 (${attempt}/8)…`);
    await new Promise((r) => setTimeout(r, 12_000 * attempt));
  }

  const toolCalls = result?.toolCallsCount ?? 0;
  const outputs = result?.outputs || [];
  const ok =
    result?.phase === "completed" &&
    result?.success !== false &&
    Number(toolCalls) > 0;
  if (result?.phase === "completed" && Number(toolCalls) === 0) {
    log(`   ⚠️ 空转（0 工具调用），可能被历史干扰，下轮会清空会话重试`);
  }
  log(
    `   ${ok ? "✅" : "❌"} ${result?.phase || "?"} 工具=${toolCalls}` +
      (outputs[0]?.name ? ` 产出:${outputs[0].name}` : ""),
  );

  if (ok) {
    // 未产出 → 清空会话后补发保存指令（避免历史里“已完成”干扰）
    if (!outputs.length) {
      log(`   💾 无产出，补发保存…`);
      try { await sendAndWait(toolId, "clear", {}, 15_000); } catch {}
      const saveRes = await sendAndWait(
        toolId,
        "chat",
        {
          message: `当前画布上已经有一个完整设计。请现在调用 canvas.updateAndSaveSticker 保存它，name 用「${t.text}·情绪文字」。除了保存工具外不要调用其他工具，不要重新设计。`,
          executionMode: "manual",
        },
        150_000,
      );
      if (saveRes?.outputs?.length) {
        log(`   💾 补存成功: ${saveRes.outputs[0]?.name || ""}`);
      } else {
        log(`   ⚠️ 补存无产出 | tools:${saveRes?.toolCallsCount ?? "?"} reply: ${String(saveRes?.agentResponse || saveRes?.message || "").slice(0, 100)}`);
      }
    }

    // 内容核对：getState + 保存产物双通道
    try {
      const stateRes = await sendAndWait(toolId, "getState", {}, 30_000);
      const check = verifyContent(result, stateRes?.canvasState, t.text, t.sub);
      if (check.textOk && check.sizeOk) {
        log(`   🔍 通过：含「${t.text}」${check.subOk ? "· 含副文案" : "· 副文案未见"} · ${check.size}`);
      } else if (check.textOk) {
        log(`   ⚠️ 文案在，尺寸异常 ${check.size}（期望 ${WIDTH}x${HEIGHT}）`);
      } else {
        const inOutput = JSON.stringify(outputs).includes(t.text);
        log(inOutput
          ? `   🔍 画布已切走，但保存产物含「${t.text}」`
          : `   ⚠️ 未找到「${t.text}」`);
      }
    } catch (e) {
      log(`   ⚠️ 检查失败: ${e.message}`);
    }
  }
  return ok;
}

async function main() {
  log(`🎨 情绪文案设计批量启动: ${WIDTH}x${HEIGHT} · ${TOTAL} 个 · 意境化字体装饰 · 多端并行`);

  let taskIndex = 0;
  let done = 0;
  let okCount = 0;

  while (done < TOTAL) {
    const tools = await getDesignTools();
    if (tools.length === 0) {
      log("⏳ 无在线设计端，30s 后重试…");
      await new Promise((r) => setTimeout(r, 30_000));
      continue;
    }

    log(`🔧 在线设计端 ×${tools.length}`);

    const batch = [];
    for (const toolId of tools) {
      if (done + batch.length >= TOTAL) break;
      const t = TASKS[taskIndex % TASKS.length];
      taskIndex++;
      batch.push(runOneTask(toolId, t, done + batch.length + 1, TOTAL));
    }

    const results = await Promise.all(batch);
    done += results.length;
    okCount += results.filter(Boolean).length;
    log(`── 本轮 ${results.filter(Boolean).length}/${results.length} 成功 · 累计 ${okCount} 成功 / ${done} 任务 ──`);
  }

  log(`🎉 完成：${okCount}/${done} 成功`);
  socket.close();
  process.exit(0);
}

main().catch((e) => {
  log(`错误: ${e.stack || e.message}`);
  process.exit(1);
});
