<template>
  <DialogTitle
    v-bind="props"
    :class="cn('text-[13px] font-[550] leading-none tracking-tight text-[var(--1s-text-color)]', $attrs.class ?? '')"
  >
    <slot />
  </DialogTitle>
</template>

<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<DialogTitleProps>()
</script>
