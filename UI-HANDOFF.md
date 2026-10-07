# 1s UI 交接报告

> 交接日期：2026-10-07  
> 当前 HEAD：`2f69b39`（shadcn-vue 功能可用版）  
> 目标：把编辑器 UI 打磨成 **Figma 级专业设计工具** 的质感

---

## 1. 项目是什么

`1s`（yishe-tool）是纯前端 Vue 3 + TypeScript 设计工具，主界面是「左工具栏 + 侧边面板 + 大画布 + 属性区」的创作台。

```bash
npm run dev        # 开发（默认 1522 端口）
npm run build      # 生产构建
npm run typecheck  # vue-tsc --noEmit
```

Node ≥ 22.12，包管理 npm。约定见根目录 `AGENTS.md`。

---

## 2. 关键决策（务必先读）

### 2.1 Element Plus 迁移已回退

历史上做过一次 shadcn-vue → Element Plus 全量迁移（提交 `2c77893`），**因大面积结构损坏 + 运行时崩溃已整体回退**。

| 内容 | 状态 |
|---|---|
| 当前工作分支状态 | 基于 `2f69b39`，shadcn-vue 体系 |
| Element Plus 迁移提交 | 在备份分支 `backup/element-plus-migration-2c77893` |
| 是否建议再迁 EP | **不建议**，除非接受重做模板结构；本次 UI 打磨走「现有 shadcn + 自建控件层」 |

回退原因摘要（避免重蹈覆辙）：
- 机械替换标签导致 `<template></template>` 提前闭合、孤儿节点，Vite 直接编不过
- shadcn 的 `variant` / `size` / `PopoverTrigger` / `Accordion` 等 API 与 EP 不兼容
- `message.ts` 的 toast/confirm 被抽掉导入后运行时报错

### 2.2 设计语言 = Figma UI3

视觉目标以 **Figma UI3 暗色工作台** 为准，参考图：

- `resources/ui3-dark-reference.png`（本仓库）
- 用户提供的 Figma 编辑器截图（左轨 + 大画布 + 右属性栏）

核心参数（已写入 `src/style/vars.less`）：

| Token | 值 |
|---|---|
| 画布 | `#1E1E1E` |
| 面板 | `#2C2C2C` / 升起 `#383838` |
| 强调蓝 | `#0D99FF` |
| 文字 | `#FFF` / `#B3B3B3` / `#6E6E6E` |
| 描边 | `#444444` |
| 字阶 | 9 / 10 / 11 / 12 / 13 / 14 px |
| 控件高度 | 22 / 26 / 30 |
| 左轨宽度 | 56px |
| 左/右面板 | 240px / 264px |

---

## 3. 本次已完成的 UI 改动

未提交（9 个文件），请先 diff 确认后再 commit。

### 3.1 新增：统一控件层 `src/style/controls.less`

这是 UI 的「零件规范」，新组件优先用这些类，不要再写各自为政的按钮样式。

| 类 | 用途 |
|---|---|
| `.u-btn` + `--ghost/--outline/--solid/--tonal/--danger` | 按钮三态 |
| `.u-icon-btn` (+`--sm/--xs/--lg`) | 图标按钮 |
| `.u-input` | 输入 |
| `.u-segmented` | 分段控件 |
| `.u-row` | 属性面板 label + control |
| `.u-panel*` | 面板头 / 分区 / 分区标题（带 +） |
| `.u-list-row` | Layers / Pages 列表行 |
| `.u-prop-row` | 属性行 label \| value |
| `.u-tabs` | Comment / Properties 标签 |
| `.u-float-toolbar` | 画布底部浮动工具条 |

交互统一为：
- hover = 黑 4% 叠层（暗色为白 8%）
- active = 加深一档
- focus-visible = 蓝色 2px 外环
- 选中 = `#0D99FF` 12–20% 底 + 蓝字
- 过渡 80ms

### 3.2 布局：去掉顶栏

- `showHeader` 默认 `false`（`src/components/design/store.ts`）
- 顶栏动作迁到**左轨底部** `.menu-bar-utils`：状态圆点、自动制作、共享、下载、主题、登录/头像
- 文件：`leftMenu.vue`、`headerMenu.vue`（顶栏组件仍在，只是不再默认渲染）

### 3.3 字号与密度

- `vars.less` 字阶整体收小一档
- 左轨项高 46px，标签 9px
- `Input` / `Button` 对齐 22/26/30 高度与焦点态

### 3.4 暗色 / 浅色令牌

- 暗色按 UI3 重写
- 浅色强调色从 `#0b57d0` 改为 Figma 蓝 `#0d99ff`

---

## 4. 文件清单（本次改动）

