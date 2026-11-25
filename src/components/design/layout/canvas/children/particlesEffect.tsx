import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from "vue";
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

const PRESETS: Record<string, () => Partial<Particle>> = {
  stars: () => ({
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 3.5 + 1.2,
    opacity: Math.random() * 0.7 + 0.3,
    color: `hsl(${Math.random() * 60 + 40}, 100%, ${Math.random() * 25 + 75}%)`,
  }),
  bubbles: () => ({
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 1 - 0.5,
    size: Math.random() * 12 + 4,
    opacity: Math.random() * 0.5 + 0.25,
    color: `hsla(${Math.random() * 40 + 180}, 75%, 70%, 0.7)`,
  }),
  snow: () => ({
    vx: (Math.random() - 0.5) * 0.5,
    vy: Math.random() * 1 + 0.3,
    size: Math.random() * 4 + 1.5,
    opacity: Math.random() * 0.5 + 0.5,
    color: `hsla(0, 0%, 100%, ${Math.random() * 0.4 + 0.6})`,
  }),
  fire: () => ({
    vx: (Math.random() - 0.5) * 1,
    vy: -Math.random() * 2 - 1,
    size: Math.random() * 6 + 2.5,
    opacity: 0.9,
    color: `hsl(${Math.random() * 35 + 10}, 100%, ${Math.random() * 30 + 45}%)`,
  }),
};

export const createDefaultCanvasChildParticlesEffectOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "particlesEffect",
    preset: "stars",
    particleCount: 100,
    backgroundColor: { type: "pure", color: "#0b1026" },
    width: { value: 100, unit: "vw" },
    height: { value: 100, unit: "vh" },
    position: createPositionDefaultOptions(canvasUnit),
    filter: createFilterDefaultOptions(canvasUnit),
    zIndex: 0,
    ...createBasicDefaultOptions(),
    transform: createTransformDefaultOptions(canvasUnit),
  };
};

export function createCanvasChildParticlesEffect(options: any) {
  return (
    <ParticlesEffectChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    />
  );
}

export const ParticlesEffectChild = defineComponent({
  props: { options: null },
  setup(props) {
    const canvasRef = ref<HTMLCanvasElement>();
    const particles: Particle[] = [];
    let animationId: number | null = null;
    let renderToken = 0;

    onCanvasChildSetup({
      targetEl: canvasRef,
      options: props.options,
      props,
    });

    function createParticle(width: number, height: number): Particle {
      const preset = props.options?.preset || "stars";
      const presetFn = PRESETS[preset] || PRESETS.stars;
      const base = presetFn();

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: base.vx || 0,
        vy: base.vy || 0,
        size: base.size || 2.5,
        opacity: base.opacity || 1,
        color: base.color || "#ffffff",
      };
    }

    function drawFrame(advance = false) {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (advance) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    let lastTickTs = 0
    function animate(ts: number) {
      const token = renderToken;
      if (!canvasRef.value || token !== renderToken) return;
      if (typeof document !== "undefined" && document.hidden) {
        animationId = null;
        return;
      }
      if (ts - lastTickTs >= 33) {
        lastTickTs = ts;
        drawFrame(true);
      }
      animationId = requestAnimationFrame(animate);
    }

    function initParticles() {
      const canvas = canvasRef.value;
      if (!canvas) return;

      const rawW = Math.max(100, slotSize.value.width);
      const rawH = Math.max(100, slotSize.value.height);
      const maxDim = Math.max(rawW, rawH);
      const ratio = maxDim > 1024 ? 1024 / maxDim : 1;
      const width = Math.max(100, Math.round(rawW * ratio));
      const height = Math.max(100, Math.round(rawH * ratio));
      canvas.width = width;
      canvas.height = height;

      const count = props.options?.particleCount || 100;
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(width, height));
      }

      // 同步绘制首帧，保证后台标签页与静态截图立即有粒子画面
      drawFrame(false);
      updateRenderingCanvas();

      if (animationId) cancelAnimationFrame(animationId);
      if (typeof document === "undefined" || !document.hidden) {
        animationId = requestAnimationFrame(animate);
      } else {
        animationId = null;
      }
    }

    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      } else if (!animationId) {
        animationId = requestAnimationFrame(animate);
      }
    };

    const { slotSize } = useCanvasChildSlotSize(canvasRef, props.options, () => {
      initParticles();
    });

    onMounted(() => {
      ++renderToken;
      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", handleVisibilityChange);
      }
      initParticles();
    });

    watch(
      () => [props.options?.preset, props.options?.particleCount],
      () => {
        ++renderToken;
        initParticles();
      },
    );

    onBeforeUnmount(() => {
      renderToken++;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
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

      const bgColor = props.options?.backgroundColor?.color || "#0b1026";

      const style: any = {
        flexShrink: 0,
        width: formatToNativeSizeString(props.options.width),
        height: formatToNativeSizeString(props.options.height),
        transform: createTransformString(props.options.transform),
        filter: createFilterFromOptions(props.options.filter),
        zIndex: props.options.zIndex,
        background: bgColor,
        overflow: "hidden",
        display: "block",
        ..._style,
      };

      onBeforeReturnRender({ style, options: props.options });

      return (
        <div style={containerStyle}>
          <canvas ref={canvasRef} style={style} />
        </div>
      );
    };
  },
});
