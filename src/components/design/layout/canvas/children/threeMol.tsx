import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
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

let $3Dmol: any = null;

export const THREEMOL_STYLES = [
  "stick",
  "sphere",
  "cartoon",
  "line",
  "cross",
] as const;
export const THREEMOL_FORMATS = ["pdb", "sdf", "xyz", "mol2"] as const;

const DEFAULT_WATER_XYZ = `3
Water
O 0.000 0.000 0.000
H 0.757 0.586 0.000
H -0.757 0.586 0.000`;

export const createDefaultCanvasChildThreeMolOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "threeMol",
    data: DEFAULT_WATER_XYZ,
    format: "xyz",
    pdbId: "",
    style: "stick",
    backgroundColor: { type: "pure", color: "#ffffff" },
    width: { value: 100, unit: "vw" },
    height: { value: 100, unit: "vh" },
    position: createPositionDefaultOptions(canvasUnit),
    filter: createFilterDefaultOptions(canvasUnit),
    zIndex: 0,
    ...createBasicDefaultOptions(),
    transform: createTransformDefaultOptions(canvasUnit),
  };
};

export function createCanvasChildThreeMol(options: any) {
  return (
    <ThreeMolChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    />
  );
}

async function load3Dmol(): Promise<any> {
  if ($3Dmol) return $3Dmol;
  const mod = await import("3dmol/build/3Dmol.js");
  $3Dmol = (mod as any).default || mod;
  return $3Dmol;
}

export const ThreeMolChild = defineComponent({
  props: { options: null },
  setup(props) {
    const targetRef = ref<HTMLElement>();
    const containerRef = ref<HTMLElement>();
    const viewerRef = ref<any>(null);
    const errorMessage = ref("");
    let renderToken = 0;

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    const data = computed(() => String(props.options?.data || ""));
    const format = computed(() => String(props.options?.format || "xyz"));
    const pdbId = computed(() => String(props.options?.pdbId || ""));
    const style = computed(() => String(props.options?.style || "stick"));

    function getStyleSpec(styleName: string): any {
      switch (styleName) {
        case "sphere":
          return { sphere: { scale: 0.35 } };
        case "cartoon":
          return { cartoon: { color: "spectrum" } };
        case "line":
          return { line: {} };
        case "cross":
          return { cross: { linewidth: 2 } };
        case "stick":
        default:
          return { stick: { radius: 0.18 }, sphere: { scale: 0.25 } };
      }
    }

    async function renderMolecule() {
      const token = ++renderToken;

      try {
        errorMessage.value = "";
        if (!containerRef.value) return;

        const mol = await load3Dmol();
        if (token !== renderToken || !containerRef.value) return;

        if (viewerRef.value) {
          viewerRef.value.clear();
        }
        containerRef.value.innerHTML = "";

        const bgColor = props.options?.backgroundColor?.color || "#ffffff";
        const viewer = mol.createViewer(containerRef.value, {
          backgroundColor: bgColor,
          antialias: true,
        });
        viewerRef.value = viewer;

        if (data.value) {
          viewer.addModel(data.value, format.value);
        } else if (pdbId.value) {
          await new Promise<void>((resolve) => {
            mol.download(`pdb:${pdbId.value}`, viewer, {}, () => resolve());
          });
        } else {
          viewer.addModel(DEFAULT_WATER_XYZ, "xyz");
        }

        if (token !== renderToken) return;

        viewer.setStyle({}, getStyleSpec(style.value));
        viewer.resize();
        viewer.zoomTo();
        viewer.render();
      } catch (error: any) {
        if (token !== renderToken) return;
        errorMessage.value = error?.message || "3D 分子渲染失败";
      } finally {
        if (token === renderToken) {
          await nextTick();
          updateRenderingCanvas();
        }
      }
    }

    useCanvasChildSlotSize(targetRef, props.options, () => {
      if (viewerRef.value) {
        try {
          viewerRef.value.resize();
          viewerRef.value.zoomTo();
          viewerRef.value.render();
          updateRenderingCanvas();
          return;
        } catch {}
      }
      renderMolecule();
    });

    onMounted(() => {
      nextTick(renderMolecule);
    });

    watch(
      () => [
        data.value,
        format.value,
        pdbId.value,
        style.value,
        props.options?.backgroundColor?.color,
      ],
      () => {
        nextTick(renderMolecule);
      },
    );

    onBeforeUnmount(() => {
      renderToken++;
      if (viewerRef.value) {
        viewerRef.value.clear();
        viewerRef.value = null;
      }
    });

    function handleWheel(e: WheelEvent) {
      e.stopPropagation();
    }

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
        position: "relative",
        ..._style,
      };

      onBeforeReturnRender({ style, options: props.options });

      return (
        <div style={containerStyle}>
          <div ref={targetRef} style={style}>
            <div
              ref={containerRef}
              style={{ width: "100%", height: "100%", position: "relative" }}
              onWheel={handleWheel}
            ></div>
            {errorMessage.value && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#c45656",
                  fontSize: "14px",
                  padding: "12px",
                  background: "rgba(255,245,245,0.92)",
                  border: "1px solid rgba(196,86,86,0.35)",
                  borderRadius: "4px",
                  maxWidth: "80%",
                  textAlign: "center",
                }}
              >
                {errorMessage.value}
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});
