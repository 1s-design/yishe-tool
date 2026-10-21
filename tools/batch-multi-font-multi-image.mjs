/**
 * 批量多字体 + 多图自由创意组合设计测试流水线
 * 运行方式: node tools/batch-multi-font-multi-image.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const API = "http://127.0.0.1:1520";
const ARTIFACT_DIR = "/Users/jackie/.gemini/antigravity-ide/brain/1ec7ed9a-9c75-4d45-a077-13c2ab6322ee";
const PROGRESS_FILE = join(ARTIFACT_DIR, "batch_multi_font_image_progress.json");

async function mcp(tool, input, timeoutMs = 600000) {
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

const MULTI_THEMES = [
  {
    key: "tokyo_diner",
    name: "「深夜食堂 · 慢调人间」日系复古居酒屋多图多字体桌垫",
    title: "深夜食堂",
    titleEn: "LATE NIGHT DINER · TOKYO RETRO NOSTALGIA",
    subtitleTop: "OPEN 22:00 - 05:00 · FRESH DAILY NOODLE & SAKE",
    subtitleBottom: "一碗温热治愈风尘仆仆 · 人间烟火气最抚凡人心 ↗",
    images: {
      hero: {
        id: "e7f7b113-edac-4ec2-b3a6-cc36d872f80e",
        name: "黑猫水下观鱼萌插画",
        url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-09-16/1789731052909_WXW3913.jpg",
      },
      sub: {
        id: "1baa3c8f-1768-46d4-aa90-e4fe890f8106",
        name: "好运锦鲤游水卡片",
        url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-07-02/1782943270275_hengyouxin_330584868994301952.jpg",
      },
    },
    fonts: {
      hero: {
        id: "48d3ba0d-8838-4ab4-8956-fe452b48d0e2",
        name: "LXGW WenKai TC Light",
        family: "LXGW WenKai TC Light",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129906653_LXGW_WenKai_TC_Light.ttf",
      },
      sub: {
        id: "13eda435-f6bb-4404-b042-046a62ac1933",
        name: "Segoe UI Bold",
        family: "Segoe UI Bold",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5_jackie/font-template/20260710/1783637097357_j0wvpq_segoeuib.ttf",
      },
    },
    palette: {
      bg: "#181413",
      primary: "#FFE4B8",
      accent: "#FF6F59",
      subText: "#A3978E",
    },
    layoutGuide: `【日系复古双图画廊布局】：
- 左侧文字区（left: 6%; width: 44%）：
  - 顶部英日排版用 {{font.sub.family}} 呈现「{{text.subtitleTop}}」
  - 主标「{{text.title}}」用书法手写体 {{font.hero.family}}，字号 calc(var(--canvas-html-vh) * 26)，温润质感
  - 底部副标用 {{text.subtitleBottom}}，配暖红日式印章「治愈」
- 右侧双图复合区（left: 52%; right: 5%）：
  - 主图卡片使用 {{image.hero.url}}，圆角卡片（border-radius: 20px; box-shadow: 0 16px 36px rgba(0,0,0,0.6)）
  - 副图微卡使用 {{image.sub.url}}，以拍立得/微错层方式呈现在右下角（如旋转 -3deg，圆角 14px，带细白描边），构成双图呼应
  - 严禁任何文字压盖右侧图片！左右层次分明。`,
  },
  {
    key: "dragon_and_landscape",
    name: "「山海腾龙 · 祥瑞华章」东方双联水墨多图多字体桌垫",
    title: "山海腾龙",
    titleEn: "EASTERN DRAGON & SACRED MOUNTAINS",
    subtitleTop: "HERITAGE ARCHIVE // EMPIRE OF CLOUDS & RIVERS",
    subtitleBottom: "龙腾浩渺云烟里 · 鹤唳清虚日月间 · 万象更新 ↗",
    images: {
      hero: {
        id: "75f39e50-9165-4288-a845-a46ced40b1f8",
        name: "中国龙插画",
        url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-07-02/1782943576492_hengyouxin_330616071474528256.jpg",
      },
      sub: {
        id: "93aadcad-8424-484d-8124-c19238745c2c",
        name: "山河远阔水墨景",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5_jackie/sticker/20261011/93aadcad-8424-484d-8124-c19238745c2c/1791723179861_sticker_1791133798691_ybonat.png",
      },
    },
    fonts: {
      hero: {
        id: "665df76f-5fb3-4b7a-b379-505478d8678f",
        name: "Slideqiuhong Regular",
        family: "Slideqiuhong Regular",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129876296_Slideqiuhong_Regular.ttf",
      },
      sub: {
        id: "58ef176f-7e03-415a-b091-558fdbdfb1cc",
        name: "LXGW WenKai Mono TC Light",
        family: "LXGW WenKai Mono TC Light",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129876296_LXGW_WenKai_Mono_TC_Light.ttf",
      },
    },
    palette: {
      bg: "#0C0D11",
      primary: "#F5CE75",
      accent: "#E63946",
      subText: "#8E93A0",
    },
    layoutGuide: `【东方水墨双景双联布局】：
- 右侧主视窗（left: 56%; right: 4%）呈现玄黑破云金龙大图 {{image.hero.url}}
- 左侧副景窗（left: 6%; width: 18%）以圆形中式漏窗/拱桥卡片呈现水墨远山 {{image.sub.url}}
- 中间书法核心区（left: 27%; width: 27%）：
  - 主标题「{{text.title}}」用 {{font.hero.family}} 竖排或横排，高贵金箔质感，字号 calc(var(--canvas-html-vh) * 22)
  - 诗词副标用宋楷 {{font.sub.family}} 竖排排列，色值 {{color.subText.css}}
  - 朱红篆刻印章「祥瑞」与「长庆」点缀
- 龙画、山水与书法大字互为呼应，气势磅礴，互不遮挡！`,
  },
  {
    key: "cyber_space_hud",
    name: "「QUANTUM MATRIX // 2088」未来太空科幻多视窗双图多字体桌垫",
    title: "QUANTUM MATRIX",
    titleEn: "DEEP SPACE HORIZON // NEURAL 2088",
    subtitleTop: "SYS.PROTOCOL ACTIVE // 1800x800 HUD WIDESCREEN",
    subtitleBottom: "HUMAN CONSCIOUSNESS EXTENDING BEYOND KNOWN REALITY ↗",
    images: {
      hero: {
        id: "2f29f229-d89a-4f53-ba91-3911ab0a9450",
        name: "宇航员深空触日",
        url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-06-26/1782424938049_hengyouxin_328360517028954112.jpg",
      },
      sub: {
        id: "75f39e50-9165-4288-a845-a46ced40b1f8",
        name: "赛博机械龙核心图",
        url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-07-02/1782943576492_hengyouxin_330616071474528256.jpg",
      },
    },
    fonts: {
      hero: {
        id: "13eda435-f6bb-4404-b042-046a62ac1933",
        name: "Segoe UI Bold",
        family: "Segoe UI Bold",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5_jackie/font-template/20260710/1783637097357_j0wvpq_segoeuib.ttf",
      },
      sub: {
        id: "83b152da-0206-4385-bc36-d338de6d13de",
        name: "Iosevka Etoile",
        family: "Iosevka Etoile",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129876296_Iosevka_Etoile.ttf",
      },
    },
    palette: {
      bg: "#090B12",
      primary: "#00F0FF",
      accent: "#FF0055",
      subText: "#6F7C93",
    },
    layoutGuide: `【赛博科技 Bento Grid 多视窗界面】：
- 左侧核心控制区（left: 5%; width: 45%）：
  - 主标题「{{text.title}}」用未来无衬线 {{font.hero.family}}，青蓝电光发光，字号 calc(var(--canvas-html-vh) * 20)
  - 顶部与底部终端命令、经纬度数据流采用等宽字体 {{font.sub.family}}
  - 左下角放置微缩状态视窗或快捷终端提示「[ONLINE] LAT:31.23 LON:121.47」
- 右侧主视窗与副视窗（left: 52%; right: 4%）：
  - 主大视窗放置宇航员插图 {{image.hero.url}}（宽约 36%），带青色十字瞄准线与科技边框
  - 侧边或副视窗放置辅助核心图 {{image.sub.url}}（小视窗，带 HUD 角标与发光扫描线）
  - 双图主次分明，充满科幻未来感，绝不遮挡文字。`,
  },
  {
    key: "botanical_zen",
    name: "「远山寻幽 · 草木生香」写意自然多图多字体手记桌垫",
    title: "远山寻幽",
    titleEn: "BOTANICAL SKETCH & TRANQUIL MOUNTAINS",
    subtitleTop: "FIELD STUDY OF NATURE · BOTANICAL JOURNAL 03",
    subtitleBottom: "草木有本心 · 何求美人折 · 心归自然天地宽 ↗",
    images: {
      hero: {
        id: "93aadcad-8424-484d-8124-c19238745c2c",
        name: "山河远阔主水墨卷",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5_jackie/sticker/20261011/93aadcad-8424-484d-8124-c19238745c2c/1791723179861_sticker_1791133798691_ybonat.png",
      },
      sub: {
        id: "e7f7b113-edac-4ec2-b3a6-cc36d872f80e",
        name: "自然生灵萌趣卡片",
        url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-09-16/1789731052909_WXW3913.jpg",
      },
    },
    fonts: {
      hero: {
        id: "48d3ba0d-8838-4ab4-8956-fe452b48d0e2",
        name: "LXGW WenKai TC Light",
        family: "LXGW WenKai TC Light",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129906653_LXGW_WenKai_TC_Light.ttf",
      },
      sub: {
        id: "d721b8fc-96a6-4e69-b2af-502dd49ad5ab",
        name: "Helvetica Neue LT Pro",
        family: "Helvetica Neue LT Pro - Heavy Extended",
        url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129876296_Helvetica.ttf",
      },
    },
    palette: {
      bg: "#121715",
      primary: "#8ADBBF",
      accent: "#E5BA73",
      subText: "#8A9A93",
    },
    layoutGuide: `【自然博物画报双图布局】：
- 左侧为主水墨山林大展屏 {{image.hero.url}}（left: 5%; width: 40%; border-radius: 18px）
- 右上侧精美装裱小生灵手记特写卡片 {{image.sub.url}}（left: 48%; top: 12%; width: 20%; border-radius: 14px）
- 右侧大字与手记排版（left: 50%; right: 6%）：
  - 主标题「{{text.title}}」用 {{font.hero.family}}，青绿玉润发光，字号 calc(var(--canvas-html-vh) * 24)
  - 英文系列标题用现代西文 {{font.sub.family}}
  - 下方排版自然哲理诗赋与手记标本编号「HERBARIUM SPECIMEN NO. 1024」
- 左右两翼双图与双字体相得益彰，宁静高远。`,
  },
];

function buildBrief(theme) {
  return `请设计一款全定制「${theme.name}」高端【多图 + 多字体】复合鼠标垫/桌垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 smartSize 或其他尺寸，尺寸已锁定。

## 核心任务要求（多图组合 + 多字体层级，严禁重复搜索）
1. 本设计为【多图 + 多字体】高级复合排版，必须同时包含：
   - 2 张图片素材：主素材图 {{image.hero.url}} 与副素材图 {{image.sub.url}}
   - 2 种不同字体：主标题字体 {{font.hero.family}} 与副标题/西文字体 {{font.sub.family}}
2. 推荐候选素材直接使用以下优质资源（无需多轮重复检索）：
   - 主图 image.hero: id="${theme.images.hero.id}", name="${theme.images.hero.name}", url="${theme.images.hero.url}"
   - 副图 image.sub: id="${theme.images.sub.id}", name="${theme.images.sub.name}", url="${theme.images.sub.url}"
   - 主字体 font.hero: id="${theme.fonts.hero.id}", name="${theme.fonts.hero.name}", family="${theme.fonts.hero.family}", url="${theme.fonts.hero.url}"
   - 副字体 font.sub: id="${theme.fonts.sub.id}", name="${theme.fonts.sub.name}", family="${theme.fonts.sub.family}", url="${theme.fonts.sub.url}"
   ⚠️ 【重要原则】严禁连续执行多次 searchSticker 或 searchFont！直接使用推荐素材并绑定到 htmlBindings 中。

3. 布局构图（防遮挡防碰撞）：
   - 严禁在文字容器上写 overflow:hidden / text-overflow:clip 强行切字！
   - ${theme.layoutGuide}

## 模板变量与可定制性（右侧属性面板一键修改）
在 canvas.addHtml 中必须声明完整 htmlBindings 与 htmlTemplateFields：
- htmlBindings 包含：
  - image: {
      hero: { id: "${theme.images.hero.id}", name: "${theme.images.hero.name}", url: "${theme.images.hero.url}" },
      sub: { id: "${theme.images.sub.id}", name: "${theme.images.sub.name}", url: "${theme.images.sub.url}" }
    }
  - font: {
      hero: { id: "${theme.fonts.hero.id}", name: "${theme.fonts.hero.name}", url: "${theme.fonts.hero.url}", family: "${theme.fonts.hero.family}" },
      sub: { id: "${theme.fonts.sub.id}", name: "${theme.fonts.sub.name}", url: "${theme.fonts.sub.url}", family: "${theme.fonts.sub.family}" }
    }
  - text: {
      title: "${theme.title}",
      titleEn: "${theme.titleEn}",
      subtitleTop: "${theme.subtitleTop}",
      subtitleBottom: "${theme.subtitleBottom}"
    }
  - color: {
      primary: { color: "${theme.palette.primary}", type: "pure" },
      bg: { color: "${theme.palette.bg}", type: "pure" },
      accent: { color: "${theme.palette.accent}", type: "pure" },
      subText: { color: "${theme.palette.subText}", type: "pure" }
    }
- htmlTemplateFields 包含：
  - [
      { key: "image.hero", type: "image", label: "主素材插画" },
      { key: "image.sub", type: "image", label: "副素材卡片" },
      { key: "font.hero", type: "font", label: "主标题字体" },
      { key: "font.sub", type: "font", label: "副标题字体" },
      { key: "text.title", type: "text", label: "主标题" },
      { key: "color.primary", type: "color", label: "主文字色" },
      { key: "color.bg", type: "color", label: "背景底色" }
    ]

## 执行流程
1. 立即调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
2. 直接调用 canvas.addHtml，输出完整的高水准【多图 + 多字体】复合设计画面
3. 调用 canvas.updateAndSaveSticker 保存，名称为「${theme.name}」`;
}

async function getIdleDesignTools() {
  const dtRes = await mcp("system.design_tool.query_design_tools", { onlineOnly: true }, 30000);
  const items = dtRes?.items || [];
  return items.filter((i) => !i.isDesigning && i.batchStatus === "idle");
}

async function runWorker(theme, connId) {
  const t0 = Date.now();
  console.log(`\n🚀 [${theme.key}] 派发【多图+多字体】复合设计: ${theme.name} -> ${connId}`);
  const brief = buildBrief(theme);

  try {
    await mcp("system.design_tool.clear_conversation", { connectionId: connId }, 15000).catch(() => {});
    const runRes = await mcp(
      "system.design_tool.run_task",
      {
        connectionId: connId,
        message: brief,
        executionMode: "automatic",
        timeoutMs: 600000,
      },
      620000,
    );

    const duration = Math.round((Date.now() - t0) / 1000);
    const sticker = runRes?.outputs?.[0];
    console.log(`✅ [${theme.key}] 制作成功！耗时 ${duration}s`);
    if (sticker?.url) {
      console.log(`   🏷️ 贴纸名称: ${sticker.name}`);
      console.log(`   🔗 COS 地址: ${sticker.url}`);
    }

    // 下载至本地 Artifacts
    let localPath = null;
    if (sticker?.url) {
      try {
        const resp = await fetch(sticker.url);
        const buf = Buffer.from(await resp.arrayBuffer());
        localPath = join(ARTIFACT_DIR, `multi_resource_${theme.key}.png`);
        writeFileSync(localPath, buf);
        console.log(`   📸 本地图片已保存: ${localPath} (${Math.round(buf.length / 1024)} KB)`);
      } catch (e) {
        console.error(`   ⚠️ 本地保存失败: ${e.message}`);
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
  console.log("🎨 多字体 + 多图组合 自由创意复合设计 批量生产流水线启动");
  console.log("================================================================================");

  const idleTools = await getIdleDesignTools();
  console.log(`当前在线空闲设计工具: ${idleTools.length} 台`);
  if (idleTools.length === 0) {
    console.error("❌ 无空闲设计工具，退出");
    process.exit(1);
  }

  const assignedCount = Math.min(idleTools.length, MULTI_THEMES.length);
  console.log(`🎯 本轮规划并发派发: ${assignedCount} 款【多图+多字体】复合桌垫\n`);

  const promises = [];
  for (let i = 0; i < assignedCount; i++) {
    const theme = MULTI_THEMES[i];
    const tool = idleTools[i];
    promises.push(runWorker(theme, tool.clientId));
  }

  const results = await Promise.all(promises);

  console.log("\n================================================================================");
  console.log(`🎉 批量多图+多字体复合设计执行完成！成功: ${results.filter((r) => r.success).length}/${assignedCount}`);
  console.log("================================================================================");
  writeFileSync(PROGRESS_FILE, JSON.stringify(results, null, 2));
}

main().catch(console.error);
