<template>
  <ScrollArea class="canvas-operate-scrollbar">
    <div class="canvas-operate-form">
      <component v-if="activeChild" :is="CanvasChildOperationComponentMap[activeChild.type]"></component>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";
import { ScrollArea } from "@/components/ui/scroll-area";
import { currentOperatingCanvasChildId, currentOperatingCanvasChild } from "../index.tsx";

const activeChild = computed(() => currentOperatingCanvasChild.value);
const activeChildId = computed({
  get() {
    return currentOperatingCanvasChildId.value;
  },
  set(val) {
    currentOperatingCanvasChildId.value = val;
  }
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
  CanvasChildOperationComponentMap
} from "../index.tsx";

function remove(index) {
  removeCavnasChild(index);
}
</script>

<style lang="less">
.custom-segmented-control {
  display: flex;
  background-color: var(--1s-shell-background, #f1f5f9);
  padding: 2px;
  border-radius: 4px;
  margin-bottom: 8px;
  user-select: none;
  cursor: pointer;
  border: 1px solid var(--1s-border-color, rgba(226, 232, 240, 0.8));

  .segmented-item {
    flex: 1;
    text-align: center;
    padding: 3px 6px;
    font-size: 11px;
    font-weight: 500;
    color: var(--1s-text-color-secondary, #64748b);
    border-radius: 3px;
    transition: all 0.15s ease;

    &:hover {
      color: var(--1s-text-color, #0f172a);
    }

    &.active {
      background-color: var(--1s-surface-background, #ffffff);
      color: var(--1s-text-color, #0f172a);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      font-weight: 600;
    }
  }
}

.sidebar-back-header {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--1s-border-color, rgba(226, 232, 240, 0.8));
}

.canvas-operate-form {
  padding: 4px 8px 16px;
  box-sizing: border-box;

  .el-collapse {
    border-top: none;
    border-bottom: none;
  }

  .el-collapse-item__header {
    height: 28px;
    line-height: 28px;
    font-size: 11px;
    font-weight: 600;
    color: var(--1s-text-color, #09090b);
    background: transparent;
    border-bottom: 1px solid var(--1s-border-color, #e4e4e7);
    padding: 0 4px;
    letter-spacing: 0.02em;
    user-select: none;
  }

  .el-collapse-item__wrap {
    background: transparent;
    border-bottom: 1px solid var(--1s-border-color, #e4e4e7);
  }

  .el-collapse-item__content {
    padding: 6px 2px 8px;
  }

  .el-input__wrapper,
  .el-select__wrapper,
  .el-textarea__inner {
    background-color: var(--1s-elevated-background, #f4f4f5);
    border-radius: 4px;
    font-size: 11px;
  }
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
