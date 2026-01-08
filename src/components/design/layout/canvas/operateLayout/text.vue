<template>
  <el-collapse v-model="textCollapseActives">
    <el-collapse-item name="1" title="文字属性">
      <operateItemTextContent v-model="currentOperatingCanvasChild.textContent">
      </operateItemTextContent>

      <operateItemSwitch
        label="使用繁体字"
        v-model="currentOperatingCanvasChild.isTraditionalChinese"
      >
      </operateItemSwitch>

      <operateItemFontSize v-model="currentOperatingCanvasChild.fontSize">
      </operateItemFontSize>

      <operateItemFontItalic
        v-model="currentOperatingCanvasChild.italic"
      ></operateItemFontItalic>

      <operateItemFontColor v-model="currentOperatingCanvasChild.fontColor">
      </operateItemFontColor>

      <operateItemLineHeight v-model="currentOperatingCanvasChild.lineHeight">
      </operateItemLineHeight>

      <operateItemLetterSpacing v-model="currentOperatingCanvasChild.letterSpacing">
      </operateItemLetterSpacing>

      <operateItemFontFamily
        v-model="currentOperatingCanvasChild.fontFamilyInfo"
        @font-load="fontLoad"
      >
      </operateItemFontFamily>

      <operateItemFontWeight v-model="currentOperatingCanvasChild.fontWeight">
      </operateItemFontWeight>

      <operateItemTextShadow v-model="currentOperatingCanvasChild.textShadow">
      </operateItemTextShadow>

      <operateItemWritingMode v-model="currentOperatingCanvasChild.writingMode">
      </operateItemWritingMode>

      <operateItemTextAlign v-model="currentOperatingCanvasChild.textAlign">
      </operateItemTextAlign>

      <operateItemTextStroke
        v-model:width="currentOperatingCanvasChild.textStrokeWidth"
        v-model:color="currentOperatingCanvasChild.textStrokeColor"
      >
      </operateItemTextStroke>
    </el-collapse-item>

    <el-collapse-item name="1.5" title="文字背景图">
      <operateItemImageSelect
        label="选择文字背景图"
        v-model="currentOperatingCanvasChild.imageInfo"
      >
      </operateItemImageSelect>
    </el-collapse-item>

    <el-collapse-item name="2" title="通用属性">
      <operateItemCommonGroup
        v-model="currentOperatingCanvasChild"
      ></operateItemCommonGroup>
    </el-collapse-item>

    <el-collapse-item name="4">
      <template #title>
        <div class="title">环形文字</div>
      </template>

      <operateItemSwitch
        label="使用圆形文字"
        v-model="currentOperatingCanvasChild.isRoundText"
      >
      </operateItemSwitch>

      <operateItemEllipseTextRadius
        v-model:horizontal="currentOperatingCanvasChild.roundTextHorizontalRadius"
        v-model:vertical="currentOperatingCanvasChild.roundTextVerticalRadius"
      >
      </operateItemEllipseTextRadius>

      <operateItemRoundTextStartDeg
        v-model="currentOperatingCanvasChild.roundTextStartDeg"
      >
      </operateItemRoundTextStartDeg>

      <operateItemSwitch
        label="是否使用逆时针排列"
        v-model="currentOperatingCanvasChild.isCounterclockwise"
      >
      </operateItemSwitch>

      <operateItemSwitch
        label="多行时文字是否向外扩张"
        v-model="currentOperatingCanvasChild.isMultipleLineOutExpand"
      >
      </operateItemSwitch>

      <operateItemSwitch
        label="是否指向圆心"
        v-model="currentOperatingCanvasChild.isPointingToCenter"
      >
      </operateItemSwitch>

      <operateItemSwitch
        label="反向文字"
        v-model="currentOperatingCanvasChild.isReverseLetter"
      >
      </operateItemSwitch>
    </el-collapse-item>
    <el-collapse-item name="5">
      <template #title>
        <div class="title">滤镜效果</div>
      </template>
      <operateItemFilterGroup
        v-model="currentOperatingCanvasChild.filter"
      ></operateItemFilterGroup>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";

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
import operateItemTextAlign from "@/components/design/layout/canvas/operate/textAlign.vue";
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
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";

import { updateCanvasStickerOptionsUnit } from "../helper";

import {
  CanvasController,
  canvasStickerOptions,
  addCanvasChild,
  removeCavnasChild,
  currentCanvasControllerInstance,
  showMainCanvas,
  currentOperatingCanvasChild,
  CanvasChildType,
  updateRenderingCanvas,
} from "../index.tsx";

const textCollapseActives = ref(["1", "1.5", "2", "3", "4", "5"]);

function fontLoad() {
  updateRenderingCanvas();
}
</script>

<style></style>
