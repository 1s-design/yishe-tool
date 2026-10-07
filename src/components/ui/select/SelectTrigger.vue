<template>
  <SelectTrigger
    v-bind="forwarded"
    :class="
      cn(
        'flex h-6 w-full items-center justify-between rounded-[5px] border border-transparent bg-[var(--1s-control-surface-muted)] px-2 py-1 text-[11px] font-[450] text-[var(--1s-text-color)] ring-offset-background placeholder:text-[var(--1s-text-color-tertiary)] hover:bg-[var(--1s-surface-background)] hover:border-[var(--1s-border-color)] focus:outline-none focus:bg-[var(--1s-surface-background)] focus:border-[var(--1s-accent-color)] focus:ring-2 focus:ring-[var(--1s-focus-ring-color)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 select-none',
        $attrs.class ?? ''
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="h-3 w-3 opacity-50 ml-1 shrink-0" />
    </SelectIcon>
  </SelectTrigger>
</template>

<script setup lang="ts">
import {
  SelectIcon,
  SelectTrigger,
  type SelectTriggerProps,
  useForwardProps,
} from 'radix-vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<SelectTriggerProps>()
const forwarded = useForwardProps(props)
</script>
