<template>
  <SelectItem
    v-bind="forwarded"
    :class="
      cn(
        'relative flex h-6 w-full cursor-pointer select-none items-center rounded-[5px] pl-8 pr-2 text-[11px] font-[450] outline-none focus:bg-[var(--1s-menu-background-hover)] focus:text-[var(--1s-menu-text)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        $attrs.class ?? ''
      )
    "
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Check class="h-3.5 w-3.5 text-[var(--1s-menu-selected-background)]" />
      </SelectItemIndicator>
    </span>

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>

<script setup lang="ts">
import {
  SelectItem,
  SelectItemIndicator,
  type SelectItemProps,
  SelectItemText,
  useForwardProps,
} from 'radix-vue'
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<SelectItemProps>()
const forwarded = useForwardProps(props)
</script>
