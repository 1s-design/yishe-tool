import { registerOperation } from "../registry";
import {
  prepareHtmlArtworkOptions,
  updateExistingHtmlArtwork,
  getDirectExternalResourceError,
  getCanvasTypographyContext,
} from "./add-child";

type FitMode = "cover" | "contain" | "stretch";

const IMAGE_KEY = "photo";

/**
 * 兼容 LLM 常见的两种写法：0-100 百分比，或 0-1 比例（0.5 表示居中）。
 * 统一归一化为 0-100 的百分比再交给 CSS。
 */
function normalizePercent(value: unknown, fallback = 50): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  const percent = num >= 0 && num <= 1 ? num * 100 : num;
  return Math.min(100, Math.max(0, percent));
}

/**
 * 生成图片适配模板。
 * 图片统一通过 htmlBindings 绑定后以 {{image.photo.url}} 引用，避免直接外链被拦截。
 */
function buildFitHtml(params: {
  mode: FitMode;
  positionX: number;
  positionY: number;
  fillType: "transparent" | "color" | "blur";
  fillColor: string;
}) {
  const { mode, positionX, positionY, fillType, fillColor } = params;
  const url = `{{image.${IMAGE_KEY}.url}}`;

  if (mode === "stretch") {
    return [
      `<div style="position: relative; width: 100%; height: 100%; overflow: hidden;">`,
      `<img src="${url}" style="display: block; width: 100%; height: 100%; object-fit: fill;" />`,
      `</div>`,
    ].join("");
  }

  if (mode === "cover") {
    return [
      `<div style="position: relative; width: 100%; height: 100%; overflow: hidden;">`,
      `<img src="${url}" style="display: block; width: 100%; height: 100%; object-fit: cover; object-position: ${positionX}% ${positionY}%;" />`,
      `</div>`,
    ].join("");
  }

  // contain：留白区域按 fillType 处理
  if (fillType === "blur") {
    return [
      `<div style="position: relative; width: 100%; height: 100%; overflow: hidden;">`,
      `<div style="position: absolute; inset: 0; background-image: url(${url}); background-size: cover; background-position: center; filter: blur(24px); transform: scale(1.12);"></div>`,
      `<img src="${url}" style="position: relative; display: block; width: 100%; height: 100%; object-fit: contain;" />`,
      `</div>`,
    ].join("");
  }

  const background =
    fillType === "color" ? `background: ${fillColor};` : "background: transparent;";
  return [
    `<div style="position: relative; width: 100%; height: 100%; overflow: hidden; ${background}">`,
    `<img src="${url}" style="display: block; width: 100%; height: 100%; object-fit: contain;" />`,
    `</div>`,
  ].join("");
}

