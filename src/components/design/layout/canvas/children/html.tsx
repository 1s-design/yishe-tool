/**
 * @description 支持 HTML 画布元素
 */

import { canvasStickerOptionsOnlyChild, updateRenderingCanvas } from "../index.tsx";
import { createFilterFromOptions, createTransformString } from "../helper.tsx";
import { computed, defineComponent, ref } from "vue";
import {
  createFilterDefaultOptions,
  createTransformDefaultOptions,
} from "./defaultOptions.tsx";
import { onCanvasChildSetup, onBeforeReturnRender } from "./commonHooks.ts";

function getHtmlChildScopeClass(id: string) {
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
  const blockedTags = new Set([
    "script",
    "iframe",
    "object",
    "embed",
    "link",
    "meta",
    "base",
    "form",
  ]);

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

function createHtmlRenderPayload(options) {
  const { htmlWithoutStyle, extractedCss } = extractHtmlStyleBlocks(options?.htmlContent || "");
  const scopeClassName = getHtmlChildScopeClass(options?.id);
  const scopedCss = scopeCssText(
    [extractedCss, typeof options?.cssContent === "string" ? options.cssContent : ""]
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

export const createDefaultCanvasChildHtmlOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "html",
    htmlContent: "",
    transform: createTransformDefaultOptions(canvasUnit),
    filter: createFilterDefaultOptions(canvasUnit),
    zIndex: 0,
  };
};

export function createCanvasChildHtml(options) {
  return (
    <Html
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></Html>
  );
}

export const Html = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const targetElRef = ref();

    onCanvasChildSetup({
      targetEl: targetElRef,
      options: props.options,
      props: props,
    });

    const renderPayload = computed(() => createHtmlRenderPayload(props.options));

    return () => {
      const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;
      const filterOptions =
        props.options?.filter || createFilterDefaultOptions(canvasUnit);

      const containerStyle: Record<string, string> = {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: "0",
        left: "0",
      };

      const style: Record<string, string | number> = {
        flexShrink: 0,
        width: "100%",
        height: "100%",
        transform: createTransformString(props.options.transform),
        filter: createFilterFromOptions(filterOptions),
        zIndex: props.options?.zIndex ?? 0,
        overflow: "hidden",
        boxSizing: "border-box",
      };

      onBeforeReturnRender({
        style,
        options: props.options,
      });

      return (
        <div style={containerStyle}>
          <div
            class={`${renderPayload.value.scopeClassName} canvas-html-child`}
            style={style}
            ref={targetElRef}
          >
            {renderPayload.value.scopedCss ? <style>{renderPayload.value.scopedCss}</style> : null}

            {renderPayload.value.sanitizedHtml ? (
              <div
                class="canvas-html-child__content"
                style={{ width: "100%", height: "100%" }}
                innerHTML={renderPayload.value.sanitizedHtml}
              ></div>
            ) : (
              <div
                class="canvas-html-child__placeholder"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                输入 HTML 代码
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});
