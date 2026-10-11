import { registerOperation } from "../registry";

registerOperation({
  id: "canvas.getState",
  name: "获取画布状态",
  description: "获取当前画布的完整状态信息，包括尺寸、背景色、所有元素列表",
  group: "画布",
  params: [],
  execute(_params, ctx) {
    const size = ctx.getCanvasSize();
    const bgColor = ctx.getCanvasBackgroundColor();
    const children = ctx.getCanvasChildren();
    const canvas = children.find((c: any) => c.type === "canvas");
    const baseFontSize =
      typeof canvas?.fontSize === "object"
        ? canvas.fontSize.value
        : canvas?.fontSize || 32;

    const elements = children
      .filter((c: any) => c.type !== "canvas")
      .map((c: any) => ({
        id: c.id,
        type: c.type,
        zIndex: c.zIndex,
        textContent: c.textContent || undefined,
        // HTML 层没有 textContent，给出可见文字预览便于内容核对
        textPreview:
          c.type === "html" && c.htmlContent
            ? String(c.htmlContent)
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 120)
            : undefined,
        position: c.position
          ? {
              center: c.position.center,
              left: c.position.left,
              top: c.position.top,
            }
          : undefined,
        width: typeof c.width === "object" ? c.width.value : c.width,
        height: typeof c.height === "object" ? c.height.value : c.height,
      }));

    const elementSummary =
      elements.length > 0
        ? elements
            .map(
              (e: any) =>
                `${e.type}(${e.id})${e.textContent ? `:"${e.textContent.slice(0, 20)}"` : e.textPreview ? `:"${e.textPreview.slice(0, 20)}"` : ""}`,
            )
            .join(", ")
        : "无";
    return {
      success: true,
      message: `画布 ${size.width}x${size.height}${size.unit}，基础字号 ${baseFontSize}px，背景 ${bgColor}，${elements.length} 个元素: ${elementSummary}。用 element.setStyle(id, ...) 修改单个元素，用 canvas.addChild 添加新元素。`,
      data: {
        canvasSize: size,
        baseFontSize,
        backgroundColor: bgColor,
        totalChildren: children.length,
        elements,
      },
    };
  },
});
