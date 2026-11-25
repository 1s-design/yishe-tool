import { defineComponent, ref, onMounted, watch } from "vue";
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

export const CONFETTI_PRESETS = [
  "default",
  "fireworks",
  "snow",
  "celebration",
  "school",
] as const;

export const createDefaultCanvasChildConfettiOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "confetti",
    preset: "celebration",
    particleCount: 120,
    spread: 110,
    colors: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"],
    backgroundColor: { type: "pure", color: "transparent" },
    width: { value: 100, unit: "vw" },
    height: { value: 100, unit: "vh" },
    position: createPositionDefaultOptions(canvasUnit),
    filter: createFilterDefaultOptions(canvasUnit),
    zIndex: 0,
    ...createBasicDefaultOptions(),
    transform: createTransformDefaultOptions(canvasUnit),
  };
};

export function createCanvasChildConfetti(options: any) {
  return (
    <ConfettiChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    />
  );
}

function getPresetPalette(preset: string): { colors: string[]; shapes: string[]; count: number } {
  switch (preset) {
    case "snow":
      return { colors: ["#ffffff", "#e0e7ff", "#bfdbfe"], shapes: ["circle"], count: 140 };
    case "school":
      return { colors: ["#ff6b35", "#ffd700", "#4169e1"], shapes: ["rect", "ribbon"], count: 110 };
    case "fireworks":
      return { colors: ["#fbbf24", "#f97316", "#ec4899", "#38bdf8", "#a855f7"], shapes: ["circle", "rect"], count: 140 };
    case "celebration":
      return { colors: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"], shapes: ["rect", "circle", "ribbon"], count: 160 };
    default:
      return { colors: ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#06b6d4"], shapes: ["rect", "circle", "ribbon"], count: 110 };
  }
}

export const ConfettiChild = defineComponent({
  props: { options: null },
  setup(props) {
    const targetRef = ref<HTMLElement>();
    const canvasRef = ref<HTMLCanvasElement>();

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    function renderStaticConfetti() {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const width = Math.max(100, slotSize.value.width);
      const height = Math.max(100, slotSize.value.height);
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const preset = props.options?.preset || "celebration";
      const presetCfg = getPresetPalette(preset);
      const colors = Array.isArray(props.options?.colors) && props.options.colors.length
        ? props.options.colors
        : presetCfg.colors;
      const count = Math.min(400, Math.max(20, Number(props.options?.particleCount) || presetCfg.count));

      // 确定性伪随机，保证截图与画布一致且永不因动画结束清空
      let seed = 4219;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      const scale = Math.max(0.7, Math.min(width, height) / 700);

      for (let i = 0; i < count; i++) {
        const x = rand() * width;
        const y = rand() * height;
        const color = colors[Math.floor(rand() * colors.length)];
        const shape = presetCfg.shapes[Math.floor(rand() * presetCfg.shapes.length)];
        const angle = rand() * Math.PI * 2;
        const size = (8 + rand() * 14) * scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.78 + rand() * 0.22;

        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === "ribbon") {
          ctx.fillRect(-size * 0.9, -size * 0.24, size * 1.8, size * 0.48);
        } else {
          ctx.fillRect(-size * 0.5, -size * 0.35, size, size * 0.7);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      updateRenderingCanvas();
    }

    const { slotSize } = useCanvasChildSlotSize(targetRef, props.options, () => {
      renderStaticConfetti();
    });

    onMounted(() => {
      renderStaticConfetti();
    });

    watch(
      () => [
        props.options?.preset,
        props.options?.particleCount,
        props.options?.spread,
        props.options?.colors,
      ],
      () => {
        renderStaticConfetti();
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
        background: props.options.backgroundColor?.color || "transparent",
        overflow: "hidden",
        pointerEvents: "none",
        display: "block",
        ..._style,
      };

      onBeforeReturnRender({ style, options: props.options });

      return (
        <div ref={targetRef} style={containerStyle}>
          <canvas ref={canvasRef} style={style} />
        </div>
      );
    };
  },
});
