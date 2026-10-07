<template>
  <TabsTrigger
    v-bind="props"
    :class="
      cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-[4px] px-2.5 py-0.5 text-[11px] font-[450] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--1s-focus-ring-color)] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--1s-surface-background)] data-[state=active]:text-[var(--1s-text-color)] data-[state=active]:font-[550] select-none',
        $attrs.class ?? ''
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>

<script setup lang="ts">
import { TabsTrigger, type TabsTriggerProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<TabsTriggerProps>()
</script>
