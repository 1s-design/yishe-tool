<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> {{ label }} </template>
    <template #content>
      <Tooltip :disabled="!tooltip">
        <TooltipTrigger as-child>
          <div>
            <color-picker v-model="model" v-bind="$attrs"></color-picker>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{{ tooltip }}</TooltipContent>
      </Tooltip>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/color.svg?component";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

// 通用的颜色操作

const model = defineModel({});

const props = defineProps({
  label: {
    default: "颜色",
  },
  tooltip: {
    default: "",
  },
});
</script>

<style></style>
