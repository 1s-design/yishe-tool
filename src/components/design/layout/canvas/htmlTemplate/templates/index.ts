import type { HtmlTemplateDefinition } from "../types";
import { cloneTemplateList } from "./shared";
import { allOverPrintTemplates } from "./allOverPrint";
import { apparelLayoutTemplates } from "./apparelLayouts";
import { infoCardTemplates } from "./infoCards";
import { labelTemplates } from "./labels";
import { largeFormatTemplates } from "./largeFormat";
import { marketingTemplates } from "./marketing";
import { motionSceneTemplates } from "./motionScenes";
import { packagingTemplates } from "./packaging";
import { posterTemplates } from "./posters";
import { productPatternTemplates } from "./productPatterns";
import { stickerTemplates } from "./stickers";
import { loadAllJsonTemplates } from "./jsonTemplates";

// 从 JSON 文件加载新模板
const jsonTemplates = loadAllJsonTemplates();

export const builtInHtmlTemplates: HtmlTemplateDefinition[] = [
  // JSON 模板（新增的高质量模板）
  ...jsonTemplates,
  // 原有模板
  ...productPatternTemplates,
  ...stickerTemplates,
  ...allOverPrintTemplates,
  ...largeFormatTemplates,
  ...posterTemplates,
  ...motionSceneTemplates,
  ...packagingTemplates,
  ...labelTemplates,
  ...infoCardTemplates,
  ...marketingTemplates,
  ...apparelLayoutTemplates,
].sort((left, right) => {
  const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.name.localeCompare(right.name, "zh-Hans-CN");
});

export function getBuiltInHtmlTemplates() {
  return cloneTemplateList(builtInHtmlTemplates);
}
