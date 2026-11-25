import {
  canvasStickerOptionsOnlyChild,
  updateRenderingCanvas,
} from "../index.tsx";
import {
  getPositionInfoFromOptions,
  formatToNativeSizeString,
  createFilterFromOptions,
  createTransformString,
} from "../helper.tsx";
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  createFilterDefaultOptions,
  createPositionDefaultOptions,
  createTransformDefaultOptions,
  createBasicDefaultOptions,
} from "./defaultOptions.tsx";
import { onBeforeReturnRender, onCanvasChildSetup, useCanvasChildSlotSize } from "./commonHooks.ts";
import WaveSurfer from "wavesurfer.js";

export const createDefaultCanvasChildWaveformOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "waveform",
    ...createBasicDefaultOptions(),
    position: createPositionDefaultOptions(canvasUnit),
    width: { value: 100, unit: "vw" },
    height: { value: 100, unit: "vh" },
    audioUrl: "",
    waveColor: "#2563eb",
    progressColor: "#06b6d4",
    backgroundColor: { type: "pure", color: "#ffffff" },
    filter: createFilterDefaultOptions(canvasUnit),
    transform: createTransformDefaultOptions(canvasUnit),
    zIndex: 0,
  };
};

export function createCanvasChildWaveform(options) {
  return (
    <Waveform
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></Waveform>
  );
}

export const Waveform = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const containerRef = ref<HTMLElement>();
    const fallbackCanvasRef = ref<HTMLCanvasElement>();
    const useFallback = ref(true);
    let wavesurfer: WaveSurfer | null = null;

    onCanvasChildSetup({
      targetEl: containerRef,
      options: props.options,
      props: props,
    });

    function destroyWaveSurfer() {
      if (wavesurfer) {
        wavesurfer.destroy();
        wavesurfer = null;
      }
    }

    function drawProceduralWaveform() {
      const canvas = fallbackCanvasRef.value;
      if (!canvas) return;
      const width = Math.max(200, slotSize.value.width);
      const height = Math.max(100, slotSize.value.height);
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const barCount = Math.max(40, Math.min(120, Math.floor(width / 10)));
      const gap = Math.max(2, Math.floor(width / barCount * 0.3));
      const barW = Math.max(2, (width - gap * (barCount + 1)) / barCount);
      const waveColor = props.options?.waveColor || "#2563eb";
      const progressColor = props.options?.progressColor || "#06b6d4";
      const midY = height / 2;
      const maxAmp = height * 0.42;

      for (let i = 0; i < barCount; i++) {
        const t = i / barCount;
        const env = Math.sin(t * Math.PI);
        const raw =
          0.35 +
          0.35 * Math.abs(Math.sin(i * 0.45)) +
          0.3 * Math.abs(Math.cos(i * 1.13 + 0.7));
        const barH = Math.max(8, raw * env * maxAmp * 2);
        const x = gap + i * (barW + gap);
        const y = midY - barH / 2;

        ctx.fillStyle = t < 0.42 ? progressColor : waveColor;
        const r = Math.min(barW / 2, 4);
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, r);
        ctx.fill();
      }
      updateRenderingCanvas();
    }

    function initWaveSurfer() {
      destroyWaveSurfer();

      const audioUrl = String(props.options?.audioUrl || "").trim();
      if (!containerRef.value || !audioUrl) {
        useFallback.value = true;
        requestAnimationFrame(drawProceduralWaveform);
        return;
      }

      try {
        useFallback.value = false;
        const pixelHeight = Math.max(80, slotSize.value.height - 24);
        wavesurfer = WaveSurfer.create({
          container: containerRef.value,
          waveColor: props.options.waveColor || "#2563eb",
          progressColor: props.options.progressColor || "#06b6d4",
          height: pixelHeight,
          cursorWidth: 0,
          interact: false,
        });

        wavesurfer.on("ready", () => {
          updateRenderingCanvas();
        });
        wavesurfer.on("error", () => {
          destroyWaveSurfer();
          useFallback.value = true;
          requestAnimationFrame(drawProceduralWaveform);
        });
        wavesurfer.load(audioUrl);
      } catch {
        useFallback.value = true;
        requestAnimationFrame(drawProceduralWaveform);
      }
    }

    const { slotSize } = useCanvasChildSlotSize(containerRef, props.options, () => {
      if (useFallback.value) {
        drawProceduralWaveform();
      } else {
        initWaveSurfer();
      }
    });

    onMounted(() => {
      initWaveSurfer();
    });

    watch(
      () => [props.options.audioUrl, props.options.waveColor, props.options.progressColor],
      () => {
        initWaveSurfer();
      },
    );

    onBeforeUnmount(() => {
      destroyWaveSurfer();
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
        transform: createTransformString(props.options.transform),
        width: formatToNativeSizeString(props.options.width),
        height: formatToNativeSizeString(props.options.height),
        background: props.options.backgroundColor?.color || "#ffffff",
        filter: createFilterFromOptions(props.options.filter),
        zIndex: props.options.zIndex,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ..._style,
      };

      onBeforeReturnRender({
        style,
        options: props.options,
      });

      return (
        <div style={containerStyle}>
          <div ref={containerRef} style={style}>
            {useFallback.value && (
              <canvas
                ref={fallbackCanvasRef}
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            )}
          </div>
        </div>
      );
    };
  },
});
