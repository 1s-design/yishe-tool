<template>
  <div v-if="count > 0" class="prompt-tray">
    <div class="prompt-tray__header">
      <div class="prompt-tray__title">
        <Sparkles class="h-3.5 w-3.5 text-[var(--1s-accent-color)]" />
        <span>已关联创作资源 ({{ count }})</span>
        <span class="prompt-tray__hint">可拖拽排序，点击预览内容</span>
      </div>
      <button
        type="button"
        class="prompt-tray__clear"
        title="清空全部关联资源"
        @click="clear"
      >
        清空全部
      </button>
    </div>

    <!-- 拖拽排序 Chips 列表 -->
    <div class="prompt-tray__chips" @dragover.prevent>
      <div
        v-for="(item, index) in refs"
        :key="`${item.type}-${item.id}`"
        class="prompt-tray__chip"
        :class="{
          'prompt-tray__chip--dragging': draggingIndex === index,
          'prompt-tray__chip--drag-over': dragOverIndex === index && draggingIndex !== index,
        }"
        draggable="true"
        @dragstart="handleDragStart($event, index)"
        @dragenter.prevent="dragOverIndex = index"
        @dragover.prevent
        @drop.prevent="handleDrop(index)"
        @dragend="handleDragEnd"
        @click="openPreview(item)"
      >
        <!-- 拖拽手柄 -->
        <GripVertical class="prompt-tray__grip h-3 w-3" />

        <!-- 资源类型徽标 -->
        <span
          class="prompt-tray__chip-type"
          :class="`prompt-tray__chip-type--${item.type}`"
        >
          {{ typeLabel(item.type) }}
        </span>

        <!-- 资源名称 -->
        <span class="prompt-tray__chip-label" :title="item.label || item.id">
          {{ item.label || item.id }}
        </span>

        <!-- 移除按钮 -->
        <button
          type="button"
          class="prompt-tray__chip-remove"
          title="移出"
          @click.stop="remove(item.type, item.id)"
        >
          <X class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- 资源注入详情预览弹窗 -->
    <Dialog :modal="false" v-model:open="showPreviewModal">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <div class="flex items-center gap-2">
            <span
              v-if="previewItem"
              class="prompt-tray__chip-type"
              :class="`prompt-tray__chip-type--${previewItem.type}`"
            >
              {{ typeLabel(previewItem.type) }}
            </span>
            <DialogTitle class="text-sm font-semibold truncate">
              {{ previewItem?.label || previewItem?.id }}
            </DialogTitle>
          </div>
          <DialogDescription class="text-xs">
            该资源将在发送时作为设计上下文或属性绑定注入到 AI Agent 中。
          </DialogDescription>
        </DialogHeader>

        <div v-if="previewItem" class="space-y-3 py-2 text-xs">
          <!-- 贴纸/灵感图片预览 -->
          <div
            v-if="previewImageUrl"
            class="flex items-center justify-center p-3 rounded-md bg-[var(--1s-hover-background)] border border-[var(--1s-border-color)] max-h-48 overflow-hidden"
          >
            <img
              :src="previewImageUrl"
              alt="资源预览"
              class="max-h-40 max-w-full object-contain"
            />
          </div>

          <!-- 文案/内容展示 -->
          <div v-if="previewContent" class="space-y-1">
            <span class="text-[var(--1s-text-color-tertiary)] font-medium">注入内容：</span>
            <div class="p-2.5 rounded bg-[var(--1s-hover-background)] border border-[var(--1s-border-color)] text-[var(--1s-text-color)] max-h-40 overflow-y-auto leading-relaxed">
              {{ previewContent }}
            </div>
          </div>

          <!-- 提示词片段 (灵感/Prompt 专属) -->
          <div v-if="previewItem.payload?.promptHints" class="space-y-1">
            <span class="text-[var(--1s-text-color-tertiary)] font-medium">设计提示词片段：</span>
            <div class="p-2.5 rounded bg-[var(--1s-hover-background)] border border-[var(--1s-border-color)] text-[var(--1s-text-color)] font-mono text-[11px]">
              {{ previewItem.payload.promptHints }}
            </div>
          </div>

          <!-- 避让事项 -->
          <div v-if="previewItem.payload?.avoidNotes" class="space-y-1">
            <span class="text-[var(--1s-danger-color,#e5484d)] font-medium">避让约束：</span>
            <div class="p-2 rounded bg-[var(--1s-hover-background)] border border-[var(--1s-border-color)] text-[var(--1s-text-color-secondary)]">
              {{ previewItem.payload.avoidNotes }}
            </div>
          </div>

          <!-- 资源 ID -->
          <div class="text-[11px] text-[var(--1s-text-color-tertiary)] flex items-center justify-between">
            <span>资源标识: {{ previewItem.id }}</span>
            <span v-if="previewItem.asReference" class="text-[var(--1s-accent-color)]">已标记为视觉参考</span>
          </div>
        </div>

        <DialogFooter class="flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            class="text-[var(--1s-danger-color,#e5484d)] hover:bg-[var(--1s-hover-background)]"
            @click="handleRemoveFromPreview"
          >
            移出提示词
          </Button>
          <Button variant="outline" size="sm" @click="showPreviewModal = false">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Sparkles, GripVertical } from 'lucide-vue-next'
import { usePromptAttachments } from '@/composables/usePromptAttachments'
import type { ResourceType, DesignResourceRef } from '@/ai/resource-refs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const { refs, remove, clear, count, move } = usePromptAttachments()

const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const showPreviewModal = ref(false)
const previewItem = ref<DesignResourceRef | null>(null)

const TYPE_LABELS: Record<ResourceType, string> = {
  inspiration: '灵感',
  font: '字体',
  image: '图片',
  sticker: '贴纸',
  sentence: '文案',
  document: '文档',
  tip: '技巧',
  prompt: '提示词',
}

function typeLabel(type: ResourceType) {
  return TYPE_LABELS[type] || type
}

function handleDragStart(e: DragEvent, index: number) {
  draggingIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function handleDrop(targetIndex: number) {
  if (draggingIndex.value !== null && draggingIndex.value !== targetIndex) {
    move(draggingIndex.value, targetIndex)
  }
  handleDragEnd()
}

function handleDragEnd() {
  draggingIndex.value = null
  dragOverIndex.value = null
}

function openPreview(item: DesignResourceRef) {
  previewItem.value = item
  showPreviewModal.value = true
}

function handleRemoveFromPreview() {
  if (previewItem.value) {
    remove(previewItem.value.type, previewItem.value.id)
    showPreviewModal.value = false
  }
}

const previewImageUrl = computed(() => {
  if (!previewItem.value) return ''
  const payload = previewItem.value.payload || {}
  return (
    payload.url ||
    payload.image ||
    payload.thumbnail ||
    payload.images?.[0] ||
    payload.previewUrl ||
    ''
  )
})

const previewContent = computed(() => {
  if (!previewItem.value) return ''
  const payload = previewItem.value.payload || {}
  return (
    payload.content ||
    payload.description ||
    payload.text ||
    payload.summary ||
    ''
  )
})
</script>

<style scoped>
.prompt-tray {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--1s-border-color);
  border-radius: 8px;
  background: var(--1s-surface-background);
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.prompt-tray__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.prompt-tray__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--1s-text-color);
}

