import { registerOperation } from "../registry";
import { importCustomStickerToLibrary } from "@/api";

registerOperation({
  id: "material.importCustomStickerToLibrary",
  name: "导入自定义贴纸到素材库",
  description: "将 custom_sticker 物理复制为 sticker 素材。仅在需要普通素材库 ID（例如创建组图）时使用。",
  group: "贴纸",
  params: [{ name: "customStickerId", label: "自定义贴纸ID", type: "string", required: true }],
  async execute(params) {
    try {
      const sticker: any = await importCustomStickerToLibrary({ customStickerId: String(params.customStickerId) });
      return {
        success: true,
        message: "自定义贴纸已移入素材库",
        data: { customStickerId: String(params.customStickerId), stickerId: sticker?.id || null, url: sticker?.url || "" },
      };
    } catch (error: any) {
      return { success: false, message: `导入素材库失败: ${error?.message || "未知错误"}` };
    }
  },
});
