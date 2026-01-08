<template>
    <operate-form-item>
        <template #icon> <icon-text-align></icon-text-align> </template>
        <template #name> 文字对齐 </template>
        <template #content>
            <el-select v-model="model" size="small" style="width:180px">
                <el-option v-for="item in textAlignOptions" :key="item.value" :label="item.label" :value="item.value">
                    <span> {{ item.label }} </span>
                </el-option>
            </el-select>
        </template>
    </operate-form-item>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import iconTextAlign from "@/components/design/assets/icon/text-align.svg?component";
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
    
<style></style>