.prompt-tray__hint {
  font-size: 10px;
  font-weight: normal;
  color: var(--1s-text-color-tertiary);
  margin-left: 4px;
}

.prompt-tray__chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.prompt-tray__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px 3px 4px;
  font-size: 11px;
  line-height: 1.3;
  border: 1px solid var(--1s-border-color);
  border-radius: 5px;
  background: var(--1s-hover-background);
  max-width: 240px;
  cursor: grab;
  user-select: none;
  transition: all 0.15s ease;
}

.prompt-tray__chip:hover {
  border-color: var(--1s-accent-color);
  background: var(--1s-surface-background);
}

.prompt-tray__chip:active {
  cursor: grabbing;
}

.prompt-tray__chip--dragging {
  opacity: 0.4;
  border-style: dashed;
}

.prompt-tray__chip--drag-over {
  border-color: var(--1s-accent-color);
  transform: scale(1.04);
}

.prompt-tray__grip {
  color: var(--1s-text-color-tertiary);
  opacity: 0.6;
}

.prompt-tray__chip-type {
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
  background: var(--1s-hover-background);
  color: var(--1s-text-color);
}

.prompt-tray__chip-type--inspiration {
  background: #ede9fe;
  color: #6d28d9;
}

.prompt-tray__chip-type--font {
  background: #ccfbf1;
  color: #0f766e;
}

.prompt-tray__chip-type--sticker,
.prompt-tray__chip-type--image {
  background: #fef3c7;
  color: #b45309;
}

.prompt-tray__chip-type--sentence {
  background: #e0f2fe;
  color: #0369a1;
}

.prompt-tray__chip-type--document {
  background: #e0e7ff;
  color: #4338ca;
}

.prompt-tray__chip-type--tip {
  background: #ffe4e6;
  color: #be123c;
}

.prompt-tray__chip-type--prompt {
  background: #f3e8ff;
  color: #7e22ce;
}

:global(.dark) .prompt-tray__chip-type--inspiration {
  background: #3b0764;
  color: #c084fc;
}

:global(.dark) .prompt-tray__chip-type--font {
  background: #042f2e;
  color: #2dd4bf;
}

:global(.dark) .prompt-tray__chip-type--sticker,
:global(.dark) .prompt-tray__chip-type--image {
  background: #451a03;
  color: #fbbf24;
}

:global(.dark) .prompt-tray__chip-type--sentence {
  background: #082f49;
  color: #38bdf8;
}

:global(.dark) .prompt-tray__chip-type--document {
  background: #1e1b4b;
  color: #818cf8;
}

:global(.dark) .prompt-tray__chip-type--tip {
  background: #4c0519;
  color: #fb7185;
}

:global(.dark) .prompt-tray__chip-type--prompt {
  background: #3b0764;
  color: #c084fc;
}

.prompt-tray__chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--1s-text-color);
}

.prompt-tray__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.prompt-tray__chip-remove:hover {
  background: var(--1s-danger-color, #e5484d);
  color: #fff;
}

.prompt-tray__clear {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  font-size: 10px;
  border: 1px solid var(--1s-border-color);
  border-radius: 4px;
  background: transparent;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.prompt-tray__clear:hover {
  border-color: var(--1s-danger-color, #e5484d);
  color: var(--1s-danger-color, #e5484d);
  background: var(--1s-hover-background);
}
</style>
