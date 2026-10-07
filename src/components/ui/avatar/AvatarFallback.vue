<template>
  <AvatarFallback
    v-bind="props"
    :class="
      cn(
        'flex h-full w-full items-center justify-center rounded-full bg-[var(--1s-control-surface-muted)] font-[450] text-[11px] text-[var(--1s-text-color-secondary)] select-none',
        $attrs.class ?? ''
      )
    "
  >
    <slot />
  </AvatarFallback>
</template>

<script setup lang="ts">
import { AvatarFallback, type AvatarFallbackProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<AvatarFallbackProps>()
</script>
