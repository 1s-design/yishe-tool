<template>
  <DropdownMenuLabel
    v-bind="props"
    :class="cn('px-2 py-1 text-[10px] font-[550] text-[var(--1s-menu-text-secondary)]', $attrs.class ?? '')"
  >
    <slot />
  </DropdownMenuLabel>
</template>

<script setup lang="ts">
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<DropdownMenuLabelProps>()
</script>
