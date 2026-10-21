import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const API = "http://127.0.0.1:1520";
const ARTIFACT_DIR = "/Users/jackie/.gemini/antigravity-ide/brain/f03c01e6-05ed-4ff8-ae7f-44440566c479";

async function mcp(tool, input, timeoutMs = 300000) {
  const res = await fetch(`${API}/api/ai-assistant/tools/execute`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ tool, input }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const d = await res.json();
  const m = (d?.data?.messages || []).find((x) => x.role === "tool");
  return m?.toolResult?.data ?? m?.toolResult ?? d;
}

// 针对存在遮挡/裁切隐患的设计进行专项优化更新
const OPTIMIZATIONS = [
  {
    key: "maintain_passion",
    connId: "designtool-mvhgvxjh-odabc7",
    saveName: "保持热爱·治愈日落手写桌垫·优化版",
    brief: `请优化当前画布上的「保持热爱 奔赴山海」治愈日落手写桌垫，重点解决【右侧字被裁切、文字遮挡】的问题：

## 核心优化要求（彻底根除遮挡与裁切）
1. 画布锁定 1800×800 像素，禁止使用 canvas.smartSize
2. 主文案「保持热爱 奔赴山海」共 8 个汉字，宽度较长：
   - 严禁在主文案元素自身上设置 overflow:hidden、text-overflow:clip 或 text-overflow:ellipsis！
   - 字号调整为 calc(var(--canvas-html-vh) * 18)（单字约 144px，8 字总宽约 1150px），确保左右两端与星芒装饰预留充足呼吸留白（两侧各留至少 250px）
   - 两侧星芒与微波浪装饰使用 flex: 0 0 auto，间距 gap: 40px，整体居中
3. 顶部副标「CHERISH EVERY MOMENT · LIVE WITH PASSION」置于 top: 13%，字号 calc(var(--canvas-html-vh) * 5.5)
4. 底部副标「日落尤其温柔 · 人间皆是浪漫 · 追光的人终会身披万丈光芒」置于 bottom: 13%，字号 calc(var(--canvas-html-vh) * 5.5)
5. 主文案垂直绝对居中（top: 50%; transform: translateY(-50%)），与上下副标纵向留出至少 12% 安全留白，绝对不发生任何文字碰撞或重叠！
6. 严格保留模板变量：{{text.title}}, {{text.subtitleTop}}, {{text.subtitleBottom}}, {{color.bg.css}}, {{color.sunset.css}}, {{color.cream.css}}, {{font.hero.family}}，并在 htmlBindings 中保留默认值
7. 立即用一个完整的 canvas.addHtml 替换，随后调用 canvas.updateAndSaveSticker 保存，name 用「保持热爱·治愈日落手写桌垫·优化版」`
  },
  {
    key: "keep_calm",
    connId: "designtool-mvhgvyc9-3df3hd",
    saveName: "KEEP CALM·极客终端代码桌垫·优化版",
    brief: `请优化当前画布上的「KEEP CALM & GIT PUSH」极客终端代码桌垫，重点解决【主标题文字与左右二进制代码流重叠碰撞】的问题：

## 核心优化要求（彻底根除遮挡与碰撞）
1. 画布锁定 1800×800 像素，禁止使用 canvas.smartSize
2. 划定中央安全工作区（Safe Zone）：
   - 左右两侧二进制代码流固定在 left: 2% (宽 60px) 与 right: 2% (宽 60px)
   - 主标题与上下命令全部限制在中央安全区内：left: 140px; right: 140px; 绝对不允许接触或重叠到两侧代码流！
3. 主标题「KEEP CALM & GIT PUSH」有 20 个字符：
   - 字号调优为 calc(var(--canvas-html-vh) * 19)（约 150px），确保 20 个字符在中央安全区内完美居中，两端与代码流保持至少 100px 呼吸间距！
   - 末尾光标 ▋ 呼吸灯发光，禁止在文字元素上写 overflow:hidden / text-overflow:clip
4. 顶部 git 指令置于 top: 14%，left: 140px; right: 140px; 居中，与左上角 macOS 红黄绿圆点彻底拉开距离，绝不重叠
5. 底部构建状态置于 bottom: 14%，left: 140px; right: 140px; 居中，与左下快捷键 [⌘+S] [⌘+ENTER]、右下分支 • main* 错开布局
6. 严格保留模板变量：{{text.title}}, {{text.subtitleTop}}, {{text.subtitleBottom}}, {{color.bg.css}}, {{color.green.css}}, {{color.cyan.css}}, {{font.hero.family}}
7. 立即用一个完整的 canvas.addHtml 替换，随后调用 canvas.updateAndSaveSticker 保存，name 用「KEEP CALM·极客终端代码桌垫·优化版」`
  },
  {
    key: "zhixing",
    connId: "designtool-mvhh19cx-bs0jg7",
    saveName: "知行合一·黑金心学艺术字桌垫·优化版",
    brief: `请优化当前画布上的「知行合一」黑金心学艺术字桌垫，重点解决【主标题与左右印章间距过窄、边框线距离过近】的问题：

## 核心优化要求（彻底根除遮挡与局促感）
1. 画布锁定 1800×800 像素，禁止使用 canvas.smartSize
2. 划定两侧印章与中央文字的安全隔离区：
   - 左侧印章列「致」「良」「知」固定在 left: 5%，总宽约 90px
   - 右侧印章列「立」「德」「功」固定在 right: 5%，总宽约 90px
   - 外围烫金矩形框边距内缩 inset: 26px，印章与烫金边框留出 20px 间距，绝对不压线
3. 中央主文案「知行合一」限制在 left: 220px; right: 220px; 区域内居中：
   - 字号采用 calc(var(--canvas-html-vh) * 28)（约 224px），在 1360px 安全区内黄金比例居中，两侧各有 180px 宽敞气韵留白，绝不挤压印章！
   - 严禁使用多层 absolute 文字层重叠（防止基线微差文字发虚），改用同一个主标题元素的优雅多段 text-shadow: 0 4px 0 #7A531C, 0 8px 16px rgba(0,0,0,0.8), 0 0 25px rgba(245,215,127,0.35)
4. 严格保留全部模板变量绑定
5. 立即用一个完整的 canvas.addHtml 替换，随后调用 canvas.updateAndSaveSticker 保存，name 用「知行合一·黑金心学艺术字桌垫·优化版」`
  }
];

