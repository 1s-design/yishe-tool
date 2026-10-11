<template>
  <ScrollArea class="canvas-operate-scrollbar u-panel__body">
    <div class="canvas-operate-form">
      <!-- 固定图层：画布 + 代码画布 —— 始终直出展示 -->
      <component :is="CanvasChildOperationComponentMap['canvas']"></component>
      <component :is="CanvasChildOperationComponentMap['html']"></component>

      <!-- 选中图层：画布/代码画布之外的图层，选中后展示其属性面板 -->
      <template v-if="extraChild">
        <div class="canvas-operate-extra-bar">
          <span class="canvas-operate-extra-bar__title">
            选中图层 · {{ canvasChildLabelMap[extraChild.type] || "图层" }}
          </span>
          <button
            type="button"
            class="u-icon-btn u-icon-btn--xs u-icon-btn--danger"
            title="删除该图层"
            @click="remove(extraChild.id)"
          >
            <XCircle class="w-3 h-3" />
          </button>
        </div>
        <component :is="CanvasChildOperationComponentMap[extraChild.type]"></component>
      </template>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { XCircle } from "lucide-vue-next";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  currentOperatingCanvasChild,
  CanvasChildOperationComponentMap,
  canvasChildLabelMap,
  removeCavnasChild,
} from "../index.tsx";

/* 当前选中的「非固定图层」（画布/代码画布之外），有则在双面板下方展示其操作面板 */
const extraChild = computed(() => {
  const child = currentOperatingCanvasChild.value;
  if (!child) return null;
  if (child.type === "canvas" || child.type === "html" || child.id === "this_is_html_id" || child.id === "this_is_canvas_id") {
    return null;
  }
  return child;
});

function remove(id: string) {
  removeCavnasChild(id);
}
</script>

<style lang="less">
.canvas-operate-form {
  padding: 0 0 18px;
  box-sizing: border-box;

  > * {
    width: 100%;
    min-width: 0;
  }
}

/* 平铺分节 — 属性直出，无折叠（Figma 检查器风格） */
.operate-section {
  padding: 8px 8px 10px;
  border-top: 1px solid var(--1s-divider-color);

  &:first-child {
    border-top: 0;
    padding-top: 6px;
  }

  /* 行级组件不再自留水平 padding，由 section 统一提供 —— 保证 label/控件左对齐 */
  .operate-form-item,
  .u-prop-row,
  .size-widget,
  .ratio-widget,
  .size-presets-trigger {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
    box-sizing: border-box;
  }

  /* form 行之间紧凑堆积 */
  .operate-form-item + .operate-form-item,
  .u-prop-row + .u-prop-row,
  .size-widget + .ratio-widget,
  .size-widget + .size-presets-trigger,
  .ratio-widget + .operate-form-item {
    margin-top: 2px;
  }
}

.operate-section__title {
  margin: 0 0 4px;
  font-size: 10px;
  font-weight: 550;
  line-height: 1.2;
  letter-spacing: 0.02em;
  color: var(--1s-text-color-secondary);
  user-select: none;
}

/* 其它图层的分隔标题条 */
.canvas-operate-extra-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: 28px;
  margin: 8px 0 2px;
  padding: 0 7px;
  border-top: 1px solid var(--1s-divider-color);

  &__title {
    font-size: var(--1s-control-font);
    font-weight: 550;
    color: var(--1s-text-color-secondary);
    letter-spacing: 0.01em;
    user-select: none;
  }
}
</style>

<style scoped>
.canvas-operate-scrollbar {
  height: 100%;
  width: 100%;
}
</style>
