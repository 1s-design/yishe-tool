<template>
  <textarea
    :value="modelValue"
    :class="
      cn(
        'flex min-h-[60px] w-full rounded-[5px] border border-transparent bg-[var(--1s-control-surface-muted)] px-2 py-1.5 text-[11px] font-[450] text-[var(--1s-text-color)] placeholder:text-[var(--1s-text-color-tertiary)] hover:bg-[var(--1s-surface-background)] hover:border-[var(--1s-border-color)] focus-visible:outline-none focus-visible:bg-[var(--1s-surface-background)] focus-visible:border-[var(--1s-accent-color)] focus-visible:ring-2 focus-visible:ring-[var(--1s-focus-ring-color)] disabled:cursor-not-allowed disabled:opacity-50',
        $attrs.class ?? ''
      )
    "
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: string | number
  class?: HTMLAttributes['class']
}

defineProps<Props>()
defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>
