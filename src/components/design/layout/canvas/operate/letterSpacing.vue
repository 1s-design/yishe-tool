<template>
  <operate-form-item>
    <template #icon> <icon-letter-spacing></icon-letter-spacing> </template>
    <template #name> 文字间距 </template>
    <template #content>
      <Tooltip>
        <TooltipTrigger as-child>
          <Input
            type="number"
            v-model="model"
            class="w-[64px] h-6 text-[11px]"
            min="-1"
            max="10"
            step=".1"
          />
        </TooltipTrigger>
        <TooltipContent side="top">文字间距相对于当前文字大小</TooltipContent>
      </Tooltip>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import iconLetterSpacing from "@/components/design/assets/icon/letter-spacing.svg?component";
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const model = defineModel();
</script>

<style></style>
