import { computed, defineComponent, nextTick, onMounted, ref, watch } from "vue";
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
import { createNoise2D } from "simplex-noise";

export const createDefaultCanvasChildSimplexNoiseOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "simplexNoise",
    scale: 50,
    octaves: 4,
    persistence: 0.5,
    color1: "#1e3a8a",
    color2: "#93c5fd",
    backgroundColor: {
      type: "pure",
      color: "transparent",
    },
    backgroundSize: "cover",
    width: { value: 100, unit: "vw" },
    height: { value: 100, unit: "vh" },
    position: createPositionDefaultOptions(canvasUnit),
    filter: createFilterDefaultOptions(canvasUnit),
    zIndex: 0,
    ...createBasicDefaultOptions(),
    transform: createTransformDefaultOptions(canvasUnit),
  };
};

export function createCanvasChildSimplexNoise(options: any) {
  return (
    <SimplexNoiseChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></SimplexNoiseChild>
  );
}

function renderNoiseToCanvas(
  canvas: HTMLCanvasElement,
  scale: number,
  octaves: number,
  persistence: number,
  color1: string,
  color2: string,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const noise2D = createNoise2D();

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const safeScale = Math.max(4, Number(scale) || 50);
  const safeOctaves = Math.max(1, Math.min(6, Math.round(Number(octaves) || 4)));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let amplitude = 1;
      let frequency = 1;
      let noiseValue = 0;
      let maxAmplitude = 0;

      for (let i = 0; i < safeOctaves; i++) {
        noiseValue +=
          amplitude * noise2D((x * frequency) / safeScale, (y * frequency) / safeScale);
        maxAmplitude += amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }

      noiseValue = (noiseValue / maxAmplitude + 1) / 2;
      noiseValue = Math.max(0, Math.min(1, noiseValue));

      const idx = (y * width + x) * 4;
      data[idx] = Math.round(c1.r + (c2.r - c1.r) * noiseValue);
      data[idx + 1] = Math.round(c1.g + (c2.g - c1.g) * noiseValue);
      data[idx + 2] = Math.round(c1.b + (c2.b - c1.b) * noiseValue);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export const SimplexNoiseChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const targetRef = ref<HTMLElement>();
    const canvasRef = ref<HTMLCanvasElement>();

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    const scale = computed(() => props.options?.scale ?? 50);
    const octaves = computed(() => props.options?.octaves ?? 4);
    const persistence = computed(() => props.options?.persistence ?? 0.5);
    const color1 = computed(() => props.options?.color1 ?? "#1e3a8a");
    const color2 = computed(() => props.options?.color2 ?? "#93c5fd");

    const renderNoise = useDebounceFn(() => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      // 限制内部渲染分辨率最高 512px，避免大画布下百万像素 CPU 阻塞，再用 CSS 平滑铺满
      const rawW = Math.max(128, slotSize.value.width);
      const rawH = Math.max(128, slotSize.value.height);
      const maxDim = Math.max(rawW, rawH);
      const ratio = maxDim > 512 ? 512 / maxDim : 1;
      canvas.width = Math.max(64, Math.round(rawW * ratio));
      canvas.height = Math.max(64, Math.round(rawH * ratio));

      renderNoiseToCanvas(
        canvas,
        scale.value,
        octaves.value,
        persistence.value,
        color1.value,
        color2.value,
      );

      nextTick(() => {
        updateRenderingCanvas();
      });
    }, 80);

    const { slotSize } = useCanvasChildSlotSize(targetRef, props.options, () => {
      renderNoise();
    });

    onMounted(() => {
      renderNoise();
    });

    watch(
      () => [
        scale.value,
        octaves.value,
        persistence.value,
        color1.value,
        color2.value,
      ],
      renderNoise,
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
        backgroundSize: props.options.backgroundSize || "cover",
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
          <div ref={targetRef} class="canvas-simplex-noise-child" style={style}>
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "100%", display: "block" }}
            ></canvas>
          </div>
        </div>
      );
    };
  },
});
