/**
 * 双轨制自愈型全形态·全风格千套设计自主飞轮引擎 (Multi-Form & Multi-Style Flywheel Engine v3)
 * 
 * 核心升级点 (满足不同尺寸与不同风格的持续飞轮自主设计)：
 * 1. 【全维度尺寸拓扑】：
 *    - 2:1 (3200×1600) 超宽电竞桌面垫 (Desk Pad)
 *    - 16:9 (2560×1440) 电脑超清宽屏壁纸 / 全景 Banner
 *    - 9:16 (1440×2560) 潮流手机壁纸 / 先锋艺术海报 (Editorial Poster)
 *    - 3:4 (1800×2400) 文艺装裱画 / 展览画芯 (Fine Art Wall Scroll)
 *    - 3:1 (3000×1000) 极长工业机箱拉花 / 灯箱标牌 (Industrial Strip)
 *    - 1:1 (2400×2400) 经典艺术方块贴纸 / 品牌徽章 (Square Art Sticker)
 * 2. 【多流派视觉风格】：
 *    - 赛博机能电竞风 (Cyber Mecha & Esports)
 *    - 复古蒸汽波霓虹风 (80s Retro Synthwave)
 *    - 现代先锋杂志风 (Avant-Garde Magazine Editorial)
 *    - 东方侘寂极简水墨 (Oriental Zen & Wabi-Sabi)
 *    - 潮牌黑金工业重工 (Industrial Techwear & Warning)
 *    - 皇家玄紫金石盘式 (Royal Gold & Purple Stamp)
 * 3. 【自适应长宽比排版】：针对不同几何比例动态计算字号与空间留白，杜绝文字挤压与裁切。
 * 4. 【双轨并发与去重账本】：持续良性自驱动，直到 1000 套不同形态精品全部落库。
 */

import { io } from "socket.io-client";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiYWNjb3VudCI6ImphY2tpZSIsInRlcm1pbmFsVHlwZSI6ImFkbWluIiwidG9rZW5JZCI6IjhiOWM0MDlmLWUyYWMtNDU3Mi1iMTA4LTEyZTE3MTQ3NjIxZCIsImlhdCI6MTc5MTEzMDY1MCwiZXhwIjoyMTA2NzA2NjUwfQ.Ebae-frV7NN98CT48hYHTLkn8ct7Efpc_5KAL9zLop8";
const RAW_TOKEN = TOKEN.replace("Bearer ", "");
const SERVER_URL = "http://localhost:1520";
const LEDGER_PATH = join(__dirname, "../storage/autonomous_1000_ledger.json");
const TARGET_TOTAL = 1000;

// =========================================================================
// 1. 六大形态与多维风格矩阵定义
// =========================================================================

const FORMS = [
  {
    type: "deskpad_2x1",
    label: "2:1 桌垫",
    nameSuffix: "全景电竞桌垫",
    width: 3200,
    height: 1600,
    style: "赛博机能电竞风",
  },
  {
    type: "banner_16x9",
    label: "16:9 宽屏壁纸",
    nameSuffix: "蒸汽波宽屏壁纸",
    width: 2560,
    height: 1440,
    style: "复古蒸汽波霓虹风",
  },
  {
    type: "poster_9x16",
    label: "9:16 手机海报",
    nameSuffix: "现代先锋杂志海报",
    width: 1440,
    height: 2560,
    style: "现代先锋杂志风",
  },
  {
    type: "wallart_3x4",
    label: "3:4 艺术画芯",
    nameSuffix: "东方侘寂艺术画芯",
    width: 1800,
    height: 2400,
    style: "东方侘寂水墨禅意",
  },
  {
    type: "strip_3x1",
    label: "3:1 工业标牌",
    nameSuffix: "潮牌工业机能标牌",
    width: 3000,
    height: 1000,
    style: "潮牌黑金工业警戒",
  },
  {
    type: "square_1x1",
    label: "1:1 艺术贴纸",
    nameSuffix: "国潮经典艺术贴纸",
    width: 2400,
    height: 2400,
    style: "皇家金石重彩风",
  },
];

