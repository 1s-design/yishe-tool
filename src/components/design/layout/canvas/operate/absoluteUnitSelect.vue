<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> {{ label }} </template>
        <template #content>
            <Select :model-value="model" @update:model-value="v => { model = v; change(v) }">
                <SelectTrigger class="operate-unit-select h-6 text-[11px]">
                    <SelectValue>{{ model }}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem  v-for="item in absoluteSizeOptions" :key="item.value" :value="item.value">
                        <span> {{ item.label }} </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import { ref, reactive,watch } from 'vue'
import icon from "@/components/design/assets/icon/unit.svg?component";
import { canvasStickerOptions } from '@/components/design/layout/canvas/index.tsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
const props = defineProps({
    label: {
        default: '尺寸单位'
    }
})



const emits = defineEmits(['change'])

/*
    深度遍历更新所有单位
    只更新绝对单位
*/
function change(unit){
    emits('change',unit)
}

const model = defineModel({
})

const absoluteSizeOptions = reactive([
    {
        value: "px",
        label: "px 像素",
    },
    {
        value: "mm",
        label: "mm 毫米",
    },
    {
        value: "cm",
        label: "cm 厘米",
    },
    {
        value: "in",
        label: "in 英寸（1英寸 ～= 2.54厘米）",
    },
]);

</script>

<style scoped>
.operate-unit-select {
  width: min(92px, 100%);
}
</style>
