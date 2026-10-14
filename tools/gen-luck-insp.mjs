// 追加「招财好运」主题灵感：发财 / 好运 / 转运 / 赚钱 / 暴富 / 锦鲤 …
// 用法: node tools/gen-luck-insp.mjs  → 追加进 tools/insp-pool.json
import { readFileSync, writeFileSync } from "fs";

const LUCK = [
  { t: "发财·锦鲤", s: "好运正在派送中", motif: "一条红金色锦鲤跃出水面、周围漂着金币与水花", color: "朱红到暖金", mood: "喜庆招财" },
  { t: "好运连连", s: "好事正在路上", motif: "层叠的祥云与飘落的金箔、四叶草点缀", color: "暖金到浅杏", mood: "温暖顺利" },
  { t: "转运·四叶草", s: "风向转好的那天", motif: "一株发光的四叶草与飞舞的光点、微风线条", color: "薄荷绿到奶油白", mood: "清新幸运" },
  { t: "暴富·金元宝", s: "闷声发大财", motif: "一摞金元宝与散落的铜钱、光芒四射", color: "暗金到赭红", mood: "富贵气派" },
  { t: "财神到", s: "请接住这波福气", motif: "一个憨态可掬的财神剪影与元宝、红灯笼", color: "正红到烫金", mood: "热闹吉祥" },
  { t: "日进斗金", s: "每天都有好收成", motif: "一只装满金币的布袋与麦穗、小钱袋", color: "暖棕到奶黄", mood: "踏实丰盈" },
  { t: "水逆退散", s: "不顺心的事都走开", motif: "一颗发光的扫把星划过夜空、水波散开", color: "深蓝到银白", mood: "清爽解气" },
  { t: "万事顺遂", s: "所愿皆所得", motif: "层叠祥云、一只小舟顺流而下、远山", color: "青绿到雾白", mood: "从容顺利" },
  { t: "步步高升", s: "一步一个台阶", motif: "蜿蜒向上的石阶与山巅初阳、飞鸟", color: "暖金到天青", mood: "上进开阔" },
  { t: "躺赚·小金库", s: "钱会自己找上门", motif: "一只戴墨镜的小猪存钱罐躺在金币堆上", color: "奶油粉到暖黄", mood: "轻松俏皮" },
  { t: "钱途无量", s: "路越走越宽", motif: "一条铺满金币的路通向远方、路旁小树", color: "橙金到浅棕", mood: "明亮开阔" },
  { t: "好运爆棚", s: "今天也是好日子", motif: "一束彩带喷出、飘落的彩纸与小星星", color: "柠檬黄到浅粉", mood: "欢快热闹" },
  { t: "财运亨通", s: "四方来财", motif: "四枚铜钱与流云纹、中央聚宝盆", color: "赭红到暗金", mood: "经典招财" },
  { t: "诸事皆宜", s: "今天什么都刚刚好", motif: "一张撕开的日历页与阳光、小花", color: "米白到暖黄", mood: "轻快日常" },
  { t: "招财进宝", s: "小财神已就位", motif: "一只金蟾叼着铜钱、身旁元宝与荷叶", color: "墨绿到鎏金", mood: "富贵雅致" },
  { t: "时来运转", s: "风车转来好运气", motif: "一架彩色小风车与飘动的彩带、蒲公英", color: "天蓝到浅橙", mood: "灵动轻盈" },
  { t: "锦鲤附体", s: "好运都是你的", motif: "两条锦鲤环绕游动、水草与气泡", color: "靛蓝到橘金", mood: "灵动喜庆" },
  { t: "福气满满", s: "把福气带回家", motif: "一只鼓鼓的红福袋与飘散的福字纹样（以图案形式呈现）", color: "正红到米白", mood: "喜庆圆满" },
  { t: "闷声发财", s: "低调，但有钱", motif: "一只低调的黑金钱夹与几枚金币、暗纹", color: "哑黑到暗金", mood: "克制高级" },
  { t: "一路生花", s: "沿途都是好风景", motif: "一条开满小花的小径延伸向远方、蝴蝶", color: "嫩绿到浅粉", mood: "清新治愈" },
  { t: "天上掉钱", s: "接住这波好运", motif: "从天而降的金币雨与小云朵、星星", color: "暖黄到浅蓝", mood: "活泼好笑" },
  { t: "收钱收到手软", s: "钱包鼓鼓的", motif: "一只鼓起的钱包与溢出的钞票、小金币", color: "柠檬绿到奶白", mood: "轻松欢快" },
  { t: "偏财运爆棚", s: "意外之喜在路上", motif: "一盏发光的马灯照亮宝箱、星光点点", color: "深紫到鎏金", mood: "神秘好运" },
  { t: "所求皆如愿", s: "许愿都灵", motif: "一盏孔明灯缓缓升空、星夜与远山", color: "墨蓝到暖橙", mood: "浪漫期许" },
];

const AVOID = "不要出现与主题无关的杂乱填充文字（无意义编号、水印、乱码英文）。";

const items = LUCK.map(({ t, s, motif, color, mood }) => ({
  title: t,
  content: `做一张招财好运主题的设计：${color}底，画${motif}，气质${mood}，画面饱满有氛围、不要大片纯色空白，适合用于鼠标垫/收纳袋/文具袋等印花。`,
  category: "招财好运",
  keywords: ["招财", "好运", "发财", "转运", motif.split("、")[0], mood],
  promptHints: `主文案「${t}」，副文案「${s}」；${color}底、贴合${mood}气质的字体；主文案的几何中心必须落在画布正中心(50%,50%)，只对主文案容器用 translate(-50%,-50%)，副文案挂在主文案正下方，不要把主+副整体居中；背景至少三层（渐变底 + 纹理肌理 + 至少两个具象插画/光影），画面丰富有层次。`,
  avoidNotes: "不要产品功能词；不要大面积纯色空白；" + AVOID,
}));

const path = new URL("./insp-pool.json", import.meta.url);
const pool = JSON.parse(readFileSync(path, "utf-8"));
const titles = new Set(pool.map((x) => x.title));
const added = items.filter((x) => !titles.has(x.title));
const merged = [...pool, ...added];
writeFileSync(path, JSON.stringify(merged, null, 2));
console.log(`招财好运灵感：新增 ${added.length} 条，池内共 ${merged.length} 条`);
const byCat = {};
merged.forEach((x) => (byCat[x.category] = (byCat[x.category] || 0) + 1));
console.log(byCat);
