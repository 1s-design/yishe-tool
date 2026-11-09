import { ref } from "vue";

/** 右侧 Dock 分页：AI 对话 / 代码画布 */
export type RightDockTab = "ai" | "code";

export const rightDockTab = ref<RightDockTab>("ai");

/** 代码画布全屏编辑器开关 */
export const showCodeCanvasFullscreen = ref(false);

/** 打开右侧 Dock 的代码画布分页 */
export function openCodeCanvasDock() {
  rightDockTab.value = "code";
}
