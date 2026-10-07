<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="
      cn(
        'peer h-3.5 w-3.5 shrink-0 rounded-[2px] border border-[var(--1s-control-border-color)] bg-transparent ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--1s-focus-ring-color)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--1s-accent-color)] data-[state=checked]:border-[var(--1s-accent-color)] data-[state=checked]:text-white',
        $attrs.class ?? ''
      )
    "
  >
    <CheckboxIndicator class="flex h-full w-full items-center justify-center text-current">
      <slot>
        <Check class="h-3.5 w-3.5" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

<script setup lang="ts">
import {
  CheckboxIndicator,
  CheckboxRoot,
  type CheckboxRootEmits,
  type CheckboxRootProps,
  useForwardPropsEmits,
} from 'radix-vue'
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<CheckboxRootProps>()
const emits = defineEmits<CheckboxRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>
