import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const API = "http://127.0.0.1:1520";
const ARTIFACT_DIR = "/Users/jackie/.gemini/antigravity-ide/brain/f03c01e6-05ed-4ff8-ae7f-44440566c479";
const PROGRESS_FILE = join(ARTIFACT_DIR, "continuous_mousepad_progress.json");

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

const THEMES = [
  {
    key: "beyond_boundaries",
    name: "「无界 / BEYOND」极简黑白先锋构成艺术字桌垫",
    title: "BEYOND BOUNDARIES",
    subtitleTop: "CONSTRUCTIVISM & AVANT-GARDE · SERIES 01",
    subtitleBottom: "探索未知的无畏边界 · DISCOVER THE UNSEEN ↗",
    fontQuery: "黑体",
    fontCategory: "sans",
    charsCount: 17,
    palette: {
      bg: "#101114",
      primary: "#F5F6F8",
      accent: "#FF453A",
      muted: "#8A8D96",
    },
    styleDetails: "纯粹高对比黑白构成，主文案采用全大写粗体无衬线，字号 calc(var(--canvas-html-vh) * 20)。顶部与底部为精密标尺辅助线与鲜红几何点缀，左右划定 18% 安全区。",
  },
  {
    key: "water_and_cloud",
    name: "「行到水穷处 坐看云起时」东方青碧水墨禅意艺术字桌垫",
    title: "行到水穷处 坐看云起时",
    subtitleTop: "WANG WEI · ZEN POETRY OF TANG DYNASTY",
    subtitleBottom: "任凭风浪起 · 稳坐钓鱼台 · 静观万物皆自得",
    fontQuery: "行楷",
    fontCategory: "calligraphy",
    charsCount: 10,
    palette: {
      bg: "#121A1A",
      primary: "#79C5B4",
      accent: "#E2C07D",
      muted: "#88A3A0",
    },
    styleDetails: "东方青碧山水墨意，主文案 10 字采用行楷书法，字号 calc(var(--canvas-html-vh) * 16)。中央安全区 left: 16%; right: 16%，两侧配以极简水纹与云气细线，古意深远。",
  },
  {
    key: "future_is_now",
    name: "「FUTURE IS NOW」Y2K 液态银电流光艺术字桌垫",
    title: "FUTURE IS NOW",
    subtitleTop: "CYBER MATRIX // QUANTUM CORE 2026",
    subtitleBottom: "DIGITAL HUMANITY · BEYOND PHYSICAL HORIZON",
    fontQuery: "黑体",
    fontCategory: "sans",
    charsCount: 13,
    palette: {
      bg: "#0A0D18",
      primary: "#E0E8FF",
      accent: "#00F0FF",
      magenta: "#FF007F",
    },
    styleDetails: "Y2K 液态金属科技感，主文字带赛博电光青与品红双色微发光投影，字号 calc(var(--canvas-html-vh) * 21)。四周装饰十字准星与科技坐标角标。",
  },
  {
    key: "dadao_zhijian",
    name: "「大道至简」极简金石朱砂印章国风艺术字桌垫",
    title: "大道至简",
    subtitleTop: "LAO TZU · TAO TE CHING CLASSIC",
    subtitleBottom: "万物之始 · 大道至简 · 衍化至繁 · 复归于朴",
    fontQuery: "毛笔",
    fontCategory: "calligraphy",
    charsCount: 4,
    palette: {
      bg: "#161618",
      primary: "#F6D386",
      accent: "#C83232",
      muted: "#A0A0A4",
    },
    styleDetails: "古典深玄黑宣纸底纹，主文案「大道至简」金石榜书大字，字号 calc(var(--canvas-html-vh) * 28)。左右对称朱砂金印「抱朴」「守拙」，外围细金线边框内缩 28px。",
  },
  {
    key: "hello_world",
    name: "「HELLO WORLD」纯净暗黑等宽代码艺术字桌垫",
    title: "HELLO WORLD //",
    subtitleTop: "console.log(\"Stay curious, stay inspired\");",
    subtitleBottom: "exit code: 0 · 0 warnings · memory clean",
    fontQuery: "黑体",
    fontCategory: "sans",
    charsCount: 14,
    palette: {
      bg: "#0E1117",
      primary: "#58A6FF",
      accent: "#3FB950",
      muted: "#7D8590",
    },
    styleDetails: "VS Code 极客现代终端风，主文字采用等宽科技大字，带语法高亮蓝与浅蓝发光光晕，字号 calc(var(--canvas-html-vh) * 20)。顶部左侧 macOS 窗口三色圆点，两翼预留 150px 安全缓冲。",
  },
  {
    key: "slow_life",
    name: "「慢生活 听风吹」森系温润手写文艺艺术字桌垫",
    title: "慢生活 听风吹",
    subtitleTop: "BREATHE DEEPLY · ENJOY THE LITTLE THINGS",
    subtitleBottom: "去吹吹晚风吧 · 人间忽晚 · 山河已秋",
    fontQuery: "手写",
    fontCategory: "calligraphy",
    charsCount: 6,
    palette: {
      bg: "#1C2422",
      primary: "#A3D9C9",
      accent: "#F2D0A4",
      muted: "#849B95",
    },
    styleDetails: "森系墨绿微渐变，舒缓手写大字，字号 calc(var(--canvas-html-vh) * 19)。两侧点缀手绘极简松针与微风流线，视觉舒适治愈护眼。",
  },
  {
    key: "think_different",
    name: "「THINK DIFFERENT」极简致敬无衬线大字桌垫",
    title: "THINK DIFFERENT",
    subtitleTop: "HERE'S TO THE CRAZY ONES · THE MISFITS",
    subtitleBottom: "THE ONES WHO SEE THINGS DIFFERENTLY ↗",
    fontQuery: "黑体",
    fontCategory: "sans",
    charsCount: 15,
    palette: {
      bg: "#141517",
      primary: "#FFFFFF",
      accent: "#30D158",
      muted: "#86868B",
    },
    styleDetails: "经典极简无衬线大字排版，字号 calc(var(--canvas-html-vh) * 20)。极度干净的纯黑底与高质感纯白字，中央安全区无任何多余杂色干扰。",
  },
  {
    key: "shun_sui",
    name: "「顺遂无虞 皆得所愿」新中式朱砂描金祈福桌垫",
    title: "顺遂无虞 皆得所愿",
    subtitleTop: "PEACE & PROSPERITY IN ALL SEASONS",
    subtitleBottom: "愿新年 · 胜旧年 · 岁岁常欢愉 · 年年皆胜意",
    fontQuery: "行楷",
    fontCategory: "calligraphy",
    charsCount: 8,
    palette: {
      bg: "#1E1214",
      primary: "#F8CF7A",
      accent: "#D63434",
      muted: "#D0AA66",
    },
    styleDetails: "故宫朱砂玄暗底，行楷吉祥大字，字号 calc(var(--canvas-html-vh) * 17)。左右对角祥云金纹，严格限制在 left: 16%; right: 16% 内，确保文字不压角纹。",
  },
  {
    key: "vaporwave_1984",
    name: "「VAPORWAVE // 1984」粉紫霓虹复古蒸汽波桌垫",
    title: "VAPORWAVE 1984",
    subtitleTop: "SYNTHPOP MEMORIES // CASSETTE DECK ACTIVE",
    subtitleBottom: "MIDNIGHT DRIVE · RETRO HORIZON SUNSET ↗",
    fontQuery: "黑体",
    fontCategory: "sans",
    charsCount: 15,
    palette: {
      bg: "#120D22",
      primary: "#FF71CE",
      accent: "#01CDFE",
      muted: "#B967FF",
    },
    styleDetails: "80年代复古合成波，霓虹粉与青蓝立体发光字，透视网格地平线与低保真落日圆盘，字号 calc(var(--canvas-html-vh) * 20)。",
  },
  {
    key: "cheng_feng",
    name: "「乘风破浪」霸气狂草金墨海浪艺术字桌垫",
    title: "乘风破浪",
    subtitleTop: "BRAVE THE WIND AND CONQUER THE WAVES",
    subtitleBottom: "直挂云帆济沧海 · 行稳致远 · 步履不停",
    fontQuery: "毛笔",
    fontCategory: "calligraphy",
    charsCount: 4,
    palette: {
      bg: "#0E131C",
      primary: "#FAD074",
      accent: "#4A90E2",
      muted: "#9CB3CC",
    },
    styleDetails: "深邃沧海暗蓝渐变，狂气草书大字「乘风破浪」，字号 calc(var(--canvas-html-vh) * 28)。左右水浪细线与金色浪花印章，绝不压字。",
  }
];

