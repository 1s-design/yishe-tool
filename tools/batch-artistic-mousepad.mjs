import { readFileSync, writeFileSync, mkdirSync } from "fs";
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

const TASKS = [
  {
    key: "zhixing",
    theme: "「知行合一」曜石黑金·心学行楷艺术字桌垫",
    saveName: "知行合一·黑金心学艺术字桌垫",
    fontQuery: "毛笔",
    fontCategory: "calligraphy",
    brief: `请设计一张全新的「知行合一」曜石黑金·心学行楷高端艺术字桌垫/鼠标垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 canvas.smartSize 或其他尺寸，尺寸已锁定。

## 文案与排版结构
1. 主文案「知行合一」：横排居中，超大气势行楷/毛笔书法大字，字号 calc(var(--canvas-html-vh) * 36)，字重极重，颜色为高光鎏金 {{color.gold.css}}，带深邃立体阴影
2. 顶部副文案「PHILOSOPHY OF UNITY · WANG YANGMING」：水平居中位于主文案上方（top: 14%），颜色 {{color.goldMuted.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，字距 letter-spacing: 4px，white-space: nowrap
3. 底部副文案「知之真切笃实处即是行 · 行之明觉精察处即是知」：水平居中位于主文案下方（bottom: 14%），颜色 {{color.goldMuted.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，white-space: nowrap
4. 左侧装饰章列：纵向排列朱砂金印「致」「良」「知」，金边细框
5. 右侧装饰章列：纵向排列朱砂金印「立」「德」「功」，金边细框
6. 整体外围：细腻烫金细线框 + 四角折角装饰纹样

## 色系与视觉质感
- 底色：曜石黑金渐变 {{color.bg.css}} (默认 #121315，外圈渐变至 #0A0A0C)
- 金色高光：{{color.gold.css}} (默认 #F5D77F)
- 暖金色：{{color.goldMuted.css}} (默认 #E6CA85)

## 模板变量化要求（核心要求：方便用户后续在 UI 右侧属性面板一键改字换色）
- 主文案使用 {{text.title}}，在 htmlBindings.text.title 设默认值 "知行合一"
- 顶部副文案使用 {{text.subtitleTop}}，在 htmlBindings.text.subtitleTop 设默认值 "PHILOSOPHY OF UNITY · WANG YANGMING"
- 底部副文案使用 {{text.subtitleBottom}}，在 htmlBindings.text.subtitleBottom 设默认值 "知之真切笃实处即是行 · 行之明觉精察处即是知"
- 金色高光使用 {{color.gold.css}}，在 htmlBindings.color.gold 设默认值 { color: "#F5D77F", type: "pure" }
- 暖金色使用 {{color.goldMuted.css}}，在 htmlBindings.color.goldMuted 设默认值 { color: "#E6CA85", type: "pure" }
- 主背景底色使用 {{color.bg.css}}，在 htmlBindings.color.bg 设默认值 { color: "#121315", type: "pure" }
- 字体使用 {{font.hero.family}} 绑定书法字体
- 在 htmlTemplateFields 中声明对应的 label（主标题文字、顶部副文案、底部副文案、烫金高光色、暖金色、背景底色、主视觉书法字体）

## 执行步骤
1. 不要检索其他贴纸，本设计为全新原创定制
2. 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
3. resource.searchFont({ query: "毛笔", category: "calligraphy" }) 检索书法字体，绑定为 font.hero
4. 立即用一个完整的 canvas.addHtml 实现完整画面（必须采用上述模板变量和 htmlBindings，字字忠实，禁止硬编码文字）
5. 确认无误后立即调用 canvas.updateAndSaveSticker 保存，名称为「知行合一·黑金心学艺术字桌垫」`
  },
  {
    key: "never_settle",
    theme: "「NEVER SETTLE」夜之城双色发光赛博艺术字桌垫",
    saveName: "NEVER SETTLE·赛博霓虹艺术字桌垫",
    fontQuery: "黑体",
    fontCategory: "sans",
    brief: `请设计一张全新的「NEVER SETTLE」夜之城双色发光双重阴影赛博朋克艺术字桌垫/鼠标垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 canvas.smartSize 或其他尺寸，尺寸已锁定。

## 文案与排版结构
1. 主文案「NEVER SETTLE」：横排居中，全大写硬朗超粗艺术字，字号 calc(var(--canvas-html-vh) * 32)，字重 900，颜色 {{color.primary.css}}，文字带立体双色霓虹发光阴影（左上青蓝 #00F0FF，右下粉红 #FF0055）
2. 顶部副文案「CYBERPUNK 2088 // PROTOCOL ACTIVE」：水平居中位于主文案上方（top: 14%），颜色 {{color.cyan.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，字距 letter-spacing: 5px，white-space: nowrap
3. 底部副文案「BREAK THE MATRIX · FORGE YOUR DESTINY ↗」：水平居中位于主文案下方（bottom: 14%），颜色 {{color.magenta.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，字距 letter-spacing: 3px，white-space: nowrap
4. 四角与两侧：科幻 HUD 十字准星、坐标角标「[SYS.OK] 2.25:1 WIDESCREEN」微科技文字装饰
5. 整体背景：深邃暗紫黑太空底色，微网格地平线透视质感

## 色系与视觉质感
- 底色：深空暗夜底色 {{color.bg.css}} (默认 #0A0C14)
- 赛博电光青：{{color.cyan.css}} (默认 #00F0FF)
- 霓虹品红：{{color.magenta.css}} (默认 #FF0055)
- 主字高亮白：{{color.primary.css}} (默认 #FFFFFF)

## 模板变量化要求（核心要求：方便用户后续在 UI 右侧属性面板一键改字换色）
- 主文案使用 {{text.title}}，在 htmlBindings.text.title 设默认值 "NEVER SETTLE"
- 顶部副文案使用 {{text.subtitleTop}}，在 htmlBindings.text.subtitleTop 设默认值 "CYBERPUNK 2088 // PROTOCOL ACTIVE"
- 底部副文案使用 {{text.subtitleBottom}}，在 htmlBindings.text.subtitleBottom 设默认值 "BREAK THE MATRIX · FORGE YOUR DESTINY ↗"
- 主字颜色使用 {{color.primary.css}}，在 htmlBindings.color.primary 设默认值 { color: "#FFFFFF", type: "pure" }
- 电光青色使用 {{color.cyan.css}}，在 htmlBindings.color.cyan 设默认值 { color: "#00F0FF", type: "pure" }
- 霓虹品红使用 {{color.magenta.css}}，在 htmlBindings.color.magenta 设默认值 { color: "#FF0055", type: "pure" }
- 主背景底色使用 {{color.bg.css}}，在 htmlBindings.color.bg 设默认值 { color: "#0A0C14", type: "pure" }
- 字体使用 {{font.hero.family}} 绑定粗体无衬线字体
- 在 htmlTemplateFields 中声明对应的 label（主标题文字、顶部副文案、底部副文案、电光青、霓虹品红、背景底色、主视觉字体）

## 执行步骤
1. 不要检索其他贴纸，本设计为全新原创定制
2. 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
3. resource.searchFont({ query: "黑体", category: "sans" }) 检索硬朗无衬线字体，绑定为 font.hero
4. 立即用一个完整的 canvas.addHtml 实现完整画面（必须采用上述模板变量和 htmlBindings，字字忠实，禁止硬编码文字）
5. 确认无误后立即调用 canvas.updateAndSaveSticker 保存，名称为「NEVER SETTLE·赛博霓虹艺术字桌垫」`
  },
  {
    key: "stay_hungry",
    theme: "「STAY HUNGRY」极简瑞士国际主义网格排版艺术字桌垫",
    saveName: "STAY HUNGRY·瑞士国际大排版桌垫",
    fontQuery: "黑体",
    fontCategory: "sans",
    brief: `请设计一张全新的「STAY HUNGRY STAY FOOLISH」极简瑞士国际主义网格排版艺术字桌垫/鼠标垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 canvas.smartSize 或其他尺寸，尺寸已锁定。

## 文案与排版结构
1. 主文案「STAY HUNGRY · STAY FOOLISH」：全大写超大号国际主义无衬线排版，字号 calc(var(--canvas-html-vh) * 26)，字重 900，颜色 {{color.primary.css}}，居中偏上（top: 45%），极致利落字距
2. 顶部副文案「INTERNATIONAL TYPOGRAPHIC STYLE · ISSUE 08 / 2026」：水平居中位于上方（top: 14%），颜色 {{color.muted.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，字距 letter-spacing: 5px，white-space: nowrap
3. 底部副文案「「求知若饥 · 虚心若愚」— 保持对世界最初的敬畏与好奇」：水平居中位于下方（bottom: 14%），颜色 {{color.primary.css}}，字号 calc(var(--canvas-html-vh) * 6.8)，white-space: nowrap
4. 瑞士网格装饰元素：正中上方一枚精密瑞士鲜红方标 {{color.accent.css}}，两翼精密标尺刻度线与网格对齐辅助微线，极致高级画册感

## 色系与视觉质感
- 底色：哑光深炭灰黑 {{color.bg.css}} (默认 #151619)
- 主文案纯白：{{color.primary.css}} (默认 #F6F7F9)
- 副文案银灰：{{color.muted.css}} (默认 #8E929B)
- 包豪斯强调红：{{color.accent.css}} (默认 #FF3B30)

## 模板变量化要求（核心要求：方便用户后续在 UI 右侧属性面板一键改字换色）
- 主文案使用 {{text.title}}，在 htmlBindings.text.title 设默认值 "STAY HUNGRY · STAY FOOLISH"
- 顶部副文案使用 {{text.subtitleTop}}，在 htmlBindings.text.subtitleTop 设默认值 "INTERNATIONAL TYPOGRAPHIC STYLE · ISSUE 08 / 2026"
- 底部副文案使用 {{text.subtitleBottom}}，在 htmlBindings.text.subtitleBottom 设默认值 "「求知若饥 · 虚心若愚」— 保持对世界最初的敬畏与好奇"
- 主字纯白使用 {{color.primary.css}}，在 htmlBindings.color.primary 设默认值 { color: "#F6F7F9", type: "pure" }
- 瑞士强调红使用 {{color.accent.css}}，在 htmlBindings.color.accent 设默认值 { color: "#FF3B30", type: "pure" }
- 银灰次要色使用 {{color.muted.css}}，在 htmlBindings.color.muted 设默认值 { color: "#8E929B", type: "pure" }
- 主背景底色使用 {{color.bg.css}}，在 htmlBindings.color.bg 设默认值 { color: "#151619", type: "pure" }
- 字体使用 {{font.hero.family}} 绑定大无衬线字体
- 在 htmlTemplateFields 中声明对应的 label（主标题文字、顶部副文案、底部副文案、主文字白、瑞士红、背景底色、主视觉字体）

## 执行步骤
1. 不要检索其他贴纸，本设计为全新原创定制
2. 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
3. resource.searchFont({ query: "黑体", category: "sans" }) 检索大无衬线字体，绑定为 font.hero
4. 立即用一个完整的 canvas.addHtml 实现完整画面（必须采用上述模板变量和 htmlBindings，字字忠实，禁止硬编码文字）
5. 确认无误后立即调用 canvas.updateAndSaveSticker 保存，名称为「STAY HUNGRY·瑞士国际大排版桌垫」`
  },
  {
    key: "keep_calm",
    theme: "「KEEP CALM & GIT PUSH」极客终端代码流艺术字桌垫",
    saveName: "KEEP CALM·极客终端代码桌垫",
    fontQuery: "黑体",
    fontCategory: "sans",
    brief: `请设计一张全新的「KEEP CALM & GIT PUSH」极客终端代码流艺术字桌垫/鼠标垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 canvas.smartSize 或其他尺寸，尺寸已锁定。

## 文案与排版结构
1. 主文案「KEEP CALM & GIT PUSH」：横排居中，等宽终端风格艺术粗字，字号 calc(var(--canvas-html-vh) * 28)，字重 800，颜色 {{color.green.css}}，文字带终端高光绿光晕，末尾带闪烁光标 ▋
2. 顶部副文案「$ git commit -m "feat: conquer the universe" && git push」：水平居中位于主文案上方（top: 14%），颜色 {{color.cyan.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，font-family: monospace，white-space: nowrap
3. 底部副文案「// 0 ERRORS · 0 WARNINGS · BUILD SUCCESSFUL [100%]」：水平居中位于主文案下方（bottom: 14%），颜色 {{color.green.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，font-family: monospace，white-space: nowrap
4. 极客界面装饰：左上角 macOS 窗口红黄绿三色小圆点（#FF5F56, #FFBD2E, #27C93F），四周微弱代码矩阵网格背景，两侧装饰极客二进制流「01010010」与快捷键角标「[⌘+S] [⌘+ENTER]」

## 色系与视觉质感
- 底色：VS Code 极客深炭黑 {{color.bg.css}} (默认 #0D1117)
- 终端高光绿：{{color.green.css}} (默认 #39D353)
- 语法高亮青蓝：{{color.cyan.css}} (默认 #58A6FF)
- 主文案纯白：{{color.white.css}} (默认 #FFFFFF)

## 模板变量化要求（核心要求：方便用户后续在 UI 右侧属性面板一键改字换色）
- 主文案使用 {{text.title}}，在 htmlBindings.text.title 设默认值 "KEEP CALM & GIT PUSH"
- 顶部副文案使用 {{text.subtitleTop}}，在 htmlBindings.text.subtitleTop 设默认值 "$ git commit -m 'feat: conquer the universe' && git push"
- 底部副文案使用 {{text.subtitleBottom}}，在 htmlBindings.text.subtitleBottom 设默认值 "// 0 ERRORS · 0 WARNINGS · BUILD SUCCESSFUL [100%]"
- 终端高光绿使用 {{color.green.css}}，在 htmlBindings.color.green 设默认值 { color: "#39D353", type: "pure" }
- 语法高亮蓝使用 {{color.cyan.css}}，在 htmlBindings.color.cyan 设默认值 { color: "#58A6FF", type: "pure" }
- 主背景底色使用 {{color.bg.css}}，在 htmlBindings.color.bg 设默认值 { color: "#0D1117", type: "pure" }
- 字体使用 {{font.hero.family}} 绑定等宽/硬朗无衬线字体
- 在 htmlTemplateFields 中声明对应的 label（主标题文字、顶部终端命令、底部构建状态、终端荧光绿、代码高亮蓝、背景底色、主视觉字体）

## 执行步骤
1. 不要检索其他贴纸，本设计为全新原创定制
2. 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
3. resource.searchFont({ query: "黑体", category: "sans" }) 检索硬朗字体，绑定为 font.hero
4. 立即用一个完整的 canvas.addHtml 实现完整画面（必须采用上述模板变量和 htmlBindings，字字忠实，禁止硬编码文字）
5. 确认无误后立即调用 canvas.updateAndSaveSticker 保存，名称为「KEEP CALM·极客终端代码桌垫」`
  },
  {
    key: "maintain_passion",
    theme: "「保持热爱 奔赴山海」治愈日落手写艺术字桌垫",
    saveName: "保持热爱·治愈日落手写桌垫",
    fontQuery: "手写",
    fontCategory: "calligraphy",
    brief: `请设计一张全新的「保持热爱 奔赴山海」治愈日落手写艺术字桌垫/鼠标垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 canvas.smartSize 或其他尺寸，尺寸已锁定。

## 文案与排版结构
1. 主文案「保持热爱 奔赴山海」：横排居中，温润潇洒手写体大字，字号 calc(var(--canvas-html-vh) * 34)，字重 700，颜色 {{color.sunset.css}}，文字带夕阳晚霞柔和发光微投影
2. 顶部副文案「CHERISH EVERY MOMENT · LIVE WITH PASSION」：水平居中位于主文案上方（top: 14%），颜色 {{color.cream.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，字距 letter-spacing: 4px，white-space: nowrap
3. 底部副文案「日落尤其温柔 · 人间皆是浪漫 · 追光的人终会身披万丈光芒」：水平居中位于主文案下方（bottom: 14%），颜色 {{color.cream.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，white-space: nowrap
4. 文艺清新装饰：主文案两侧配以极简手绘小星芒 ✨ 与山海微波纹装饰线，四周舒展克制留白，视觉极为舒适护眼

## 色系与视觉质感
- 底色：深邃暮色山海蓝紫渐变 {{color.bg.css}} (默认 linear-gradient(135deg, #161A2B 0%, #24243E 60%, #302B4A 100%))
- 暖霞橙：{{color.sunset.css}} (默认 #FFB088)
- 奶油杏白：{{color.cream.css}} (默认 #F9EFE6)

## 模板变量化要求（核心要求：方便用户后续在 UI 右侧属性面板一键改字换色）
- 主文案使用 {{text.title}}，在 htmlBindings.text.title 设默认值 "保持热爱 奔赴山海"
- 顶部副文案使用 {{text.subtitleTop}}，在 htmlBindings.text.subtitleTop 设默认值 "CHERISH EVERY MOMENT · LIVE WITH PASSION"
- 底部副文案使用 {{text.subtitleBottom}}，在 htmlBindings.text.subtitleBottom 设默认值 "日落尤其温柔 · 人间皆是浪漫 · 追光的人终会身披万丈光芒"
- 暖霞橙色使用 {{color.sunset.css}}，在 htmlBindings.color.sunset 设默认值 { color: "#FFB088", type: "pure" }
- 奶油杏白使用 {{color.cream.css}}，在 htmlBindings.color.cream 设默认值 { color: "#F9EFE6", type: "pure" }
- 主背景底色使用 {{color.bg.css}}，在 htmlBindings.color.bg 设默认值 { color: "#161A2B", type: "pure" }
- 字体使用 {{font.hero.family}} 绑定手写/行书字体
- 在 htmlTemplateFields 中声明对应的 label（主标题文字、顶部副文案、底部副文案、暖霞橙、奶油白、背景底色、主视觉手写字体）

## 执行步骤
1. 不要检索其他贴纸，本设计为全新原创定制
2. 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
3. resource.searchFont({ query: "手写", category: "calligraphy" }) 检索治愈手写字体，绑定为 font.hero
4. 立即用一个完整的 canvas.addHtml 实现完整画面（必须采用上述模板变量和 htmlBindings，字字忠实，禁止硬编码文字）
5. 确认无误后立即调用 canvas.updateAndSaveSticker 保存，名称为「保持热爱·治愈日落手写桌垫」`
  },
  {
    key: "rijindoujin",
    theme: "「日进斗金」国潮金石合体字聚财艺术字桌垫",
    saveName: "日进斗金·国潮金石合体字桌垫",
    fontQuery: "毛笔",
    fontCategory: "calligraphy",
    brief: `请设计一张全新的「日进斗金」国潮金石合体字聚财高奢艺术字桌垫/鼠标垫。

## 画布尺寸（最高优先级·严格执行）
- 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })，即 1800×800 像素（900×400mm 比例 2.25:1）
- 禁止使用 canvas.smartSize 或其他尺寸，尺寸已锁定。

## 文案与排版结构
1. 主文案「日进斗金」：横排居中，金石雕刻大字，字号 calc(var(--canvas-html-vh) * 36)，字重极重，颜色为赤金 {{color.gold.css}}，带立体浮雕倒角阴影
2. 顶部副文案「祥龙纳瑞 · 八方来财 · 四季平安 · 岁岁欢愉」：水平居中位于主文案上方（top: 14%），颜色 {{color.goldMuted.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，字距 letter-spacing: 3px，white-space: nowrap
3. 底部副文案「勤耕不辍行远道 · 时来运转步步高 ↗」：水平居中位于主文案下方（bottom: 14%），颜色 {{color.goldMuted.css}}，字号 calc(var(--canvas-html-vh) * 6.5)，white-space: nowrap
4. 左右对称金章：左侧竖排圆章「日」「进」，右侧竖排圆章「斗」「金」，金线双圈包边
5. 边框装饰：古典回纹连珠金线边框 + 四角传统如意祥云折角

## 色系与视觉质感
- 底色：深沉朱砂黛黑暗纹底 {{color.bg.css}} (默认 #180F10)
- 故宫赤金：{{color.gold.css}} (默认 #F7CE76)
- 暖香槟金：{{color.goldMuted.css}} (默认 #DFBA67)
- 宫廷朱红点缀：{{color.cinnabar.css}} (默认 #C83232)

## 模板变量化要求（核心要求：方便用户后续在 UI 右侧属性面板一键改字换色）
- 主文案使用 {{text.title}}，在 htmlBindings.text.title 设默认值 "日进斗金"
- 顶部副文案使用 {{text.subtitleTop}}，在 htmlBindings.text.subtitleTop 设默认值 "祥龙纳瑞 · 八方来财 · 四季平安 · 岁岁欢愉"
- 底部副文案使用 {{text.subtitleBottom}}，在 htmlBindings.text.subtitleBottom 设默认值 "勤耕不辍行远道 · 时来运转步步高 ↗"
- 赤金高光使用 {{color.gold.css}}，在 htmlBindings.color.gold 设默认值 { color: "#F7CE76", type: "pure" }
- 暖金色使用 {{color.goldMuted.css}}，在 htmlBindings.color.goldMuted 设默认值 { color: "#DFBA67", type: "pure" }
- 主背景底色使用 {{color.bg.css}}，在 htmlBindings.color.bg 设默认值 { color: "#180F10", type: "pure" }
- 字体使用 {{font.hero.family}} 绑定书法/榜书字体
- 在 htmlTemplateFields 中声明对应的 label（主标题文字、顶部吉祥文案、底部励志文案、故宫赤金、暖金色、背景底色、主视觉书法字体）

## 执行步骤
1. 不要检索其他贴纸，本设计为全新原创定制
2. 第一步必须调用 canvas.setSize({ width: 1800, height: 800, unit: "px", lock: true })
3. resource.searchFont({ query: "毛笔", category: "calligraphy" }) 检索书法字体，绑定为 font.hero
4. 立即用一个完整的 canvas.addHtml 实现完整画面（必须采用上述模板变量和 htmlBindings，字字忠实，禁止硬编码文字）
5. 确认无误后立即调用 canvas.updateAndSaveSticker 保存，名称为「日进斗金·国潮金石合体字桌垫」`
  }
];

