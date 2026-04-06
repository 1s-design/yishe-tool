import { canvasStickerOptionsOnlyChild } from "../index.tsx";
import { formatToNativeSizeString } from "../helper.tsx";
import { fetchFontFace } from "../operate/fontFamily/index.ts";
import type { HtmlTemplateDefinition, HtmlTemplateFieldDefinition, HtmlTemplateMeta } from "./types";

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (error) {
      // Fall through to JSON cloning for reactive objects.
    }
  }
  return JSON.parse(JSON.stringify(value));
}

export function getValueByPath(source: Record<string, any> | null | undefined, path: string) {
  if (!source || !path) {
    return undefined;
  }

  return path.split(".").reduce((current, key) => {
    if (current == null) {
      return undefined;
    }
    return current[key];
  }, source as any);
}

export function setValueByPath(target: Record<string, any>, path: string, value: any) {
  const segments = path.split(".").filter(Boolean);
  if (!segments.length) {
    return target;
  }

  let cursor: Record<string, any> = target;
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    if (isLast) {
      cursor[segment] = value;
      return;
    }

    if (!cursor[segment] || typeof cursor[segment] !== "object" || Array.isArray(cursor[segment])) {
      cursor[segment] = {};
    }

    cursor = cursor[segment];
  });

  return target;
}

export function ensureHtmlTemplateOptions(target: any) {
  if (!target || typeof target !== "object") {
    return target;
  }

  target.htmlBindings = target.htmlBindings && typeof target.htmlBindings === "object"
    ? target.htmlBindings
    : {};
  target.htmlTemplateFields = Array.isArray(target.htmlTemplateFields)
    ? target.htmlTemplateFields
    : [];
  target.htmlTemplateDefaultBindings =
    target.htmlTemplateDefaultBindings && typeof target.htmlTemplateDefaultBindings === "object"
      ? target.htmlTemplateDefaultBindings
      : {};
  target.htmlTemplateMeta =
    target.htmlTemplateMeta && typeof target.htmlTemplateMeta === "object"
      ? target.htmlTemplateMeta
      : null;

  return target;
}

export function normalizeHtmlTemplateBindings(
  fields: HtmlTemplateFieldDefinition[] = [],
  rawBindings: Record<string, any> = {}
) {
  const normalized = clone(rawBindings || {});

  fields.forEach((field) => {
    const currentValue = getValueByPath(normalized, field.key);
    if (currentValue !== undefined && currentValue !== null && currentValue !== "") {
      if (field.type === "color" && typeof currentValue === "string") {
        setValueByPath(normalized, field.key, {
          color: currentValue,
          type: "pure",
        });
      }
      return;
    }

    switch (field.type) {
      case "color":
        setValueByPath(normalized, field.key, {
          color: "#111827",
          type: "pure",
        });
        break;
      case "number":
        setValueByPath(normalized, field.key, 0);
        break;
      case "font":
      case "image":
        setValueByPath(normalized, field.key, null);
        break;
      case "textarea":
      case "text":
      default:
        setValueByPath(normalized, field.key, "");
        break;
    }
  });

  return normalized;
}

export function applyHtmlTemplateToTarget(target: any, template: HtmlTemplateDefinition) {
  ensureHtmlTemplateOptions(target);

  target.htmlContent = template.htmlContent;
  target.htmlTemplateFields = clone(template.bindingFields || []);
  target.htmlTemplateDefaultBindings = clone(template.defaultBindings || {});
  target.htmlBindings = normalizeHtmlTemplateBindings(
    target.htmlTemplateFields,
    target.htmlTemplateDefaultBindings
  );
  target.htmlTemplateMeta = {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    tags: template.tags || [],
    difficulty: template.difficulty,
    sceneDescription: template.sceneDescription,
    suitableProducts: template.suitableProducts || [],
    printStyle: template.printStyle,
    sortOrder: template.sortOrder,
    source: template.source || "builtin",
  } satisfies HtmlTemplateMeta;

  return target;
}

export function hasHtmlMagicVariables(templateText = "") {
  return /\{\{\s*[^}]+?\s*\}\}/.test(String(templateText || ""));
}

export function detachHtmlTemplateFromTarget(
  target: any,
  options: {
    preserveBindings?: boolean;
  } = {}
) {
  ensureHtmlTemplateOptions(target);

  target.htmlTemplateMeta = null;

  if (options.preserveBindings) {
    return target;
  }

  target.htmlTemplateFields = [];
  target.htmlTemplateDefaultBindings = {};
  target.htmlBindings = {};

  return target;
}

function normalizeTemplateContextValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map(normalizeTemplateContextValue);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const nextValue: Record<string, any> = {};
  Object.keys(value).forEach((key) => {
    nextValue[key] = normalizeTemplateContextValue(value[key]);
  });

  if (typeof value.color === "string") {
    nextValue.css = value.color;
  }

  if (typeof value.url === "string") {
    nextValue.src = value.url;
  }

  return nextValue;
}

