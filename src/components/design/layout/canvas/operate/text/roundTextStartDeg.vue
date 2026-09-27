<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 起始角度 </template>
        <template #content>
            <Tooltip>
                <TooltipTrigger as-child>
                    <Input style="width:90px" v-model="model" class="h-6 text-[11px]" max="360" min="0" step="12" type="number" />
                </TooltipTrigger>
                <TooltipContent side="top">起始角度范围为 0 ～ 360 ，从正上方顺时针计算</TooltipContent>
            </Tooltip>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/degree.svg?component";
import { ref } from 'vue'
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
