/**
 * 模板加载工具函数
 * 从 JSON 文件加载模板定义
 */

import type { HtmlTemplateDefinition, HtmlTemplateFieldDefinition } from "../types";
import { createPureColor, defaultFontBinding } from "./shared";

/**
 * 将 JSON 模板数据转换为 HtmlTemplateDefinition 格式
 */
export function loadTemplateFromJson(json: any): HtmlTemplateDefinition {
  return {
    id: json.id,
    name: json.name,
    category: json.category,
    description: json.description,
    tags: json.tags || [],
    difficulty: json.difficulty,
    printStyle: json.printStyle,
    suitableProducts: json.suitableProducts || [],
    sceneDescription: json.sceneDescription,
    sortOrder: json.sortOrder ?? Number.MAX_SAFE_INTEGER,
    source: json.source || "builtin",
    bindingFields: convertFields(json.fields || []),
    defaultBindings: convertDefaults(json.defaults || {}),
    htmlContent: json.html || "",
  };
}

/**
 * 转换字段定义
 */
function convertFields(fields: any[]): HtmlTemplateFieldDefinition[] {
  return fields.map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    placeholder: field.placeholder,
    description: field.description,
    min: field.min,
    max: field.max,
    step: field.step,
    rows: field.rows,
  }));
}

/**
 * 转换默认值
 */
function convertDefaults(defaults: any): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [category, values] of Object.entries(defaults)) {
    if (category === "color") {
      result.color = {};
      for (const [key, value] of Object.entries(values as Record<string, any>)) {
        if (value.color && value.type) {
          result.color[key] = createPureColor(value.color);
        }
      }
    } else if (category === "font") {
      result.font = {};
      for (const [key, value] of Object.entries(values as Record<string, any>)) {
        result.font[key] = { ...defaultFontBinding, ...(value || {}) };
      }
    } else if (category === "image") {
      result.image = values;
    } else {
      result[category] = values;
    }
  }

  return result;
}
