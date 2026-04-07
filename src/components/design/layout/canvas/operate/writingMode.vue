<template>
    <operate-form-item>
        <template #icon> <icon-writing-mode></icon-writing-mode> </template>
        <template #name> 排列方式 </template>
        <template #content>
            <el-tooltip content="英文和数字显示方向会有影响" :hide-after="0">
                <el-select v-model="model" size="small" class="operate-compact-select">
                <el-option v-for="item in writingModeOptions" :key="item.value" :label="item.label" :value="item.value">
                    <span> {{ item.label }} </span>
                </el-option>
            </el-select>
            </el-tooltip>
        </template>
    </operate-form-item>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import iconWritingMode from "@/components/design/assets/icon/writing-mode.svg?component";
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
