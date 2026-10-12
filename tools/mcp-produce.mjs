// MCP 持续生产：多主题名言/情绪文字长款鼠标垫，目标 N 张
// 用法: node tools/mcp-produce.mjs [目标数量=1000] [每轮并发数=4]
import { readFileSync, appendFileSync, mkdirSync } from "fs";

const TOKEN = readFileSync("/Users/jackie/workspace/1s/tools/.test-token", "utf-8").trim();
const API = "http://127.0.0.1:1520/api/ai-assistant/tools/execute";
const LOG_DIR = "/Users/jackie/workspace/1s/.batch-logs";
mkdirSync(LOG_DIR, { recursive: true });
const LOG = `${LOG_DIR}/produce.log`;

const TARGET = Number(process.argv[2]) || 1000;
const CONCURRENCY = Number(process.argv[3]) || 4;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG, line + "\n");
}

// ── 主题池：名言 / 励志 / 治愈 / 国风 / 禅意 / 爱情 / 友情 / 亲�情 / 节气 / 哲思 / 童趣 / 旅行 ──
const THEMES = [
  // 励志
  { t: "Stay hungry. Stay foolish.", s: "求知若饥，虚心若愚 — 乔布斯", y: "黑白极简 + 大号英文 + 中文注脚 + 细线框" },
  { t: "凡是过往，皆为序章", s: "— 莎士比亚", y: "淡青底 + 细衬线中英混排 + 翻页浪纹" },
  { t: "What doesn't kill me makes me stronger", s: "杀不死我的，必使我更强大 — 尼采", y: "黑底白字 + 金缮裂纹 + 山峰闪电" },
  { t: "向前跑，别回头", s: "风会记住你的名字", y: "橙红渐变 + 斜体动感字 + 跑道线脚印" },
  { t: "此刻即是最好的时刻", s: "种一棵树最好的时间是现在", y: "暖阳橙底 + 手写体 + 小树苗沙漏" },
  { t: "星光不问赶路人", s: "时光不负有心人", y: "深蓝星空 + 发光细字 + 星轨月牙" },
  { t: "山高自有客行路", s: "水深自有渡船人", y: "山水灰蓝 + 楷体 + 山径小船飞鸟" },
  { t: "把每一次跌倒都当作起跳", s: "— 致正在坚持的你", y: "黑金底 + 硬朗字 + 弹簧弧线" },
  // 治愈
  { t: "慢慢来", s: "一切都来得及", y: "燕麦奶茶色 + 手写体 + 茶叶小猫爪" },
  { t: "允许一切发生", s: "你已经很好了", y: "浅杏粉底 + 细圆体 + 羽毛小云朵" },
  { t: "今天也辛苦了", s: "早点休息吧", y: "深蓝夜色 + 发光细字 + 月亮热牛奶" },
  { t: "万物可爱", s: "日子很慢很慢", y: "嫩芽绿底 + 轻快体 + 小花瓢虫" },
  { t: "前路有光", s: "别怕慢慢走", y: "暖黄晨光 + 手写体 + 路灯星星脚印" },
  { t: "被爱着", s: "从来都不是一个人", y: "奶油粉底 + 圆润体 + 爱心毛线围巾" },
  { t: "别急", s: "花期不同而已", y: "浅紫藤色 + 细体 + 花苞藤蔓露珠" },
  { t: "在看风景", s: "也在成为风景", y: "天青底 + 清透字 + 山峦小船云影" },
  { t: "好好生活", s: "慢慢相遇", y: "奶油黄底 + 温馨体 + 面包灯泡书本" },
  { t: "人间值得", s: "你也值得", y: "暖橙落日 + 手写体 + 太阳小屋炊烟" },
  // 国风 / 禅意
  { t: "此心安处是吾乡", s: "— 苏轼", y: "暖杏底 + 行楷 + 小屋炊烟月牙" },
  { t: "行到水穷处，坐看云起时", s: "— 王维", y: "天青底 + 淡墨 + 流水云海" },
  { t: "且将新火试新茶", s: "诗酒趁年华 — 苏轼", y: "茶绿底 + 宋楷 + 茶烟酒壶远山" },
  { t: "宁静致远", s: "淡泊明志", y: "宣纸米底 + 行书 + 淡墨山水" },
  { t: "心有山海", s: "静而无边", y: "青灰山水 + 宋体 + 远山飞鸟小舟" },
  { t: "常想一二", s: "不思八九", y: "宣纸米底 + 楷体 + 橘子竹叶茶杯" },
  { t: "一蓑烟雨任平生", s: "— 苏轼《定风波》", y: "水墨灰蓝 + 行草 + 蓑衣烟雨" },
  { t: "知足常乐", s: "小满胜万全", y: "米白底 + 圆润楷体 + 麦穗小碗" },
  // 哲思 / 英文
  { t: "Do one thing well", s: "一生做好一件事", y: "素白底 + 黑细字 + 刻刀墨滴极简禅意" },
  { t: "Be the change", s: "欲变世界，先变其身 — 甘地", y: "深蓝底 + 金色细字 + 破茧小翅膀" },
  { t: "Simplicity is the ultimate sophistication", s: "至简即至臻 — 达芬奇", y: "米白底 + 无衬线细字 + 圆点几何" },
  { t: "The best time is now", s: "最好的时刻就是现在", y: "暖阳橙底 + 手写英文 + 沙漏小树" },
  { t: "Less is more", s: "少即是多 — 密斯", y: "纯白底 + 极简黑字 + 留白呼吸" },
  { t: "Dream big, start small", s: "心怀远大，始于足下", y: "天蓝底 + 手写体 + 小星星小脚印" },
  // 情感 / 生活
  { t: "把平凡的日子过成诗", s: "— 致认真生活的你", y: "奶油底 + 手写体 + 诗集小花咖啡" },
  { t: "见字如面", s: "纸短情长", y: "信封米白 + 钢笔手写 + 邮票邮戳羽毛笔" },
  { t: "人间烟火气", s: "最抚凡人心", y: "暖橙灶火 + 手写体 + 小碗筷子灯笼" },
  { t: "日子滚烫", s: "人间可爱", y: "暖红底 + 圆体 + 小火苗笑脸" },
  { t: "三餐四季", s: "温柔有趣", y: "米黄底 + 温馨体 + 小碗四季花草" },
  // 节气 / 自然
  { t: "立春", s: "万物复苏时", y: "嫩芽绿底 + 细明体 + 柳枝草芽" },
  { t: "惊蛰", s: "春雷唤万物", y: "青灰底 + 楷体 + 闪电小虫嫩芽" },
  { t: "夏至", s: "日光最长的一天", y: "明黄底 + 清爽字 + 蝉鸣荷叶" },
  { t: "霜降", s: "秋深露重", y: "冷灰底 + 细体 + 霜叶残荷" },
  { t: "大雪", s: "天地苍茫", y: "素白底 + 清透字 + 雪花枯枝" },
  { t: "海上明月", s: "天涯此时", y: "深蓝底 + 宋体 + 明月海浪" },
  // 童趣 / 轻松
  { t: "猫肥家润", s: "有猫万事足", y: "奶油黄底 + 胖胖体 + 猫咪小鱼干" },
  { t: "好好吃饭", s: "天天开心", y: "暖橙底 + 圆体 + 小饭碗笑脸" },
  { t: "不许不开心", s: "快乐要按时", y: "柠檬黄底 + 活力体 + 小太阳彩带" },
  { t: "摸鱼快乐", s: "工位小确幸", y: "薄荷绿底 + 手写体 + 小鱼气泡" },
  { t: "今日份可爱", s: "请查收", y: "樱花粉底 + 软萌体 + 小爱心贴纸" },
  // 旅行 / 远方
  { t: "去更远的地方", s: "见更亮的光", y: "海蓝底 + 手写体 + 帆船飞鸟" },
  { t: "山河远阔", s: "人间星河", y: "青绿山水 + 宋体 + 远山云海" },
  { t: "在路上", s: "风来自远方", y: "灰蓝公路 + 做旧字 + 路标山峦" },
  { t: "去看看世界", s: "别困在原地", y: "天青底 + 轻快字 + 飞机云朵地图" },
  // 爱情 / 友情
  { t: "慢慢喜欢你", s: "很久很久", y: "藕粉底 + 手写体 + 小爱心月光" },
  { t: "一起看日落", s: "把黄昏留给你", y: "暖橘底 + 圆体 + 落日剪影双人椅" },
  { t: "老朋友", s: "好久不见", y: "牛皮纸底 + 手写体 + 咖啡杯旧照片" },
  { t: "顶峰相见", s: "— 致同行的人", y: "雪山蓝底 + 硬朗字 + 山峰旗帜" },
  // ── 世界名言 ──
  { t: "I think, therefore I am", s: "我思故我在 — 笛卡尔", y: "素白底 + 衬线英文 + 几何圆点，理性极简" },
  { t: "To be or not to be", s: "生存还是毁灭 — 莎士比亚", y: "深灰底 + 戏剧体字 + 幕布/骷髅剪影" },
  { t: "Veni, vidi, vici", s: "我来，我见，我征服 — 凯撒", y: "黑金底 + 罗马体 + 桂冠/柱式装饰" },
  { t: "Knowledge is power", s: "知识就是力量 — 培根", y: "米白底 + 粗衬线 + 书页/羽毛笔装饰" },
  { t: "The unexamined life is not worth living", s: "未经省察的人生不值得过 — 苏格拉底", y: "灰蓝底 + 细字 + 橄榄枝/石柱" },
  { t: "Man is born free", s: "人生而自由 — 卢梭", y: "天空蓝底 + 手写体 + 飞鸟/云影" },
  { t: "All that we see or seem", s: "所见所感皆一梦 — 爱伦·坡", y: "暗紫底 + 哥特字 + 乌鸦/月牙" },
  { t: "The only thing we have to fear is fear itself", s: "我们唯一恐惧的就是恐惧本身 — 罗斯福", y: "深蓝底 + 硬朗字 + 星条/灯塔" },
  { t: "Float like a butterfly, sting like a bee", s: "如蝶轻盈，如蜂致命 — 阿里", y: "黑金撞色 + 动感字 + 拳套/蝴蝶" },
  { t: "Imagination is more important than knowledge", s: "想象力比知识更重要 — 爱因斯坦", y: "深空底 + 公式纹理 + 星轨/齿轮" },
  { t: "This too shall pass", s: "这一切都会过去", y: "灰白底 + 细体 + 沙漏/流云" },
  { t: "No man is an island", s: "没有人是一座孤岛 — 邓恩", y: "海蓝底 + 手写体 + 孤岛/海鸥" },
  { t: "Carpe diem", s: "及时行乐 — 贺拉斯", y: "暖金底 + 拉丁衬线 + 日晷/花枝" },
  { t: "Fortune favors the bold", s: "幸运眷顾勇敢者 — 维吉尔", y: "赤红底 + 力量字 + 帆船/闪电" },
  { t: "Time is the wisest counselor", s: "时间是最睿智的顾问 — 普鲁塔克", y: "铜褐底 + 衬线 + 钟表/沙漏" },
  { t: "We are what we repeatedly do", s: "重复的行为造就了我们 — 亚里士多德", y: "米灰底 + 细黑体 + 齿轮/脚印序列" },
  // ── 知名诗词 ──
  { t: "长风破浪会有时", s: "直挂云帆济沧海 — 李白", y: "海蓝底 + 行草 + 浪涛/云帆" },
  { t: "天生我材必有用", s: "千金散尽还复来 — 李白", y: "墨金底 + 行书 + 山水/酒樽" },
  { t: "会当凌绝顶", s: "一览众山小 — 杜甫", y: "云灰底 + 楷书 + 群峰/孤松" },
  { t: "春眠不觉晓", s: "处处闻啼鸟 — 孟浩然", y: "嫩绿底 + 行楷 + 飞鸟/落花" },
  { t: "明月松间照", s: "清泉石上流 — 王维", y: "青灰底 + 淡墨 + 松月/山泉" },
  { t: "采菊东篱下", s: "悠然见南山 — 陶渊明", y: "米黄底 + 楷体 + 菊花/篱笆/远山" },
  { t: "但愿人长久", s: "千里共婵娟 — 苏轼", y: "深蓝底 + 宋体 + 圆月/桂花" },
  { t: "大江东去", s: "浪淘尽，千古风流人物 — 苏轼", y: "赭石底 + 行草 + 江涛/赤壁" },
  { t: "问渠那得清如许", s: "为有源头活水来 — 朱熹", y: "青绿底 + 楷书 + 溪流/源头石" },
  { t: "山重水复疑无路", s: "柳暗花明又一村 — 陆游", y: "青灰底 + 行书 + 山路/柳枝/村舍" },
  { t: "落红不是无情物", s: "化作春泥更护花 — 龚自珍", y: "暖红底 + 行楷 + 落花/新芽" },
  { t: "千磨万击还坚劲", s: "任尔东西南北风 — 郑燮", y: "竹青底 + 楷书 + 翠竹/风痕" },
  { t: "海内存知己", s: "天涯若比邻 — 王勃", y: "天青底 + 宋体 + 海天/飞雁" },
  { t: "欲穷千里目", s: "更上一层楼 — 王之涣", y: "暖黄底 + 楷书 + 高楼/远山" },
  { t: "停车坐爱枫林晚", s: "霜叶红于二月花 — 杜牧", y: "枫红底 + 行楷 + 枫叶/山路" },
  { t: "天街小雨润如酥", s: "草色遥看近却无 — 韩愈", y: "青绿底 + 细体 + 细雨/草芽" },
  { t: "不以物喜，不以己悲", s: "— 范仲淹《岳阳楼记》", y: "青灰底 + 楷书 + 洞庭波光/飞鸟" },
  { t: "落霞与孤鹜齐飞", s: "秋水共长天一色 — 王勃", y: "暖橙底 + 行书 + 落霞/孤鹜/秋水" },
  { t: "俱怀逸兴壮思飞", s: "欲上青天揽明月 — 李白", y: "墨蓝底 + 草书 + 明月/云气" },
  { t: "无意苦争春", s: "一任群芳妒 — 陆游《卜算子》", y: "梅红底 + 楷书 + 梅花/疏枝" },
  { t: "静以修身，俭以养德", s: "— 诸葛亮《诫子书》", y: "米白底 + 楷体 + 竹简/毛笔" },
];