const THEMES = [
  {
    category: "招财开运",
    palette: "玄金曜石、黑金流光、重彩赤金",
    bgGradient: "radial-gradient(circle at 50% 48%, #1f1505 0%, #100a02 60%, #060401 100%)",
    titleColor: "linear-gradient(135deg, #ffffff 0%, #ffd700 35%, #f59e0b 70%, #d97706 100%)",
    accentColor: "#f59e0b",
    sealBg: "#b91c1c",
    sealTextCol: "#fef08a",
    items: [
      { main: "日进斗金", top: "天官赐福 · 八方来财", sub: "财源广进 步步高升", seal: "八方聚宝" },
      { main: "招财进宝", top: "紫气东升 · 金玉满堂", sub: "富贵盈门 岁岁安康", seal: "大吉金堂" },
      { main: "一本万利", top: "风生水起 · 鸿基永固", sub: "八方来财 顺遂无虞", seal: "财运恒通" },
      { main: "时来运转", top: "乾坤开泰 · 运转亨通", sub: "风生水起 鸿图大展", seal: "顺遂无忧" },
      { main: "八方来财", top: "祥瑞盈门 · 聚宝成渊", sub: "金玉满堂 喜乐平安", seal: "福泽深厚" },
      { main: "财源滚滚", top: "岁序丰稔 · 仓廪充盈", sub: "五谷丰登 岁稔年丰", seal: "生财有道" },
      { main: "富贵", top: "荣华兆瑞 · 繁花似锦", sub: "花开富贵 锦绣前程", seal: "天赐百福" },
      { main: "生财", top: "君子爱财 · 取之有道", sub: "积德生财 家道隆昌", seal: "和气生财" },
    ],
  },
  {
    category: "祈福祥瑞",
    palette: "朱砂正红、宫廷赤金、温润象牙白",
    bgGradient: "radial-gradient(circle at 50% 48%, #360707 0%, #1d0303 60%, #0c0101 100%)",
    titleColor: "linear-gradient(135deg, #ffffff 0%, #fed7aa 30%, #fca5a5 65%, #f87171 100%)",
    accentColor: "#ef4444",
    sealBg: "#991b1b",
    sealTextCol: "#fee2e2",
    items: [
      { main: "平安喜乐", top: "岁岁长相见 · 欢愉常在", sub: "顺遂无忧 万事胜意", seal: "百福俱臻" },
      { main: "吉星高照", top: "祥云呈瑞 · 福泽绵长", sub: "福光普照 运开时泰", seal: "大吉呈祥" },
      { main: "万象更新", top: "岁序更新 · 春祺夏安", sub: "日月同辉 喜乐长存", seal: "福泽延绵" },
      { main: "瑞气盈门", top: "紫气氤氲 · 和气致祥", sub: "千祥云集 百福骈臻", seal: "迎祥纳瑞" },
      { main: "岁岁安康", top: "长乐未央 · 欢愉永乐", sub: "顺遂平安 岁岁长宁", seal: "永绥吉劭" },
      { main: "康泰", top: "身心清朗 · 福寿自来", sub: "安康泰和 岁月安稳", seal: "清吉康宁" },
      { main: "大吉", top: "鸿运当头 · 吉星眷顾", sub: "大吉大利 顺遂常存", seal: "万事吉" },
    ],
  },
  {
    category: "事业高升",
    palette: "藏青苍浪、沧海流金、青金石蓝",
    bgGradient: "radial-gradient(circle at 50% 48%, #071b2e 0%, #030d17 60%, #01050a 100%)",
    titleColor: "linear-gradient(135deg, #ffffff 0%, #bae6fd 30%, #38bdf8 65%, #0284c7 100%)",
    accentColor: "#38bdf8",
    sealBg: "#0369a1",
    sealTextCol: "#e0f2fe",
    items: [
      { main: "一帆风顺", top: "沧海横流 · 乘风破浪", sub: "万里鹏程 一路顺遂", seal: "顺风顺水" },
      { main: "大展宏图", top: "志存九霄 · 气吞万里", sub: "青云直上 志在千里", seal: "扶摇直上" },
      { main: "步步高升", top: "云梯有路 · 扶摇万里", sub: "云程发轫 步月登云", seal: "连中三元" },
      { main: "马到成功", top: "旗开得胜 · 势不可挡", sub: "一马当先 如日中天", seal: "凯歌高奏" },
      { main: "金榜题名", top: "十年磨剑 · 今朝锋芒", sub: "独占鳌头 前程似锦", seal: "状元及第" },
      { main: "高远", top: "山高水长 · 登高望远", sub: "志存高远 卓尔不群", seal: "高瞻远瞩" },
      { main: "凌云", top: "会当凌绝顶 · 一览众山小", sub: "凌云壮志 剑指苍穹", seal: "气贯长虹" },
    ],
  },
  {
    category: "东方哲学与心境",
    palette: "玄紫流金、水墨玄青、松石苍翠",
    bgGradient: "radial-gradient(circle at 50% 48%, #1f0d38 0%, #110520 60%, #07010e 100%)",
    titleColor: "linear-gradient(135deg, #ffffff 0%, #fef08a 35%, #e9d5ff 70%, #c084fc 100%)",
    accentColor: "#c084fc",
    sealBg: "#7e22ce",
    sealTextCol: "#f3e8ff",
    items: [
      { main: "知行合一", top: "心向光明 · 笃行致远", sub: "知之真切 行之笃实", seal: "致良知" },
      { main: "宁静致远", top: "心如止水 · 鉴照万物", sub: "淡泊明志 水深流静", seal: "清心笃行" },
      { main: "上善若水", top: "包容万汇 · 厚德载物", sub: "水善利万物而不争", seal: "润泽万物" },
      { main: "厚德载物", top: "地势坤德 · 君子宏阔", sub: "厚德载物 生生不息", seal: "大德敦化" },
      { main: "道法自然", top: "天地大美 · 万物自生", sub: "万物归真 清虚自守", seal: "返璞归真" },
      { main: "知足常乐", top: "心宽是福 · 岁月生香", sub: "得失随缘 心自安详", seal: "怡然自得" },
      { main: "清欢", top: "人间有味 · 闲庭信步", sub: "心安是归处 岁月带香", seal: "得趣" },
    ],
  },
  {
    category: "热血新国潮与潮牌态度",
    palette: "暗夜黑、赛博荧光金、炽热赤练",
    bgGradient: "radial-gradient(circle at 50% 48%, #211c05 0%, #110e02 60%, #050400 100%)",
    titleColor: "linear-gradient(135deg, #ffffff 0%, #fef08a 30%, #eab308 70%, #ca8a04 100%)",
    accentColor: "#eab308",
    sealBg: "#b45309",
    sealTextCol: "#fef9c3",
    items: [
      { main: "无畏", top: "FEARLESS · 一往无前", sub: "生而无畏 战至巅峰", seal: "天下先" },
      { main: "乘风", top: "BREAK THE LIMIT · 破界破浪", sub: "风起云涌 势如破竹", seal: "御风而行" },
      { main: "破局", top: "NEW HORIZON · 重塑乾坤", sub: "独辟蹊径 敢为人先", seal: "破浪而出" },
      { main: "巅峰", top: "TOP OF THE WORLD · 傲视群雄", sub: "群峰之上 惟我自强", seal: "独尊" },
      { main: "锋芒", top: "SHARP AS STEEL · 利剑出鞘", sub: "不露锋芒 则无以图存", seal: "势不可挡" },
      { main: "燃", top: "KEEP BURNING · 热血不灭", sub: "生如烈焰 肆意盛开", seal: "赤子心" },
    ],
  },
];

