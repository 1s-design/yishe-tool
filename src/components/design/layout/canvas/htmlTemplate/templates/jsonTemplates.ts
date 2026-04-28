/**
 * JSON 模板统一入口
 * 集中管理和导出所有 JSON 模板
 */

import type { HtmlTemplateDefinition } from "../types";
import { loadTemplateFromJson } from "./templateLoader";

// 导入所有子文件夹下的 JSON 模板文件
// 注意：Vite glob 必须是静态字符串
const templateModules = import.meta.glob("./*/*.json", { eager: true });

/**
 * 加载所有 JSON 模板
 */
export function loadAllJsonTemplates(): HtmlTemplateDefinition[] {
  const templates: HtmlTemplateDefinition[] = [];

  for (const [, module] of Object.entries(templateModules)) {
    const json = (module as any).default;
    if (json && json.id) {
      try {
        const template = loadTemplateFromJson(json);
        templates.push(template);
      } catch (error) {
        console.warn(`[模板加载失败]`, error);
      }
    }
  }

  return templates;
}

/**
 * 按分类加载模板
 */
export function loadTemplatesByCategory(category: string): HtmlTemplateDefinition[] {
  return loadAllJsonTemplates().filter((t) => t.category.includes(category));
}

/**
 * 根据 ID 获取模板
 */
export function getTemplateById(id: string): HtmlTemplateDefinition | undefined {
  return loadAllJsonTemplates().find((t) => t.id === id);
}