function buildPrompt(x, idx) {
  return [
    `画布 canvas.setSize 3000x1376（比例2.18，长款鼠标垫印花）后设计一款名言/情绪文字鼠标垫，完成后必须调用 canvas.updateAndSaveSticker 保存，name 用「${x.t.slice(0, 12)}·${idx}」。`,
    `【核心构图·硬性】画面只有一段核心文案：主文案「${x.t}」必须精确落在画布几何正中心(50%,50%)，水平、垂直都居中；只对主文案容器用 position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)，禁止把「主文案+副文案」整体居中。副文案「${x.s}」挂在主文案正下方，整体仍保持视觉居中。`,
    `【极简风格·硬性】以简洁为主，只保留核心文案。严禁添加任何多余的装饰性文字：不要小号英文/拼音、不要编号/角标、不要印章落款文字、不要标语口号、不要副标题以外的任何文字。除主文案与副文案外，画面上不得出现其他文字。`,
    `【排版层级】主文案字号远大于副文案（主文案字高约为画布高度的 18-26%，副文案约为主文案的 1/4-1/3），主次分明、清晰可读；四周留出舒适的内边距（约画布宽高的 10-14%），不要挤满画面。`,
    `【背景与装饰】用克制的配色与极简背景（纯色或柔和渐变）；装饰最多是极淡的底纹或一两条细线，不要繁复图案、不要堆砌元素。`,
    `【主题风格】${x.y}`,
    `【多样性】配色与字体都要贴合本主题气质，不要套用固定模板。`,
    `严禁出现任何产品功能词（防滑/顺滑/材质/尺寸参数等）。用 canvas.addHtml 的 HTML/CSS 实现，字体通过 htmlBindings 绑定。`,
  ].join("\n");
}

