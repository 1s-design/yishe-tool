<template>
  <div
    :class="
      cn(
        'rounded-[var(--1s-radius-large)] border border-[var(--1s-border-color)] bg-[var(--1s-surface-background)] text-[var(--1s-text-color)] transition-colors',
        $attrs.class ?? ''
      )
    "
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>
