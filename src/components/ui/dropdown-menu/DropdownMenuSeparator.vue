<template>
  <DropdownMenuSeparator
    v-bind="props"
    :class="cn('my-1 h-px bg-[var(--1s-menu-border)]', $attrs.class ?? '')"
  />
</template>

<script setup lang="ts">
import { DropdownMenuSeparator, type DropdownMenuSeparatorProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<DropdownMenuSeparatorProps>()
</script>
