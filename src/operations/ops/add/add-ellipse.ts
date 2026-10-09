import { registerOperation } from "../../registry";

void ({
  id: "canvas.addEllipse",
  name: "添加椭圆",
  description:
    "添加椭圆/圆形元素（宽高相同即圆形）。【推荐用 canvas.addChild html + border-radius:50% 替代】更灵活。",
  group: "添加元素",
  params: [
    {
      name: "width",
      label: "宽度",
      type: "number",
      default: 100,
      min: 1,
      max: 10000,
      description: "椭圆宽度（px）",
    },
    {
      name: "height",
      label: "高度",
      type: "number",
      default: 100,
      min: 1,
      max: 10000,
      description: "椭圆高度（px），与宽度相同即为圆形",
    },
    {
      name: "backgroundColor",
      label: "背景颜色",
      type: "color",
      default: "#ffffff",
      description: "椭圆背景颜色",
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
      rotateZ,
      center,
    } = params;

    const extraOptions: Record<string, any> = {};

    if (width !== undefined) extraOptions.width = { value: width, unit: "px" };
    if (height !== undefined)
      extraOptions.height = { value: height, unit: "px" };
    if (backgroundColor !== undefined) {
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

    const id = ctx.addCanvasChild("ellipse", extraOptions);
    return {
      success: true,
      message: `已添加${width === height ? "圆形" : "椭圆"}元素 (id: ${id}) ${width}x${height}px。用 element.setStyle 可通过 id 调整位置。`,
      data: { id, type: "ellipse" },
    };
  },
});
