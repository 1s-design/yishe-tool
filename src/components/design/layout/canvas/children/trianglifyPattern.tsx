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
import trianglify from "trianglify";

export const createDefaultCanvasChildTrianglifyOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "trianglify",
    cellSize: 45,
    variance: 0.75,
    seed: null,
    xColors: "random",
    yColors: "match",
    palette: "YlGn",
    strokeWidth: 1.51,
    fill: true,
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

export function createCanvasChildTrianglify(options: any) {
  return (
    <TrianglifyChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    />
  );
}

export const TrianglifyChild = defineComponent({
  props: { options: null },
  setup(props) {
    const svgRef = ref<SVGSVGElement>();

    onCanvasChildSetup({
      targetEl: svgRef,
      options: props.options,
      props,
    });

    function render() {
      if (!svgRef.value) return;

      try {
        const width = Math.max(200, Math.min(1200, slotSize.value.width));
        const height = Math.max(150, Math.min(900, slotSize.value.height));

        const config: any = {
          width,
          height,
          cellSize: props.options?.cellSize || 45,
          variance: props.options?.variance ?? 0.75,
          strokeWidth: props.options?.strokeWidth ?? 1.51,
          fill: props.options?.fill !== false,
          xColors: props.options?.xColors || props.options?.palette || "random",
          yColors: props.options?.yColors || "match",
        };

        if (props.options?.seed) {
          config.seed = props.options.seed;
        }

        const pattern = trianglify(config);
        const svgElement = pattern.toSVG();

        svgRef.value.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svgRef.value.innerHTML = "";
        while (svgElement.firstChild) {
          svgRef.value.appendChild(svgElement.firstChild);
        }

        updateRenderingCanvas();
      } catch (e) {
        console.error("Trianglify render error:", e);
      }
    }

    const { slotSize } = useCanvasChildSlotSize(svgRef, props.options, () => {
      render();
    });

    onMounted(render);
    watch(
      () => [
        props.options?.cellSize,
        props.options?.variance,
        props.options?.seed,
        props.options?.xColors,
        props.options?.yColors,
        props.options?.palette,
        props.options?.strokeWidth,
        props.options?.fill,
      ],
      render,
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
        ..._style,
      };

      onBeforeReturnRender({ style, options: props.options });

      return (
        <div style={containerStyle}>
          <div style={style}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 600 400"
              preserveAspectRatio="xMidYMid slice"
              style={{ display: "block" }}
            />
          </div>
        </div>
      );
    };
  },
});
