<template>
  <div class="resource-list-shell">
    <!-- 统一顶部工具条 -->
    <header class="resource-list-shell__toolbar">
      <div class="resource-list-shell__toolbar-left">
        <slot name="tabs"></slot>
        <slot name="toolbar-left"></slot>
      </div>

      <div class="resource-list-shell__toolbar-right">
        <slot name="toolbar-right"></slot>
      </div>
    </header>

    <!-- 列表内容区 -->
    <main class="resource-list-shell__content" :aria-busy="loading">
      <!-- 卡片网格 -->
      <div
        v-if="itemCount > 0"
        class="resource-list-shell__grid"
        :class="gridClass"
      >
        <slot></slot>
      </div>

      <!-- 统一空状态 -->
      <div
        v-else-if="!loading"
        class="resource-list-shell__empty"
      >
        <slot name="empty">
          <div class="resource-list-shell__empty-card">
            <div class="resource-list-shell__empty-icon">
              <component :is="emptyIcon || Sparkles" class="h-8 w-8" />
            </div>
            <h3 class="resource-list-shell__empty-title">
              {{ emptyTitle || '暂无相关资源' }}
            </h3>
            <p v-if="emptyDescription" class="resource-list-shell__empty-desc">
              {{ emptyDescription }}
            </p>
            <Button
              v-if="emptyActionLabel"
              variant="default"
              size="sm"
              class="resource-list-shell__empty-btn"
              @click="$emit('empty-action')"
            >
              {{ emptyActionLabel }}
            </Button>
          </div>
        </slot>
      </div>

      <!-- 加载遮罩 -->
      <transition name="fade">
        <div v-if="loading" class="resource-list-shell__loading-overlay">
          <div class="resource-list-shell__loading-spinner">
            <Loader2 class="h-6 w-6 animate-spin text-[var(--1s-accent-color)]" />
            <span class="text-xs text-[var(--1s-text-color-secondary)]">正在加载资源...</span>
          </div>
        </div>
      </transition>
    </main>

    <!-- 浮动批量操作条 (多选时触发) -->
    <transition name="slide-up">
      <div v-if="selectedCount > 0" class="resource-list-shell__batch-bar">
        <div class="resource-list-shell__batch-info">
          <span class="font-medium text-[var(--1s-text-color)]">已选 {{ selectedCount }} 项</span>
          <button
            type="button"
            class="text-xs text-[var(--1s-text-color-tertiary)] hover:text-[var(--1s-text-color)] underline"
            @click="$emit('batch-clear')"
          >
            取消选择
          </button>
        </div>
        <div class="resource-list-shell__batch-actions">
          <slot name="batch-actions"></slot>
        </div>
      </div>
    </transition>

    <!-- 统一底部分页 -->
    <footer v-if="total !== undefined && total > 0" class="resource-list-shell__footer">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        @update:current-page="(page) => $emit('update:currentPage', page)"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Sparkles, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Pagination from './pagination.vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    total?: number
    currentPage?: number
    pageSize?: number
    itemCount?: number
    emptyTitle?: string
    emptyDescription?: string
    emptyIcon?: Component
    emptyActionLabel?: string
    selectedCount?: number
    gridClass?: string
  }>(),
  {
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 20,
    itemCount: 0,
    emptyTitle: '暂无资源',
    emptyDescription: '',
    emptyIcon: undefined,
    emptyActionLabel: '',
    selectedCount: 0,
    gridClass: '',
  },
)

defineEmits<{
  'update:currentPage': [page: number]
  'empty-action': []
  'batch-clear': []
}>()

const totalPages = computed(() => {
  if (!props.pageSize || props.pageSize <= 0) return 1
  return Math.ceil(props.total / props.pageSize) || 1
})
</script>

<style scoped>
.resource-list-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100%;
  position: relative;
  background: var(--1s-panel-background);
  color: var(--1s-text-color);
}

.resource-list-shell__toolbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
  backdrop-filter: blur(8px);
}

.resource-list-shell__toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.resource-list-shell__toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  flex-shrink: 0;
}

.resource-list-shell__caption {
  font-size: 11px;
  font-weight: 500;
  color: var(--1s-text-color-tertiary);
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--1s-hover-background);
}

.resource-list-shell__content {
  position: relative;
  flex: 1;
  min-height: 280px;
  padding: 18px 20px 24px;
  overflow-y: auto;
}

.resource-list-shell__grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 14px;
  width: 100%;
}

@media (min-width: 640px) {
  .resource-list-shell__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .resource-list-shell__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .resource-list-shell__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .resource-list-shell__grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (min-width: 1536px) {
  .resource-list-shell__grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

.resource-list-shell__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  height: 100%;
  padding: 40px 20px;
}

.resource-list-shell__empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 380px;
}

.resource-list-shell__empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--1s-hover-background);
  color: var(--1s-accent-color);
  margin-bottom: 14px;
}

.resource-list-shell__empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--1s-text-color);
  margin-bottom: 6px;
}

.resource-list-shell__empty-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--1s-text-color-secondary);
  margin-bottom: 16px;
}

.resource-list-shell__empty-btn {
  margin-top: 4px;
}

.resource-list-shell__loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--1s-panel-background) 72%, transparent);
  backdrop-filter: blur(2px);
}

.resource-list-shell__loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  border-radius: 10px;
  background: var(--1s-surface-background);
  border: 1px solid var(--1s-border-color);
  box-shadow: var(--1s-shadow-float);
}

.resource-list-shell__batch-bar {
  position: sticky;
  bottom: 50px;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 20px;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--1s-surface-background);
  border: 1px solid var(--1s-accent-color);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.resource-list-shell__batch-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.resource-list-shell__batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-list-shell__footer {
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 4px 12px;
  border-top: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>
