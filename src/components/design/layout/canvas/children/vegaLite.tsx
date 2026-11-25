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

const DEFAULT_VEGA_LITE_SPEC = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: {
    values: [
      { x: "A", y: 10 },
      { x: "B", y: 20 },
    ],
  },
  mark: "bar",
  encoding: {
    x: { field: "x", type: "nominal" },
    y: { field: "y", type: "quantitative" },
  },
};

export const createDefaultCanvasChildVegaLiteOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "vegaLite",
    spec: JSON.parse(JSON.stringify(DEFAULT_VEGA_LITE_SPEC)),
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

export function createCanvasChildVegaLite(options) {
  return (
    <VegaLiteChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></VegaLiteChild>
  );
}

export const VegaLiteChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const targetRef = ref<HTMLElement>();
    const plotRef = ref<HTMLElement>();
    const errorMessage = ref("");
    let view: any = null;

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    const spec = computed(() => props.options?.spec || {});

    async function renderChart() {
      await nextTick();
      const el = plotRef.value;
      if (!el) return;

      const specVal = spec.value;

      if (
        !specVal ||
        typeof specVal !== "object" ||
        Object.keys(specVal).length === 0
      ) {
        errorMessage.value = "请输入有效的 Vega-Lite spec";
        updateRenderingCanvas();
        return;
      }

      try {
        errorMessage.value = "";

        if (view) {
          view.finalize();
          view = null;
        }

        el.innerHTML = "";

        const [vegaLiteModule, vegaModule] = await Promise.all([
          import("vega-lite"),
          import("vega"),
        ]);

        const compile = vegaLiteModule?.compile;
        if (!vegaModule || !compile) {
          throw new Error("Vega 依赖未加载成功");
        }

        const { parse, View: VegaView } = vegaModule;
        const normalizedSpec = JSON.parse(JSON.stringify(specVal));
        if (!normalizedSpec.width || normalizedSpec.width === "container") {
          normalizedSpec.width = Math.max(200, slotSize.value.width - 100);
        }
        if (!normalizedSpec.height || normalizedSpec.height === "container") {
          normalizedSpec.height = Math.max(160, slotSize.value.height - 100);
        }
        const vgSpec = compile(normalizedSpec).spec;
        view = new VegaView(parse(vgSpec), {
          renderer: "svg",
          container: el,
        });
        await view.runAsync();
      } catch (error: any) {
        errorMessage.value = error?.message || "Vega-Lite 渲染失败";
        console.warn("Vega-Lite render failed:", error);
      } finally {
        updateRenderingCanvas();
      }
    }

    const debouncedRender = useDebounceFn(renderChart, 150);

    const { slotSize } = useCanvasChildSlotSize(targetRef, props.options, () => {
      debouncedRender();
    });

    onMounted(debouncedRender);
    watch(spec, debouncedRender, { deep: true });

    onBeforeUnmount(() => {
      if (view) {
        view.finalize();
        view = null;
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
        pointerEvents: "none",
        ..._style,
      };

      onBeforeReturnRender({
        style,
        options: props.options,
      });

      return (
        <div style={containerStyle}>
          <div ref={targetRef} style={style}>
            {errorMessage.value ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px",
                  background: "rgba(255,245,245,0.88)",
                  color: "#c45656",
                  fontSize: "12px",
                  textAlign: "center",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                {errorMessage.value}
              </div>
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