async function runWorker(task, connId, workerIdx) {
  const t0 = Date.now();
  console.log(`\n🚀 [Worker ${workerIdx + 1}] 开始派发: ${task.theme}`);
  console.log(`   目标实例: ${connId}`);

  try {
    // 1. 清理已有会话，确保干净初始状态
    await mcp("system.design_tool.clear_conversation", { connectionId: connId }, 15000).catch(() => {});

    // 2. 派发并等待完成（自动模式）
    const runRes = await mcp("system.design_tool.run_task", {
      connectionId: connId,
      message: task.brief,
      executionMode: "automatic",
      timeoutMs: 600000,
    }, 620000);

    const duration = Math.round((Date.now() - t0) / 1000);
    console.log(`✅ [Worker ${workerIdx + 1}] 设计完成，耗时 ${duration}s`);
    
    // 3. 核查画布状态
    const stateRes = await mcp("system.design_tool.get_state", { connectionId: connId }, 30000).catch(() => ({}));
    const canvasSize = stateRes?.canvasState?.canvasSize || {};
    const textPreview = (stateRes?.canvasState?.elements || []).map(e => e.textPreview || "").join(" ");
    
    // 4. 捕获画布快照
    const snapRes = await mcp("system.design_tool.snapshot", { connectionId: connId }, 90000).catch((e) => ({ error: e.message }));
    let snapPath = null;
    if (snapRes?.snapshot && typeof snapRes.snapshot === "string" && snapRes.snapshot.startsWith("data:image/")) {
      const b64 = snapRes.snapshot.split(",")[1];
      snapPath = join(ARTIFACT_DIR, `artistic_mat_${task.key}.png`);
      writeFileSync(snapPath, Buffer.from(b64, "base64"));
      console.log(`   📸 快照已保存: ${snapPath} (${Math.round(b64.length * 0.75 / 1024)} KB)`);
    }

    return {
      success: true,
      workerIdx: workerIdx + 1,
      key: task.key,
      theme: task.theme,
      connId,
      duration,
      canvasSize: `${canvasSize.width}x${canvasSize.height}`,
      textPreview,
      outputs: runRes?.outputs || [],
      snapPath,
    };
  } catch (err) {
    const duration = Math.round((Date.now() - t0) / 1000);
    console.error(`❌ [Worker ${workerIdx + 1}] 失败: ${err.message} (${duration}s)`);
    return {
      success: false,
      workerIdx: workerIdx + 1,
      key: task.key,
      theme: task.theme,
      connId,
      duration,
      error: err.message,
    };
  }
}

