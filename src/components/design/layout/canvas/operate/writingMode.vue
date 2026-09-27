<template>
    <operate-form-item>
        <template #icon> <icon-writing-mode></icon-writing-mode> </template>
        <template #name> 排列方式 </template>
        <template #content>
            <Tooltip>
                <TooltipTrigger as-child>
                    <div>
                        <Select :model-value="model as any" @update:model-value="v => (model = v)">
                            <SelectTrigger class="operate-compact-select h-6 text-[11px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="item in writingModeOptions" :key="item.value" :value="item.value">
                                    <span> {{ item.label }} </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">英文和数字显示方向会有影响</TooltipContent>
            </Tooltip>
        </template>
    </operate-form-item>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import iconWritingMode from "@/components/design/assets/icon/writing-mode.svg?component";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
const model = defineModel({})

const writingModeOptions = ref([
    {
        label: '水平排列从上到下',
        value: 'htb'
    },
    {
        label: '垂直排列从左到右',
        value: 'vlr'
    },
    {
        label: '垂直排列从右到左',
        value: 'vrl'
    }
])

</script> 
    
<style scoped>
.operate-compact-select {
  width: min(180px, 100%);
}
</style>
