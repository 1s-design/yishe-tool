import chartXkcd from "chart.xkcd";
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

export const CHART_XKCD_TYPES = [
  { value: "bar", label: "柱状图" },
  { value: "pie", label: "饼图" },
  { value: "line", label: "折线图" },
  { value: "XY", label: "XY散点图" },
] as const;

export const createDefaultCanvasChildChartXkcdOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "chartXkcd",
    chartType: "bar",
    data: {
      labels: ["A", "B", "C"],
      datasets: [
        {
          label: "Sample",
          data: [10, 20, 30],
        },
      ],
    },
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

export function createCanvasChildChartXkcd(options: any) {
  return (
    <ChartXkcdChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></ChartXkcdChild>
  );
}

export const ChartXkcdChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const chartContainerRef = ref<HTMLElement>();
    const svgHostRef = ref<HTMLElement>();
    const chartInstance = ref<any>(null);
    const errorMessage = ref("");

    onCanvasChildSetup({
      targetEl: chartContainerRef,
      options: props.options,
      props,
    });

    const chartType = computed(() => props.options?.chartType || "bar");
    const data = computed(() => {
      try {
        if (props.options?.data && typeof props.options.data === "object") {
          return props.options.data;
        }
        return {
          labels: ["A", "B", "C"],
          datasets: [{ label: "Sample", data: [10, 20, 30] }],
        };
      } catch {
        return {
          labels: ["A", "B", "C"],
          datasets: [{ label: "Sample", data: [10, 20, 30] }],
        };
      }
    });

    function renderChart() {
      const host = svgHostRef.value;
      if (!host) return;

      try {
        errorMessage.value = "";

        if (chartInstance.value) {
          chartInstance.value = null;
        }

        host.innerHTML = "";

        const svgEl = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        svgEl.style.width = "100%";
        svgEl.style.height = "100%";
        host.appendChild(svgEl);

        const chartData = JSON.parse(JSON.stringify(data.value));
        const currentChartType = chartType.value;

        if (currentChartType === "bar") {
          chartInstance.value = new chartXkcd.Bar(svgEl, {
            data: chartData,
          });
        } else if (currentChartType === "pie") {
          chartInstance.value = new chartXkcd.Pie(svgEl, {
            data: chartData,
          });
        } else if (currentChartType === "line") {
          chartInstance.value = new chartXkcd.Line(svgEl, {
            data: chartData,
          });
        } else if (currentChartType === "XY" || currentChartType === "scatter") {
          chartInstance.value = new chartXkcd.XY(svgEl, {
            data: chartData,
          });
        }
      } catch (error: any) {
        errorMessage.value = error?.message || "chart.xkcd 渲染失败";
      } finally {
        nextTick(() => {
          updateRenderingCanvas();
        });
      }
    }

    const debouncedRender = useDebounceFn(renderChart, 120);

    useCanvasChildSlotSize(chartContainerRef, props.options, () => {
      debouncedRender();
    });

    onMounted(debouncedRender);

    watch([chartType, data], debouncedRender, {
      deep: true,
    });

    onBeforeUnmount(() => {
      chartInstance.value = null;
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
            class="canvas-chart-xkcd-child"
            style={style}
            data-chart-engine="chart.xkcd"
          >
            <style>{`
              .canvas-chart-xkcd-child svg {
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
              }
              .canvas-chart-xkcd-child .canvas-chart-xkcd-child__error {
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
              <div class="canvas-chart-xkcd-child__error">
                {errorMessage.value}
              </div>
            ) : (
              <div ref={svgHostRef} style={{ width: "100%", height: "100%" }}></div>
            )}
          </div>
        </div>
      );
    };
  },
});
