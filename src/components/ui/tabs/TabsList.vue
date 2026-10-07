<template>
  <TabsList
    v-bind="props"
    :class="
      cn(
        'inline-flex h-8 items-center justify-center rounded-[5px] bg-[var(--1s-control-surface-muted)] p-0.5 text-[var(--1s-text-color-secondary)] select-none',
        $attrs.class ?? ''
      )
    "
  >
    <slot />
  </TabsList>
</template>

<script setup lang="ts">
import { TabsList, type TabsListProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<TabsListProps>()
</script>
