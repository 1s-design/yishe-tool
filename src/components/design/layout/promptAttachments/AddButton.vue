<template>
  <button
    type="button"
    class="add-to-prompt"
    :class="{ 'add-to-prompt--added': isAdded }"
    :title="isAdded ? '点击移出提示词' : '加入提示词'"
    @click.stop.prevent="handleToggle"
  >
    <Check v-if="isAdded" class="h-3 w-3" />
    <Plus v-else class="h-3 w-3" />
    <span v-if="showLabel">{{ isAdded ? '已添加' : '加入提示词' }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Check } from 'lucide-vue-next'
import { usePromptAttachments } from '@/composables/usePromptAttachments'
import type { DesignResourceRef } from '@/ai/resource-refs'

const props = withDefaults(
  defineProps<{
    refItem: DesignResourceRef
    showLabel?: boolean
  }>(),
  { showLabel: false },
)

const { has, toggle } = usePromptAttachments()
const isAdded = computed(() => has(props.refItem.type, props.refItem.id))

function handleToggle() {
  toggle(props.refItem)
}
</script>

<style scoped>
.add-to-prompt {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: 11px;
  line-height: 1;
  border: 1px solid var(--1s-border-color);
  border-radius: 5px;
  background: var(--1s-control-surface-muted);
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.add-to-prompt:hover {
  border-color: var(--1s-accent-color);
  color: var(--1s-accent-color);
}

.add-to-prompt--added {
  border-color: var(--1s-accent-color);
  background: var(--1s-accent-color);
  color: #fff;
}
</style>
