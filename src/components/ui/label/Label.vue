<template>
  <Label
    v-bind="props"
    :class="
      cn(
        'text-[11px] font-[450] leading-none text-[var(--1s-text-color-secondary)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none',
        $attrs.class ?? ''
      )
    "
  >
    <slot />
  </Label>
</template>

<script setup lang="ts">
import { Label, type LabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<LabelProps>()
</script>
