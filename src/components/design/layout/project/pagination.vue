<template>
  <div class="pagination">
    <button
      class="pagination__btn"
      :disabled="currentPage <= 1"
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      <ChevronLeft class="h-3 w-3" />
    </button>
    
    <template v-for="page in visiblePages" :key="page">
      <button
        v-if="page !== '...'"
        class="pagination__page"
        :class="{ 'pagination__page--active': page === currentPage }"
        @click="$emit('update:currentPage', page)"
      >
        {{ page }}
      </button>
      <span v-else class="pagination__ellipsis">...</span>
    </template>
    
    <button
      class="pagination__btn"
      :disabled="currentPage >= totalPages"
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      <ChevronRight class="h-3 w-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

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
  gap: 2px;
  padding: 8px 16px;
}

.pagination__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: background 0.15s;
}

.pagination__btn:hover:not(:disabled) {
  background: var(--1s-hover-background);
  color: var(--1s-text-color);
}

.pagination__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination__page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: none;
  background: transparent;
  color: var(--1s-text-color-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s;
}

.pagination__page:hover {
  background: var(--1s-hover-background);
  color: var(--1s-text-color);
}

.pagination__page--active {
  background: var(--1s-accent-color);
  color: white;
  font-weight: 500;
}

.pagination__ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  color: var(--1s-text-color-tertiary);
  font-size: 11px;
}
</style>