```
新增
  src/style/controls.less
  resources/ui3-dark-reference.png

修改
  src/style/vars.less
  src/modules/main/main.ts          # import controls.less
  src/components/design/store.ts    # showHeader = false
  src/components/design/layout/leftMenu.vue
  src/components/design/layout/headerMenu.vue
  src/components/ui/button/index.ts
  src/components/ui/input/Input.vue
```

---

## 5. 建议的后续工作（按优先级）

### P0 结构对齐 Figma
1. **左侧面板**换成 `.u-panel` / `.u-list-row`：Pages、Layers、项目资源，行高压缩、缩进、选中态
2. **右侧属性栏**换成 `.u-prop-row` / `.u-panel__section-title`，分区标题右侧 + 操作
3. **底部工具条**用 `.u-float-toolbar`（Figma 底部悬浮栏形态）

### P1 组件补齐
4. 对话框 / 弹层 / 下拉菜单密度与圆角统一
5. 滑块、开关、颜色选择器、数字输入（目前 `operateFormItem.vue` 里用 `!important` 硬拧 EP 尺寸，应废弃该写法）
6. 空态、加载态、Toast 位置与样式

### P2 交互与主题
7. 暗/浅主题切换打磨（令牌已就位，需回归）
8. 键盘焦点遍历、快捷键提示
9. 画布区域栅格/标尺质感

### P3 可选
10. 若必须走 Element Plus：从 `backup/element-plus-migration-2c77893` 起做**增量**迁移，禁止整文件正则替换
11. Figma MCP 接入后按节点精确对齐（见第 7 节）

---

## 6. 已知问题 / 坑

| 问题 | 说明 |
|---|---|
| `typecheck` 不干净 | 约 170 个历史 TS 错误（`customTextSticker/watch.ts`、three 类型、`svgCanvas` 等），多数与 UI 无关，不要在 UI 任务里顺手全清 |
| 字体 CORS | `fonts.googleapis.com` 在导出 PNG 时 `cssRules` 读不到，浏览器跨域限制，与 UI 无关 |
| shadcn `components/ui` | 仍在使用，不要删；Button/Input 已按新控件层收紧 |
| 强制样式 | `operateFormItem.vue` 对 `.el-*` 使用大量 `!important`，重构属性面板时优先干掉 |
| 命名冲突 | `unplugin-vue-components` 对 `Modal`/`Canvas`/`Image` 等有 naming conflict 警告 |

---

## 7. 环境与工具

- **Codex CLI** 已对齐 MiMo：`model = "mimo-v2.6-pro"`，`provider = "mimo"`（`https://api.xiaomimimo.com/v1`）
  - 需要环境变量 `MIMO_API_KEY`（已写入 `~/.zshrc`）
  - 原配置备份：`~/.codex/config.toml.bak-mimo-align-*`
- **Figma MCP** 尚未授权（`mcp.figma.com` 要 OAuth）。授权后可直接读设计文件节点做开发
- **Untitled UI** 授权：免费版可商用、可作参考；禁止转卖/再分发；MIT 代码在 [untitleduico/react](https://github.com/untitleduico/react)

---

## 8. 设计原则（写给接手的人）

1. **先改零件，再改页面** — 按钮/行/面板头不统一时，改 `controls.less`，不要在业务组件里写私有样式
2. **密度优先于装饰** — Figma 感来自小字号、紧行高、安静的 hover，不是阴影和渐变
3. **选中态和 hover 不要打架** — 选中必须能压过 hover
4. **一次只动一层** — 令牌 → 控件类 → 单个面板 → 整页，避免一把梭
5. **功能不许回归** — 当前 `2f69b39` 是功能可用基线；UI 改完点一遍核心流程（上传/贴纸/画布/导出/AI）
6. **不要做整库正则替换迁移** — Element Plus 那次就是这么炸的

---

## 9. 快速验收清单

改完 UI 后自检：

- [ ] `npm run dev` 能起、无新增编译错误
- [ ] 顶栏消失，左轨底部有下载/主题/登录
- [ ] 暗色下画布 `#1E1E1E`、面板 `#2C2C2C`、选中蓝 `#0D99FF`
- [ ] 按钮 hover/active/focus 三态一致
- [ ] 左轨 / 左面板 / 右面板字号 ≤ 12px
- [ ] 画布缩放、拖拽、贴纸、导出仍可用

---

## 10. 一句话总结

**功能基线稳在 shadcn-vue（`2f69b39`），UI 向 Figma UI3 看齐：统一控件层已就位，顶栏已收进左轨，字号密度已收小；下一步把左右面板和底部工具条换成新控件类，并按参考图逐区打磨。**

有问题优先查 `resources/ui3-dark-reference.png` 与本文第 2 / 8 节。
