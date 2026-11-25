import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from "vue";
import {
  canvasStickerOptionsOnlyChild,
  updateRenderingCanvas,
} from "../index.tsx";
import {
  createFilterFromOptions,
  createTransformString,
  formatToNativeSizeString,
  getPositionInfoFromOptions,
} from "../helper.tsx";
import {
  createBasicDefaultOptions,
  createFilterDefaultOptions,
  createPositionDefaultOptions,
  createTransformDefaultOptions,
} from "./defaultOptions.tsx";
import { onBeforeReturnRender, onCanvasChildSetup, useCanvasChildSlotSize } from "./commonHooks.ts";

export const createDefaultCanvasChildMarkmapChartOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "markmapChart",
    markdown: "# 主题\n## 分支1\n### 子节点1\n### 子节点2\n## 分支2",
    backgroundColor: {
      type: "pure",
      color: "#ffffff",
    },
    width: {
      value: 100,
      unit: "vw",
    },
    height: {
      value: 100,
      unit: "vh",
    },
    position: createPositionDefaultOptions(canvasUnit),
    filter: createFilterDefaultOptions(canvasUnit),
    zIndex: 0,
    ...createBasicDefaultOptions(),
    transform: createTransformDefaultOptions(canvasUnit),
  };
};

export function createCanvasChildMarkmapChart(options) {
  return (
    <MarkmapChartChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></MarkmapChartChild>
  );
}

export const MarkmapChartChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const svgRef = ref<SVGSVGElement>();
    const errorMessage = ref("");
    let markmapInstance: any = null;

    onCanvasChildSetup({
      targetEl: svgRef,
      options: props.options,
      props,
    });

    const markdown = computed(() =>
      String(props.options?.markdown || "").trim(),
    );

    async function renderMarkmap() {
      const text = markdown.value;
      if (!text) {
        errorMessage.value = "请输入 Markdown 内容";
        await nextTick();
        updateRenderingCanvas();
        return;
      }

      if (!svgRef.value) return;

      try {
        errorMessage.value = "";
        svgRef.value.innerHTML = "";

        const [{ Transformer }, { Markmap }] = await Promise.all([
          import("markmap-lib"),
          import("markmap-view"),
        ]);

        const transformer = new Transformer();
        const { root } = transformer.transform(text);

        markmapInstance = Markmap.create(
          svgRef.value,
          {
            autoFit: true,
            duration: 0,
          },
          root,
        );
        markmapInstance?.fit?.();
      } catch (error: any) {
        errorMessage.value = error?.message || "Markmap 渲染失败";
      } finally {
        await nextTick();
        updateRenderingCanvas();
      }
    }

    useCanvasChildSlotSize(svgRef, props.options, () => {
      nextTick(() => {
        markmapInstance?.fit?.();
        updateRenderingCanvas();
      });
    });

    onMounted(() => {
      renderMarkmap();
    });

    watch(markdown, renderMarkmap, {
      deep: true,
    });

    return () => {
      const { containerStyle: _containerStyle, style: _style } =
        getPositionInfoFromOptions(props.options.position);

      const containerStyle: any = {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        ..._containerStyle,
      };

      const style: any = {
        flexShrink: 0,
        width: formatToNativeSizeString(props.options.width),
        height: formatToNativeSizeString(props.options.height),
        transform: createTransformString(props.options.transform),
        filter: createFilterFromOptions(props.options.filter),
        zIndex: props.options.zIndex,
        background: props.options.backgroundColor?.color || "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        padding: 0,
        pointerEvents: "none",
        ..._style,
      };

      onBeforeReturnRender({
        style,
        options: props.options,
      });

      return (
        <div style={containerStyle}>
          <div class="canvas-markmap-chart-child" style={style}>
            <style>{`
              .canvas-markmap-chart-child svg {
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                display: block;
              }
              .canvas-markmap-chart-child .canvas-markmap-chart-child__error {
                color: #c45656;
                font-size: 14px;
                line-height: 1.4;
                padding: 12px;
                background: rgba(255, 245, 245, 0.92);
                border: 1px solid rgba(196, 86, 86, 0.35);
                border-radius: 4px;
                white-space: pre-wrap;
                max-width: 100%;
                max-height: 100%;
                overflow: hidden;
                box-sizing: border-box;
              }
            `}</style>
            {errorMessage.value ? (
              <div class="canvas-markmap-chart-child__error">
                {errorMessage.value}
              </div>
            ) : (
              <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
            )}
          </div>
        </div>
      );
    };
  },
});
