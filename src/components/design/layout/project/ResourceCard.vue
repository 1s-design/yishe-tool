<template>
  <div
    class="resource-card"
    :class="[
      `resource-card--${resourceType || 'default'}`,
      {
        'resource-card--clickable': !!onSelect,
        'resource-card--added': isAdded,
      },
    ]"
    @click="handleCardClick"
  >
    <!-- 1. 视觉预览区 (极简风格：无任何 hover 操作浮层，无多余装饰文字) -->
    <!-- A. 贴纸/图片类型：1:1 纯净居中预览 -->
    <div
      v-if="isImageLike"
      class="resource-card__media resource-card__media--sticker"
    >
      <img
        v-if="media"
        :src="media"
        :alt="title"
        loading="lazy"
        class="resource-card__img-contain"
      />
      <div v-else class="resource-card__placeholder">
        <span class="text-xs text-[var(--1s-text-color-tertiary)]">无预览图</span>
      </div>
    </div>

    <!-- B. 字体类型：有图显示图，无图显示字体名称 -->
    <div
      v-else-if="resourceType === 'font'"
      class="resource-card__media resource-card__media--font"
    >
      <img
        v-if="media"
        :src="media"
        :alt="title"
        loading="lazy"
        class="resource-card__img-contain"
      />
      <div v-else class="resource-card__font-preview">
        <span class="resource-card__font-name">{{ title }}</span>
      </div>
    </div>

    <!-- C. 灵感类型：16:10 封面预览 -->
    <div
      v-else-if="resourceType === 'designInspiration'"
      class="resource-card__media resource-card__media--cover"
    >
      <img
        v-if="media"
        :src="media"
        :alt="title"
        loading="lazy"
        class="resource-card__img-cover"
      />
      <div v-else class="resource-card__placeholder">
        <span class="text-xs text-[var(--1s-text-color-tertiary)]">无图片</span>
      </div>
    </div>

    <!-- D. 文案类型：纯净句子排版，不重复堆砌标题与摘要 -->
    <div
      v-else-if="resourceType === 'sentence'"
      class="resource-card__sentence-box"
    >
      <p class="resource-card__sentence-text" :title="sentenceText">
        {{ sentenceText }}
      </p>
    </div>

    <!-- E. 其他有封面图的通用资源 -->
    <div
      v-else-if="media"
      class="resource-card__media"
      :style="aspectRatioStyle"
    >
      <img
        :src="media"
        :alt="title"
        loading="lazy"
        class="resource-card__img-cover"
      />
    </div>

    <!-- 2. 信息内容区 (极简标题与摘要，非文案类型展示) -->
    <div
      v-if="resourceType !== 'sentence'"
      class="resource-card__body"
    >
      <div class="resource-card__title" :title="title">
        {{ title }}
      </div>
      <div
        v-if="cleanSummary"
        class="resource-card__summary"
        :title="cleanSummary"
      >
        {{ cleanSummary }}
      </div>
    </div>

    <!-- 3. 卡片底部：左侧状态/备注，右侧更多操作图标 (点击下拉全部操作) -->
    <div class="resource-card__footer">
      <!-- 卡片左下方：极简已选状态或时间备注 -->
      <div class="resource-card__footer-left">
        <span v-if="isAdded" class="resource-card__status-added">已选</span>
        <span
          v-else-if="footerNote"
          class="resource-card__note"
          :title="footerNote"
        >
          {{ footerNote }}
        </span>
      </div>

      <!-- 卡片右下方：单个「更多」图标，点击下拉包含所有操作 -->
      <div class="resource-card__more-wrap" @click.stop>
        <button
          ref="moreBtnRef"
          type="button"
          class="resource-card__more-btn"
          title="更多操作"
          @click="toggleMoreMenu"
        >
          <MoreHorizontal class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>

  <!-- 更多操作菜单：Teleport 到 body + fixed 定位，避免被资源浮层遮挡 -->
  <Teleport to="body">
    <template v-if="moreMenuOpen">
      <div class="resource-card__more-backdrop" @click="closeMoreMenu"></div>
      <div
        class="resource-card__more-menu"
        :style="{
          top: moreMenuPos.top + 'px',
          left: moreMenuPos.left + 'px',
        }"
        @click.stop
      >
        <button
          v-for="action in actions"
          :key="action.key"
          type="button"
          class="resource-card__more-item"
          :class="{
            'resource-card__more-item--danger': action.danger,
            'resource-card__more-item--active': action.key === 'add' && isAdded,
          }"
          @click="handleActionClick(action)"
        >
          <component
            :is="getActionIcon(action)"
            class="h-3.5 w-3.5 mr-2 shrink-0 opacity-70"
          />
          <span class="truncate">{{ action.label }}</span>
        </button>
      </div>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type Component } from 'vue'
