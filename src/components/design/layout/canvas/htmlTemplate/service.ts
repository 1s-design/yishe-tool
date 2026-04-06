import { builtInHtmlTemplates } from "./builtIn";
import type { HtmlTemplateDefinition } from "./types";

const LOCAL_HTML_TEMPLATE_STORAGE_KEY = "_1s_html_template_library";

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function getLocalTemplateRecords() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(LOCAL_HTML_TEMPLATE_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.warn("[htmlTemplate] failed to read local templates", error);
    return [];
  }
}

function setLocalTemplateRecords(records: HtmlTemplateDefinition[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_HTML_TEMPLATE_STORAGE_KEY, JSON.stringify(records));
}

export function getLocalHtmlTemplates() {
  return getLocalTemplateRecords()
    .map(normalizeStoredTemplate)
    .filter(Boolean) as HtmlTemplateDefinition[];
}

export function saveLocalHtmlTemplate(template: Partial<HtmlTemplateDefinition>) {
  const name = String(template?.name || "").trim();
  const htmlContent = String(template?.htmlContent || "").trim();

  if (!name || !htmlContent) {
    throw new Error("模板名称和 HTML 内容不能为空");
  }

  const records = getLocalTemplateRecords();
  const nextTemplate: HtmlTemplateDefinition = {
    id: template.id || `local-html-template-${Date.now()}`,
    name,
    category: template.category || "我的模板",
    description: template.description || "本地保存的 HTML 模板",
    tags: template.tags || ["local"],
    difficulty: template.difficulty,
    sceneDescription: template.sceneDescription || "",
    suitableProducts: template.suitableProducts || [],
    printStyle: template.printStyle,
    sortOrder: template.sortOrder,
    source: "local",
    htmlContent,
    bindingFields: template.bindingFields || [],
    defaultBindings: template.defaultBindings || {},
  };

  const nextRecords = records.filter((item) => item?.id !== nextTemplate.id);
  nextRecords.unshift(nextTemplate);
  setLocalTemplateRecords(nextRecords as HtmlTemplateDefinition[]);

  return nextTemplate;
}

function normalizeStoredTemplate(item: any): HtmlTemplateDefinition | null {
  const meta = item?.meta || {};
  const htmlContent = item?.htmlContent || meta?.htmlContent;
  const bindingFields = item?.bindingFields || meta?.bindingFields;

  if (!item?.id || !item?.name || !htmlContent || !Array.isArray(bindingFields)) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category || meta?.category || "我的模板",
    description: item.description || meta?.description || "",
    tags: item.tags || meta?.tags || [],
    difficulty: item.difficulty || meta?.difficulty,
    sceneDescription: item.sceneDescription || meta?.sceneDescription || "",
    suitableProducts: item.suitableProducts || meta?.suitableProducts || [],
    printStyle: item.printStyle || meta?.printStyle,
    sortOrder: item.sortOrder ?? meta?.sortOrder,
    source: item.source || "local",
    htmlContent,
    bindingFields,
    defaultBindings: item.defaultBindings || meta?.defaultBindings || {},
  };
}

export async function getHtmlTemplateLibrary() {
  const templates = builtInHtmlTemplates.map((item) => clone(item));
  const localTemplates = getLocalHtmlTemplates();

  localTemplates.forEach((item) => {
    if (!templates.find((template) => template.id === item.id)) {
      templates.unshift(item);
    }
  });

  return templates;
}
