import { registerOperation } from "../../registry";

void ({
  id: "canvas.addRect",
  name: "添加矩形",
  description:
    "添加矩形元素。【推荐用 canvas.addChild html 类型替代】适合纯色/渐变矩形，HTML 类型可实现更丰富的卡片、背景等效果。",
  group: "添加元素",
  params: [
    {
      name: "width",
      label: "宽度",
      type: "number",
      default: 100,
      min: 1,
      max: 10000,
      description: "矩形宽度（px）",
    },
    {
      name: "height",
      label: "高度",
      type: "number",
      default: 100,
      min: 1,
      max: 10000,
      description: "矩形高度（px）",
    },
    {
      name: "backgroundColor",
      label: "背景颜色",
      type: "color",
      default: "#ffffff",
      description: "矩形背景颜色",
    },
    {
      name: "borderColor",
      label: "边框颜色",
      type: "color",
      default: "#ffffff",
      description: "边框颜色",
    },
    {
      name: "borderWidth",
      label: "边框宽度",
      type: "number",
      default: 0,
      min: 0,
      max: 100,
      description: "边框宽度（px）",
    },
    {
      name: "borderRadius",
      label: "圆角",
      type: "number",
      default: 0,
      min: 0,
      max: 5000,
      description: "矩形圆角（px）",
    },
    {
      name: "rotateZ",
      label: "旋转角度",
      type: "number",
      default: 0,
      min: -360,
      max: 360,
      description: "旋转角度（度）",
    },
    {
      name: "center",
      label: "居中",
      type: "boolean",
      default: true,
      description: "是否在画布中居中",
    },
  ],
  execute(params, ctx) {
    const {
      width,
      height,
      backgroundColor,
      borderColor,
      borderWidth,
      borderRadius,
      rotateZ,
      center,
    } = params;

    const extraOptions: Record<string, any> = {};

    if (width !== undefined) extraOptions.width = { value: width, unit: "px" };
    if (height !== undefined)
      extraOptions.height = { value: height, unit: "px" };
    if (backgroundColor !== undefined) {
      // 检测是否是渐变色
      const isGradient = backgroundColor.includes("gradient");
      extraOptions.backgroundColor = {
        color: backgroundColor,
        type: isGradient ? "gradient" : "pure",
      };
    }
    if (borderColor !== undefined)
      extraOptions.borderColor = { color: borderColor, type: "pure" };
    if (borderWidth !== undefined)
      extraOptions.borderWidth = { value: borderWidth, unit: "px" };
    if (borderRadius !== undefined) {
      extraOptions.borderRadius = {
        horizontal: { value: borderRadius, unit: "px" },
        vertical: { value: borderRadius, unit: "px" },
      };
    }
    if (rotateZ !== undefined) {
      extraOptions.transform = { rotateZ };
    }
    if (center !== undefined) {
      extraOptions.position = {
        center,
        verticalCenter: center,
        horizontalCenter: center,
        top: { value: 0, unit: "px" },
        left: { value: 0, unit: "px" },
        bottom: { value: 0, unit: "px" },
        right: { value: 0, unit: "px" },
      };
    }

    const id = ctx.addCanvasChild("rect", extraOptions);
    return {
      success: true,
      message: `已添加矩形元素 (id: ${id}) ${width}x${height}px。用 element.setStyle 可通过 id 调整位置和大小。`,
      data: { id, type: "rect" },
    };
  },
});
