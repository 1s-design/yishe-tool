<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 宽高比 </template>
        <template #content>
            <Select :model-value="model" @update:model-value="v => { model = v; $emit('change', model) }">
                <SelectTrigger class="w-[120px] h-6 text-[11px]">
                    <SelectValue placeholder="设置当前宽高比" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="item in aspectRatioOptions" :key="item.label" :value="String(item.value)">{{ item.label }}</SelectItem>
                </SelectContent>
            </Select>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/aspect-ratio.svg?component";
import { ref } from 'vue'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const model = defineModel({ default: '' })


const aspectRatioOptions = ref([
    {
        label: '等宽高(1 : 1)',
        value: 1
    },
    {
        label: '16 : 9',
        value: 16 / 9
    },
    {
        label: '黄金比(1.618 : 1)',
        value: 1.618 / 1
    },
    {
        label: '银比例(1 : √2)',
        value: 1 / Math.sqrt(2)
    },
    {
        label: '4 : 3',
        value: 4 / 3
    },
    {
        label: '16 : 9',
        value: 16 / 9
    },
    {
        label: '国旗 19 / 10',
        value: 19 / 10
    },

])


</script>

<style></style>
