<template>
  <div class="pagination">
    <div v-if="total !== undefined" class="pagination__info">
      共 {{ total }} 项
    </div>
    
    <div class="pagination__controls">
      <button
        type="button"
        class="pagination__btn"
        :disabled="currentPage <= 1"
        title="上一页"
        aria-label="上一页"
        @click="$emit('update:currentPage', currentPage - 1)"
      >
        <ChevronLeft class="h-3.5 w-3.5" />
      </button>
      
      <template v-for="(page, idx) in visiblePages" :key="idx">
        <button
          v-if="page !== '...'"
          type="button"
          class="pagination__page"
          :class="{ 'pagination__page--active': page === currentPage }"
          @click="$emit('update:currentPage', Number(page))"
        >
          {{ page }}
        </button>
        <span v-else class="pagination__ellipsis">…</span>
      </template>
      
      <button
        type="button"
        class="pagination__btn"
        :disabled="currentPage >= totalPages"
        title="下一页"
        aria-label="下一页"
        @click="$emit('update:currentPage', currentPage + 1)"
      >
        <ChevronRight class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    total?: number
  }>(),
  {
    total: undefined,
  },
)

defineEmits<{
  'update:currentPage': [page: number]
}>()

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  width: 100%;
}

.pagination__info {
  font-size: 11px;
  color: var(--1s-text-color-secondary);
  white-space: nowrap;
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.pagination__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--1s-border-color);
  border-radius: 6px;
  background: var(--1s-surface-background);
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination__btn:hover:not(:disabled) {
  background: var(--1s-hover-background);
  border-color: var(--1s-text-color-tertiary);
  color: var(--1s-text-color);
}

.pagination__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  border-color: transparent;
}

.pagination__page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--1s-text-color-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination__page:hover {
  background: var(--1s-hover-background);
  color: var(--1s-text-color);
}

.pagination__page--active {
  background: var(--1s-accent-color);
  border-color: var(--1s-accent-color);
  color: #fff;
  font-weight: 600;
}

.pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 26px;
  color: var(--1s-text-color-tertiary);
  font-size: 11px;
  user-select: none;
}
</style>
