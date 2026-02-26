<template>
    <operate-form-item>
        <template #icon>
            <Setting />
        </template>
        <template #name> 常用尺寸比例 </template>
        <template #content>
            <el-select 
                v-model="selectedValue" 
                placeholder="选择常用尺寸比例" 
                @change="handleSelect" 
                style="width:160px;"
                size="small"
            >
                <el-option-group v-for="group in sizeGroups" :key="group.label" :label="group.label">
                    <el-option 
                        v-for="item in group.options" 
                        :key="item.label" 
                        :value="item" 
                        :label="item.label"
                    >
                        <div class="flex items-center justify-between">
                            <span>{{ item.label }}</span>
                            <span style="color: #999; font-size: 0.8em; margin-left: 8px;">{{ item.width }}x{{ item.height }}{{ item.unit ? item.unit : 'px' }}</span>
                        </div>
                    </el-option>
                </el-option-group>
            </el-select>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Setting } from "@element-plus/icons-vue";
import operateFormItem from "../operateFormItem.vue";

const emit = defineEmits(['select']);

const selectedValue = ref('');

interface SizeOption {
    label: string;
    width: number;
    height: number;
    unit?: string;
    ratio?: number;
    description?: string;
}

interface SizeGroup {
    label: string;
    options: SizeOption[];
}

const sizeGroups: SizeGroup[] = [
    {
        label: '通用比例',
        options: [
            { label: '正方形 (1:1)', width: 1000, height: 1000, ratio: 1 },
            { label: '高清视频 (16:9)', width: 1920, height: 1080, ratio: 16/9 },
            { label: '传统电视 (4:3)', width: 1024, height: 768, ratio: 4/3 },
            { label: '移动端全屏 (9:16)', width: 1080, height: 1920, ratio: 9/16 },
        ]
    },
    {
        label: '服饰类 (POD)',
        options: [
            { label: 'T恤印花 (12x16")', width: 3600, height: 4800, unit: 'px', description: '300 DPI' },
            { label: '连帽衫正面 (12x16")', width: 3600, height: 4800, unit: 'px', description: '300 DPI' },
            { label: '卫衣背面 (12x16")', width: 3600, height: 4800, unit: 'px', description: '300 DPI' },
            { label: '大尺寸印花 (16x20")', width: 4800, height: 6000, unit: 'px', description: '300 DPI' },
        ]
    },
    {
        label: '杯具 & 配饰 (POD)',
        options: [
            { label: '马克杯 11oz (全幅)', width: 2700, height: 1050, unit: 'px', description: '9x3.5" @ 300 DPI' },
            { label: '马克杯 15oz (全幅)', width: 2700, height: 1140, unit: 'px', description: '9x3.8" @ 300 DPI' },
            { label: '手机壳 (通用)', width: 1200, height: 2400, unit: 'px', description: '约 300 DPI' },
            { label: '帆布包 (14x14")', width: 4200, height: 4200, unit: 'px', description: '300 DPI' },
        ]
    },
    {
        label: '墙画 & 装饰 (POD)',
        options: [
            { label: '海报/装饰画 (18x24")', width: 5400, height: 7200, unit: 'px', description: '300 DPI' },
            { label: '海报/装饰画 (24x36")', width: 7200, height: 10800, unit: 'px', description: '300 DPI' },
            { label: '正方形画布 (12x12")', width: 3600, height: 3600, unit: 'px', description: '300 DPI' },
            { label: '明信片 (6x4")', width: 1800, height: 1200, unit: 'px', description: '300 DPI' },
        ]
    },
    {
        label: '社交媒体',
        options: [
            { label: '微信公众号封面', width: 900, height: 383, ratio: 2.35/1 },
            { label: '小红书正方形', width: 1242, height: 1242, ratio: 1/1 },
            { label: '小红书长图', width: 1242, height: 1656, ratio: 3/4 },
            { label: '抖音/视频号', width: 1080, height: 1920, ratio: 9/16 },
        ]
    }
];

function handleSelect(item: SizeOption) {
    emit('select', {
        width: item.width,
        height: item.height
    });
    // 重置选择器文字
    selectedValue.value = '';
}
</script>

<style scoped>
.flex {
    display: flex;
}
.items-center {
    align-items: center;
}
.justify-between {
    justify-content: space-between;
}
</style>
