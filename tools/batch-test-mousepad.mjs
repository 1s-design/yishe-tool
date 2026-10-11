#!/usr/bin/env node
/**
 * 鼠标垫文字文创批量测试 — 沿用 batch-test-v2 的发送方式
 * 画布：宽 3000，比例 2.18 → 高 1376
 * 用法:
 *   node tools/batch-test-mousepad.mjs           # 循环跑全部风格，直到 60 个
 *   node tools/batch-test-mousepad.mjs 10        # 只跑 10 个
 */

import { readFileSync, appendFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const SERVER_URL = "http://localhost:1520";
const LOG_DIR = join(__dirname, "..", ".batch-logs");
mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = join(LOG_DIR, "mousepad.log");

const WIDTH = 3000;
const RATIO = 2.18;
const HEIGHT = Math.round(WIDTH / RATIO); // 1376

const TOTAL = Number(process.argv[2]) || 60;
const SEND_INTERVAL_MS = 100_000; // 发送间隔，给 agent 跑图时间

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

/** 文字类文创鼠标垫设计任务 */
const TASKS = [
  {
    style: "赛博朋克霓虹",
    text: "NEON DREAM",
    details: "霓虹灯管立体艺术字，紫粉青撞色，暗色网格地平线背景，横向宽幅构图，文字居中偏左，右侧留霓虹光斑装饰。",
  },
  {
    style: "水墨书法",
    text: "宁静致远",
    details: "行书大字横向排布，飞白笔触，留白呼吸感，淡墨山水晕染，宣纸肌理，古典文人气质。",
  },
  {
    style: "极简无衬线",
    text: "LESS IS MORE",
    details: "超大号 Helvetica 风英文，纯黑白高对比，字距拉开，左对齐，大量负空间，瑞士国际主义排版。",
  },
  {
    style: "复古蒸汽波",
    text: "VAPOR WAVE",
    details: "粉紫渐变立体字，透视网格地板，落日圆盘，故障艺术 glitch 条纹，90 年代赛博复古。",
  },
  {
    style: "日式侘寂",
    text: "一期一会",
    details: "手写假名风汉字，粗糙墨迹边缘，米灰枯山水底纹，极小英文注脚，克制留白。",
  },
  {
    style: "韩系手写",
    text: "今天也要加油鸭",
    details: "圆润可爱手写体，奶油黄底色，小插画点缀（咖啡、书本），软萌治愈系。",
  },
  {
    style: "国潮醒狮",
    text: "醒狮",
    details: "粗壮国潮美术字，正红描金，醒狮纹样装饰边角，祥云底纹，喜庆大气横向构图。",
  },
  {
    style: "哥特黑体",
    text: "MEMENTO",
    details: "哥特尖角字体，纯黑底银色字，荆棘纹样装饰，暗黑古典，对称构图。",
  },
  {
    style: "孟菲斯几何",
    text: "PLAY",
    details: "粗黑轮廓波普字，明黄粉蓝几何图形散布，点阵条纹装饰，活泼孟菲斯风。",
  },
  {
    style: "故宫红墙",
    text: "紫禁城",
    details: "宫廷匾额体，朱红底金线框，回纹边饰，角楼剪影，庄重典雅横向匾额构图。",
  },
  {
    style: "美式复古海报",
    text: "ROUTE 66",
    details: "做旧磨损质感，粗犷无衬线字，公路/车牌/星条旗元素，牛皮纸底色，美式公路文化。",
  },
  {
    style: "赛博书法",
    text: "道",
    details: "巨大单字书法，笔画中嵌电路板纹路，蓝黑底发光描边，传统与科技碰撞。",
  },
  {
    style: "酸性设计",
    text: "ACID",
    details: "扭曲金属质感字体，镭射渐变，液态玻璃效果，Y2K 酸性潮流，高饱和撞色。",
  },
  {
    style: "温柔奶油风",
    text: "慢生活",
    details: "圆体字，奶油白/浅杏色，手绘小花小草装饰边框，柔和治愈，适合作息/阅读主题。",
  },
  {
    style: "黑白高对比",
    text: "黑白",
    details: "解构主义汉字，笔画拆分重组，纯黑白，强烈视觉冲击，艺术展海报气质。",
  },
  {
    style: "中药铺古风",
    text: "本草纲目",
    details: "竖排楷书，药柜抽屉格纹背景，印章红点缀，做旧纸张，中医药文化气息。",
  },
  {
    style: "迪斯科复古",
    text: "DISCO",
    details: "镜面球质感立体字，粉橙紫霓虹渐变，放射线背景，70 年代舞厅氛围。",
  },
  {
    style: "军事工业",
    text: "FORTRESS",
    details: "军工 stencil 模板字体，军绿/卡其色，编号条码装饰，做旧磨损，硬朗机能风。",
  },
  {
    style: "清新水彩",
    text: "春暖花开",
    details: "水彩晕染艺术字，粉绿春色，花瓣飞溅效果，透明水痕质感，文艺清新。",
  },
  {
    style: "像素复古",
    text: "LEVEL UP",
    details: "8-bit 像素字体，复古游戏机配色（红黄蓝绿），像素小图标点缀，怀旧游戏风。",
  },
  {
    style: "藏书票风",
    text: "EX LIBRIS",
    details: "古典藏书票排版，衬线体，铜版画风格装饰（书本、羽毛笔、月桂），棕褐单色。",
  },
  {
    style: "包豪斯",
    text: "BAUHAUS",
    details: "原色几何构成（红黄蓝），无衬线粗体，圆/方/三角组合排版，理性现代主义。",
  },
  {
    style: "威士忌酒标",
    text: "RESERVE",
    details: "烫金衬线字，深棕/墨绿底，麦穗与橡木桶纹样，酒标徽章式构图，轻奢复古。",
  },
  {
    style: "街头涂鸦",
    text: "WILD STYLE",
    details: "喷漆气泡字，高饱和撞色，飞溅与描边，砖墙质感底，街头文化炸裂感。",
  },
  {
    style: "极简禅意",
    text: "空",
    details: "单字极大留白，细线框，一枝枯笔飞白，灰白米色，极致禅意与克制。",
  },
  {
    style: "星空宇宙",
    text: "COSMOS",
    details: "星云渐变立体字，星座连线装饰，深蓝紫底，银河光尘，浪漫宇宙主题。",
  },
  {
    style: "青花瓷",
    text: "青花",
    details: "青花缠枝莲纹边框，钴蓝白瓷配色，楷书题字，瓷面光泽质感，东方雅致。",
  },
  {
    style: "武术国风",
    text: "武",
    details: "狂草大字，墨点飞溅，红黑配色，武术剪影装饰，气势磅礴横向构图。",
  },
  {
    style: "文艺手帐",
    text: "记录生活",
    details: "手写体+打字机字体混排，胶带/贴纸/邮票装饰，牛皮纸底，手帐拼贴风。",
  },
  {
    style: "赛博日文",
    text: "東京未来",
    details: "假名+汉字混排，霓虹粉蓝，全息投影质感，电线杆/招牌元素，东京街头赛博。",
  },
  {
    style: "法式优雅",
    text: "PARIS",
    details: "细衬线法式字体，米白+黑+金，埃菲尔铁塔线条装饰，杂志封面式排版。",
  },
  {
    style: "摇滚乐队",
    text: "ROCK ON",
    details: "磨损金属字体，黑红配色，闪电/吉他/骷髅装饰，乐队 T 恤图案风格。",
  },
  {
    style: "治愈插画字",
    text: "小确幸",
    details: "手绘插画风字体，柔和马卡龙色，小动物/云朵/星星环绕，温馨治愈。",
  },
  {
    style: "解构主义",
    text: "BREAK",
    details: "字体破碎解构重组，灰白底黑红碎片，构成主义排版，先锋艺术感。",
  },
  {
    style: "茶道和风",
    text: "茶",
    details: "单字书法+假名注音，抹茶绿/苔色，茶碗与竹纹装饰，侘寂茶道美学。",
  },
];

function buildPrompt(t) {
  return [
    `设计一款鼠标垫文字文创设计，完成后保存到贴纸库。`,
    `硬性要求：`,
    `1. 画布尺寸先用 canvas.setSize 设为 宽度 ${WIDTH}、高度 ${HEIGHT}（宽高比 ${RATIO}），后续不要改尺寸`,
    `2. 一切内容用代码画布 canvas.addHtml 的 HTML/CSS 实现，禁止用 canvas.addChild 添加文字/图片/矩形子元素`,
    `3. 横向宽幅鼠标垫构图，文字是绝对主角，排版要精致、有层次`,
    `4. 完成后调用 canvas.updateAndSaveSticker 保存`,
    `设计需求：风格「${t.style}」，主文案「${t.text}」。${t.details}`,
  ].join("\n");
}

async function api(path, body) {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body || {}),
    signal: AbortSignal.timeout(30000),
  });
  return res.json();
}

