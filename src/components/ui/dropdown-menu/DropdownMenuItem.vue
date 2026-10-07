<template>
  <DropdownMenuItem
    v-bind="forwarded"
    :class="
      cn(
        'relative flex h-6 cursor-pointer select-none items-center rounded-[5px] px-2 text-[11px] font-[450] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-[var(--1s-menu-background-hover)] hover:text-[var(--1s-menu-text)] focus:bg-[var(--1s-menu-background-hover)] focus:text-[var(--1s-menu-text)]',
        $attrs.class ?? ''
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import {
  DropdownMenuItem,
  type DropdownMenuItemEmits,
  type DropdownMenuItemProps,
  useForwardPropsEmits,
} from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<DropdownMenuItemProps>()
const emits = defineEmits<DropdownMenuItemEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>
