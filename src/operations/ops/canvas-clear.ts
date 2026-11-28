import { registerOperation } from "../registry";
import {
  currentEditingCustomStickerId,
  currentEditingCustomStickerFolderId,
} from "@/components/design/layout/canvas";

registerOperation({
  id: "canvas.clear",
  name: "清空画布",
  description: "清空画布上的所有元素并解除当前编辑中的自定义贴纸绑定。创建新设计前必须先调用此工具。不可撤销。",
  group: "画布",
  params: [],
  execute(_params, ctx) {
    const children = ctx.getCanvasChildren();
    const count = children.filter((c: any) => c.type !== "canvas").length;
    ctx.clearCanvas();
    currentEditingCustomStickerId.value = null;
    currentEditingCustomStickerFolderId.value = null;
    return {
      success: true,
      message: `已清空画布，共删除 ${count} 个元素`,
      data: { removedCount: count },
    };
  },
});