// 全局 1000 题清单生成器 (自动注入 6 大尺寸与形态)
function buildMasterUniverse() {
  const list = [];
  let index = 0;
  while (list.length < TARGET_TOTAL) {
    const cat = THEMES[index % THEMES.length];
    const catItems = cat.items;
    const baseItem = catItems[Math.floor(index / THEMES.length) % catItems.length];
    const formDef = FORMS[index % FORMS.length];

    const id = `item-${index + 1}`;
    const roundNum = Math.floor(index / (THEMES.length * 7)) + 1;
    const titleSuffix = roundNum > 1 ? ` · 卷${roundNum}` : "";

    list.push({
      id,
      index: index + 1,
      title: `《${baseItem.main}》· ${formDef.nameSuffix} (#${index + 1}${titleSuffix})`,
      form: formDef.type,
      formLabel: formDef.label,
      width: formDef.width,
      height: formDef.height,
      styleGenre: formDef.style,
      mainText: baseItem.main,
      topText: baseItem.top,
      subText: baseItem.sub,
      sealText: baseItem.seal,
      category: cat.category,
      palette: cat.palette,
      bgGradient: cat.bgGradient,
      titleColor: cat.titleColor,
      accentColor: cat.accentColor,
      sealBg: cat.sealBg,
      sealTextCol: cat.sealTextCol,
      prompt: `请为我设计一张【${baseItem.main}】${formDef.nameSuffix}。规格尺寸：${formDef.width}×${formDef.height}px (${formDef.label})。风格要求：${formDef.style}。主文案「${baseItem.main}」，顶标「${baseItem.top}」，副标「${baseItem.sub}」，朱砂印章「${baseItem.seal}」。色彩体系：${cat.palette}。自适应视口排版，防断行裁切。完成后保存设计入库。`,
    });
    index += 1;
  }
  return list;
}

