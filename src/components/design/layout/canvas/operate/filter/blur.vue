<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 模糊效果 </template>
        <template #content>
            <Tooltip>
                <TooltipTrigger as-child>
                    <div class="flex items-center gap-1" style="width:80px">
                        <Input type="number" v-model="model.value" class="h-6 min-w-0 flex-1 text-[11px]" max="999" min="0" step="1" />
                        <div style="font-size:1rem;"> {{ canvasStickerOptions.unit }}</div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">模糊效果</TooltipContent>
            </Tooltip>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/blur.svg?component";
import { canvasStickerOptions } from '@/components/design/layout/canvas/index.tsx'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const props = defineProps({
    tooltip: {
        default: ''
    }
})

const model = defineModel({})

</script>
  
<style></style>
