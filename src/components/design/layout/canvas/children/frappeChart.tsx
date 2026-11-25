import { Chart } from "frappe-charts";
import { computed, defineComponent, nextTick, onMounted, ref, watch } from "vue";
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

export const FRAPPE_CHART_TYPES = [
  "bar",
  "line",
  "pie",
  "percentage",
  "axis-mixed",
] as const;

export const createDefaultCanvasChildFrappeChartOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "frappeChart",
    chartType: "bar" as const,
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{ values: [25, 40, 30, 35, 8] }],
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

export function createCanvasChildFrappeChart(options: any) {
  return (
    <FrappeChartChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></FrappeChartChild>
  );
}

export const FrappeChartChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const chartContainerRef = ref<HTMLElement>();
    const chartInstance = ref<Chart | null>(null);
    const errorMessage = ref("");

    onCanvasChildSetup({
      targetEl: chartContainerRef,
      options: props.options,
      props,
    });

    const chartType = computed(() => props.options?.chartType || "bar");
    const labels = computed(() => {
      try {
        if (Array.isArray(props.options?.labels)) {
          return props.options.labels;
        }
        return ["Jan", "Feb", "Mar", "Apr", "May"];
      } catch {
        return ["Jan", "Feb", "Mar", "Apr", "May"];
      }
    });
    const datasets = computed(() => {
      try {
        if (Array.isArray(props.options?.datasets)) {
          return props.options.datasets;
        }
        return [{ values: [25, 40, 30, 35, 8] }];
      } catch {
        return [{ values: [25, 40, 30, 35, 8] }];
      }
    });

    function renderChart() {
      if (!chartContainerRef.value) return;

      try {
        errorMessage.value = "";

        if (chartInstance.value) {
          chartInstance.value.destroy();
          chartInstance.value = null;
        }

        const height = Math.max(200, Math.min(slotSize.value.height - 40, 900));
        chartInstance.value = new Chart(chartContainerRef.value, {
          data: {
            labels: labels.value,
            datasets: datasets.value,
          },
          type: chartType.value,
          height,
          colors: ["#7cd6fd", "#743ee2", "#ffa3ef", "#5e5e5e"],
        });
      } catch (error: any) {
        errorMessage.value = error?.message || "Frappe Chart 渲染失败";
      } finally {
        nextTick(() => {
          updateRenderingCanvas();
        });
      }
    }

    const { slotSize } = useCanvasChildSlotSize(chartContainerRef, props.options, () => {
      nextTick(renderChart);
    });

    onMounted(() => {
      nextTick(renderChart);
    });

    watch([chartType, labels, datasets], () => {
      nextTick(renderChart);
    }, {
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
        background: props.options.backgroundColor?.color || "#ffffff",
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
          <div
            ref={chartContainerRef}
            class="canvas-frappe-chart-child"
            style={style}
            data-chart-engine="frappe-charts"
          >
            <style>{`
              .canvas-frappe-chart-child .chart-container {
                width: 100%;
                height: 100%;
              }
              .canvas-frappe-chart-child svg {
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
              }
              .canvas-frappe-chart-child .canvas-frappe-chart-child__error {
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
              <div class="canvas-frappe-chart-child__error">
                {errorMessage.value}
              </div>
            ) : null}
          </div>
        </div>
      );
    };
  },
});
