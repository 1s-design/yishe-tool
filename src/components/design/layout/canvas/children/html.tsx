/**
 * @description 支持 HTML 画布元素
 */

import {
  canvasStickerOptionsOnlyChild,
  reparentCanvasChildren,
  rescueReparentedCanvasChildren,
  updateRenderingCanvas,
} from "../index.tsx";
import { createFilterFromOptions, createTransformString, formatToNativeSizeString } from "../helper.tsx";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";
import {
  createFilterDefaultOptions,
  createTransformDefaultOptions,
} from "./defaultOptions.tsx";
import { onCanvasChildSetup, onBeforeReturnRender } from "./commonHooks.ts";
import {
  createHtmlRenderPayload,
  ensureHtmlTemplateFontsLoaded,
  ensureHtmlTemplateOptions,
} from "../htmlTemplate/runtime.ts";
import { resolveCanvasTypography } from "@/operations/canvas-typography";

export const createDefaultCanvasChildHtmlOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "html",
    htmlContent: "",
    htmlBindings: {},
    htmlTemplateFields: [],
    htmlTemplateDefaultBindings: {},
    htmlTemplateMeta: null,
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
    const contentElRef = ref<HTMLElement>();

    onCanvasChildSetup({
      targetEl: targetElRef,
      options: props.options,
      props: props,
    });

    watchEffect(() => {
      ensureHtmlTemplateOptions(props.options);
      ensureHtmlTemplateFontsLoaded(
        props.options?.htmlTemplateFields || [],
        props.options?.htmlBindings || {}
      );
    });

    const renderPayload = computed(() => createHtmlRenderPayload(props.options));

    function syncHtmlContentDom() {
      const container = contentElRef.value;
      if (!container) return;
      // 更新 innerHTML 前先将已挂载的嵌入子组件安全撤回离屏池，避免被 innerHTML 替换销毁
      rescueReparentedCanvasChildren(container);
      container.innerHTML = renderPayload.value.sanitizedHtml || "";
      nextTick(() => {
        reparentCanvasChildren();
        updateRenderingCanvas();
      });
    }

    onMounted(() => {
      syncHtmlContentDom();
    });

    watch(
      () => renderPayload.value.sanitizedHtml,
      () => {
        nextTick(syncHtmlContentDom);
      }
    );

    onBeforeUnmount(() => {
      rescueReparentedCanvasChildren(contentElRef.value);
    });

    return () => {
      const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;
      const canvasWidthCss = formatToNativeSizeString(canvasStickerOptionsOnlyChild.value.width);
      const canvasHeightCss = formatToNativeSizeString(canvasStickerOptionsOnlyChild.value.height);
      const canvasFontSizeCss = formatToNativeSizeString(
        canvasStickerOptionsOnlyChild.value.fontSize || { value: 32, unit: "px" }
      );
      const canvasFontSize = Number(canvasStickerOptionsOnlyChild.value.fontSize?.value) || 32;
      const typography = resolveCanvasTypography({
        width: Number(canvasStickerOptionsOnlyChild.value.width.value) || 1,
        height: Number(canvasStickerOptionsOnlyChild.value.height.value) || 1,
        unit: canvasUnit,
        density: canvasStickerOptionsOnlyChild.value.typographyDensity || "balanced",
        fontSize: canvasFontSize,
      });
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
        "--canvas-html-width": canvasWidthCss,
        "--canvas-html-height": canvasHeightCss,
        "--canvas-html-vw": `calc(${canvasWidthCss} / 100)`,
        "--canvas-html-vh": `calc(${canvasHeightCss} / 100)`,
        "--canvas-font-size": canvasFontSizeCss,
        "--type-hero": typography.typeScale.hero,
        "--type-title": typography.typeScale.title,
        "--type-primary": typography.typeScale.primaryText,
        "--type-primary-text": typography.typeScale.primaryText,
        "--type-subtitle": typography.typeScale.subtitle,
        "--type-body": typography.typeScale.body,
        "--type-caption": typography.typeScale.caption,
        "--type-micro": typography.typeScale.micro,
        flexShrink: 0,
        width: "100%",
        height: "100%",
        transform: createTransformString(props.options.transform),
        filter: createFilterFromOptions(filterOptions),
        zIndex: props.options?.zIndex ?? 0,
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        minWidth: "100%",
        minHeight: "100%",
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
            <style>{`
              :where(.${renderPayload.value.scopeClassName} .canvas-html-child__content),
              :where(.${renderPayload.value.scopeClassName} .canvas-html-child__content *:not(.s1-child-placeholder):not(.s1-child-placeholder *)) {
                all: revert;
                box-sizing: border-box;
              }

              .${renderPayload.value.scopeClassName} .canvas-html-child__content .s1-child-placeholder {
                font-size: 16px;
                line-height: 1.4;
                color: #111827;
                text-align: left;
                box-sizing: border-box;
              }

              .${renderPayload.value.scopeClassName} .canvas-html-child__content {
                display: block;
                width: 100%;
                height: 100%;
                position: absolute;
                inset: 0;
                overflow: hidden;
              }

              .${renderPayload.value.scopeClassName} .canvas-html-child__content style,
              .${renderPayload.value.scopeClassName} .canvas-html-child__content script {
                display: none;
              }
            `}</style>
            {renderPayload.value.scopedCss ? <style>{renderPayload.value.scopedCss}</style> : null}

            {renderPayload.value.sanitizedHtml ? (
              <div
                ref={contentElRef}
                class="canvas-html-child__content"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: "0",
                  display: "block",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  fontSize: "var(--canvas-font-size)",
                  minWidth: "100%",
                  minHeight: "100%"
                }}
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
