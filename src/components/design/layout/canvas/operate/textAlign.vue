<template>
    <operate-form-item>
        <template #icon> <icon-text-align></icon-text-align> </template>
        <template #name> 文字对齐 </template>
        <template #content>
            <Select v-model="model">
                <SelectTrigger class="operate-compact-select h-6 text-[11px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="item in textAlignOptions" :key="item.value" :value="item.value">
                        <span> {{ item.label }} </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </template>
    </operate-form-item>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import iconTextAlign from "@/components/design/assets/icon/text-align.svg?component";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
const model = defineModel({ default: 'left' })

const textAlignOptions = ref([
    {
        label: '左对齐',
        value: 'left'
    },
    {
        label: '居中对齐',
        value: 'center'
    },
    {
        label: '右对齐',
        value: 'right'
    },
    {
        label: '两端对齐',
        value: 'justify'
    }
])

</script> 
    
<style scoped>
.operate-compact-select {
  width: min(180px, 100%);
}
</style>