function buildBrief(theme) {
  return `请设计一款全新的「${theme.name}」高端艺术字鼠标垫/桌垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 canvas.smartSize 或其他尺寸，尺寸已锁定。

## 防遮挡与防裁切核心规范（必须严格执行）
1. 划定中央安全工作区（Safe Zone）：
   - 中央主体文字容器必须限制在 left: 16%; right: 16%; width: 68%; 内居中，杜绝与左右两翼装饰碰撞！
   - 严禁在文字元素上直接写 overflow:hidden、text-overflow:clip 或 text-overflow:ellipsis 强行切字！
2. 字数自适应字号：
   - 主文案「${theme.title}」（字符数: ${theme.charsCount}）：字号必须合理适配，${theme.charsCount > 6 ? '长文本字号控制在 calc(var(--canvas-html-vh) * 16~18)' : '字号控制在 calc(var(--canvas-html-vh) * 26~28)'}，两端预留充足呼吸留白。
3. 投影与立体层级：
   - 优先使用同一个文字元素的 text-shadow（如多段 text-shadow: 0 4px 0 ..., 0 8px 16px ...），严禁多层 absolute 文本重叠产生阴影发虚遮挡。
4. 上下副标垂直避让：
   - 顶部副标置于 top: 13%，字号 calc(var(--canvas-html-vh) * 5.5)；
   - 底部副标置于 bottom: 13%，字号 calc(var(--canvas-html-vh) * 5.5)；
   - 主标题垂直居中，上下与副标留出至少 10% 间隙，绝不上下挤压重叠。

## 文案与变量化要求（右侧属性面板一键修改）
- 主文案使用 {{text.title}}，默认值 "${theme.title}"
- 顶部副文案使用 {{text.subtitleTop}}，默认值 "${theme.subtitleTop}"
- 底部副文案使用 {{text.subtitleBottom}}，默认值 "${theme.subtitleBottom}"
- 主文字颜色使用 {{color.primary.css}}，默认值 { color: "${theme.palette.primary}", type: "pure" }
- 背景底色使用 {{color.bg.css}}，默认值 { color: "${theme.palette.bg}", type: "pure" }
- 强调色使用 {{color.accent.css}}，默认值 { color: "${theme.palette.accent}", type: "pure" }
- 字体使用 {{font.hero.family}} 绑定检索到的匹配字库
- 在 htmlTemplateFields 中声明对应中文 label

## 风格细节
${theme.styleDetails}

## 执行步骤
1. 不要检索其他贴纸，本设计为全新原创定制
2. 第一步调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
3. resource.searchFont({ query: "${theme.fontQuery}", category: "${theme.fontCategory}" }) 检索匹配字体，绑定为 font.hero
4. 立即用一个完整的 canvas.addHtml 实现完整画面（必须采用上述模板变量和 htmlBindings，字字忠实，禁止硬编码文字）
5. 确认无误后立即调用 canvas.updateAndSaveSticker 保存，名称为「${theme.name}」`;
}

