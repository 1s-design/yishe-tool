<template>
    <operate-form-item>
        <template #icon> 适 </template>
        <template #name> 图片适应 </template>
        <template #content>
            <Select v-model="model">
                <SelectTrigger class="operate-compact-select h-6 text-[11px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="item in objectFitOptions" :key="item.value" :value="item.value">
                        <span> {{ item.label }} </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </template>
    </operate-form-item>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import icon from "@/components/design/assets/icon/writing-mode.svg?component";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
const model = defineModel({})

const objectFitOptions = ref([
    {
        label: '使用图片原始大小',
        value: 'none'
    },
    {
        label: '保持尺寸比例填充,可能会丢失内容',
        value: 'fill'
    },
    {
        label: '内容拉伸填充',
        value: 'cover'
    },
    {
        label: '保持原有尺寸比例',
        value: 'contain'
    },
])

</script>

<style scoped>
.operate-compact-select {
  width: min(160px, 100%);
}
</style>
