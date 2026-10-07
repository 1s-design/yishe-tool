<template>
  <input
    v-model="modelValue"
    :class="
      cn(
        'flex h-6 w-full box-border rounded-[5px] border border-transparent bg-[var(--1s-control-surface-muted)] px-2 py-1 text-[11px]/4 font-[450] text-[var(--1s-text-color)] transition-[border-color,box-shadow,background-color] duration-[80ms] ease-[cubic-bezier(0.4,0,0.2,1)] file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-[var(--1s-text-color-tertiary)] hover:bg-[var(--1s-surface-background)] hover:border-[var(--1s-border-color)] focus-visible:outline-none focus-visible:bg-[var(--1s-surface-background)] focus-visible:border-[var(--1s-accent-color)] focus-visible:ring-2 focus-visible:ring-[var(--1s-focus-ring-color)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--1s-control-surface-muted)]',
        $attrs.class ?? ''
      )
    "
  />
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>
