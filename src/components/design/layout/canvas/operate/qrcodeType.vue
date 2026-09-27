<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 二维码点类型 </template>
        <template #content>
            <Tooltip>
                <TooltipTrigger as-child>
                    <div style="width:120px">
                        <Select v-model="model">
                            <SelectTrigger class="h-6 text-[11px]">
                                <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="item in qrcodeTypeOptions" :key="item.value" :value="item.value">
                                    <span class="text-xs">{{ item.label }}</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">二维码类型</TooltipContent>
            </Tooltip>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import icon from "@/components/design/assets/icon/qrcode-type.svg?component";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const model = defineModel({})

const qrcodeTypeOptions = reactive([
    {
        value: "square",
        label: "方块形（常规类型）",
        displayLabel:'21312'
    },
    {
        value: "dots",
        label: "圆点类型",
    },
    {
        value: 'rounded',
        label: "圆角类型",
    },
    {
        value: 'extra-rounded',
        label: "圆角类型(圆角更大)",
    },

    {
        value: "classy",
        label: "大圆角",
    },
    {
        value: "classy-rounded",
        label: "更大的圆角",
    }
]);

</script>

<style></style>
