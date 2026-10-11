<template>
    <operate-form-item>
        <template #name> 元素层级 </template>
        <template #content>
            <Tooltip>
                <TooltipTrigger as-child>
                    <Input style="width:72px;" type="number" :model-value="model as any" @update:model-value="v => (model = v)" max="999" min="0"
                        step="1"></Input>
                </TooltipTrigger>
                <TooltipContent side="top">控制元素的堆叠顺序,值越大,层级越高</TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" class="shrink-0" @click="setTopZIndex"> 顶层 </Button>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { canvasStickerOptions, currentOperatingCanvasChild, getCanvasTopZIndexChild } from "@/components/design/layout/canvas/index.tsx";
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const props = defineProps({
    tooltip: {
        default: ''
    }
})



// 设置为最顶层的zIndex
function setTopZIndex() {

    let topChild = getCanvasTopZIndexChild()

    let maxZIndex = topChild?.zIndex || 0

    maxZIndex = Number(maxZIndex)

    if (maxZIndex >= (currentOperatingCanvasChild.value.zIndex || 0) && (topChild != currentOperatingCanvasChild.value)) {
        currentOperatingCanvasChild.value.zIndex = maxZIndex + 1
    }
}

const model = defineModel({})

</script>
  
<style></style>
