import {
  currentCanvasControllerInstance,
  renderingLoading,
} from "@/components/design/layout/canvas";
import { nextTick } from "vue";

export const DEFAULT_AI_CAPTURE_MAX_DIMENSION = 1000;

export interface CanvasCaptureForAIOptions {
  /** AI 预览图最长边；传 0 可关闭缩放并保留原始尺寸。 */
  maxDimension?: number;
  /** 默认继续使用 PNG，保持透明背景和现有模型兼容性。 */
  mimeType?: "image/png" | "image/jpeg" | "image/webp";
  /** 仅 JPEG/WebP 生效。 */
  quality?: number;
  timeoutMs?: number;
}

function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      resolve();
    };
    const hidden =
      typeof document !== "undefined" && document.visibilityState === "hidden";

    if (hidden && typeof MessageChannel !== "undefined") {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        channel.port2.close();
        finish();
      };
      channel.port2.postMessage(null);
    }

    fallbackTimer = setTimeout(finish, 250);

    if (!hidden && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        finish();
      });
    }
  });
}

/**
 * 等待画布渲染完成
 */
async function waitForRender(
  controller: any,
  timeout = 15_000,
  rejectOnTimeout = false,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (!controller.loading.value && !renderingLoading.value) {
        resolve();
        return;
      }
      if (Date.now() - startTime > timeout) {
        const message = `[AI Capture] 等待渲染超时 (${timeout}ms)`;
        console.warn(message);
        if (rejectOnTimeout) {
          reject(new Error(message));
          return;
        }
        resolve();
        return;
      }
      setTimeout(check, 50);
    };
    check();
  });
}

export async function renderCurrentCanvasNow(
  options: { timeoutMs?: number } = {},
) {
  const controller = currentCanvasControllerInstance.value;
  if (!controller) {
    throw new Error("画布控制器未初始化");
  }

  const timeoutMs = options.timeoutMs ?? 60_000;

  await nextTick();
  await waitForAnimationFrame();
  await waitForAnimationFrame();
  // 等待 DOM 稳定（字体加载、图片解码等）
  await new Promise((resolve) => setTimeout(resolve, 300));
  await waitForAnimationFrame();

  if (typeof controller.updateRenderingCanvasJob === "function") {
    controller.loading.value = true;
    renderingLoading.value = true;
    await Promise.race([
      Promise.resolve(controller.updateRenderingCanvasJob()),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`画布渲染超时 (${timeoutMs}ms)`)),
          timeoutMs,
        );
      }),
    ]);
  } else {
    await controller.activeUpdateRenderingCanvas();
    await waitForRender(controller, timeoutMs, true);
  }

  await waitForRender(controller, timeoutMs, true);
  if (controller.shouldUpdateCanvasSticker?.value) {
    // 竞态条件：onUpdated 可能在渲染后重置标记，不应阻塞截图
    console.warn("[Capture] shouldUpdateCanvasSticker 仍为 true（可能是竞态），继续使用当前画面");
    controller.shouldUpdateCanvasSticker.value = false;
  }
  await nextTick();
  await waitForAnimationFrame();

  return controller;
}

/**
 * 截取当前画布为 base64 图片
 * 会先强制更新贴纸渲染，确保截图是最新的
 */
