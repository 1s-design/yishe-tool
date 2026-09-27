<template>
  <div class="json-node" :style="{ paddingLeft: depth * 16 + 'px' }">
    <div
      v-if="isExpandable"
      class="json-node__expandable"
      @click.stop="emit('toggle', path)"
    >
      <span class="json-node__arrow" :class="{ 'json-node__arrow--expanded': expanded }">
        <ChevronRight />
      </span>
      <span class="json-node__key" :class="{ 'json-node__key--root': depth === 0 }">{{ displayKey }}</span>
      <span class="json-node__bracket">{{ isArray ? '[' : '{' }}</span>
      <span v-if="!expanded" class="json-node__summary">{{ collapsedSummary }}</span>
      <span v-if="!expanded" class="json-node__bracket">{{ isArray ? ']' : '}' }}</span>
      <span v-if="depth === 0 && data.children" class="json-node__count">{{ data.children.length }} 个元素</span>
    </div>

    <template v-if="isExpandable && expanded">
      <template v-for="(entry, index) in entries" :key="entry.key">
        <!-- Object / Array child -->
        <template v-if="isExpandableEntry(entry.value)">
          <json-node
            :data="entry.value"
            :depth="depth + 1"
            :path="path + '.' + entry.key"
            :expanded-paths="expandedPaths"
            :parent-key="entry.key"
            @toggle="(p) => emit('toggle', p)"
          />
        </template>
        <!-- Primitive child -->
        <div
          v-else
          class="json-node__leaf"
          :style="{ paddingLeft: (depth + 1) * 16 + 'px' }"
        >
          <span class="json-node__key">{{ entry.key }}</span>
          <span class="json-node__colon">:</span>
          <span :class="valueClass(entry.value)">{{ formatValue(entry.value) }}</span>
        </div>
      </template>
      <div class="json-node__close" :style="{ paddingLeft: depth * 16 + 'px' }">
        <span class="json-node__bracket">{{ isArray ? ']' : '}' }}</span>
      </div>
    </template>

    <!-- Non-expandable at top level (shouldn't normally happen) -->
    <div v-if="!isExpandable" class="json-node__leaf" :style="{ paddingLeft: depth * 16 + 'px' }">
      <span class="json-node__key">{{ displayKey }}</span>
      <span class="json-node__colon">:</span>
      <span :class="valueClass(data)">{{ formatValue(data) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

defineOptions({ name: 'JsonNode' })

const props = defineProps<{
  data: any
  depth: number
  path: string
  expandedPaths: Set<string>
  parentKey?: string
}>()

const emit = defineEmits<{
  (e: 'toggle', path: string): void
}>()

const isArray = computed(() => Array.isArray(props.data))
const isExpandable = computed(() => {
  if (props.data === null || props.data === undefined) return false
  if (typeof props.data !== 'object') return false
  return true
})

const expanded = computed(() => props.expandedPaths.has(props.path))

const displayKey = computed(() => {
  if (props.parentKey !== undefined) return props.parentKey
  if (props.depth === 0) return '$'
  return props.path.split('.').pop() || ''
})

const entries = computed(() => {
  if (!props.data || typeof props.data !== 'object') return []
  return Object.keys(props.data).map(key => ({
    key,
    value: props.data[key]
  }))
})

const collapsedSummary = computed(() => {
  const keys = Object.keys(props.data)
  const count = keys.length
  if (count === 0) return ''
  if (count <= 3) return keys.join(', ')
  return `${keys.slice(0, 3).join(', ')}, ...+${count - 3}`
})

function isExpandableEntry(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value !== 'object') return false
  if (Array.isArray(value)) return value.length > 0
  return Object.keys(value).length > 0
}

function formatValue(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') {
    if (value.length > 50) return `"${value.slice(0, 50)}..."`
    return `"${value}"`
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'function') return '[Function]'
  return String(value)
}

function valueClass(value: any): string {
  if (value === null || value === undefined) return 'json-node__value--null'
  if (typeof value === 'string') return 'json-node__value--string'
  if (typeof value === 'number') return 'json-node__value--number'
  if (typeof value === 'boolean') return 'json-node__value--boolean'
  return 'json-node__value--other'
}
</script>

<style scoped lang="less">
.json-node {
  &__expandable {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 1px 4px;
    border-radius: 3px;
    user-select: none;
    line-height: 1.6;

    &:hover {
      background: var(--1s-hover-background);
    }
  }

  &__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    font-size: 10px;
    color: var(--1s-text-color-secondary);
    transition: transform 0.15s ease;
    flex-shrink: 0;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__key {
    color: #c678dd;
    font-weight: 500;

    &--root {
      color: var(--1s-text-color-secondary);
      font-weight: 600;
    }
  }

  &__bracket {
    color: var(--1s-text-color-secondary);
    font-weight: 500;
  }

  &__summary {
    color: var(--1s-text-color-secondary);
    font-size: 11px;
    font-style: italic;
  }

  &__count {
    font-size: 11px;
    color: var(--1s-text-color-secondary);
    margin-left: 6px;
    background: var(--1s-hover-background);
    padding: 0 6px;
    border-radius: 3px;
  }

  &__close {
    line-height: 1.6;
    .json-node__bracket {
      color: var(--1s-text-color-secondary);
    }
  }

  &__leaf {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 1px 4px;
    border-radius: 3px;
    line-height: 1.6;
    cursor: default;

    &:hover {
      background: var(--1s-hover-background);
    }
  }

  &__colon {
    color: var(--1s-text-color-secondary);
    margin-right: 4px;
  }

  &__value {
    &--string {
      color: #98c379;
    }
    &--number {
      color: #d19a66;
    }
    &--boolean {
      color: #56b6c2;
    }
    &--null {
      color: var(--1s-text-color-secondary);
      font-style: italic;
    }
    &--other {
      color: var(--1s-text-color);
    }
  }
}
</style>
