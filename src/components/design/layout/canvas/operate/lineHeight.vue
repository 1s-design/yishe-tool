<template>
    <operate-form-item>
        <template #icon> <icon-line-height></icon-line-height> </template>
        <template #name> 行高 </template>
        <template #content>
           <Tooltip>
            <TooltipTrigger as-child>
              <Input
                type="number"
                v-model="model"
                class="w-[64px] h-6 text-[11px]"
                min="0"
                max="5"
                step=".1"
              />
            </TooltipTrigger>
            <TooltipContent side="top">文字的行高相对于字号</TooltipContent>
           </Tooltip>
        </template>
    </operate-form-item>
</template>

<script setup lang='ts'>
import iconLineHeight from "@/components/design/assets/icon/line-height.svg?component";
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
const model = defineModel({})
</script>

<style></style>
