<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 元素层级 </template>
        <template #content>
            <Tooltip>
                <TooltipTrigger as-child>
                    <Input style="width:80px;" type="number" :model-value="model as any" @update:model-value="v => (model = v)" class="h-6 text-[11px]" max="999" min="0"
                        step="1"></Input>
                </TooltipTrigger>
                <TooltipContent side="top">控制元素的堆叠顺序,值越大,层级越高</TooltipContent>
            </Tooltip>
            <Button size="sm" @click="setTopZIndex"> 设为最高 </Button>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/z-index.svg?component";
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
