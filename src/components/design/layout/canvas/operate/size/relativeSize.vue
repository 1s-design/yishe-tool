<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> {{ label }} </template>
        <template #content>
            <div class="flex items-center gap-1.5">
                <span class="text-[11px] text-muted-foreground">宽</span>
                <Popover>
                    <PopoverTrigger as-child>
                        <div class="flex items-center gap-1" style="width: 80px">
                            <Input class="h-6 text-[11px] min-w-0 flex-1" type="number" v-model.number="width.value" step="10" min="0"
                                placeholder="宽" />
                            <span class="text-[10px] text-muted-foreground">{{ width.unit }}</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent class="w-[160px]">
                        <div class="flex items-end justify-end">
                            <RadioGroup v-model="width.unit" class="flex flex-row flex-wrap items-center gap-3">
                                <label v-for="u, index in unitOptions" :key="index" class="flex flex-row flex-wrap items-center gap-3">
                                    <RadioGroupItem :value="u.value" />
                                    <span class="text-xs">{{ u.label }}</span>
                                </label>
                            </RadioGroup>
                        </div>
                    </PopoverContent>
                </Popover>

                <span class="text-[11px] text-muted-foreground">高</span>

                <Popover>
                    <PopoverTrigger as-child>
                        <div class="flex items-center gap-1" style="width: 80px">
                            <Input class="h-6 text-[11px] min-w-0 flex-1" type="number" v-model.number="height.value" step="10"
                                placeholder="高" min="0" />
                            <span class="text-[10px] text-muted-foreground">{{ height.unit }}</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent class="w-[160px]">
                        <div class="flex items-end justify-end">
                            <RadioGroup v-model="height.unit" class="flex flex-row flex-wrap items-center gap-3">
                                <label v-for="u, index in unitOptions" :key="index" class="flex flex-row flex-wrap items-center gap-3">
                                    <RadioGroupItem :value="u.value" />
                                    <span class="text-xs">{{ u.label }}</span>
                                </label>
                            </RadioGroup>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/size.svg?component";
import { ref, watch, computed } from "vue";
import { canvasStickerOptions ,canvasStickerOptionsOnlyChild} from "@/components/design/layout/canvas/index.tsx";
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'



const props = defineProps({
    label: {
        default: "尺寸",
    },
    unit: {
        default: 'px'
    },
});


const unitOptions = computed(() => {

    let currentUnit = canvasStickerOptionsOnlyChild.value.width.unit

    const options = [
        {
            label: `使用当前画布单位(${currentUnit})`,
            value: currentUnit,
        },
        {
            label: '画布宽度的百分比',
            value: 'vw',
        },
        {
            label: '画布高度的百分比',
            value: 'vh',
        }
    ]

    return options
})


const width: any = defineModel("width", {});
const height: any = defineModel("height", {});


</script>

<style scoped lang="less"></style>