async function getDesignTools() {
  try {
    const data = await api("/api/websocket/connections", {});
    return (data?.data || [])
      .filter((c) => c.query?.clientSource === "设计端")
      .map((c) => c.id);
  } catch (e) {
    log(`获取连接失败: ${e.message}`);
    return [];
  }
}

async function sendTask(toolId, prompt) {
  try {
    const data = await api("/api/websocket/remote-command", {
      connectionId: toolId,
      command: {
        type: "chat",
        payload: { message: prompt, executionMode: "manual" },
      },
    });
    return data?.data?.success || data?.status;
  } catch (e) {
    log(`发送任务失败: ${e.message}`);
    return false;
  }
}

async function main() {
  log(`🎨 鼠标垫文字文创批量测试启动: 画布 ${WIDTH}×${HEIGHT} (比例 ${RATIO})，共 ${TOTAL} 个任务`);

  let totalSent = 0;
  let taskIndex = 0;

  while (totalSent < TOTAL) {
    const tools = await getDesignTools();

    if (tools.length === 0) {
      log("⏳ 没有可用的设计工具，等待 60 秒...");
      await new Promise((r) => setTimeout(r, 60_000));
      continue;
    }

    log(`🔧 找到 ${tools.length} 个设计工具`);

    for (const toolId of tools) {
      if (totalSent >= TOTAL) break;

      const t = TASKS[taskIndex % TASKS.length];
      taskIndex++;
      totalSent++;

      log(`📤 [${totalSent}/${TOTAL}] ${t.style}「${t.text}」→ ${toolId.slice(0, 18)}`);

      const ok = await sendTask(toolId, buildPrompt(t));
      if (ok) {
        log(`✅ 任务已发送`);
      } else {
        log(`❌ 任务发送失败`);
      }
    }

    log(`⏳ 等待 ${SEND_INTERVAL_MS / 1000} 秒... (已发送: ${totalSent}/${TOTAL})`);
    await new Promise((r) => setTimeout(r, SEND_INTERVAL_MS));
  }

  log(`🎉 完成！共发送 ${totalSent} 个任务`);
}

main().catch((e) => log(`错误: ${e.message}`));