registerOperation({
  id: "canvas.fitImage",
  name: "图片适配画布",
  description:
    "把一张图片按指定宽高与适配模式（cover 裁剪 / contain 填充 / stretch 拉伸）铺到画布上，写入代码画布（HTML 层）。确定性实现，不需要手写 HTML：优先用它完成图片尺寸调整任务。",
  group: "画布",
  params: [
    {
      name: "url",
      label: "图片地址",
      type: "string",
      required: true,
      placeholder: "https://...",
      description: "图片的完整 URL",
    },
    {
      name: "width",
      label: "目标宽度",
      type: "number",
      min: 1,
      max: 20000,
      description: "画布目标宽度（px）。与 height 同时提供时会先设置画布尺寸。",
    },
    {
      name: "height",
      label: "目标高度",
      type: "number",
      min: 1,
      max: 20000,
      description: "画布目标高度（px）。与 width 同时提供时会先设置画布尺寸。",
    },
    {
      name: "mode",
      label: "适配模式",
      type: "string",
      default: "cover",
      options: [
        { label: "cover 裁剪（等比缩放并裁掉多余）", value: "cover" },
        { label: "contain 填充（等比缩放并留白）", value: "contain" },
        { label: "stretch 拉伸（非等比，允许变形）", value: "stretch" },
      ],
      description: "cover / contain / stretch",
    },
    {
      name: "positionX",
      label: "裁剪焦点 X",
      type: "number",
      default: 50,
      min: 0,
      max: 100,
      description: "cover 模式下裁剪焦点横向位置：0-100 百分比（也可传 0-1 比例），0 左 100 右",
    },
    {
      name: "positionY",
      label: "裁剪焦点 Y",
      type: "number",
      default: 50,
      min: 0,
      max: 100,
      description: "cover 模式下裁剪焦点纵向位置：0-100 百分比（也可传 0-1 比例），0 上 100 下",
    },
    {
      name: "fillType",
      label: "留白填充",
      type: "string",
      default: "transparent",
      options: [
        { label: "透明", value: "transparent" },
        { label: "纯色", value: "color" },
        { label: "图片模糊放大", value: "blur" },
      ],
      description: "contain 模式下空白区域的填充方式",
    },
    {
      name: "fillColor",
      label: "留白颜色",
      type: "color",
      default: "#ffffff",
      description: "fillType 为 color 时使用的颜色",
    },
    {
      name: "imageName",
      label: "图片名称",
      type: "string",
      description: "可选，用于 UI 中展示的图片名",
    },
  ],
  execute(params, ctx) {
    const url = String(params.url || "").trim();
    if (!url) {
      return { success: false, message: "缺少图片地址" };
    }

    const mode = (params.mode || "cover") as FitMode;
    const fillType = (params.fillType || "transparent") as
      | "transparent"
      | "color"
      | "blur";
    const positionX = normalizePercent(params.positionX, 50);
    const positionY = normalizePercent(params.positionY, 50);

    // 先应用画布尺寸（宽高都给出时才改）
    const targetWidth = Number(params.width) || 0;
    const targetHeight = Number(params.height) || 0;
    if (targetWidth > 0 && targetHeight > 0) {
      ctx.setCanvasSize(targetWidth, targetHeight, "px");
    }

    const htmlContent = buildFitHtml({
      mode,
      positionX,
      positionY,
      fillType,
      fillColor: params.fillColor || "#ffffff",
    });

    const options: Record<string, any> = {
      htmlContent,
      htmlBindings: {
        image: {
          [IMAGE_KEY]: {
            id: `fit-image-${IMAGE_KEY}`,
            url,
            name: params.imageName || "适配图片",
          },
        },
      },
    };

    // 优先替换已有 HTML 作品，没有则新建
    // 这里是程序化生成的完整画面，跳过「片段/过短」检查，避免短模板（如纯拉伸图）被误杀
    const replaced = updateExistingHtmlArtwork(ctx, options, {
      skipFragmentCheck: true,
    });
    if (replaced) {
      if (replaced.rejected) {
        return {
          success: false,
          message: replaced.message || "图片适配写入失败",
          data: { rejected: true, id: replaced.id },
        };
      }
      const size = ctx.getCanvasSize();
      return {
        success: true,
        message: `已把图片按 ${mode} 模式写入代码画布，画布 ${size.width}×${size.height}${size.unit}`,
        data: {
          id: replaced.id,
          mode,
          fillType,
          positionX,
          positionY,
          canvasWidth: size.width,
          canvasHeight: size.height,
          replaced: true,
        },
      };
    }

    const prepared = prepareHtmlArtworkOptions(
      options,
      undefined,
      getCanvasTypographyContext(ctx),
    );
    const directError = getDirectExternalResourceError(prepared);
    if (directError) {
      return {
        success: false,
        message: directError,
        data: { rejected: true, reason: "direct_external_resource_url" },
      };
    }

    const id = ctx.addCanvasChild("html", prepared);
    const size = ctx.getCanvasSize();
    return {
      success: true,
      message: `已把图片按 ${mode} 模式写入代码画布，画布 ${size.width}×${size.height}${size.unit}`,
      data: {
        id,
        mode,
        fillType,
        positionX,
        positionY,
        canvasWidth: size.width,
        canvasHeight: size.height,
        replaced: false,
      },
    };
  },
});