export async function captureCanvasForAI(
  options: CanvasCaptureForAIOptions = {},
): Promise<string> {
  const controller = await renderCurrentCanvasNow({
    timeoutMs: options.timeoutMs,
  });

  const canvasEl = controller.canvasEl;
  if (!canvasEl) {
    throw new Error("画布元素不存在");
  }

  // 检查 canvas 尺寸
  if (canvasEl.width === 0 || canvasEl.height === 0) {
    throw new Error("画布尺寸为 0，无法截图");
  }

  try {
    const maxDimension =
      options.maxDimension === undefined
        ? DEFAULT_AI_CAPTURE_MAX_DIMENSION
        : Math.max(0, Number(options.maxDimension) || 0);
    const longestSide = Math.max(canvasEl.width, canvasEl.height);
    const scale =
      maxDimension > 0 && longestSide > maxDimension
        ? maxDimension / longestSide
        : 1;
    const outputWidth = Math.max(1, Math.round(canvasEl.width * scale));
    const outputHeight = Math.max(1, Math.round(canvasEl.height * scale));

    let outputCanvas: HTMLCanvasElement = canvasEl;
    if (scale < 1) {
      outputCanvas = document.createElement("canvas");
      outputCanvas.width = outputWidth;
      outputCanvas.height = outputHeight;
      const outputContext = outputCanvas.getContext("2d", { alpha: true });
      if (!outputContext) {
        throw new Error("无法创建 AI 预览图画布");
      }
      outputContext.imageSmoothingEnabled = true;
      outputContext.imageSmoothingQuality = "high";
      outputContext.drawImage(
        canvasEl,
        0,
        0,
        canvasEl.width,
        canvasEl.height,
        0,
        0,
        outputWidth,
        outputHeight,
      );
    }

    const mimeType = options.mimeType || "image/png";
    const quality = Math.max(0.1, Math.min(1, options.quality ?? 0.86));
    const base64 = outputCanvas.toDataURL(mimeType, quality);
    if (!base64 || base64 === "data:," || base64.length < 100) {
      throw new Error("画布截图数据为空");
    }

    console.log(
      `[AI Capture] 截图成功 ${canvasEl.width}x${canvasEl.height} -> ${outputWidth}x${outputHeight}，大小:`,
      Math.round(base64.length / 1024),
      "KB",
    );
    return base64;
  } catch (err: any) {
    // 如果 toDataURL 失败，可能是 canvas 被污染
    console.error("[AI Capture] 截图失败:", err);
    throw new Error(`画布截图失败: ${err?.message || "未知错误"}`);
  }
}

/**
 * 获取画布状态摘要（文字描述）
 */
export function getCanvasStateSummary(): string {
  const controller = currentCanvasControllerInstance.value;
  if (!controller) {
    return "画布未初始化";
  }

  const options = controller.options;
  if (!options) {
    return "画布配置为空";
  }

  const children = options.children || [];
  const mainCanvas = children[0];
  const elements = children.slice(1);
  const formatSize = (size: any) => {
    if (size && typeof size === "object") {
      return `${size.value ?? "?"}${size.unit || "px"}`;
    }
    return String(size ?? "?");
  };

  const lines = [
    `画布尺寸: ${formatSize(mainCanvas?.width)} x ${formatSize(mainCanvas?.height)}`,
    `元素数量: ${elements.length}`,
    "",
  ];

  if (elements.length > 0) {
    lines.push("元素列表:");
    elements.forEach((el: any, i: number) => {
      const desc = getElementBriefDescription(el);
      lines.push(`  ${i + 1}. [${el.type}] ${desc}`);
    });
  } else {
    lines.push("画布为空，没有元素");
  }

  return lines.join("\n");
}

/**
 * 获取元素简要描述
 */
function getElementBriefDescription(el: any): string {
  switch (el.type) {
    case "text":
      return `文字: "${(el.textContent || "").slice(0, 20)}"`;
    case "image":
      return `图片: ${el.src ? "有" : "无"}`;
    case "rect":
      return `矩形: ${el.fill || "无填充"}`;
    case "ellipse":
      return `椭圆: ${el.fill || "无填充"}`;
    case "qrcode":
      return `二维码`;
    case "barcode":
      return `条形码`;
    case "math":
      return `公式: "${(el.formula || "").slice(0, 20)}"`;
    case "mermaid":
      return `流程图`;
    case "codeBlock":
      return `代码块: ${el.language || "?"}`;
    case "molecule":
      return `分子: ${(el.source || "").slice(0, 15)}`;
    case "threeMol":
      return `3D分子`;
    case "figlet":
      return `ASCII字: "${(el.text || "").slice(0, 10)}"`;
    case "chartjs":
    case "apexChart":
    case "plotlyChart":
      return `图表`;
    default:
      return el.type;
  }
}
