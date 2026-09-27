<template>
    <operate-form-item>
        <template #icon> <icon></icon> </template>
        <template #name> 边框尺寸 </template>
        <template #content>
            <Popover>
                <PopoverTrigger as-child>
                    <div class="relative w-[72px]">
                        <Input type="number" v-model="model.value" class="h-6 pr-8 text-[11px]" min="0" step="1" />
                        <div class="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground"> {{ model.unit }} </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent class="w-[180px]">
                    <div class="flex items-center justify-end">
                        <div class="w-full">
                            <RadioGroup v-model="model.unit" class="grid gap-1">
                                <label v-for="u in unitOptions" :key="u.value" class="flex items-center gap-2 cursor-pointer">
                                    <RadioGroupItem :value="u.value" />
                                    <span class="text-xs">{{ u.label }}</span>
                                </label>
                            </RadioGroup>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/border-width.svg?component";
import { ref ,computed} from 'vue'
import { canvasStickerOptions,canvasStickerOptionsOnlyChild } from "@/components/design/layout/canvas/index.tsx";
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const props = defineProps({
    tooltip: {
        default: ''
    },
})

const unitOptions = computed(() => {
    return [
        {
            label: `使用当前画布单位(${canvasStickerOptionsOnlyChild.value.width.unit})`,
            value: canvasStickerOptionsOnlyChild.value.width.unit,
        },
        {
            label: "相对于画布宽的百分比",
            value: "vw",
        },
        {
            label: "相对于画布高的百分比",
            value: "vh",
        },
        {
            label: "相对于当前元素宽的百分比",
            value: "%w",
        },
        {
            label: "相对于当前元素高的百分比",
            value: "%h",
        },
    ]
});


const model = defineModel({})

</script>

<style></style>
