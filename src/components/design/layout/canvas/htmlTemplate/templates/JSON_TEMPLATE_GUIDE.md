# JSON 模板格式说明

## 📁 文件结构

每个模板是一个独立的 JSON 文件，存放在分类文件夹下。

### 路径示例
```
templates/
├── apparelTypography/
│   ├── streetwear-bold-text.json
│   ├── minimal-serif-quote.json
│   └── ...
├── ecommerceMarketing/
│   ├── product-promo-banner.json
│   └── ...
└── socialMedia/
    ├── instagram-square-post.json
    └── ...
```

---

## 📝 JSON 模板格式

```json
{
  "id": "unique-template-id",
  "name": "模板名称",
  "category": "分类 / 子分类",
  "description": "模板描述",
  "tags": ["标签1", "标签2"],
  "difficulty": "simple",
  "printStyle": "cutout",
  "suitableProducts": ["产品1", "产品2"],
  "sceneDescription": "使用场景描述",
  "sortOrder": 100,
  "fields": [
    {
      "key": "text.title",
      "label": "标题",
      "type": "text",
      "placeholder": "默认占位符",
      "description": "字段说明"
    }
  ],
  "defaults": {
    "text": { "title": "默认值" },
    "color": {
      "primary": { "color": "#ff0000", "type": "pure" }
    }
  },
  "html": "<style>...</style><div>...</div>"
}
```

---

## 🔑 字段说明

### 基础信息

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识符，使用 kebab-case |
| `name` | string | ✅ | 模板名称 |
| `category` | string | ✅ | 分类，如 "服饰 / 文字排版" |
| `description` | string | ✅ | 简短描述 |
| `tags` | string[] | ✅ | 标签数组 |
| `difficulty` | string | ✅ | 难度：`simple` / `intermediate` / `advanced` |
| `printStyle` | string | ✅ | 印花方式：`cutout` / `poster` / `label` 等 |
| `suitableProducts` | string[] | ✅ | 适用产品列表 |
| `sceneDescription` | string | ✅ | 使用场景详细说明 |
| `sortOrder` | number | ✅ | 排序权重，越小越靠前 |

### 字段定义 (fields)

每个字段定义包含：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | string | ✅ | 变量键名，如 `text.title` |
| `label` | string | ✅ | 显示名称 |
| `type` | string | ✅ | 类型：`text` / `textarea` / `number` / `color` / `image` / `font` |
| `placeholder` | string | ❌ | 占位符文本 |
| `description` | string | ❌ | 字段说明 |
| `min` | number | ❌ | 数字最小值 |
| `max` | number | ❌ | 数字最大值 |
| `step` | number | ❌ | 数字步长 |
| `rows` | number | ❌ | 文本域行数 |

### 默认值 (defaults)

按类别组织的默认值：

```json
{
  "defaults": {
    "text": {
      "title": "默认标题",
      "subtitle": "默认副标题"
    },
    "color": {
      "primary": { "color": "#ff0000", "type": "pure" },
      "bg": { "color": "#ffffff", "type": "pure" }
    },
    "font": {
      "title": { "id": "", "name": "", "url": "" }
    },
    "image": {
      "hero": {
        "id": "builtin-id",
        "name": "图片名",
        "url": "data:image/..."
      }
    },
    "style": {
      "spacing": 20,
      "size": 100
    }
  }
}
```

### HTML 内容

包含内联 `<style>` 和 HTML 结构：

```json
{
  "html": "<style>\n  .container { ... }\n</style>\n<div class=\"container\">\n  {{text.title}}\n</div>"
}
```

**注意**：
- 使用 `{{key}}` 语法作为变量占位符
- CSS 中也可以使用变量，如 `color: {{color.primary}}`
- 样式和结构写在同一个字符串中

---

## 🆚 变量类型对照

### text
单行文本输入
```json
{ "key": "text.title", "label": "标题", "type": "text" }
```

### textarea
多行文本输入
```json
{ "key": "text.desc", "label": "描述", "type": "textarea", "rows": 3 }
```

### number
数字输入
```json
{ "key": "style.size", "label": "大小", "type": "number", "min": 0, "max": 100, "step": 5 }
```

### color
颜色选择器
```json
{ "key": "color.primary", "label": "主色", "type": "color" }
```

### image
图片选择器
```json
{ "key": "image.hero", "label": "主图", "type": "image" }
```

### font
字体选择器
```json
{ "key": "font.title", "label": "标题字体", "type": "font" }
```

---

## ✏️ 创建新模板

### 步骤 1：创建 JSON 文件

在对应分类文件夹下创建新的 JSON 文件：

```
templates/apparelTypography/my-new-template.json
```

### 步骤 2：填写模板内容

按照上面的格式填写 JSON。

### 步骤 3：测试

系统会自动加载所有 JSON 模板，无需额外配置。

---

## 📂 最佳实践

### 1. 文件命名
- 使用 kebab-case：`my-template-name.json`
- 名称要有描述性：`streetwear-bold-text.json`

### 2. ID 命名
- 唯一且描述性
- 使用 kebab-case
- 建议包含分类信息

### 3. HTML 编写
- 保持简洁
- 使用现代 CSS（flexbox、grid）
- 使用 `clamp()` 实现响应式
- 避免使用 JavaScript

### 4. 变量命名
- 使用类别前缀：`text.*` / `color.*` / `style.*`
- 保持简洁明了

### 5. 默认值
- 提供合理的默认值
- 颜色使用 `{ color: "#xxx", type: "pure" }` 格式
- 字体使用 `{ id: "", name: "", url: "" }` 格式

---

## 🔧 工具函数

### 加载所有 JSON 模板
```typescript
import { loadAllJsonTemplates } from "./jsonTemplates";

const templates = loadAllJsonTemplates();
```

### 按分类加载
```typescript
import { loadTemplatesByCategory } from "./jsonTemplates";

const apparelTemplates = loadTemplatesByCategory("服饰");
```

### 根据 ID 获取
```typescript
import { getTemplateById } from "./jsonTemplates";

const template = getTemplateById("streetwear-bold-text");
```

---

## ✅ 优势

使用 JSON 格式的优势：

1. **易于维护** - 纯数据文件，不需要写 TypeScript
2. **易于扩展** - 添加新模板只需创建 JSON 文件
3. **结构清晰** - 数据与逻辑分离
4. **可移植性** - JSON 可以在不同系统间共享
5. **版本控制** - 更容易追踪模板变更
6. **非开发者可用** - 设计师也可以创建模板

---

## 📊 当前模板统计

| 分类 | 文件数 | 状态 |
|------|--------|------|
| apparelTypography | 6 | ✅ 完成 |
| ecommerceMarketing | 待转换 | 🔄 计划 |
| socialMedia | 待转换 | 🔄 计划 |

---

随时可以添加更多 JSON 模板！
