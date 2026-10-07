<template>
  <ScrollArea class="canvas-operate-scrollbar u-panel__body">
    <div class="canvas-operate-form">
      <!-- 固定图层：画布 + 代码画布 —— 直接叠放展示，不再下拉切换 -->
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
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";
import { XCircle } from "lucide-vue-next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { currentOperatingCanvasChildId, currentOperatingCanvasChild } from "../index.tsx";

/* 当前选中的「非固定图层」（画布/代码画布之外），有则在双面板下方展示其操作面板 */
const extraChild = computed(() => {
  const child = currentOperatingCanvasChild.value;
  if (!child) return null;
  if (child.type === "canvas" || child.type === "html" || child.id === "this_is_html_id" || child.id === "this_is_canvas_id") {
    return null;
  }
  return child;
});

import operateItemColor from "@/components/design/layout/canvas/operate/color/index.vue";
import operateItemTextContent from "@/components/design/layout/canvas/operate/textContent.vue";
import operateItemFontSize from "@/components/design/layout/canvas/operate/fontSize.vue";
import operateItemFontWeight from "@/components/design/layout/canvas/operate/fontWeight.vue";
import operateItemFontItalic from "@/components/design/layout/canvas/operate/italic.vue";
import operateItemFontColor from "@/components/design/layout/canvas/operate/fontColor.vue";
import operateItemFontFamily from "@/components/design/layout/canvas/operate/fontFamily/fontFamily.vue";
import operateItemLineHeight from "@/components/design/layout/canvas/operate/lineHeight.vue";
import operateItemLetterSpacing from "@/components/design/layout/canvas/operate/letterSpacing.vue";
import operateItemWritingMode from "@/components/design/layout/canvas/operate/writingMode.vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemPosition from "@/components/design/layout/canvas/operate/position/position.vue";
import operateItemZindex from "@/components/design/layout/canvas/operate/zIndex.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemImageSelect from "@/components/design/layout/canvas/operate/imageSelect/index.vue";
import operateItemSwitch from "@/components/design/layout/canvas/operate/basicSwitch.vue";
import operateItemPadding from "@/components/design/layout/canvas/operate/padding.vue";
import operateItemBorderRadius from "@/components/design/layout/canvas/operate/borderRadius.vue";
import operateItemQrcodeErrorCorrectionLevel from "@/components/design/layout/canvas/operate/qrcodeErrorCorrectionLevel.vue";
import operateItemQrcodeType from "@/components/design/layout/canvas/operate/qrcodeType.vue";
import operateItemBorderWidth from "@/components/design/layout/canvas/operate/border/borderWidth.vue";
import operateItemRectBorderRadius from "@/components/design/layout/canvas/operate/border/rectBorderRadius.vue";
import operateItemAbsoluteUnitSelect from "@/components/design/layout/canvas/operate/absoluteUnitSelect.vue";
import operateItemTextShadow from "@/components/design/layout/canvas/operate/text-shadow/index.vue";
import operateItemRoundTextStartDeg from "@/components/design/layout/canvas/operate/text/roundTextStartDeg.vue";
import operateItemEllipseTextRadius from "@/components/design/layout/canvas/operate/text/ellipseTextRadius.vue";
import operateItemTextStroke from "@/components/design/layout/canvas/operate/text/textStroke.vue";
import operateItemFilterGroup from "@/components/design/layout/canvas/operate/filter/group.vue";
import operateItemObjectFit from "@/components/design/layout/canvas/operate/objectFit.vue";
import operateItemCommonGroup from '@/components/design/layout/canvas/operate/commonGroup.vue';

import {
  updateCanvasStickerOptionsUnit
} from '../helper'

import {
  CanvasController,
  canvasStickerOptions,
  addCanvasChild,
  removeCavnasChild,
  currentCanvasControllerInstance,
  showMainCanvas,
  CanvasChildType,
  updateRenderingCanvas,
  CanvasChildOperationComponentMap,
  canvasChildLabelMap
} from "../index.tsx";

function remove(index) {
  removeCavnasChild(index);
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
  padding: 10px 10px 12px;
  border-top: 1px solid var(--1s-divider-color);

  &:first-child {
    border-top: 0;
    padding-top: 6px;
  }
}

.operate-section__title {
  margin: 0 0 6px;
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

.sidebar-back-header {
  margin: 2px 0 6px;
  padding: 0 4px 6px;
  border-bottom: 1px solid var(--1s-divider-color);
}
</style>

<style scoped>
.canvas-operate-scrollbar {
  height: 100%;
  width: 100%;
}

:deep(.el-scrollbar__bar.is-vertical) {
  width: 3px;
}
</style>
