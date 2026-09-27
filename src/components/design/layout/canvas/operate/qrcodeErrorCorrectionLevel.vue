<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 纠错等级 </template>
        <template #content>
            <Tooltip>
                <TooltipTrigger as-child>
                    <div style="width:120px">
                        <Select v-model="model">
                            <SelectTrigger class="h-6 text-[11px]">
                                <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="item in errorCorrectionLevelOptions" :key="item.value" :value="item.value">
                                    <span class="text-xs">{{ item.label }}</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">纠错等级越高，二维码在损坏的情况下扫描成功率越高</TooltipContent>
            </Tooltip>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import icon from "@/components/design/assets/icon/error-level.svg?component";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const model = defineModel({})

const errorCorrectionLevelOptions = reactive([
    {
        value: 'L',
        label: "L(低)",
    },
    {
        value: "M",
        label: "M(中)",
    },
    {
        value: "Q",
        label: "Q(较高)",
    },
    {
        value: "H",
        label: "H(高)",
    }
]);

</script>

<style></style>
