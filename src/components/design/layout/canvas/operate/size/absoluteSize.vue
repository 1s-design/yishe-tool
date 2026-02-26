<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> {{ label }} </template>
        <template #content>
            <div class="size-inputs-wrapper">
                <div class="input-group">
                    <span class="label-text">宽</span>
                    <el-input class="size-input" size="small" v-model.number="width.value" step="10" placeholder="宽" type="number">
                        <template #suffix>
                            <span class="unit-text">{{ canvasStickerOptions.unit }}</span>
                        </template>
                    </el-input>
                </div>
                
                <div class="input-group" style="margin-left: 12px;">
                    <span class="label-text">高</span>
                    <el-input class="size-input" size="small" v-model.number="height.value" step="10" placeholder="高" type="number">
                        <template #suffix>
                            <span class="unit-text">{{ canvasStickerOptions.unit }}</span>
                        </template>
                    </el-input>
                </div>
            </div>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/size.svg?component";
import { canvasStickerOptions } from '@/components/design/layout/canvas/index.tsx'

const props = defineProps({
    label: {
        default: "尺寸",
    }
});

const width = defineModel<any>("width", { default: { value: 0 } });
const height = defineModel<any>("height", { default: { value: 0 } });
</script>

<style scoped lang="less">
.size-inputs-wrapper {
    display: flex;
    align-items: center;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .label-text {
        font-size: 12px;
        color: #999;
    }
}

.size-input {
    width: 90px;
}

.unit-text {
    font-size: 10px;
    color: #ccc;
}
</style>