async function mcp(tool, input, timeoutMs = 60_000) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tool, input }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const d = await res.json();
      const m = (d?.data?.messages || []).find((x) => x.role === "tool");
      return m?.toolResult?.data ?? m?.toolResult ?? d;
    } catch (e) {
      if (attempt === 2) return { phase: "error", success: false, error: e.message };
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
}

async function getTools() {
  const list = await mcp("system.design_tool.query_design_tools", { onlineOnly: true });
  return (list?.items || []).map((it) => it.clientId);
}

const RUN_START_MS = Date.now();

function stickerTimestamp(url) {
  const m = String(url || "").match(/(\d{13})_sticker/);
  return m ? Number(m[1]) : 0;
}

async function libItems() {
  try {
    const r = await fetch("http://127.0.0.1:1520/api/custom-sticker?page=1&pageSize=100", {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: AbortSignal.timeout(15000),
    });
    const d = await r.json();
    return (d?.data?.items || []).map((it) => ({ name: it.name || "", url: it.url || "" }));
  } catch {
    return [];
  }
}

// 只认「本轮开始之后新落库」的贴纸，避免命中历史同名贴纸导致虚报成功
function savedThisRun(items, name, prefix) {
  return items.some(
    (it) =>
      stickerTimestamp(it.url) >= RUN_START_MS &&
      (it.name === name || (prefix && it.name.startsWith(prefix))),
  );
}

