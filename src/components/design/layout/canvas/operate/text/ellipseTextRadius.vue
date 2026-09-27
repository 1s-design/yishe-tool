<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 圆形文字半径 </template>
        <template #content>
            <Popover>
                <PopoverTrigger as-child>
                    <div class="flex items-center gap-1">
                        <span class="text-[11px] text-muted-foreground">X</span>
                        <div class="flex items-center gap-1" style="width:72px">
                            <Input type="number" v-model="horizontalRadius.value" class="h-6 min-w-0 flex-1 text-[11px]" min="0" step="1" />
                            <div class="text-[10px] text-muted-foreground"> {{ horizontalRadius.unit }}</div>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent align="end" class="w-auto p-3">
                    <div class="flex items-center justify-end">
                        <RadioGroup v-model="horizontalRadius.unit" class="flex flex-row flex-wrap items-center gap-3">
                            <label v-for="u in unitOptions" :key="u.value" class="flex items-center gap-1.5">
                                <RadioGroupItem :value="u.value" />
                                <span class="text-xs">{{ u.label }}</span>
                            </label>
                        </RadioGroup>
                    </div>
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger as-child>
                    <div class="flex items-center gap-1">
                        <span class="text-[11px] text-muted-foreground">Y</span>
                        <div class="flex items-center gap-1" style="width:72px">
                            <Input type="number" v-model="verticalRadius.value" class="h-6 min-w-0 flex-1 text-[11px]" min="0" step="1" />
                            <div class="text-[10px] text-muted-foreground"> {{ verticalRadius.unit }}</div>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent align="end" class="w-auto p-3">
                    <div class="flex items-center justify-end">
                        <RadioGroup v-model="verticalRadius.unit" class="flex flex-row flex-wrap items-center gap-3">
                            <label v-for="u in unitOptions" :key="u.value" class="flex items-center gap-1.5">
                                <RadioGroupItem :value="u.value" />
                                <span class="text-xs">{{ u.label }}</span>
                            </label>
                        </RadioGroup>
                    </div>
                </PopoverContent>
            </Popover>
        </template>
    </operate-form-item>
</template>

<script setup lang="tsx">
import icon from "@/components/design/assets/icon/round-text-radius.svg?component";
import { ref, computed } from 'vue'
import { canvasStickerOptions,canvasStickerOptionsOnlyChild } from '@/components/design/layout/canvas/index.tsx'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const props = defineProps({
    tooltip: {
        default: ''
    },
})

const horizontalRadius = defineModel('horizontal', {})
const verticalRadius = defineModel('vertical', {})

const unitOptions = computed(() => {
    return [{
        label: `使用当前画布单位(${canvasStickerOptionsOnlyChild.value.width.unit})`,
        value: canvasStickerOptionsOnlyChild.value.width.unit,
    }, {
        label: '画布宽度百分比',
        value: 'vw',
    }, {
        label: '画布高度度百分比',
        value: 'vh',
    }]
})

</script>
  
<style></style>