async function main() {
  console.log("================================================================================");
  console.log("🎨 艺术字风格鼠标垫/桌垫 多实例集群并发设计测试");
  console.log("================================================================================");

  // 1. 查询当前在线可用设计端
  const dtRes = await mcp("system.design_tool.query_design_tools", { onlineOnly: true }, 30000);
  const items = dtRes?.items || [];
  const idleTools = items.filter(i => !i.isDesigning && i.batchStatus === "idle");

  console.log(`当前在线设计工具: ${items.length} 台`);
  console.log(`当前就绪空闲设计工具: ${idleTools.length} 台`);

  if (idleTools.length === 0) {
    console.error("❌ 没有可用空闲设计工具，退出");
    process.exit(1);
  }

  const assignedCount = Math.min(idleTools.length, TASKS.length);
  console.log(`本次并发派发: ${assignedCount} 个艺术字桌垫主题\n`);

  const workerPromises = [];
  for (let i = 0; i < assignedCount; i++) {
    const task = TASKS[i];
    const tool = idleTools[i];
    workerPromises.push(runWorker(task, tool.clientId, i));
  }

  const results = await Promise.all(workerPromises);

  console.log("\n================================================================================");
  console.log("📊 并发生产与质检总结报告");
  console.log("================================================================================");
  for (const r of results) {
    if (r.success) {
      console.log(`✅ [Worker ${r.workerIdx}] ${r.theme}`);
      console.log(`   实例: ${r.connId} | 耗时: ${r.duration}s | 尺寸: ${r.canvasSize}`);
      console.log(`   文案核验: ${r.textPreview.slice(0, 80)}...`);
      if (r.snapPath) console.log(`   快照文件: ${r.snapPath}`);
    } else {
      console.log(`❌ [Worker ${r.workerIdx}] ${r.theme}`);
      console.log(`   实例: ${r.connId} | 耗时: ${r.duration}s | 错误: ${r.error}`);
    }
  }

  writeFileSync(
    join(ARTIFACT_DIR, "batch_mousepad_results.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(`\n结果已写入: ${join(ARTIFACT_DIR, "batch_mousepad_results.json")}`);
}

main().catch(console.error);