async function waitIdle(connectionId, timeoutMs = 300_000) {
  const start = Date.now();
  let last = "";
  while (Date.now() - start < timeoutMs) {
    const st = await mcp("system.design_tool.get_agent_status", { connectionId }, 25_000);
    const status = st?.agentStatus?.status || st?.raw?.agentStatus?.status;
    if (status === "idle") return true;
    last = status || "unknown";
    // 僵死超过 90s 仍非 idle → 强制 stop 复位
    if (Date.now() - start > 90_000) {
      await mcp("system.design_tool.stop", { connectionId }, 25_000);
      await new Promise((r) => setTimeout(r, 3000));
    }
    await new Promise((r) => setTimeout(r, 10_000));
  }
  return false;
}

async function resetAgent(connectionId) {
  // 强制复位：stop 可解僵死 executing，再清会话
  await mcp("system.design_tool.stop", { connectionId }, 25_000).catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));
  await mcp("system.design_tool.clear_conversation", { connectionId }, 20_000).catch(() => {});
}

async function produceOne(connectionId, x, idx) {
  const saveName = `${x.t.slice(0, 12)}·${idx}`;
  const prefix = x.t.slice(0, 6);
  const inLib = async () => savedThisRun(await libItems(), saveName, prefix);

  // 发送前等空闲，避免 rejected
  await waitIdle(connectionId, 240_000);

  // 强制复位（stop + clear）
  await resetAgent(connectionId);

  let res = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const sent = await mcp("system.design_tool.send_task", { connectionId, message: buildPrompt(x, idx) }, 30_000);
    if (!sent?.requestId) {
      await new Promise((r) => setTimeout(r, 10_000 * attempt));
      continue;
    }
    res = await mcp("system.design_tool.wait_result", { requestId: sent.requestId, timeoutMs: 300_000 }, 330_000);
    if (res?.phase !== "rejected" && res?.phase !== "error" && res?.phase !== "timeout") break;
    await waitIdle(connectionId, 180_000);
    await resetAgent(connectionId);
    await new Promise((r) => setTimeout(r, 8_000 * attempt));
  }

  // 判定：outputs 有 或 库中已存在
  if ((res?.outputs || []).length > 0) return { ok: true, via: "outputs" };
  if (await inLib()) return { ok: true, via: "lib" };

  // 未保存 → 补存（最多 2 次）
  for (let retry = 1; retry <= 2; retry++) {
    await resetAgent(connectionId);
    const s2 = await mcp("system.design_tool.send_task", {
      connectionId,
      message: `画布上已有完整设计。请只调用 canvas.updateAndSaveSticker 保存，name 用「${saveName}」，不要做其他修改。`,
    }, 30_000);
    if (s2?.requestId) {
      const r2 = await mcp("system.design_tool.wait_result", { requestId: s2.requestId, timeoutMs: 150_000 }, 180_000);
      if ((r2?.outputs || []).length > 0) return { ok: true, via: `save_retry${retry}` };
    }
    if (await inLib()) return { ok: true, via: `lib_retry${retry}` };
    await new Promise((r) => setTimeout(r, 5000));
  }
  return { ok: false, phase: res?.phase };
}

