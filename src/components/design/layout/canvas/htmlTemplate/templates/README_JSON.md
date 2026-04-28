# HTML JSON 模板系统

## 📦 概述

本项目使用 JSON 文件格式定义 HTML 模板，使模板创建和维护更加简单。

---

## 📁 目录结构

```
templates/
├── apparelTypography/           # 服饰文字排版
│   ├── streetwear-bold-text.json
│   ├── minimal-serif-quote.json
│   ├── retro-vintage-badge.json
│   ├── modern-minimalist-brand.json
│   ├── japanese-zen-text.json
│   └── college-varsity-text.json
├── jsonTemplates.ts             # 统一加载器
├── templateLoader.ts            # 模板转换工具
├── index.ts                     # 主入口
└── JSON_TEMPLATE_GUIDE.md       # 详细说明
```

---

## 🚀 快速开始

### 添加新模板

1. **创建 JSON 文件**
   ```
   templates/apparelTypography/my-template.json
   ```

2. **填写内容**
   ```json
   {
     "id": "my-template",
     "name": "我的模板",
     "category": "服饰 / 文字排版",
     "description": "模板描述",
     "tags": ["标签"],
     "difficulty": "simple",
     "printStyle": "cutout",
     "suitableProducts": ["T恤"],
     "sceneDescription": "场景说明",
     "sortOrder": 999,
     "fields": [],
     "defaults": {},
     "html": "<style>...</style><div>...</div>"
   }
   ```

3. **完成！** 系统自动加载

---

## 📖 文档

- [JSON 模板格式详细说明](./JSON_TEMPLATE_GUIDE.md)
- [模板使用指南](./README.md)
- [重构总结](./REFACTOR_SUMMARY.md)

---

## ✅ 优势

- ✏️ **纯数据文件** - 不需要编程
- 🔄 **自动加载** - 添加文件即可
- 👥 **人人可用** - 设计师也能创建
- 📊 **易于维护** - 结构清晰
- 🔍 **版本友好** - 易于追踪变更

---

## 📊 当前模板

| 分类 | 数量 | 状态 |
|------|------|------|
| 服饰文字排版 | 6 | ✅ |
| 电商营销 | 待添加 | 🔄 |
| 社交媒体 | 待添加 | 🔄 |

---

随时可以添加更多模板！
