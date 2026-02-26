<template>
  <el-collapse v-model="canvasCollapseActives">
    <el-collapse-item name="1" title="画布配置">
      <operateItemAbsoluteSize label="画布尺寸(px)" v-model:width="currentOperatingCanvasChild.width"
        v-model:height="currentOperatingCanvasChild.height">
      </operateItemAbsoluteSize>

      <operateCanvasSizePresets @select="handlePresetSelect"></operateCanvasSizePresets>

      <!-- 不再支持画布单位选择，默认全部使用px -->
      
      <!-- <operateItemAbsoluteUnitSelect @change="absoluteUnitChange" label="画布尺寸单位" v-model="canvasStickerOptions.unit">
      </operateItemAbsoluteUnitSelect> -->

      <operateItemSwitch label="在主画布中显示" v-model="showMainCanvas"></operateItemSwitch>
      
      <operateAspectRatio @change="aspectRatioChange"></operateAspectRatio>

      <!-- <operateItemSwitch label="显示真实大小" v-model="canvasStickerOptions.showCanvasRealSize"></operateItemSwitch> -->
      <operateItemColor label="辅助背景颜色" tooltip="用于辅助画布中的元素，不会对实际画布产生影响" type="pure"
        v-model="canvasStickerOptions.supportBackgroundColor"></operateItemColor>

    </el-collapse-item>
    <el-collapse-item name="2" title="画布属性">

      <operateItemColor label="画布背景颜色" tooltip="画布背景颜色" v-model="currentOperatingCanvasChild.backgroundColor">
      </operateItemColor>

      <a-alert message="我们更希望你使用一个新的背景元素，而不是直接更改画布的背景颜色或其他效果，虽然最终实现的效果相同" banner closable />

    </el-collapse-item>
    <el-collapse-item name="4" title="画布滤镜效果">
      <operateItemFilterGroup v-model="currentOperatingCanvasChild.filter"></operateItemFilterGroup>
    </el-collapse-item>
    <operateItemClipPath v-model="currentOperatingCanvasChild.clipPath"></operateItemClipPath>
  </el-collapse>
</template>
    
<script setup lang='ts'>
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";
import operateAspectRatio from '@/components/design/layout/canvas/operate/aspectRatio.vue';
import operateCanvasSizePresets from '@/components/design/layout/canvas/operate/size/canvasSizePresets.vue';
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
import operateItemAbsoluteSize from "@/components/design/layout/canvas/operate/size/absoluteSize.vue";
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
import operateItemClipPath from '@/components/design/layout/canvas/operate/clipPath/index.vue';

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
  currentOperatingCanvasChild,
  CanvasChildType,
  updateRenderingCanvas
} from "../index.tsx";


const canvasCollapseActives = ref(["1", "2", "3", "4", '5'])


function absoluteUnitChange(unit) {
  updateCanvasStickerOptionsUnit(unit)
}


// 改变宽高比
function aspectRatioChange(asepctRatio) {

  /**
   * 分为基于宽度或高度
  */
 let canvasChild = canvasStickerOptions.value.children.find((item) => item.type == 'canvas');

  canvasChild.height.value =  Number((canvasChild.width.value / asepctRatio).toFixed(2))
}

function handlePresetSelect(preset: { width: number, height: number }) {
  let canvasChild = canvasStickerOptions.value.children.find((item: any) => item.type == 'canvas');
  if (canvasChild) {
    canvasChild.width.value = preset.width;
    canvasChild.height.value = preset.height;
  }
}

</script>
    
<style></style>