async function main() {
  log(`🚀 持续生产启动：目标 ${TARGET} 张 · 并发 ${CONCURRENCY} · 主题池 ${THEMES.length}`);

  let produced = 0;
  let attempt = 0;
  let idx = 1;

  while (produced < TARGET) {
    const tools = await getTools();
    if (tools.length === 0) {
      log("⏳ 无在线设计端，30s 后重试…");
      await new Promise((r) => setTimeout(r, 30_000));
      continue;
    }
    const batch = tools.slice(0, CONCURRENCY);
    const jobs = batch.map((id, i) => {
      const x = THEMES[(attempt * CONCURRENCY + i) % THEMES.length];
      return produceOne(id, x, idx + i).then((r) => ({ x, id, r }));
    });
    const results = await Promise.allSettled(jobs);
    for (const s of results) {
      if (s.status === "fulfilled" && s.value.r.ok) {
        produced++;
        log(`✅ [${produced}/${TARGET}] 「${s.value.x.t.slice(0, 14)}」via ${s.value.r.via}`);
      } else {
        const v = s.status === "fulfilled" ? s.value : null;
        log(`❌ 失败: ${v ? `「${v.x.t.slice(0, 14)}」${v.r.reason || v.r.phase || ""}` : s.reason?.message}`);
      }
    }
    idx += batch.length;
    attempt++;
    log(`── 进度 ${produced}/${TARGET} ──`);
  }
  log(`🎉 达成目标：${produced} 张`);
}

main().catch((e) => log(`致命错误: ${e.stack || e.message}`));
