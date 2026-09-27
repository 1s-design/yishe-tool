<template>
    <Accordion type="multiple" :model-value="rawCanvasCollapseActives" @update:model-value="v => rawCanvasCollapseActives = v as string[]">
        <AccordionItem value="1">
            <AccordionTrigger>基础属性</AccordionTrigger>
            <AccordionContent>
            <operateItemSize label="尺寸" v-model:width="currentOperatingCanvasChild.width"
                v-model:height="currentOperatingCanvasChild.height">
            </operateItemSize>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
            <AccordionTrigger>
                <div class="title">通用属性</div>
            </AccordionTrigger>
            <AccordionContent>
            <operateItemCommonGroup v-model="currentOperatingCanvasChild"></operateItemCommonGroup>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
</template>
    
<script setup lang='ts'>
import { ref } from "vue";

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from '@/components/design/layout/canvas/operate/commonGroup.vue';

import {
    currentOperatingCanvasChild,
} from "../index.tsx";

const rawCanvasCollapseActives = ref(["1", "2", "3", "4", '5']);


</script>
    
<style></style>