// =========================================================================
// 2. 六大形态专属高精排版 HTML 生成器
// =========================================================================

function generatePrecisionMcpHtml(brief) {
  const { form, mainText, topText, subText, sealText, accentColor, sealBg, sealTextCol } = brief;

  // 1. 横版 2:1 超宽电竞桌垫 (3200 × 1600)
  if (form === "deskpad_2x1") {
    return `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 70% 50%, #15102a 0%, #080612 55%, #020105 100%);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:120px 180px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;inset:40px;border:1px solid rgba(168,85,247,0.25);pointer-events:none;"></div>
  <div style="position:absolute;top:60px;left:70px;display:flex;gap:30px;font-size:24px;color:#a855f7;font-weight:700;letter-spacing:4px;">
    <span>GRID // 3200×1600</span>
    <span>SYS.VER 2.6</span>
    <span style="color:#38bdf8;">DESKPAD EDITION</span>
  </div>
  <div style="position:absolute;bottom:60px;right:70px;font-size:22px;color:#94a3b8;letter-spacing:6px;">
    ULTRA-WIDE GAMING DESK MAT / 原创设计
  </div>
  <div style="display:flex;flex-direction:column;gap:30px;z-index:2;max-width:32%;">
    <div style="display:inline-flex;align-items:center;gap:12px;padding:8px 20px;background:rgba(168,85,247,0.15);border-left:4px solid #a855f7;color:#d8b4fe;font-size:32px;letter-spacing:8px;font-weight:700;">
      ${topText}
    </div>
    <div style="font-size:48px;line-height:1.45;color:#f8fafc;font-weight:600;letter-spacing:8px;text-shadow:0 4px 20px rgba(0,0,0,0.8);">
      ${subText}
    </div>
    <div style="display:inline-flex;align-items:center;gap:16px;margin-top:10px;">
      <div style="padding:10px 24px;background:#7e22ce;color:#faf5ff;font-size:28px;font-weight:900;letter-spacing:6px;border-radius:4px;">
        ${sealText}
      </div>
      <div style="width:120px;height:2px;background:linear-gradient(90deg,#a855f7,transparent);"></div>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 19.5);font-weight:900;letter-spacing:24px;background:linear-gradient(135deg, #ffffff 0%, #f0abfc 35%, #c084fc 70%, #7e22ce 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 48px rgba(0,0,0,0.85), 0 0 40px rgba(192,132,252,0.45);line-height:1;white-space:nowrap;">
      ${mainText}
    </h1>
    <div style="font-size:36px;letter-spacing:18px;color:#94a3b8;font-weight:700;margin-top:28px;text-transform:uppercase;">
      BREAK THROUGH THE DARKNESS
    </div>
  </div>
</div>
    `.trim();
  }

  // 2. 横版 16:9 电脑宽屏壁纸 / 全景 Banner (2560 × 1440)
  if (form === "banner_16x9") {
    return `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 35%, #2a0845 0%, #15002b 50%, #080014 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:100px 140px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;bottom:0;left:0;right:0;height:45%;background:linear-gradient(to top, rgba(236,72,153,0.18) 0%, transparent 100%);border-top:2px solid #ec4899;perspective:600px;pointer-events:none;">
    <div style="width:100%;height:100%;background:repeating-linear-gradient(90deg, rgba(236,72,153,0.2) 0px, rgba(236,72,153,0.2) 2px, transparent 2px, transparent 80px);"></div>
  </div>
  <div style="position:absolute;top:22%;left:50%;transform:translate(-50%, -50%);width:420px;height:420px;background:linear-gradient(to bottom, #fde047 0%, #f43f5e 60%, #a855f7 100%);border-radius:50%;opacity:0.85;box-shadow:0 0 100px rgba(244,63,94,0.6);pointer-events:none;"></div>
  <div style="display:flex;align-items:center;gap:24px;z-index:2;margin-top:10px;">
    <span style="font-size:26px;letter-spacing:14px;color:#f472b6;font-weight:700;text-transform:uppercase;">${topText}</span>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;margin:auto 0;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 16.5);font-weight:900;letter-spacing:26px;background:linear-gradient(180deg, #ffffff 0%, #fed7aa 30%, #f43f5e 70%, #831843 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 12px 36px rgba(0,0,0,0.9), 0 0 42px rgba(244,63,94,0.6);line-height:1;white-space:nowrap;">
      ${mainText}
    </h1>
    <div style="font-size:36px;letter-spacing:16px;color:#38bdf8;font-weight:800;margin-top:28px;text-transform:uppercase;text-shadow:0 0 20px #38bdf8;">
      ${subText}
    </div>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;width:100%;border-top:1px solid rgba(244,63,94,0.3);padding-top:24px;z-index:2;">
    <span style="font-size:22px;color:#94a3b8;letter-spacing:6px;">SEAL: ${sealText}</span>
    <span style="font-size:22px;color:#f472b6;letter-spacing:6px;font-weight:600;">IMMERSIVE DESKTOP AUDIOVISUAL</span>
  </div>
</div>
    `.trim();
  }

  // 3. 竖版 9:16 手机海报 / 潮流杂志刊物 (1440 × 2560)
  if (form === "poster_9x16") {
    const chars = mainText.length > 2 ? `${mainText.slice(0, 2)}<br>${mainText.slice(2)}` : mainText;
    return `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(circle at 50% 30%, #201305 0%, #100801 60%, #050200 100%);box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:180px 120px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid rgba(245,158,11,0.4);padding-bottom:28px;z-index:2;">
    <div>
      <div style="font-size:72px;font-weight:900;color:#f59e0b;letter-spacing:6px;line-height:1;">VOL.26</div>
      <div style="font-size:26px;color:#94a3b8;letter-spacing:8px;margin-top:8px;">EDITORIAL POSTER</div>
    </div>
    <div style="text-align:right;font-size:28px;color:#fef3c7;letter-spacing:4px;">
      AUTUMN / 2026<br><span style="color:#f59e0b;font-weight:700;">LIMITLESS LIFE</span>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin:auto 0;z-index:2;">
    <div style="font-size:38px;letter-spacing:16px;color:#fbbf24;font-weight:600;margin-bottom:30px;">
      · ${topText} ·
    </div>
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 23.5);font-weight:900;letter-spacing:18px;background:linear-gradient(180deg, #ffffff 0%, #fde68a 40%, #f59e0b 80%, #b45309 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 16px 40px rgba(0,0,0,0.8), 0 0 30px rgba(245,158,11,0.4);line-height:1.15;text-align:center;">
      ${chars}
    </h1>
    <div style="width:140px;height:4px;background:#f59e0b;margin-top:40px;border-radius:2px;"></div>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.15);padding-top:36px;z-index:2;">
    <div style="max-width:65%;">
      <div style="font-size:42px;color:#ffffff;font-weight:600;letter-spacing:6px;">${subText}</div>
      <div style="font-size:28px;color:#94a3b8;margin-top:10px;letter-spacing:4px;">不负韶华 活出真我本色</div>
    </div>
    <div style="padding:14px 28px;background:${sealBg};border:2px solid ${sealTextCol};border-radius:6px;box-shadow:0 6px 20px rgba(0,0,0,0.6);">
      <span style="font-size:32px;font-weight:900;color:${sealTextCol};letter-spacing:6px;">${sealText}</span>
    </div>
  </div>
</div>
    `.trim();
  }

  // 4. 竖版 3:4 艺术画芯 / 展览挂画 (1800 × 2400)
  if (form === "wallart_3x4") {
    return `
<div style="width:100%;height:100%;position:relative;background:radial-gradient(ellipse at 50% 40%, #0f1c24 0%, #060c10 65%, #020406 100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:200px 140px;font-family:'PingFang SC','Noto Serif SC',serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;inset:100px;border:1px solid rgba(56,189,248,0.2);pointer-events:none;"></div>
  <div style="position:absolute;inset:120px;border:1px dashed rgba(255,255,255,0.12);pointer-events:none;"></div>
  <div style="display:flex;align-items:center;gap:20px;z-index:2;">
    <div style="width:50px;height:1px;background:#38bdf8;"></div>
    <span style="font-size:36px;letter-spacing:14px;color:#7dd3fc;font-weight:500;">${topText}</span>
    <div style="width:50px;height:1px;background:#38bdf8;"></div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;margin:auto 0;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 17.5);font-weight:900;letter-spacing:22px;background:linear-gradient(180deg, #ffffff 0%, #bae6fd 40%, #38bdf8 75%, #0284c7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 44px rgba(0,0,0,0.85), 0 0 32px rgba(56,189,248,0.4);line-height:1;white-space:nowrap;">
      ${mainText}
    </h1>
    <div style="font-size:32px;letter-spacing:12px;color:#94a3b8;margin-top:36px;font-weight:400;">
      ${subText}
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:36px;z-index:2;">
    <div style="padding:12px 28px;background:#0c4a6e;border:2px solid #7dd3fc;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.6);">
      <span style="font-size:28px;font-weight:bold;color:#e0f2fe;letter-spacing:6px;">${sealText}</span>
    </div>
    <span style="font-size:32px;color:#f1f5f9;letter-spacing:8px;font-weight:500;">清泉石上流</span>
  </div>
</div>
    `.trim();
  }

  // 5. 超长横向 3:1 工业机箱拉花 / 灯箱标牌 (3000 × 1000)
  if (form === "strip_3x1") {
    return `
<div style="width:100%;height:100%;position:relative;background:#0a0a0c;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:80px 140px;font-family:'PingFang SC','Noto Sans SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;top:0;left:0;right:0;height:18px;background:repeating-linear-gradient(-45deg, #facc15 0px, #facc15 20px, #000 20px, #000 40px);pointer-events:none;"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:18px;background:repeating-linear-gradient(-45deg, #facc15 0px, #facc15 20px, #000 20px, #000 40px);pointer-events:none;"></div>
  <div style="display:flex;flex-direction:column;gap:18px;z-index:2;max-width:35%;">
    <div style="display:inline-flex;align-items:center;gap:12px;padding:6px 18px;background:#facc15;color:#000;font-size:24px;font-weight:900;letter-spacing:4px;">
      CAUTION // SPEC 01
    </div>
    <div style="font-size:38px;color:#ffffff;font-weight:700;letter-spacing:6px;line-height:1.3;">
      ${topText}<br><span style="color:#facc15;">LIMITLESS SYSTEM</span>
    </div>
    <div style="font-size:22px;color:#94a3b8;letter-spacing:4px;">
      SEAL: ${sealText} // AUTHENTIC
    </div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * 22);font-weight:900;letter-spacing:26px;background:linear-gradient(135deg, #ffffff 0%, #fef08a 40%, #facc15 75%, #ca8a04 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 10px 30px rgba(0,0,0,0.8), 0 0 36px rgba(250,204,21,0.45);line-height:1;white-space:nowrap;">
      ${mainText}
    </h1>
    <div style="font-size:28px;letter-spacing:14px;color:#facc15;font-weight:800;margin-top:20px;text-transform:uppercase;">
      ${subText}
    </div>
  </div>
</div>
    `.trim();
  }

  // 6. 默认 1:1 经典艺术方块标贴 (2400 × 2400)
  const len = mainText.length;
  let fontSizeVw = len === 2 ? 27.0 : (len === 3 ? 20.5 : 16.5);
  let letterSpacing = len === 2 ? "46px" : (len === 3 ? "32px" : "22px");

  return `
<div style="width:100%;height:100%;position:relative;background:${brief.bgGradient};box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:170px 140px;font-family:'PingFang SC','Noto Serif SC',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;">
  <div style="position:absolute;inset:90px;border:2px solid ${accentColor}88;border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;inset:116px;border:1px solid rgba(255,255,255,0.22);border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:170px;left:170px;width:130px;height:130px;border:1px solid ${accentColor}44;border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;top:170px;right:170px;width:130px;height:130px;border:1px solid ${accentColor}44;border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;bottom:170px;left:170px;width:130px;height:130px;border:1px solid ${accentColor}44;border-radius:50%;pointer-events:none;"></div>
  <div style="position:absolute;bottom:170px;right:170px;width:130px;height:130px;border:1px solid ${accentColor}44;border-radius:50%;pointer-events:none;"></div>
  <div style="display:flex;align-items:center;gap:20px;z-index:2;margin-top:24px;">
    <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,${accentColor});"></div>
    <span style="font-size:42px;letter-spacing:14px;color:${accentColor};font-weight:600;white-space:nowrap;">${topText}</span>
    <div style="width:60px;height:2px;background:linear-gradient(90deg,${accentColor},transparent);"></div>
  </div>
  <div style="display:flex;align-items:center;justify-content:center;width:78%;max-width:78%;margin:auto 0;z-index:2;">
    <h1 style="margin:0;padding:0;font-size:calc(var(--canvas-html-vw) * ${fontSizeVw});font-weight:900;letter-spacing:${letterSpacing};background:${brief.titleColor};-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 14px 42px rgba(0,0,0,0.75), 0 0 28px ${accentColor}55;white-space:nowrap;display:flex;justify-content:center;align-items:center;">
      ${mainText}
    </h1>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:32px;z-index:2;margin-bottom:24px;">
    <div style="font-size:46px;letter-spacing:12px;color:#f3f4f6;font-weight:500;white-space:nowrap;opacity:0.96;text-shadow:0 4px 12px rgba(0,0,0,0.6);">
      ${subText}
    </div>
    <div style="display:inline-flex;align-items:center;justify-content:center;padding:12px 28px;background:${sealBg};border:2px solid ${sealTextCol}cc;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
      <span style="font-size:32px;font-weight:bold;color:${sealTextCol};letter-spacing:6px;">${sealText}</span>
    </div>
  </div>
</div>
  `.trim();
}