import {
  MoreHorizontal,
  Plus,
  Check,
  Trash2,
  Pencil,
  Download,
  Copy,
  Eye,
  Layers,
  Sparkles,
} from 'lucide-vue-next'
import { s1Confirm } from '@/common/message'

export interface ResourceCardBadge {
  label: string
  variant?: 'default' | 'tonal' | 'outline' | 'warning' | 'destructive'
}

export interface ResourceCardAction {
  key: string
  label: string
  icon?: Component
  danger?: boolean
  onSelect?: () => void
}

const props = withDefaults(
  defineProps<{
    title: string
    summary?: string
    media?: string
    badges?: ResourceCardBadge[]
    tags?: string[] | string
    footerNote?: string
    actions?: ResourceCardAction[]
    onSelect?: () => void
    resourceType?:
      | 'sticker'
      | 'customSticker'
      | 'font'
      | 'sentence'
      | 'document'
      | 'tips'
      | 'prompt'
      | 'designInspiration'
      | string
    aspectRatio?: '16/10' | '1/1' | 'auto'
  }>(),
  {
    summary: '',
    media: '',
    badges: () => [],
    tags: () => [],
    footerNote: '',
    actions: () => [],
    onSelect: undefined,
    resourceType: 'default',
    aspectRatio: '16/10',
  },
)

const isImageLike = computed(() => {
  return props.resourceType === 'sticker' || props.resourceType === 'customSticker'
})

const aspectRatioStyle = computed(() => {
  if (props.aspectRatio === '1/1') return { aspectRatio: '1 / 1' }
  if (props.aspectRatio === '16/10') return { aspectRatio: '16 / 10' }
  return {}
})

/** 文案类型纯净文本 */
const sentenceText = computed(() => {
  return props.title || props.summary || ''
})

/** 过滤重复的摘要 */
const cleanSummary = computed(() => {
  if (!props.summary) return ''
  if (props.summary.trim() === props.title.trim()) return ''
  return props.summary
})

/** 判断是否已经加入到提示词托盘 */
const isAdded = computed(() => {
  return props.actions.some(
    (a) =>
      (a.key === 'add' || a.key === 'prompt') &&
      a.label.includes('移出'),
  )
})

/** 根据操作 key 匹配图标 */
function getActionIcon(action: ResourceCardAction): Component {
  if (action.icon) return action.icon
  if (action.key === 'add' || action.key === 'prompt') {
    return isAdded.value ? Check : Plus
  }
  switch (action.key) {
    case 'edit':
      return Pencil
    case 'use':
      return Layers
    case 'delete':
      return Trash2
    case 'download':
      return Download
    case 'copy':
      return Copy
    case 'view':
    case 'preview':
    case 'detail':
      return Eye
    case 'repeat':
    case 'produce':
      return Sparkles
    default:
      return MoreHorizontal
  }
}

function handleCardClick() {
  props.onSelect?.()
}

/** 更多操作菜单开关 */
const moreBtnRef = ref<HTMLElement | null>(null)
const moreMenuOpen = ref(false)
const moreMenuPos = ref({ top: 0, left: 0 })

