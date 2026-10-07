<template>
        <section class="operate-section">
            <h4 class="operate-section__title">基础属性</h4>
            
            <operateItemSize label="尺寸" v-model:width="currentOperatingCanvasChild.width"
                v-model:height="currentOperatingCanvasChild.height">
            </operateItemSize>
            
        </section>
        <section class="operate-section">
            <h4 class="operate-section__title">
                <div class="title">通用属性</div>
            </h4>
            
            <operateItemCommonGroup v-model="currentOperatingCanvasChild"></operateItemCommonGroup>
            
        </section>
    
</template>
    
<script setup lang='ts'>
import { ref } from "vue";


import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from '@/components/design/layout/canvas/operate/commonGroup.vue';

import {
    currentOperatingCanvasChild,
} from "../index.tsx";



</script>
    
<style></style>
