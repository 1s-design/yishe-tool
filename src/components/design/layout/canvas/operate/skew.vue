<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 元素倾斜 </template>
        <template #content>
            <Tooltip>
                <TooltipTrigger as-child>
                    <div>
                        <Popover>
                            <PopoverTrigger as-child>
                                <Button variant="ghost" size="sm">
                                    <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                                        <span>X: {{ x }}°</span>
                                        <span>Y: {{ y }}°</span>
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-[180px]">
                                <div class="flex items-center gap-3">
                                    <div class="w-1/4"> x轴 </div>
                                    <div class="w-3/4"> <Slider :model-value="[x]" :min="0" :max="360" @update:model-value="v => (x = v[0])" /> </div>
                                    <div class="w-1/4"> y轴 </div>
                                    <div class="w-3/4"> <Slider :model-value="[y]" :min="0" :max="360" @update:model-value="v => (y = v[0])" /> </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">用于调整元素倾斜角度</TooltipContent>
            </Tooltip>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/skew.svg?component";
import { ref } from 'vue'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

const x = defineModel('x', { default: 0 })
const y = defineModel('y', { default: 0 })
</script>

<style></style>
