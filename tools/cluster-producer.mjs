/**
 * 多设计端分布式集群并发生产调度器
 * 自动发现所有在线 designtool 客户端，按队列并发派发多元化创作任务，
 * 支持上千个不同品类、风格、字体、技巧、文案组合的连续生产与实时落库画廊记录。
 *
 * 用法:
 *   node tools/cluster-producer.mjs [--limit 50] [--concurrency 5]
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";

const TOKEN = readFileSync(new URL("./.test-token", import.meta.url), "utf-8").trim();
const SERVER_URL = "http://127.0.0.1:1520";
const MCP_API = `${SERVER_URL}/api/ai-assistant/tools/execute`;
const LOGS_DIR = new URL("../.batch-logs", import.meta.url).pathname;
const CLUSTER_LOG = `${LOGS_DIR}/cluster-production.log`;
const GALLERY_FILE = `${LOGS_DIR}/produced-gallery.json`;

mkdirSync(LOGS_DIR, { recursive: true });

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(CLUSTER_LOG, line + "\n");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mcp(tool, input, timeoutMs = 900000) {
  for (let a = 1; a <= 2; a++) {
    try {
      const res = await fetch(MCP_API, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tool, input }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const d = await res.json();
      const m = (d?.data?.messages || []).find((x) => x.role === "tool");
      return m?.toolResult?.data ?? m?.toolResult ?? d;
    } catch (e) {
      if (a === 2) return { phase: "error", error: e.message };
      await sleep(3000);
    }
  }
}

async function getOnlineWorkers() {
  try {
    const res = await fetch(`${SERVER_URL}/api/websocket/connections`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: "{}",
    });
    const d = await res.json();
    return (d?.data || [])
      .filter((c) => String(c.id).startsWith("designtool-") || c.query?.clientSource === "设计端")
      .map((c) => c.id);
  } catch (e) {
    log(`获取在线实例异常: ${e.message}`);
    return [];
  }
}

// 基础资源池
const FONT_POOL = [
  { type: "font", id: "5d394ee9-6627-4b37-a05a-0217154f6525", label: "LXGWBrightCode LightItalic" },
  { type: "font", id: "2cb59900-a80d-4224-95f5-89efa3d88cb1", label: "LXGWBrightCode Light" },
];

const TIP_POOL = [
  { type: "tip", id: "f0c9e208-d0a7-4c7d-a1f1-2611aa7e6acc", label: "文字图案填充" },
];

const STICKER_POOL = [
  { type: "sticker", id: "99f35682-8a68-40bb-a96e-2836c091cb7b", label: "收钱收到手软·长款" },
  { type: "sticker", id: "a4ca0999-da31-49fe-9090-7c196245a8d3", label: "越努力越幸运·长款" },
  { type: "sticker", id: "2ff3fb54-1958-4096-a1b3-c0b75055e0e2", label: "人间值得·黑金" },
];

const PROMPT_POOL = [
  { type: "prompt", id: "f422239e-3aa7-4c2c-b159-59b108774db8", label: "设计鼠标垫" },
];

// 风格与载体矩阵
const PRODUCTS = [
  { name: "长款鼠标垫", width: 1440, height: 640, label: "长款" },
  { name: "标准鼠标垫", width: 1200, height: 960, label: "标准款" },
  { name: "贴纸徽章", width: 1024, height: 1024, label: "方形" },
  { name: "手机壳印花", width: 900, height: 1800, label: "竖长款" },
];

const THEMES = [
  { category: "好运财源", main: "财源滚滚", sub: "日进斗金八方来财", style: "国潮红金，龙纹铜钱暗纹，金色细线边框，烫金颗粒感" },
  { category: "好运财源", main: "日进斗金", sub: "富贵盈门家和事兴", style: "朱砂红配琉璃金，立体浮雕光芒放射，富丽堂皇" },
  { category: "好运财源", main: "闷声发财", sub: "低调但有钱", style: "哑光玄黑配古铜金，克制内敛奢华质感，几何极简线条" },
  { category: "好运财源", main: "偏财运爆棚", sub: "意外之喜在路上", style: "深紫到鎏金渐变，星芒光斑散落，神秘奢华好运" },
  { category: "好运财源", main: "暴富小分队", sub: "搞钱第一不讲废话", style: "明黄到墨绿醒目潮酷，波普涂鸦线条，金币喷洒动态感" },

  { category: "职场治愈", main: "拒绝内卷", sub: "到点就走生活万岁", style: "浅灰奶蓝拼色，瑞士国际排版网格，干净利落克制" },
  { category: "职场治愈", main: "早点下班", sub: "天塌下来明天再办", style: "日落橘粉渐变天际线，放松闲适黄昏光影，极简居中" },
  { category: "职场治愈", main: "情绪稳定", sub: "不以物喜不以己悲", style: "森系墨绿配燕麦白，自然呼吸质感，治愈微光环绕" },
  { category: "职场治愈", main: "不听不听", sub: "施主休扰老衲摸鱼", style: "黑白趣味高对比，极简留白，潮酷卡通笔触装饰" },
  { category: "职场治愈", main: "保持礼貌", sub: "心中念经面带微笑", style: "高级莫兰迪灰调，优雅英文字母环绕，轻盈呼吸感" },

  { category: "励志金句", main: "人间值得", sub: "万物可爱未来可期", style: "黑金星空夜幕，流光溢彩金线，温暖闪烁星尘" },
  { category: "励志金句", main: "一路生花", sub: "所走之处皆为繁景", style: "嫩绿到柔粉水彩晕染，漫天花瓣微光粒子，清新唯美" },
  { category: "励志金句", main: "越努力越幸运", sub: "向上生长自有光芒", style: "暖橙到朝阳黄放射光辉，充满晨光生机与向上的张力" },
  { category: "励志金句", main: "保持热爱", sub: "奔赴下一场山海", style: "深海湛蓝到晨曦紫微光，山峦叠嶂轮廓暗纹，浩瀚宏大" },
  { category: "励志金句", main: "顺遂无虞", sub: "岁岁平安事事胜意", style: "故宫红配象牙白，中式古典卷草纹饰，端庄温润" },

  { category: "赛博科技", main: "CYBER MATRIX", sub: "REBOOT YOUR REALITY", style: "深空黑配霓虹青绿与荧光紫，HUD未来界面发光线框" },
  { category: "赛博科技", main: "NEON DREAM", sub: "NIGHT CITY CHRONICLES", style: "赛博朋克深紫暗夜，故障艺术Glitch色彩分离，液态金属光泽" },
  { category: "赛博科技", main: "FUTURE VISION", sub: "BEYOND ALL HORIZONS", style: "深灰科技底色，极简等宽字符排版，几何光斑线条" },

  { category: "慢调生活", main: "COFFEE FIRST", sub: "LIFE BEGINS AFTER COFFEE", style: "美式复古牛皮纸棕与烘焙咖啡褐，手绘拉花线条，醇厚质朴" },
  { category: "慢调生活", main: "猫肥家润", sub: "猫爪盖印万事大吉", style: "奶油杏色温润底色，萌猫肉垫剪影轮廓，温馨治愈居家感" },
  { category: "慢调生活", main: "SLOW DOWN", sub: "TAKE YOUR SWEET TIME", style: "极简米白与水洗黑，古典衬线体呼吸感，宽大留白禅意" },
];

function generateTaskPool(targetCount = 200) {
  const tasks = [];
  let idx = 1;
  while (tasks.length < targetCount) {
    for (const prod of PRODUCTS) {
      for (const t of THEMES) {
        if (tasks.length >= targetCount) break;
        const font = FONT_POOL[(idx - 1) % FONT_POOL.length];
        const tip = TIP_POOL[(idx - 1) % TIP_POOL.length];
        const hasSticker = (idx % 2 === 1) && STICKER_POOL.length > 0;
        const sticker = hasSticker ? STICKER_POOL[(idx - 1) % STICKER_POOL.length] : null;

        const resources = [font, tip];
        if (sticker) resources.push(sticker);

        tasks.push({
          id: `task_${idx}`,
          title: `${t.main}·${prod.name}`,
          description: `做一张${prod.name}印花：${prod.width}x${prod.height}，${t.style}，主文案「${t.main}」，副文案「${t.sub}」，结合所给字体与技巧${hasSticker ? "及贴纸元素" : ""}。`,
          width: prod.width,
          height: prod.height,
          category: t.category,
          mainText: t.main,
          subText: t.sub,
          resources,
        });
        idx++;
      }
    }
  }
  return tasks;
}

// 画廊数据管理
function loadGallery() {
  if (existsSync(GALLERY_FILE)) {
    try {
      return JSON.parse(readFileSync(GALLERY_FILE, "utf-8"));
    } catch {}
  }
  return [];
}

function saveGallery(items) {
  writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), "utf-8");
}

async function runWorkerLoop(workerId, taskQueue, gallery, stats) {
  log(`👷 实例 [${workerId}] 启动监听任务队列...`);

  while (taskQueue.length > 0) {
    const task = taskQueue.shift();
    if (!task) break;

    log(`🚀 实例 [${workerId}] 接单: [${task.id}] ${task.title} (剩余 ${taskQueue.length} 个待排)`);

    const startRes = await mcp("system.design_tool.batch_start", {
      connectionId: workerId,
      count: 1,
      taskPreset: "custom",
      outputKind: "independent-batch",
      enableAnalysisOptimization: false,
      saveMode: "auto",
      description: task.description,
      resources: task.resources,
      timeoutMs: 900000,
    });

    if (startRes?.phase === "error" || startRes?.phase === "rejected") {
      log(`⚠️ 实例 [${workerId}] 受理失败: ${startRes?.message || startRes?.error}，将重试或跳过`);
      stats.failed++;
      await sleep(10000);
      continue;
    }

    // 轮询该实例任务直到完成
    let completed = false;
    for (let r = 0; r < 50; r++) {
      await sleep(18000);
      const st = await mcp("system.design_tool.batch_get_state", { connectionId: workerId }, 60000).catch(() => ({}));
      const b = (st?.raw || {}).batch || st?.batch || {};
      if (!b?.status) continue;
      const it = (b.items || [])[0] || {};

      if (r % 3 === 0 || ["done", "stopped"].includes(b.status)) {
        log(`   [${workerId}] 进度 r=${r}: ${b.status} ${b.succeeded ?? 0}/${b.total ?? "-"} | ${it.title || task.title} ${it.status || ""}${it.savedUrl ? " SAVED" : ""}`);
      }

      if (["done", "stopped"].includes(b.status)) {
        completed = true;
        if (it.savedUrl) {
          stats.succeeded++;
          const entry = {
            id: it.id || task.id,
            title: it.title || task.title,
            workerId,
            url: it.savedUrl,
            category: task.category,
            dimensions: `${task.width}x${task.height}`,
            mainText: task.mainText,
            completedAt: new Date().toISOString(),
          };
          gallery.push(entry);
          saveGallery(gallery);
          log(`✅ 实例 [${workerId}] 成功落库: ${task.title} -> ${it.savedUrl}`);
        } else {
          stats.failed++;
          log(`❌ 实例 [${workerId}] 制作未落库: ${task.title} | ${it.error || "未知原因"}`);
        }
        break;
      }
    }

    if (!completed) {
      stats.failed++;
      log(`⏱️ 实例 [${workerId}] 任务超时: ${task.title}`);
    }

    // 实例休息 5 秒准备接下一个任务
    await sleep(5000);
  }

  log(`🏁 实例 [${workerId}] 已无待派任务，优雅退出。`);
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.indexOf("--limit");
  const targetTotal = limitArg >= 0 && args[limitArg + 1] ? Number(args[limitArg + 1]) : 50;

  log(`========================================`);
  log(`🌟 启动多设计端集群并发生产调度器`);
  log(`🎯 目标批量: ${targetTotal} 个多样化设计成品`);
  log(`========================================`);

  const workers = await getOnlineWorkers();
  log(`🔍 发现当前在线设计端数量: ${workers.length} 个`);
  workers.forEach((w, i) => log(`   Worker #${i + 1}: ${w}`));

  if (workers.length === 0) {
    log(`❌ 未检测到在线设计端连接，请确保浏览器设计端页面已打开`);
    process.exit(1);
  }

  const taskPool = generateTaskPool(targetTotal);
  log(`📋 已基于 8 大风格矩阵生成 ${taskPool.length} 个差异化设计任务`);

  const gallery = loadGallery();
  const stats = { succeeded: 0, failed: 0, total: taskPool.length };

  log(`⚡ 开始并发调度派发，同时驱动 ${workers.length} 个实例跑生产...`);

  // 并发启动所有 Worker
  await Promise.all(
    workers.map((workerId) => runWorkerLoop(workerId, taskPool, gallery, stats))
  );

  log(`========================================`);
  log(`🎉 集群生产完成！共成功落库: ${stats.succeeded} / ${stats.total} (失败: ${stats.failed})`);
  log(`📁 作品画廊清单已保存至: ${GALLERY_FILE}`);
  log(`========================================`);
}

main().catch((err) => {
  log(`集群主进程异常: ${err.message}`);
});
