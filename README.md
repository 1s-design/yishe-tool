# Design Tool

通用的在线设计工具前端，包含 2D/3D 设计画布、素材与模型管理、登录鉴权、分享卡片、后台管理等能力。

这个仓库已经做过一轮公开化整理：

- 去掉了默认生产域名、品牌硬编码和公开仓库中不应保留的敏感日志。
- 提供了通用的应用名称、后台标题、分享域名和二维码默认值配置。
- 清理了不适合继续入库的本地证书、私钥、日志残留和缓存文件。
- 将公开默认配置收口到环境变量和 `public/project.config.json`。

## 功能概览

- 2D/3D 设计编辑与画布导出
- 自定义模型、贴纸、字体、素材管理
- 用户登录、注册、资料获取与权限判断
- 后台管理路由与基础资源管理
- 分享卡片、二维码、截图与水印
- Web 与 Capacitor 应用构建支持

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址由 Vite 提供，前端会把 `/api` 代理到 `VITE_PROXY_TARGET`，默认值为 `http://localhost:1520`。

## 构建

```bash
npm run build
```

构建产物默认输出到 `www/`。

## 公开版配置

建议优先修改以下文件：

- `.env.development`
- `.env.production`
- `.env.app`
- `public/project.config.json`

关键配置项：

- `VITE_APP_NAME`: 应用全名
- `VITE_APP_SHORT_NAME`: 页面与加载态短名
- `VITE_ADMIN_TITLE`: 后台默认标题
- `VITE_PUBLIC_ORIGIN`: 对外分享链接域名
- `VITE_SHARE_WATERMARK`: 导出图片水印文案
- `VITE_DEFAULT_QRCODE_CONTENT`: 二维码元素默认内容
- `VITE_PROXY_TARGET`: 本地开发代理目标

`public/project.config.json` 用于配置公开站点信息，例如：

- 站点根地址
- H5 二维码地址
- 备案信息
- 首页联系方式

## 仓库使用建议

- 不要把真实生产域名、私钥、证书和带敏感信息的 `.env` 重新提交进仓库。
- 如果需要开放给第三方使用，优先通过 `VITE_*` 环境变量和 `public/project.config.json` 做品牌化与部署配置。
- 若历史提交里曾包含真实密钥或密码，正式开源前建议再做一次历史清理与密钥轮换。
