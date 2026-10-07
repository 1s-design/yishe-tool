<template>
  <h3
    :class="
      cn('text-[13px] font-[550] leading-none tracking-tight text-[var(--1s-text-color)]', $attrs.class ?? '')
    "
  >
    <slot />
  </h3>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>