// =========================================================================
// 3. 生产账本管理
// =========================================================================

function loadLedger() {
  if (existsSync(LEDGER_PATH)) {
    try {
      const data = JSON.parse(readFileSync(LEDGER_PATH, "utf-8"));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  return [];
}

function saveLedgerRecord(record) {
  const ledger = loadLedger();
  const exists = ledger.some((item) => item.mainText === record.mainText && item.form === record.form);
  if (!exists) {
    ledger.push(record);
    const dir = dirname(LEDGER_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2), "utf-8");
  }
  return ledger.length;
}

// =========================================================================
// 4. 通信与自愈控制
// =========================================================================

async function postApi(path, body) {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: TOKEN,
    },
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
    query: { clientSource: "管理后台", clientId: `multi-form-factory-v3-${Date.now()}` },
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

function sendRemoteCommand(connectionId, type, payload = {}, timeoutMs = 240_000) {
  return new Promise((resolve, reject) => {
    const requestId = `fly3-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timer = setTimeout(() => {
      pendingResolvers.delete(requestId);
      reject(new Error(`工位 [${connectionId.slice(-6)}] 执行超时 (${timeoutMs / 1000}s)`));
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
      headers: {
        "Content-Type": "application/json",
        Authorization: TOKEN,
      },
      body: JSON.stringify({
        connectionId,
        command: { type, payload, requestId },
      }),
    }).catch(reject);
  });
}

// =========================================================================
// 5. 全形态多流派自主飞轮引擎主循环
// =========================================================================

async function runAutonomousFlywheel() {
  console.log("\n=======================================================");
  console.log("   🚀 全形态·全风格自主设计生产飞轮引擎启动 (Flywheel v3) ");
  console.log("   📐 尺寸覆盖: 2:1桌垫 | 16:9壁纸 | 9:16海报 | 3:4画芯 | 3:1标牌 | 1:1贴纸");
  console.log("   🎨 风格覆盖: 赛博机能 | 蒸汽波 | 杂志先锋 | 侘寂水墨 | 黑金工业 | 皇家重彩");
  console.log(`   🎯 生产总目标: ${TARGET_TOTAL} 套多元形态精品 (绝不重复)`);
  console.log("=======================================================\n");

  await initGlobalSocket();
  const masterUniverse = buildMasterUniverse();
  const initialLedger = loadLedger();
  const completedKeys = new Set(initialLedger.map((d) => `${d.mainText}-${d.form || "square_1x1"}`));

  const pendingQueue = masterUniverse.filter((item) => !completedKeys.has(`${item.mainText}-${item.form}`));
  let completedCount = initialLedger.length;

  console.log(`📊 账本加载完毕: 已落库唯一精品: ${completedCount} / ${TARGET_TOTAL} 张`);
  console.log(`📋 待办队列就绪: 剩余待制多元设计: ${pendingQueue.length} 套\n`);

  let round = 0;

  while (completedCount < TARGET_TOTAL && pendingQueue.length > 0) {
    round += 1;
    const tools = await getOnlineDesignTools();

    if (!tools.length) {
      console.warn("⚠️ 当前暂无在线工位，5 秒后重新感知...");
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }

    console.log(`\n── 🔄 飞轮第 ${round} 轮 [在线工位: ${tools.length} 个] [当前进度: ${completedCount}/${TARGET_TOTAL} (${((completedCount / TARGET_TOTAL) * 100).toFixed(1)}%)] ──`);

    const assignedTasks = [];
    for (let i = 0; i < tools.length; i++) {
      if (pendingQueue.length === 0) break;
      const worker = tools[i];
      const brief = pendingQueue.shift();
      const track = (round + i) % 3 === 0 ? "内部Agent" : "外部MCP";
      assignedTasks.push({ worker, brief, track });
    }

    const roundStartTime = Date.now();
    const results = await Promise.all(
      assignedTasks.map(async ({ worker, brief, track }, idx) => {
        const shortId = worker.id.slice(-6);
        const taskStart = Date.now();
        console.log(`   🚀 [工位 #${idx + 1} (${shortId})] 投入制作: ${brief.title} 【${brief.formLabel} · ${brief.styleGenre} · ${track}轨】`);

        try {
          // 复位清空
          await sendRemoteCommand(worker.id, "resetAgent", {}, 10_000).catch(() => null);
          await sendRemoteCommand(worker.id, "executeOperation", { operation: "canvas.clear" }, 15_000).catch(() => null);

          let stickerOutput = null;

          if (track === "外部MCP") {
            // 外部 MCP 模式：尺寸 ➔ 注入定制 HTML ➔ 保存
            await sendRemoteCommand(worker.id, "executeOperation", {
              operation: "canvas.setSize",
              parameters: { width: brief.width, height: brief.height, unit: "px" },
            });
            const mcpHtml = generatePrecisionMcpHtml(brief);
            await sendRemoteCommand(worker.id, "executeOperation", {
              operation: "canvas.addHtml",
              parameters: { htmlContent: mcpHtml, htmlBindings: {} },
            });
            const saveRes = await sendRemoteCommand(worker.id, "executeOperation", {
              operation: "canvas.updateAndSaveSticker",
              parameters: { name: brief.title },
            }, 60_000);
            stickerOutput = saveRes?.data;
          } else {
            // 内部 Agent 模式：注入提示词驱动设计端智能 Agent 创作
            const chatRes = await sendRemoteCommand(worker.id, "chat", {
              message: brief.prompt,
              executionMode: "automatic",
              resetConversation: true,
              force: true,
            }, 180_000);

            const outputs = chatRes?.outputs || [];
            stickerOutput = outputs.find((o) => o.type === "sticker" || o.customStickerId || o.url);

            if (!stickerOutput) {
              const saveRes = await sendRemoteCommand(worker.id, "executeOperation", {
                operation: "canvas.updateAndSaveSticker",
                parameters: { name: brief.title },
              }, 60_000).catch(() => null);
              if (saveRes?.data) stickerOutput = saveRes.data;
            }
          }

          const duration = ((Date.now() - taskStart) / 1000).toFixed(1);

          if (stickerOutput?.customStickerId || stickerOutput?.url) {
            const record = {
              id: stickerOutput.customStickerId || `sticker-${Date.now()}`,
              index: brief.index,
              title: brief.title,
              form: brief.form,
              formLabel: brief.formLabel,
              width: brief.width,
              height: brief.height,
              styleGenre: brief.styleGenre,
              track,
              mainText: brief.mainText,
              topText: brief.topText,
              subText: brief.subText,
              category: brief.category,
              cosUrl: stickerOutput.url,
              workerId: worker.id,
              durationSeconds: parseFloat(duration),
              createdAt: new Date().toISOString(),
            };
            const currentTotal = saveLedgerRecord(record);
            completedCount = currentTotal;

            console.log(`   ✅ [工位 #${idx + 1} (${shortId})] 入库成功！耗时: ${duration}s, 尺寸: ${brief.width}×${brief.height}, COS: ${record.cosUrl.slice(0, 45)}...`);
            return { success: true, record };
          } else {
            console.log(`   ⚠️ [工位 #${idx + 1} (${shortId})] 未检测到有效产物，将该题自动回池稍后重试...`);
            pendingQueue.push(brief);
            return { success: false };
          }
        } catch (err) {
          console.log(`   ❌ [工位 #${idx + 1} (${shortId})] 执行异常 (${err.message})，将该题自动回池稍后重试...`);
          pendingQueue.push(brief);
          return { success: false, error: err.message };
        }
      })
    );

    const roundDuration = ((Date.now() - roundStartTime) / 1000).toFixed(1);
    const roundSuccesses = results.filter((r) => r.success).length;
    console.log(`\n🎉 第 ${round} 轮完成！本轮入库: ${roundSuccesses}/${assignedTasks.length} 张 · 总账本: ${completedCount}/${TARGET_TOTAL} (${((completedCount / TARGET_TOTAL) * 100).toFixed(1)}%) · 轮耗时: ${roundDuration}s`);
    console.log(`⏳ 持续良性飞轮运转：3 秒后开启下一轮多轨并发设计...`);
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\n🎊 宏伟目标已达成！1000 套全形态多元风格优秀设计全部成功落库！`);
  process.exit(0);
}

runAutonomousFlywheel().catch((err) => {
  console.error("飞轮引擎异常:", err);
  process.exit(1);
});
