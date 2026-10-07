<template>
  <!-- 画布：尺寸 / 预设 / 比例 / 外观 —— 全部直出，无折叠 -->
  <section class="operate-section">
    <h4 class="operate-section__title">画布</h4>
    <operateItemAbsoluteSize
      label="尺寸(px)"
      v-model:width="currentOperatingCanvasChild.width"
      v-model:height="currentOperatingCanvasChild.height"
    />

    <operateCanvasSizePresets @select="handlePresetSelect" />

    <operateAspectRatio @change="aspectRatioChange" />

    <operateItemColor
      label="背景颜色"
      tooltip="画布背景颜色"
      v-model="currentOperatingCanvasChild.backgroundColor"
    />

    <operateItemFontSize
      label="基础字号"
      v-model="currentOperatingCanvasChild.fontSize"
    />

    <operateItemSwitch
      label="在主画布中显示"
      v-model="showMainCanvas"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import operateAspectRatio from "@/components/design/layout/canvas/operate/aspectRatio.vue";
import operateCanvasSizePresets from "@/components/design/layout/canvas/operate/size/canvasSizePresets.vue";
import operateItemColor from "@/components/design/layout/canvas/operate/color/index.vue";
import operateItemFontSize from "@/components/design/layout/canvas/operate/fontSize.vue";
import operateItemAbsoluteSize from "@/components/design/layout/canvas/operate/size/absoluteSize.vue";
import operateItemSwitch from "@/components/design/layout/canvas/operate/basicSwitch.vue";

import {
  canvasStickerOptions,
  showMainCanvas,
  /* 画布面板固定绑定画布图层，与代码画布面板可同时显示 */
  canvasLayerChild as currentOperatingCanvasChild,
} from "../index.tsx";

watchEffect(() => {
  const canvasChild = currentOperatingCanvasChild.value;
  if (!canvasChild || canvasChild.type !== "canvas" || canvasChild.fontSize) {
    return;
  }

  canvasChild.fontSize = {
    unit: "px",
    value: 32,
  };
});

// 改变宽高比
function aspectRatioChange(asepctRatio) {
  /**
   * 分为基于宽度或高度
   */
  let canvasChild = canvasStickerOptions.value.children.find(
    (item: any) => item.type == "canvas",
  ) as any;

  canvasChild.height.value = Number(
    (canvasChild.width.value / asepctRatio).toFixed(2),
  );
}

function handlePresetSelect(preset: { width: number; height: number }) {
  let canvasChild = canvasStickerOptions.value.children.find(
    (item: any) => item.type == "canvas",
  ) as any;
  if (canvasChild) {
    canvasChild.width.value = preset.width;
    canvasChild.height.value = preset.height;
  }
}
</script>

<style lang="less" scoped></style>