async function getIdleDesignTools() {
  const dtRes = await mcp("system.design_tool.query_design_tools", { onlineOnly: true }, 30000);
  const items = dtRes?.items || [];
  return items.filter(i => !i.isDesigning && i.batchStatus === "idle");
}

async function runWorker(theme, connId) {
  const t0 = Date.now();
  console.log(`\n🚀 派发任务: ${theme.name} -> ${connId}`);
  const brief = buildBrief(theme);

  try {
    await mcp("system.design_tool.clear_conversation", { connectionId: connId }, 15000).catch(() => {});
    const runRes = await mcp("system.design_tool.run_task", {
      connectionId: connId,
      message: brief,
      executionMode: "automatic",
      timeoutMs: 600000,
    }, 620000);

    const duration = Math.round((Date.now() - t0) / 1000);
    const sticker = runRes?.outputs?.[0];
    console.log(`✅ [${theme.key}] 制作完成，耗时 ${duration}s`);
    if (sticker?.url) {
      console.log(`   🏷️ 贴纸名称: ${sticker.name}`);
      console.log(`   🔗 COS 地址: ${sticker.url}`);
    }

    // 下载贴纸保存至本地供画廊与审查
    let localPath = null;
    if (sticker?.url) {
      try {
        const resp = await fetch(sticker.url);
        const buf = Buffer.from(await resp.arrayBuffer());
        localPath = join(ARTIFACT_DIR, `artistic_mat_${theme.key}.png`);
        writeFileSync(localPath, buf);
        console.log(`   📸 图片已下载: ${localPath} (${Math.round(buf.length / 1024)} KB)`);
      } catch (e) {
        console.error(`   ⚠️ 图片下载失败: ${e.message}`);
      }
    }

    return {
      success: true,
      key: theme.key,
      name: theme.name,
      connId,
      duration,
      stickerId: sticker?.customStickerId,
      url: sticker?.url,
      localPath,
    };
  } catch (err) {
    const duration = Math.round((Date.now() - t0) / 1000);
    console.error(`❌ [${theme.key}] 失败: ${err.message} (${duration}s)`);
    return {
      success: false,
      key: theme.key,
      name: theme.name,
      connId,
      duration,
      error: err.message,
    };
  }
}

