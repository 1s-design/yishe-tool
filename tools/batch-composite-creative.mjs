/**
 * 批量自由创意组合设计测试流水线：字体 + 图片素材 + 艺术字排版 + 模板变量
 * 运行方式: node tools/batch-composite-creative.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const API = "http://127.0.0.1:1520";
const ARTIFACT_DIR = "/Users/jackie/.gemini/antigravity-ide/brain/1ec7ed9a-9c75-4d45-a077-13c2ab6322ee";
const PROGRESS_FILE = join(ARTIFACT_DIR, "batch_composite_creative_progress.json");

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

const COMPOSITE_THEMES = [
  {
    key: "koi_fortune",
    name: "「锦鲤戏水 · 好运连连」新中式国潮锦鲤书法桌垫",
    title: "好运连连",
    titleEn: "GOOD LUCK AHEAD",
    subtitleTop: "LUCKY KOI CARP · CHINESE HERITAGE SERIES 01",
    subtitleBottom: "时来运转 · 诸事皆宜 · 万事胜意 ↗",
    stickerQuery: "锦鲤",
    fallbackSticker: {
      id: "1baa3c8f-1768-46d4-aa90-e4fe890f8106",
      name: "水中锦鲤",
      url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-07-02/1782943270275_hengyouxin_330584868994301952.jpg",
    },
    fontQuery: "楷",
    fontCategory: "书法手写体",
    fallbackFont: {
      id: "48d3ba0d-8838-4ab4-8956-fe452b48d0e2",
      name: "LXGW WenKai TC Light",
      url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129906653_LXGW_WenKai_TC_Light.ttf",
    },
    charsCount: 4,
    palette: {
      bg: "#161112",
      primary: "#FAD074",
      accent: "#E63946",
      muted: "#A89F91",
    },
    compositionPlan: `【东方红金国潮布局】：
- 画布分为左侧书法主视觉区（0%~55%）与右侧锦鲤插画区（52%~96%）
- 右侧配图用 {{image.hero.url}}，给以圆形或水波羽化遮罩（border-radius: 24px; box-shadow: 0 16px 40px rgba(0,0,0,0.6)），水墨金波与锦鲤互映
- 左侧主文字「好运连连」，字号 calc(var(--canvas-html-vh) * 26)，行楷书法，带暖金微发光 text-shadow
- 左右两翼界限分明，主文案绝对不与锦鲤图片重合遮挡`,
  },
  {
    key: "rising_dragon",
    name: "「龙腾四海 · 气贯长虹」东方玄黑金龙霸气桌垫",
    title: "龙腾四海",
    titleEn: "RISING DRAGON",
    subtitleTop: "EASTERN DRAGON LEGEND // EMPIRE OF CLOUDS",
    subtitleBottom: "长风破浪会有时 · 直挂云帆济沧海 ↗",
    stickerQuery: "中国龙",
    fallbackSticker: {
      id: "75f39e50-9165-4288-a845-a46ced40b1f8",
      name: "中国龙插画",
      url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-07-02/1782943576492_hengyouxin_330616071474528256.jpg",
    },
    fontQuery: "书法",
    fontCategory: "书法手写体",
    fallbackFont: {
      id: "58ef176f-7e03-415a-b091-558fdbdfb1cc",
      name: "LXGW WenKai Mono TC Light",
      url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129876296_LXGW_WenKai_Mono_TC_Light.ttf",
    },
    charsCount: 4,
    palette: {
      bg: "#0B0C10",
      primary: "#F3C969",
      accent: "#FF4D4D",
      muted: "#7E828E",
    },
    compositionPlan: `【曜石黑金龙纹布局】：
- 右翼（54%~95%）放置中国龙插画 {{image.hero.url}}，暗夜金龙破云而出，带微金光边缘
- 左侧（6%~52%）排版霸气书法「龙腾四海」，金箔质感 text-shadow，字号 calc(var(--canvas-html-vh) * 27)
- 辅以现代双色经纬辅助线与「祥瑞」朱红金印，气势磅礴`,
  },
  {
    key: "warm_cat",
    name: "「猫肥家润 · 慢享生活」日系温暖治愈萌宠插画桌垫",
    title: "猫肥家润",
    titleEn: "WARM & COZY",
    subtitleTop: "LITTLE JOY IN DAILY LIFE · CAT CAFE MOMENTS",
    subtitleBottom: "日暖风恬 · 柴米油盐皆是诗 · 喵趣横生 ↗",
    stickerQuery: "猫",
    fallbackSticker: {
      id: "e7f7b113-edac-4ec2-b3a6-cc36d872f80e",
      name: "黑猫水下观鱼插画",
      url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-09-16/1789731052909_WXW3913.jpg",
    },
    fontQuery: "手写",
    fontCategory: "书法手写体",
    fallbackFont: {
      id: "48d3ba0d-8838-4ab4-8956-fe452b48d0e2",
      name: "LXGW WenKai TC Light",
      url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129906653_LXGW_WenKai_TC_Light.ttf",
    },
    charsCount: 4,
    palette: {
      bg: "#181B1A",
      primary: "#FFE3B3",
      accent: "#FF9248",
      muted: "#949E99",
    },
    compositionPlan: `【温暖治愈森系布局】：
- 左翼（6%~46%）精致装裱猫咪插图 {{image.hero.url}}，圆角卡片质感（border-radius: 20px）
- 右翼（48%~94%）呈现温润手写字体「猫肥家润」，字号 calc(var(--canvas-html-vh) * 26)
- 暖驼护眼低饱和背景，配以日系生活标语与小鱼干印章，极具治愈感`,
  },
  {
    key: "cyber_astronaut",
    name: "「CYBER MATRIX // 2026」未来主义星际探索桌垫",
    title: "CYBER MATRIX",
    titleEn: "NEURAL INTERFACE 2026",
    subtitleTop: "QUANTUM HORIZON // DEEP SPACE EXPLORATION",
    subtitleBottom: "HUMANITY REACHING BEYOND THE PHYSICAL REALM ↗",
    stickerQuery: "宇航员",
    fallbackSticker: {
      id: "2f29f229-d89a-4f53-ba91-3911ab0a9450",
      name: "宇航员触日",
      url: "https://1s-1257307499.cos.ap-beijing.myqcloud.com/hengyouxin/2026-06-26/1782424938049_hengyouxin_328360517028954112.jpg",
    },
    fontQuery: "等线体",
    fontCategory: "等线体",
    fallbackFont: {
      id: "13eda435-f6bb-4404-b042-046a62ac1933",
      name: "Segoe UI Bold",
      url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5_jackie/font-template/20260710/1783637097357_j0wvpq_segoeuib.ttf",
    },
    charsCount: 12,
    palette: {
      bg: "#080B14",
      primary: "#4CE3FF",
      accent: "#FF007F",
      muted: "#7A889B",
    },
    compositionPlan: `【赛博朋克深空探索布局】：
- 右翼（52%~95%）放置宇航员太空探索插图 {{image.hero.url}}，带有微蓝发光 HUD 坐标边框
- 左翼（6%~50%）等宽科技排版「CYBER MATRIX // 2026」，字号 calc(var(--canvas-html-vh) * 20)，电光青霓虹投影
- 顶部与底部点缀终端数据流、经纬准星与系统就绪指示`,
  },
  {
    key: "landscape_zen",
    name: "「山河远阔 · 水墨旷达」青绿写意远山禅境桌垫",
    title: "山河远阔",
    titleEn: "ENDLESS MOUNTAINS",
    subtitleTop: "LANDSCAPE OF MIND · ZEN POETRY COLLECTION",
    subtitleBottom: "清风明月本无价 · 近水远山皆有情 ↗",
    stickerQuery: "山水",
    fallbackSticker: {
      id: "93aadcad-8424-484d-8124-c19238745c2c",
      name: "山河远阔 · 水墨山水",
      url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5_jackie/sticker/20261011/93aadcad-8424-484d-8124-c19238745c2c/1791723179861_sticker_1791133798691_ybonat.png",
    },
    fontQuery: "楷",
    fontCategory: "书法手写体",
    fallbackFont: {
      id: "48d3ba0d-8838-4ab4-8956-fe452b48d0e2",
      name: "LXGW WenKai TC Light",
      url: "https://yishe-storage-1257307499.cos.ap-beijing.myqcloud.com/users/5/font-template/1792129906653_LXGW_WenKai_TC_Light.ttf",
    },
    charsCount: 4,
    palette: {
      bg: "#101614",
      primary: "#77D2B8",
      accent: "#E2BA69",
      muted: "#889B95",
    },
    compositionPlan: `【青绿千里江山水墨布局】：
- 右半屏（48%~95%）铺展水墨山水画卷 {{image.hero.url}}，远山如黛，轻烟微霭
- 左侧（6%~46%）舒展写意大字「山河远阔」，青碧金石质感，字号 calc(var(--canvas-html-vh) * 26)
- 辅以清雅诗赋与「澄怀观道」古典印章，空灵旷远`,
  },
];

function buildBrief(theme) {
  return `请设计一款全定制「${theme.name}」高端图文组合鼠标垫/桌垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 smartSize 或其他尺寸，尺寸已锁定。

## 图文组合核心要求（自由创意开发 + 素材引用）
1. 引用图片素材：
   - 调用 resource.searchSticker({ query: "${theme.stickerQuery}", limit: 3 }) 检索高质量配图素材；
   - 将检索到的最佳图片（或推荐候选：id="${theme.fallbackSticker.id}", name="${theme.fallbackSticker.name}", url="${theme.fallbackSticker.url}"）绑定至 htmlBindings.image.hero；
   - 在 HTML 中以 {{image.hero.url}} 方式自然融入设计构图（作为主体插画卡片、羽化背景或侧翼视觉焦点）。
2. 引用字体资源：
   - 调用 resource.searchFont({ query: "${theme.fontQuery}", category: "${theme.fontCategory}" }) 检索匹配艺术字体；
   - 将检索到的字体（或推荐候选：id="${theme.fallbackFont.id}", name="${theme.fallbackFont.name}", url="${theme.fallbackFont.url}"）绑定至 htmlBindings.font.hero；
   - 在 HTML 中以 {{font.hero.family}} 样式赋予主标题大字。
3. 布局构图（防遮挡防碰撞）：
   - 图文左右分区排版：一侧为精美插画焦点，另一侧为艺术字视觉中心，绝不发生文字压盖主体插画或切断断字！
   - 严禁在文字容器上写 overflow:hidden、text-overflow:clip 强行切字！
   - ${theme.compositionPlan}

## 模板变量与可定制性（右侧属性面板一键修改）
在 canvas.addHtml 中必须声明完整 htmlBindings 与 htmlTemplateFields：
- htmlBindings 包含：
  - image: { hero: { id, name, url } }
  - font: { hero: { id, name, url, family } }
  - text: { title: "${theme.title}", subtitleTop: "${theme.subtitleTop}", subtitleBottom: "${theme.subtitleBottom}" }
  - color: { primary: { color: "${theme.palette.primary}", type: "pure" }, bg: { color: "${theme.palette.bg}", type: "pure" }, accent: { color: "${theme.palette.accent}", type: "pure" } }
- htmlTemplateFields 包含：
  - [{ key: "image.hero", type: "image", label: "核心插画" }, { key: "font.hero", type: "font", label: "标题字体" }, { key: "text.title", type: "text", label: "主标题" }, { key: "color.primary", type: "color", label: "主文字色" }, { key: "color.bg", type: "color", label: "底色" }]

## 执行流程
1. 立即调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
2. 调用 resource.searchSticker 与 resource.searchFont 检索获取资源对象
3. 组合为一个极具设计感与高级感的 canvas.addHtml，实现完整的画面布局
4. 调用 canvas.updateAndSaveSticker 保存，名称为「${theme.name}」`;
}

async function getIdleDesignTools() {
  const dtRes = await mcp("system.design_tool.query_design_tools", { onlineOnly: true }, 30000);
  const items = dtRes?.items || [];
  return items.filter((i) => !i.isDesigning && i.batchStatus === "idle");
}

async function runWorker(theme, connId) {
  const t0 = Date.now();
  console.log(`\n🚀 [${theme.key}] 派发创意图文任务: ${theme.name} -> ${connId}`);
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
        localPath = join(ARTIFACT_DIR, `composite_creative_${theme.key}.png`);
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
  console.log("🎨 字体 + 图片 自由创意图文组合设计 批量生产与质检流水线启动");
  console.log("================================================================================");

  let themeIndex = 0;
  const history = existsSync(PROGRESS_FILE) ? JSON.parse(readFileSync(PROGRESS_FILE, "utf-8")) : [];
  const activeWorkers = new Map();

  const TOTAL_TARGET = COMPOSITE_THEMES.length;
  console.log(`🎯 本轮规划设计: ${TOTAL_TARGET} 款各具特色的自由创意图文复合桌垫\n`);

  while (history.filter((h) => h.success).length < TOTAL_TARGET && themeIndex < COMPOSITE_THEMES.length) {
    const idleTools = await getIdleDesignTools();
    const available = idleTools.filter((t) => !activeWorkers.has(t.clientId));

    if (available.length === 0 && activeWorkers.size === 0) {
      console.log("⏳ 等待可用设计端 (20s)...");
      await new Promise((r) => setTimeout(r, 20000));
      continue;
    }

    for (const tool of available) {
      if (themeIndex >= COMPOSITE_THEMES.length) break;
      const theme = COMPOSITE_THEMES[themeIndex++];
      const connId = tool.clientId;

      const p = runWorker(theme, connId).then((res) => {
        history.push(res);
        writeFileSync(PROGRESS_FILE, JSON.stringify(history, null, 2));
        activeWorkers.delete(connId);
        console.log(`📊 当前完成进度: [${history.filter((h) => h.success).length}/${TOTAL_TARGET}]`);
        return res;
      });

      activeWorkers.set(connId, p);
    }

    if (activeWorkers.size > 0) {
      await Promise.race(activeWorkers.values());
    }
  }

  if (activeWorkers.size > 0) {
    console.log(`⏳ 等待最后 ${activeWorkers.size} 个任务全部完成...`);
    await Promise.all(activeWorkers.values());
  }

  console.log("\n================================================================================");
  console.log(`🎉 批量图文自由创意设计全部完成！累计成功: ${history.filter((h) => h.success).length}/${TOTAL_TARGET}`);
  console.log("================================================================================");
  writeFileSync(PROGRESS_FILE, JSON.stringify(history, null, 2));
}

main().catch(console.error);
