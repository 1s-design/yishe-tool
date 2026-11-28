import opentype from "opentype.js";
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from "vue";
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
import { onBeforeReturnRender, onCanvasChildSetup } from "./commonHooks.ts";

export const createDefaultCanvasChildOpentypeTextOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "opentypeText",
    text: "Hello",
    fontUrl: "",
    fontSize: 72,
    fillColor: "#000000",
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

export function createCanvasChildOpentypeText(options) {
  return (
    <OpentypeTextChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></OpentypeTextChild>
  );
}

export const OpentypeTextChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const targetRef = ref<HTMLElement>();
    const errorMessage = ref("");
    const svgHtml = ref("");
    const loading = ref(false);
    let renderToken = 0;

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    const text = computed(() => String(props.options?.text || "").trim());
    const fontUrl = computed(() => String(props.options?.fontUrl || "").trim());
    const fontSize = computed(() => Number(props.options?.fontSize) || 72);
    const fillColor = computed(() =>
      String(props.options?.fillColor || "#000000"),
    );

    async function loadFontAndRender() {
      const token = ++renderToken;
      const currentText = text.value;
      const currentFontUrl = fontUrl.value;

      if (!currentText) {
        svgHtml.value = "";
        errorMessage.value = "请输入文字内容";
        updateRenderingCanvas();
        return;
      }

      if (!currentFontUrl) {
        svgHtml.value = "";
        errorMessage.value = "请输入字体文件URL";
        updateRenderingCanvas();
        return;
      }

      loading.value = true;
      errorMessage.value = "";

      try {
        const resp = await fetch(currentFontUrl);
        if (!resp.ok) {
          throw new Error(`字体请求失败 (${resp.status})`);
        }
        const buffer = await resp.arrayBuffer();
        const font = opentype.parse(buffer);
        if (token !== renderToken) return;
        const path = font.getPath(
          currentText,
          0,
          fontSize.value,
          fontSize.value,
        );
        const pathData = path.toPathData(2);
        const bbox = path.getBoundingBox();
        const pad = Math.max(4, fontSize.value * 0.08);
        const svgWidth = Math.ceil(bbox.x2 - bbox.x1 + pad * 2) || 400;
        const svgHeight = Math.ceil(bbox.y2 - bbox.y1 + pad * 2) || 120;
        const viewBox = `${bbox.x1 - pad} ${bbox.y1 - pad} ${svgWidth} ${svgHeight}`;

        svgHtml.value = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><path d="${pathData}" fill="${fillColor.value}"/></svg>`;
      } catch (error: any) {
        if (token !== renderToken) return;
        svgHtml.value = "";
        errorMessage.value = error?.message || "字体加载失败";
      } finally {
        if (token === renderToken) {
          loading.value = false;
          await nextTick();
          updateRenderingCanvas();
        }
      }
    }

    onMounted(() => {
      loadFontAndRender();
    });

    watch(
      [text, fontUrl, fontSize, fillColor],
      () => {
        loadFontAndRender();
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
        width: "100%",
        height: "100%",
        transform: createTransformString(props.options.transform),
        filter: createFilterFromOptions(props.options.filter),
        zIndex: props.options.zIndex,
        overflow: "hidden",
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
          <div ref={targetRef} style={style}>
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
            ) : loading.value ? (
              <div style={{ color: "#666", fontSize: "14px", padding: "12px" }}>
                加载字体路径中...
              </div>
            ) : (
              <div
                class="canvas-opentype-text-child"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
                innerHTML={svgHtml.value}
              ></div>
            )}
          </div>
        </div>
      );
    };
  },
});
