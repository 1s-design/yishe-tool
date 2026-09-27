<template>
    <Accordion type="multiple" :model-value="backgroundCollapseActives" @update:model-value="v => backgroundCollapseActives = v as string[]">
        <AccordionItem value="1">
            <AccordionTrigger>背景属性</AccordionTrigger>
            <AccordionContent>
            <operateItemSize label="背景尺寸" v-model:width="currentOperatingCanvasChild.width"
                v-model:height="currentOperatingCanvasChild.height">
            </operateItemSize>
            <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor">
            </operateItemBackgroundColor>

            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
            <AccordionTrigger>通用属性</AccordionTrigger>
            <AccordionContent>
            <operateItemCommonGroup v-model="currentOperatingCanvasChild"></operateItemCommonGroup>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="5">
            <AccordionTrigger>
                <div class="title">滤镜效果</div>
            </AccordionTrigger>
            <AccordionContent>
            <operateItemFilterGroup v-model="currentOperatingCanvasChild.filter"></operateItemFilterGroup>
            </AccordionContent>
        </AccordionItem>
        <operateItemBuiltInBackground v-model="currentOperatingCanvasChild.customBackground">
        </operateItemBuiltInBackground>

        <operateItemClipPath v-model="currentOperatingCanvasChild.clipPath"></operateItemClipPath>
    </Accordion>
</template>
    
<script setup lang='ts'>
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

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
import operateItemBuiltInBackground from '@/components/design/layout/canvas/operate/builtInBackground/index.vue';
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


const backgroundCollapseActives = ref(["1", "2", "3", "4", '5'])


</script>
    
<style></style>