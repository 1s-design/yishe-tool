import { Chart, registerables } from "chart.js";
import {
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
  createBasicDefaultOptions,
  createFilterDefaultOptions,
  createPositionDefaultOptions,
  createTransformDefaultOptions,
} from "./defaultOptions.tsx";
import {
  createFilterFromOptions,
  createTransformString,
  formatToNativeSizeString,
  getPositionInfoFromOptions,
} from "../helper.tsx";
import { onBeforeReturnRender, onCanvasChildSetup, useCanvasChildSlotSize } from "./commonHooks.ts";

Chart.register(...registerables);

export const CHART_TYPES = [
  { value: "bar", label: "柱状图" },
  { value: "line", label: "折线图" },
  { value: "pie", label: "饼图" },
  { value: "doughnut", label: "环形图" },
  { value: "radar", label: "雷达图" },
  { value: "scatter", label: "散点图" },
  { value: "polarArea", label: "极坐标图" },
];

export const createDefaultCanvasChildChartjsOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "chartjs",
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
    options: {},
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

export function createCanvasChildChartjs(options: any) {
  return (
    <ChartjsChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></ChartjsChild>
  );
}

export const ChartjsChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const targetRef = ref<HTMLDivElement>();
    const canvasRef = ref<HTMLCanvasElement>();
    let chart: Chart | null = null;

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    function destroyChart() {
      if (chart) {
        chart.destroy();
        chart = null;
      }
    }

    const renderChart = useDebounceFn(async () => {
      await nextTick();
      const canvas = canvasRef.value;
      if (!canvas) return;

      destroyChart();

      const { width, height } = slotSize.value;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const chartType = props.options.chartType || "bar";
      const data = props.options.data || { labels: [], datasets: [] };
      const chartOptions = props.options.options || {};

      try {
        chart = new Chart(ctx, {
          type: chartType as any,
          data: JSON.parse(JSON.stringify(data)),
          options: {
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            ...JSON.parse(JSON.stringify(chartOptions)),
          },
        });
        updateRenderingCanvas();
      } catch (error: any) {
        console.warn("Chart.js render failed:", error);
      }
    }, 120);

    const { slotSize } = useCanvasChildSlotSize(targetRef, props.options, () => {
      renderChart();
    });

    onMounted(renderChart);
    watch(() => props.options.chartType, renderChart);
    watch(() => props.options.data, renderChart, { deep: true });
    watch(() => props.options.options, renderChart, { deep: true });

    onBeforeUnmount(() => {
      destroyChart();
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
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }}></canvas>
          </div>
        </div>
      );
    };
  },
});