function toggleMoreMenu() {
  if (moreMenuOpen.value) {
    moreMenuOpen.value = false
    return
  }
  const rect = moreBtnRef.value?.getBoundingClientRect()
  if (rect) {
    const menuWidth = 160
    moreMenuPos.value = {
      top: Math.min(rect.bottom + 4, window.innerHeight - 220),
      left: Math.max(8, rect.right - menuWidth),
    }
  }
  moreMenuOpen.value = true
}

function closeMoreMenu() {
  moreMenuOpen.value = false
}

function handleActionClick(action: ResourceCardAction) {
  closeMoreMenu()
  if (action.danger) {
    s1Confirm({
      title: '确认删除',
      content: `确定要删除该资源吗？此操作不可逆。`,
      onOk: () => {
        action.onSelect?.()
      },
    })
    return
  }
  action.onSelect?.()
}

const onDocKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMoreMenu()
}
document.addEventListener('keydown', onDocKeydown)
onBeforeUnmount(() => document.removeEventListener('keydown', onDocKeydown))
</script>

<style scoped>
.resource-card {
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid var(--1s-border-color);
  border-radius: 8px;
  background: var(--1s-surface-background);
  overflow: hidden;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.resource-card:hover {
  border-color: color-mix(in srgb, var(--1s-accent-color) 40%, var(--1s-border-color));
}

.resource-card--clickable {
  cursor: pointer;
}

.resource-card--added {
  border-color: color-mix(in srgb, var(--1s-accent-color) 45%, var(--1s-border-color));
}

/* 预览图容器 */
.resource-card__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--1s-hover-background);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resource-card__media--sticker {
  aspect-ratio: 1 / 1;
  background: var(--1s-hover-background);
  padding: 12px;
}

.resource-card__img-contain {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.resource-card__media--cover {
  aspect-ratio: 16 / 10;
}

.resource-card__img-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.resource-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* 字体无图极简展示 */
.resource-card__media--font {
  aspect-ratio: 16 / 9;
  padding: 12px;
  background: var(--1s-hover-background);
}

.resource-card__font-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}

.resource-card__font-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--1s-text-color);
}

/* 文案类型极简排版 */
.resource-card__sentence-box {
  padding: 12px 12px 6px;
  min-height: 84px;
  display: flex;
  align-items: flex-start;
}

.resource-card__sentence-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--1s-text-color);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* 内容主体 */
.resource-card__body {
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  gap: 3px;
  flex: 1;
  min-height: 48px;
}

.resource-card__title {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--1s-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-card__summary {
  font-size: 11px;
  line-height: 1.45;
  color: var(--1s-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 底部操作条 */
.resource-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 0 8px 0 6px;
  border-top: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

/* 右下方更多图标按钮 */
.resource-card__more-wrap {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.resource-card__more-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--1s-text-color-tertiary);
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--1s-hover-background);
    color: var(--1s-text-color);
  }
}

.resource-card__more-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10001;
}

.resource-card__more-menu {
  position: fixed;
  z-index: 10002;
  min-width: 160px;
  padding: 4px;
  border-radius: 13px;
  border: 1px solid var(--1s-menu-border);
  background: var(--1s-menu-background);
  color: var(--1s-menu-text);
  box-shadow: 0 0 0 1px var(--1s-menu-border), 0 8px 24px -4px rgba(0, 0, 0, 0.45);
}

.resource-card__more-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 26px;
  padding: 0 8px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--1s-menu-text);
  font-size: 11px;
  font-weight: 450;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--1s-menu-background-hover);
    color: var(--1s-menu-text);
  }
}

.resource-card__more-item--danger {
  color: var(--1s-danger-color, #e5484d);
}

.resource-card__more-item--active {
  color: var(--1s-accent-color);
  font-weight: 500;
}

.resource-card__footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  min-width: 0;
}

.resource-card__note {
  font-size: 10px;
  color: var(--1s-text-color-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-card__status-added {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--1s-accent-color) 12%, transparent);
  color: var(--1s-accent-color);
  font-size: 10px;
  font-weight: 500;
}
</style>