async function main() {
  console.log("================================================================================");
  console.log("🔄 艺术字鼠标垫/桌垫 持续批量自动化生产与质检流水线启动");
  console.log("================================================================================");

  let themeIndex = 0;
  const history = existsSync(PROGRESS_FILE) ? JSON.parse(readFileSync(PROGRESS_FILE, "utf-8")) : [];
  const activeWorkers = new Map(); // connId -> promise

  const TOTAL_TARGET = Number(process.env.TARGET_COUNT) || 10;
  console.log(`🎯 本轮计划持续生产 target: ${TOTAL_TARGET} 款艺术字桌垫\n`);

  while (history.filter(h => h.success).length < TOTAL_TARGET && themeIndex < THEMES.length) {
    const idleTools = await getIdleDesignTools();
    const available = idleTools.filter(t => !activeWorkers.has(t.clientId));

    if (available.length === 0 && activeWorkers.size === 0) {
      console.log("⏳ 无空闲设计端，等待 20s...");
      await new Promise(r => setTimeout(r, 20000));
      continue;
    }

    for (const tool of available) {
      if (themeIndex >= THEMES.length) break;
      const theme = THEMES[themeIndex++];
      const connId = tool.clientId;

      const p = runWorker(theme, connId).then(res => {
        history.push(res);
        writeFileSync(PROGRESS_FILE, JSON.stringify(history, null, 2));
        activeWorkers.delete(connId);
        console.log(`📊 当前完成进度: [${history.filter(h => h.success).length}/${TOTAL_TARGET}]`);
        return res;
      });

      activeWorkers.set(connId, p);
    }

    if (activeWorkers.size > 0) {
      // 等待其中任意一个完成再继续下一轮调度
      await Promise.race(activeWorkers.values());
    }
  }

  // 等待剩余活跃任务全部收敛
  if (activeWorkers.size > 0) {
    console.log(`⏳ 等待最后 ${activeWorkers.size} 个任务收敛...`);
    await Promise.all(activeWorkers.values());
  }

  console.log("\n================================================================================");
  console.log(`🎉 持续生产测试完成！累计产出: ${history.filter(h => h.success).length} 款`);
  console.log("================================================================================");
  writeFileSync(PROGRESS_FILE, JSON.stringify(history, null, 2));
}

main().catch(console.error);
