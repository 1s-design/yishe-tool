<template>
  <Accordion type="multiple" :model-value="qrcodeCollapseActives" @update:model-value="v => qrcodeCollapseActives = v as string[]">
    <AccordionItem value="1">
      <AccordionTrigger>
        <div class="title">基本配置</div>
      </AccordionTrigger>
      <AccordionContent>
      <operateItemTextContent
        label="条形码内容"
        v-model="currentOperatingCanvasChild.barcodeContent"
      >
      </operateItemTextContent>

      <operateItemBarcodeFormat v-model="currentOperatingCanvasChild.barcodeFormat">
      </operateItemBarcodeFormat>

      <operateItemBarcodeWidth v-model="currentOperatingCanvasChild.width">
      </operateItemBarcodeWidth>
      <div class="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">该宽度指定的是条形码单个线的宽度</div>

      <operateItemBarcodeHeight v-model="currentOperatingCanvasChild.height">
      </operateItemBarcodeHeight>

      <operateItemMargin v-model="currentOperatingCanvasChild.margin">
      </operateItemMargin>

      <operateItemColor
        label="条形码颜色"
        v-model="currentOperatingCanvasChild.lineColor"
        type="pure"
      >
      </operateItemColor>

      <operateItemColor
        label="背景颜色"
        v-model="currentOperatingCanvasChild.background"
        type="pure"
      >
      </operateItemColor>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="common">
      <AccordionTrigger>通用属性</AccordionTrigger>
      <AccordionContent>
      <operateItemCommonGroup
        v-model="currentOperatingCanvasChild"
      ></operateItemCommonGroup>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import operateItemColor from "@/components/design/layout/canvas/operate/color/index.vue";
import operateItemTextContent from "@/components/design/layout/canvas/operate/textContent.vue";
import operateItemBarcodeFormat from "@/components/design/layout/canvas/operate/barcode/format.vue";
import operateItemFontSize from "@/components/design/layout/canvas/operate/fontSize.vue";
import operateItemFontWeight from "@/components/design/layout/canvas/operate/fontWeight.vue";
import operateItemFontItalic from "@/components/design/layout/canvas/operate/italic.vue";
import operateItemFontColor from "@/components/design/layout/canvas/operate/fontColor.vue";
import operateItemFontFamily from "@/components/design/layout/canvas/operate/fontFamily/fontFamily.vue";
import operateItemLineHeight from "@/components/design/layout/canvas/operate/lineHeight.vue";
import operateItemLetterSpacing from "@/components/design/layout/canvas/operate/letterSpacing.vue";
import operateItemWritingMode from "@/components/design/layout/canvas/operate/writingMode.vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBarcodeWidth from "@/components/design/layout/canvas/operate/barcode/width.vue";
import operateItemBarcodeHeight from "@/components/design/layout/canvas/operate/barcode/height.vue";
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
import operateItemMargin from "@/components/design/layout/canvas/operate/margin.vue";
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

const qrcodeCollapseActives = ref(["1", "2", "3", "4", "5", "common"]);
</script>

<style></style>