function stringifyTemplateValue(value: any) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyTemplateValue(item)).join(", ");
  }

  if (typeof value === "object") {
    if (typeof value.family === "string" && value.family !== "inherit") {
      return value.family;
    }
    if (typeof value.color === "string") {
      return value.color;
    }
    if (typeof value.url === "string") {
      return value.url;
    }
    if (typeof value.css === "string") {
      return value.css;
    }
  }

  return "";
}

export function createHtmlTemplateContext(options: any) {
  ensureHtmlTemplateOptions(options);

  const bindings = normalizeTemplateContextValue(options?.htmlBindings || {});
  const bindingFields: HtmlTemplateFieldDefinition[] = options?.htmlTemplateFields || [];

  bindingFields.forEach((field) => {
    if (field.type !== "font") {
      return;
    }

    const currentValue = getValueByPath(bindings, field.key);
    if (!currentValue || typeof currentValue !== "object") {
      setValueByPath(bindings, field.key, {
        family: "Arial",
      });
      return;
    }

    currentValue.family = currentValue.id ? `font_${currentValue.id}` : "Arial";
  });

  const canvasWidth = formatToNativeSizeString(canvasStickerOptionsOnlyChild.value.width);
  const canvasHeight = formatToNativeSizeString(canvasStickerOptionsOnlyChild.value.height);

  return {
    ...bindings,
    canvas: {
      width: canvasStickerOptionsOnlyChild.value.width.value,
      widthUnit: canvasStickerOptionsOnlyChild.value.width.unit,
      height: canvasStickerOptionsOnlyChild.value.height.value,
      heightUnit: canvasStickerOptionsOnlyChild.value.height.unit,
      widthCss: canvasWidth,
      heightCss: canvasHeight,
    },
    element: {
      id: options?.id || "",
      zIndex: options?.zIndex ?? 0,
    },
  };
}

export function resolveHtmlMagicVariables(templateText = "", context: Record<string, any> = {}) {
  if (!templateText) {
    return "";
  }

  return templateText.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, path) => {
    const value = getValueByPath(context, String(path).trim());
    return stringifyTemplateValue(value);
  });
}

export async function ensureHtmlTemplateFontsLoaded(
  fields: HtmlTemplateFieldDefinition[] = [],
  bindings: Record<string, any> = {}
) {
  const fontFields = fields.filter((field) => field.type === "font");

  await Promise.all(
    fontFields.map(async (field) => {
      const value = getValueByPath(bindings, field.key);
      if (!value?.id || !value?.url || !value?.name) {
        return;
      }

      try {
        await fetchFontFace({
          id: value.id,
          url: value.url,
          name: value.name,
        });
      } catch (error) {
        console.warn("[htmlTemplate] failed to load font binding", field.key, error);
      }
    })
  );
}

export function getHtmlChildScopeClass(id: string) {
  const safeId = String(id || "html")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-");
  return `canvas-html-child-${safeId}`;
}