async function main() {
  console.log("================================================================================");
  console.log("🛠️ 针对文字遮挡/裁切隐患进行专项自适应防碰撞优化");
  console.log("================================================================================");

  const promises = OPTIMIZATIONS.map(async (opt, idx) => {
    const t0 = Date.now();
    console.log(`🚀 [Worker ${idx + 1}] 派发优化任务: ${opt.saveName} -> ${opt.connId}`);
    const res = await mcp("system.design_tool.run_task", {
      connectionId: opt.connId,
      message: opt.brief,
      executionMode: "automatic",
      timeoutMs: 300000,
    }, 320000);

    const duration = Math.round((Date.now() - t0) / 1000);
    console.log(`✅ [Worker ${idx + 1}] 优化完成，耗时 ${duration}s`);
    
    // 下载更新后的贴纸图片
    const stickerUrl = res?.outputs?.[0]?.url;
    if (stickerUrl) {
      const resp = await fetch(stickerUrl);
      const buf = Buffer.from(await resp.arrayBuffer());
      const dest = join(ARTIFACT_DIR, `artistic_mousepad_${opt.key}_fixed.png`);
      writeFileSync(dest, buf);
      console.log(`   📸 新版图片已保存: ${dest} (${Math.round(buf.length / 1024)} KB)`);
    }

    return {
      key: opt.key,
      name: opt.saveName,
      connId: opt.connId,
      duration,
      output: res?.outputs?.[0],
    };
  });

  const results = await Promise.all(promises);
  console.log("\n优化结果汇总:", JSON.stringify(results, null, 2));
}

main().catch(console.error);
