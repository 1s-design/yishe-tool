import cloud from "d3-cloud";
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUpdated,
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

const DEFAULT_WORDS = [
  { text: "Hello", size: 40 },
  { text: "World", size: 30 },
  { text: "Design", size: 25 },
  { text: "Creative", size: 20 },
  { text: "Canvas", size: 18 },
  { text: "Art", size: 15 },
  { text: "Visual", size: 12 },
  { text: "Layout", size: 10 },
];

export const createDefaultD3CloudOptions = () => {
  return {
    words: DEFAULT_WORDS,
    fontFamily: "sans-serif",
    fontWeight: "bold",
    colors: ["#111111", "#ff4d6d", "#2ec4b6", "#ffbe0b", "#3a86ff"],
    padding: 5,
    rotate: () => (~~(Math.random() * 6) - 3) * 30,
    spiral: "archimedean",
  };
};

export const createDefaultCanvasChildD3CloudOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "d3Cloud",
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
    backgroundColor: {
      type: "pure",
      color: "transparent",
    },
    d3Cloud: {
      version: 1,
      ...createDefaultD3CloudOptions(),
    },
  };
};

export function createCanvasChildD3Cloud(options) {
  return (
    <D3CloudChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></D3CloudChild>
  );
}

function resolveD3CloudRotate(rotateOption: any): () => number {
  if (typeof rotateOption === "function") {
    return rotateOption;
  }
  if (Array.isArray(rotateOption) && rotateOption.length > 0) {
    const angles = rotateOption.map((v) => Number(v) || 0);
    return () => angles[Math.floor(Math.random() * angles.length)];
  }
  if (typeof rotateOption === "number") {
    return () => rotateOption;
  }
  if (rotateOption === "horizontal") {
    return () => 0;
  }
  if (rotateOption === "orthogonal") {
    return () => (Math.random() < 0.25 ? 90 : 0);
  }
  if (rotateOption === "diagonal") {
    const angles = [-35, 0, 0, 35];
    return () => angles[Math.floor(Math.random() * angles.length)];
  }
  return () => (~~(Math.random() * 5) - 2) * 30;
}

export const D3CloudChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const svgRef = ref<SVGSVGElement>();
    const containerRef = ref<HTMLElement>();
    const errorMessage = ref("");
    let renderToken = 0;

    onCanvasChildSetup({
      targetEl: containerRef,
      options: props.options,
      props,
    });

    const { slotSize: canvasPixelSize } = useCanvasChildSlotSize(
      containerRef,
      props.options,
      () => {
        renderCloud();
      },
    );

    const d3CloudOptions = computed(() => {
      return props.options?.d3Cloud || createDefaultD3CloudOptions();
    });

    const renderCloud = useDebounceFn(async () => {
      const svg = svgRef.value;
      if (!svg) {
        return;
      }

      const currentToken = ++renderToken;
      const { width, height } = canvasPixelSize.value;

      // 清除旧内容并同步外层 viewBox
      svg.innerHTML = "";
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const options = d3CloudOptions.value;
      if (!options?.words?.length) {
        errorMessage.value = "请输入词语数据";
        updateRenderingCanvas();
        return;
      }

      try {
        errorMessage.value = "";

        const layout = cloud()
          .size([width, height])
          .words(
            options.words.map((word) => ({
              text: word.text,
              size: word.size || 10,
            })),
          )
          .padding(options.padding ?? 6)
          .rotate(resolveD3CloudRotate(options.rotate))
          .font(options.fontFamily || "sans-serif")
          .fontWeight(options.fontWeight || "bold")
          .fontSize((d) => d.size || 10)
          .spiral(options.spiral || "archimedean")
          .on("end", (words) => {
            if (currentToken !== renderToken) {
              return;
            }

            const colors = options.colors || ["#111111"];

            const g = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g",
            );
            g.setAttribute(
              "transform",
              `translate(${width / 2},${height / 2})`,
            );

            words.forEach((word, index) => {
              const text = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text",
              );
              text.setAttribute("text-anchor", "middle");
              text.setAttribute(
                "transform",
                `translate(${word.x},${word.y}) rotate(${word.rotate})`,
              );
              text.setAttribute("font-size", `${word.size}px`);
              text.setAttribute(
                "font-family",
                options.fontFamily || "sans-serif",
              );
              text.setAttribute("font-weight", options.fontWeight || "bold");
              text.setAttribute("fill", colors[index % colors.length]);
              text.textContent = word.text;
              g.appendChild(text);
            });

            svg.appendChild(g);
            updateRenderingCanvas();
          });

        layout.start();
      } catch (error: any) {
        errorMessage.value = error?.message || "词云渲染失败";
        updateRenderingCanvas();
      }
    }, 120);

    onMounted(() => {
      nextTick(renderCloud);
    });

    watch(() => props.options, renderCloud, { deep: true });

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
          <div ref={containerRef} style={style}>
            {errorMessage.value ? (
              <div
                style={{
                  color: "#c45656",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  padding: "12px",
                  background: "rgba(255, 245, 245, 0.92)",
                  border: "1px solid rgba(196, 86, 86, 0.35)",
                  borderRadius: "4px",
                  whiteSpace: "pre-wrap",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                {errorMessage.value}
              </div>
            ) : (
              <svg
                ref={svgRef}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              ></svg>
            )}
          </div>
        </div>
      );
    };
  },
});

function formatSizeOptionToPixelValue(size: any) {
  if (!size) {
    return null;
  }

  if (!isNaN(Number(size))) {
    return size;
  }

  const { value, unit } = size;

  if (!value) {
    return 0;
  }

  // 简化处理，只处理 vw/vh 单位
  if (unit === "vw") {
    return (window.innerWidth * Number(value)) / 100;
  }

  if (unit === "vh") {
    return (window.innerHeight * Number(value)) / 100;
  }

  return Number(value);
}
