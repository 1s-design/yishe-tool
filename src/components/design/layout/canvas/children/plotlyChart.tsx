import Plotly from "plotly.js-dist-min";
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useDebounceFn } from "@vueuse/core";
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

export const createDefaultCanvasChildPlotlyChartOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "plotlyChart",
    data: [{ x: [1, 2, 3, 4], y: [10, 15, 13, 17], type: "scatter" }],
    layout: {},
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

export function createCanvasChildPlotlyChart(options: any) {
  return (
    <PlotlyChartChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></PlotlyChartChild>
  );
}

export const PlotlyChartChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const targetRef = ref<HTMLElement>();
    const plotRef = ref<HTMLElement>();
    const errorMessage = ref("");

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    const data = computed(() => props.options?.data || []);
    const layout = computed(() => props.options?.layout || {});

    async function renderPlotly() {
      await nextTick();
      const el = plotRef.value;
      if (!el) return;

      const dataVal = data.value;
      const layoutVal = layout.value;

      if (!Array.isArray(dataVal) || dataVal.length === 0) {
        errorMessage.value = "请输入有效的 data 数组";
        updateRenderingCanvas();
        return;
      }

      try {
        errorMessage.value = "";
        const mergedLayout = {
          autosize: false,
          width: slotSize.value.width || 400,
          height: slotSize.value.height || 300,
          margin: { t: 48, r: 30, b: 48, l: 50 },
          ...JSON.parse(JSON.stringify(layoutVal)),
        };
        await Plotly.newPlot(
          el,
          JSON.parse(JSON.stringify(dataVal)),
          mergedLayout,
          {
            staticPlot: true,
            displayModeBar: false,
          },
        );
      } catch (error: any) {
        errorMessage.value = error?.message || "Plotly 渲染失败";
      } finally {
        updateRenderingCanvas();
      }
    }

    const debouncedRender = useDebounceFn(renderPlotly, 150);

    const { slotSize } = useCanvasChildSlotSize(targetRef, props.options, () => {
      debouncedRender();
    });

    onMounted(debouncedRender);
    watch(data, debouncedRender, { deep: true });
    watch(layout, debouncedRender, { deep: true });

    onBeforeUnmount(() => {
      if (plotRef.value) {
        Plotly.purge(plotRef.value);
      }
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
        overflow: "hidden",
        position: "relative",
        ..._style,
      };

      onBeforeReturnRender({
        style,
        options: props.options,
      });

      return (
        <div style={containerStyle}>
          <div ref={targetRef} style={style}>
            <style>{`
                            .canvas-plotly-child__error {
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
              <div class="canvas-plotly-child__error">{errorMessage.value}</div>
            ) : (
              <div
                ref={plotRef}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              ></div>
            )}
          </div>
        </div>
      );
    };
  },
});