function extractHtmlStyleBlocks(rawHtml = "") {
  const styleBlocks = [...rawHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  return {
    htmlWithoutStyle: rawHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim(),
    extractedCss: styleBlocks.map((item) => item[1] || "").join("\n").trim(),
  };
}

function sanitizeInlineStyle(rawStyle = "") {
  return rawStyle
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/behavior\s*:[^;]+;?/gi, "")
    .replace(/url\(\s*(['"]?)\s*javascript:[^)]+\)/gi, "none")
    .replace(/position\s*:\s*fixed/gi, "position: absolute")
    .trim();
}

function sanitizeHtmlContent(rawHtml = "") {
  if (!rawHtml.trim()) {
    return "";
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(rawHtml, "text/html");
  const blockedTags = new Set(["script", "iframe", "object", "embed", "link", "meta", "base", "form"]);

  documentNode.body.querySelectorAll("*").forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    if (blockedTags.has(tagName)) {
      element.remove();
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const attrName = attribute.name.toLowerCase();
      const attrValue = attribute.value || "";

      if (attrName.startsWith("on") || attrName === "srcdoc") {
        element.removeAttribute(attribute.name);
        return;
      }

      if (attrName === "style") {
        const safeStyle = sanitizeInlineStyle(attrValue);
        if (safeStyle) {
          element.setAttribute("style", safeStyle);
        } else {
          element.removeAttribute(attribute.name);
        }
        return;
      }

      if (
        ["href", "src", "xlink:href", "formaction", "action"].includes(attrName) &&
        /^\s*javascript:/i.test(attrValue)
      ) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (
        ["href", "src", "xlink:href"].includes(attrName) &&
        /^\s*data:text\/html/i.test(attrValue)
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return documentNode.body.innerHTML.trim();
}

function sanitizeCssContent(rawCss = "") {
  return rawCss
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@import[\s\S]*?;/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/behavior\s*:[^;]+;?/gi, "")
    .replace(/url\(\s*(['"]?)\s*javascript:[^)]+\)/gi, "none")
    .replace(/position\s*:\s*fixed/gi, "position: absolute")
    .trim();
}

function findMatchingBrace(text: string, openBraceIndex: number) {
  let depth = 0;
  for (let index = openBraceIndex; index < text.length; index += 1) {
    const character = text[index];
    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function prefixCssSelector(selector: string, scopeSelector: string) {
  const trimmedSelector = selector.trim();
  if (!trimmedSelector) {
    return scopeSelector;
  }

  if (
    trimmedSelector.startsWith(scopeSelector) ||
    trimmedSelector === "from" ||
    trimmedSelector === "to" ||
    /^\d+%$/.test(trimmedSelector)
  ) {
    return trimmedSelector;
  }

  const normalizedSelector = trimmedSelector.replace(/\b(:root|html|body)\b/g, scopeSelector);

  if (normalizedSelector.includes(":scope")) {
    return normalizedSelector.replace(/:scope/g, scopeSelector);
  }

  if (/^[>+~]/.test(normalizedSelector)) {
    return `${scopeSelector} ${normalizedSelector}`;
  }

  if (/^[:[]/.test(normalizedSelector)) {
    return `${scopeSelector}${normalizedSelector}`;
  }

  if (normalizedSelector.startsWith("&")) {
    return normalizedSelector.replace(/&/g, scopeSelector);
  }

  return `${scopeSelector} ${normalizedSelector}`;
}

function scopeCssSelectors(selectorText: string, scopeSelector: string) {
  return selectorText
    .split(",")
    .map((selector) => prefixCssSelector(selector, scopeSelector))
    .join(", ");
}

function scopeCssText(rawCss = "", scopeSelector: string) {
  const cssText = sanitizeCssContent(rawCss);
  if (!cssText) {
    return "";
  }

  let cursor = 0;
  let result = "";

  while (cursor < cssText.length) {
    while (/\s/.test(cssText[cursor] || "")) {
      cursor += 1;
    }

    if (cursor >= cssText.length) {
      break;
    }

    if (cssText[cursor] === "@") {
      const openBraceIndex = cssText.indexOf("{", cursor);
      const semicolonIndex = cssText.indexOf(";", cursor);

      if (semicolonIndex !== -1 && (openBraceIndex === -1 || semicolonIndex < openBraceIndex)) {
        result += cssText.slice(cursor, semicolonIndex + 1);
        cursor = semicolonIndex + 1;
        continue;
      }

      if (openBraceIndex === -1) {
        result += cssText.slice(cursor);
        break;
      }

      const closeBraceIndex = findMatchingBrace(cssText, openBraceIndex);
      if (closeBraceIndex === -1) {
        result += cssText.slice(cursor);
        break;
      }

      const atRuleHeader = cssText.slice(cursor, openBraceIndex).trim();
      const atRuleBody = cssText.slice(openBraceIndex + 1, closeBraceIndex);

      if (/^@keyframes/i.test(atRuleHeader) || /^@font-face/i.test(atRuleHeader)) {
        result += `${atRuleHeader}{${atRuleBody}}`;
      } else {
        result += `${atRuleHeader}{${scopeCssText(atRuleBody, scopeSelector)}}`;
      }

      cursor = closeBraceIndex + 1;
      continue;
    }

    const openBraceIndex = cssText.indexOf("{", cursor);
    if (openBraceIndex === -1) {
      break;
    }

    const closeBraceIndex = findMatchingBrace(cssText, openBraceIndex);
    if (closeBraceIndex === -1) {
      break;
    }

    const selectorText = cssText.slice(cursor, openBraceIndex).trim();
    const bodyText = cssText.slice(openBraceIndex + 1, closeBraceIndex);

    result += `${scopeCssSelectors(selectorText, scopeSelector)}{${bodyText}}`;
    cursor = closeBraceIndex + 1;
  }

  return result.trim();
}

export function createHtmlRenderPayload(options: any) {
  ensureHtmlTemplateOptions(options);

  const context = createHtmlTemplateContext(options);
  const compiledHtml = resolveHtmlMagicVariables(options?.htmlContent || "", context);
  const { htmlWithoutStyle, extractedCss } = extractHtmlStyleBlocks(compiledHtml);
  const scopeClassName = getHtmlChildScopeClass(options?.id);
  const scopedCss = scopeCssText(
    [extractedCss, resolveHtmlMagicVariables(typeof options?.cssContent === "string" ? options.cssContent : "", context)]
      .filter(Boolean)
      .join("\n"),
    `.${scopeClassName}`
  );

  return {
    scopeClassName,
    scopedCss,
    sanitizedHtml: sanitizeHtmlContent(htmlWithoutStyle),
  };
}
