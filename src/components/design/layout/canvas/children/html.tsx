/**
 * @description 支持 HTML 画布元素
 */

import { canvasStickerOptionsOnlyChild, updateRenderingCanvas } from "../index.tsx";
import { createFilterFromOptions, createTransformString } from "../helper.tsx";
import { computed, defineComponent, ref, watchEffect } from "vue";
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
