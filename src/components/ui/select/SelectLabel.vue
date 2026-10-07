<template>
  <SelectLabel
    :class="cn('px-2 py-1 text-[10px] font-[550] text-[var(--1s-menu-text-secondary)]', $attrs.class ?? '')"
  >
    <slot />
  </SelectLabel>
</template>

<script setup lang="ts">
import { SelectLabel, type SelectLabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

defineProps<SelectLabelProps>()
</script>
