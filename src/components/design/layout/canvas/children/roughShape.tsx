import {
  computed,
  defineComponent,
  nextTick,
  ref,
  watch,
  onMounted,
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
import rough from "roughjs";

export const ROUGH_SHAPE_TYPES = ["rect", "circle", "line", "ellipse"] as const;

export const createDefaultCanvasChildRoughShapeOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "roughShape",
    shape: "rect" as const,
    fill: "#4ECDC4",
    stroke: "#000000",
    strokeWidth: 2,
    roughness: 1,
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

export function createCanvasChildRoughShape(options: any) {
  return (
    <RoughShapeChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></RoughShapeChild>
  );
}

export const RoughShapeChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const targetRef = ref<HTMLElement>();
    const canvasRef = ref<HTMLCanvasElement>();
    const errorMessage = ref("");

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    const shape = computed(() => props.options?.shape || "rect");
    const fill = computed(() => props.options?.fill || "#4ECDC4");
    const stroke = computed(() => props.options?.stroke || "#000000");
    const strokeWidth = computed(() => props.options?.strokeWidth || 2);
    const roughness = computed(() => props.options?.roughness || 1);

    const renderRoughShape = useDebounceFn(() => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      const width = Math.max(100, slotSize.value.width);
      const height = Math.max(100, slotSize.value.height);
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      try {
        errorMessage.value = "";
        const rc = rough.canvas(canvas);
        const pad = Math.min(width, height) * 0.1;
        const drawOpts = {
          fill: fill.value,
          fillStyle: "hachure",
          stroke: stroke.value,
          strokeWidth: strokeWidth.value,
          roughness: roughness.value,
        };

        switch (shape.value) {
          case "circle": {
            const diameter = Math.min(width, height) - pad * 2;
            rc.circle(width / 2, height / 2, diameter, drawOpts);
            break;
          }
          case "line":
            rc.line(pad, height - pad, width - pad, pad, drawOpts);
            break;
          case "ellipse":
            rc.ellipse(width / 2, height / 2, width - pad * 2, height - pad * 2, drawOpts);
            break;
          case "rect":
          default:
            rc.rectangle(pad, pad, width - pad * 2, height - pad * 2, drawOpts);
        }
      } catch (error: any) {
        errorMessage.value = error?.message || "手绘图形渲染失败";
      } finally {
        nextTick(() => {
          updateRenderingCanvas();
        });
      }
    }, 80);

    const { slotSize } = useCanvasChildSlotSize(targetRef, props.options, () => {
      renderRoughShape();
    });

    onMounted(() => {
      renderRoughShape();
    });

    watch(
      () => [
        shape.value,
        fill.value,
        stroke.value,
        strokeWidth.value,
        roughness.value,
      ],
      () => {
        renderRoughShape();
      },
      { deep: true },
    );

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
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            ref={targetRef}
            class="canvas-rough-shape-child"
            style={style}
            data-shape-type={shape.value}
          >
            {errorMessage.value ? (
              <div
                style={{
                  color: "#c45656",
                  fontSize: "14px",
                  padding: "12px",
                  background: "rgba(255, 245, 245, 0.92)",
                  border: "1px solid rgba(196, 86, 86, 0.35)",
                  borderRadius: "4px",
                }}
              >
                {errorMessage.value}
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", display: "block" }}
              ></canvas>
            )}
          </div>
        </div>
      );
    };
  },
});
