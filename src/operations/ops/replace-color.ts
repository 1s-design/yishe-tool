import { registerOperation } from "../registry";
import {
  currentCanvasControllerInstance,
  renderingLoading,
} from "@/components/design/layout/canvas";
import { canvasToFile, downloadByFile } from "@/common/transform";
import Utils from "@/common/utils";
import { extractPalette, replaceColor } from "@/common/color-replace";

async function waitForRenderedCanvas() {
  const controller = currentCanvasControllerInstance.value;
  if (!controller) return { controller: null, canvasEl: null, error: "画布控制器未初始化" };

  await Promise.race([
    controller.activeUpdateRenderingCanvas(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("画布渲染启动超时 (15s)")), 15_000),
    ),
  ]);

  await new Promise<void>((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      if (!controller.loading.value && !renderingLoading.value) {
        resolve();
        return;
      }
      attempts++;
      if (attempts > 200) {
        reject(new Error("画布渲染超时 (10s)"));
        return;
      }
      setTimeout(check, 50);
    };
    check();
  });

  const canvasEl = controller.canvasEl as HTMLCanvasElement | null;
  if (!canvasEl || !canvasEl.width || !canvasEl.height) {
    return { controller, canvasEl: null, error: "画布元素未找到或尺寸为 0" };
  }
  return { controller, canvasEl, error: "" };
}

function readPixels(canvasEl: HTMLCanvasElement): ImageData {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) throw new Error("画布上下文获取失败");
  const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
  return imageData;
}

registerOperation({
  id: "canvas.colorPalette",
  name: "读取画布用色",
  description:
    "提取当前画布实际渲染后的主色（按占比排序，含百分比与是否中性色），用于挑选要替换的源颜色。",
  group: "颜色",
  params: [
    {
      name: "maxColors",
      label: "颜色数量",
      type: "number",
      default: 8,
      min: 1,
      max: 20,
      description: "返回的主色数量，默认 8",
    },
  ],
  async execute(params) {
    const maxColors = Math.max(1, Math.min(20, Number(params.maxColors) || 8));
    try {
      const { canvasEl, error } = await waitForRenderedCanvas();
      if (!canvasEl) return { success: false, message: error };
      const palette = extractPalette(readPixels(canvasEl), maxColors);
      if (!palette.length) {
        return { success: false, message: "画布是空的（没有不透明像素）" };
      }
      const text = palette
        .map(
          (c) =>
            `${c.hex} ${(c.ratio * 100).toFixed(1)}%${c.neutral ? "（中性）" : ""}`,
        )
        .join("，");
      return { success: true, message: `主色：${text}`, data: { colors: palette } };
    } catch (err: any) {
      return { success: false, message: `读取失败: ${err?.message || String(err)}` };
    }
  },
});

registerOperation({
  id: "canvas.replaceColor",
  name: "画布换色",
  description:
    "把整个画布中某个颜色替换成另一个颜色，覆盖文字、HTML、图片、图表等所有元素（在渲染像素上替换）。输出为新的 PNG 文件。",
  group: "颜色",
  params: [
    {
      name: "from",
      label: "源颜色",
      type: "color",
      required: true,
      description: "要被替换掉的颜色，可用 canvas.colorPalette 先查画布主色",
    },
    {
      name: "to",
      label: "目标颜色",
      type: "color",
      required: true,
      description: "替换成的新颜色",
    },
    {
      name: "tolerance",
      label: "容差",
      type: "number",
      default: 10,
      min: 0,
      max: 100,
      description: "色差容差，0 只换完全相同的颜色，越大越宽松",
    },
    {
      name: "preserveLuminance",
      label: "保留明暗",
      type: "boolean",
      default: false,
      description: "开启后只替换色相/饱和度，保留原图明暗层次（适合照片）",
    },
    {
      name: "autoTrim",
      label: "自动裁剪",
      type: "boolean",
      default: true,
      description: "导出时去除透明边",
    },
    {
      name: "filename",
      label: "文件名",
      type: "string",
      default: "recolor",
      description: "导出文件名（不含扩展名）",
    },
  ],
  async execute(params) {
    const {
      from,
      to,
      tolerance = 10,
      preserveLuminance = false,
      autoTrim = true,
      filename = "recolor",
    } = params;

    try {
      const { canvasEl, error } = await waitForRenderedCanvas();
      if (!canvasEl) return { success: false, message: error };

      const imageData = readPixels(canvasEl);
      const stats = replaceColor(imageData, {
        from,
        to,
        tolerance: Number(tolerance),
        preserveLuminance: Boolean(preserveLuminance),
      });

      if (stats.replacedPixels === 0) {
        return {
          success: false,
          message: `没有匹配到 ${from} 的像素（容差 ${tolerance}），可以调大容差或先用 canvas.colorPalette 确认源色`,
          data: stats,
        };
      }

      const output = document.createElement("canvas");
      output.width = imageData.width;
      output.height = imageData.height;
      output.getContext("2d")?.putImageData(imageData, 0, 0);

      const finalCanvas = autoTrim ? Utils.trimCanvas(output) : output;
      const file = await canvasToFile(finalCanvas, `${filename}.png`);
      downloadByFile(file);

      const percent = (stats.ratio * 100).toFixed(2);
      return {
        success: true,
        message: `已替换 ${stats.replacedPixels} 个像素（占不透明像素 ${percent}%），输出 ${finalCanvas.width}x${finalCanvas.height} PNG`,
        data: { stats, width: finalCanvas.width, height: finalCanvas.height },
      };
    } catch (err: any) {
      return { success: false, message: `换色失败: ${err?.message || String(err)}` };
    }
  },
});
