<template>
  <div class="project-page flex flex-col min-h-full">
    <ResourceListShell
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :item-count="list.length"
      empty-title="暂无设计灵感"
      empty-description="灵感是「灵感驱动自动生产」的素材池"
      @update:current-page="changePage"
    >
      <template #tabs>
        <slot name="tabs"></slot>
      </template>

      <template #toolbar-left>
        <Input
          v-model="queryParams.keyword"
          placeholder="搜索灵感标题或内容"
          class="w-48 h-7 text-xs"
          @keyup.enter="getList"
        />
        <Button variant="outline" size="sm" @click="getList" :disabled="loading" class="h-7 text-xs gap-1">
          <Search class="h-3.5 w-3.5" />
          搜索
        </Button>
      </template>

      <div v-for="item in list" :key="item.id">
        <ResourceCard
          :title="item.title"
          :summary="String((item as any).content || (item as any).description || (item as any).summary || '')"
          :media="item.images?.[0] || (item as any).image || (item as any).thumbnail || ''"
          resource-type="designInspiration"
          :badges="[
            { label: item.category || '未分类', variant: 'tonal' },
            ...(item.status ? [{ label: item.status, variant: statusVariant(item.status) }] : []),
          ]"
          :tags="(item as any).tags || (item as any).keywords || []"
          :footer-note="`已产出 ${item.producedCount || 0} 张`"
          :actions="cardActions(item)"
          :on-select="() => openDetail(item)"
        />
      </div>
    </ResourceListShell>

    <!-- 详情弹窗 -->
    <Dialog :modal="false" v-model:open="showDetail">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ current?.title }}</DialogTitle>
          <DialogDescription>设计灵感详情</DialogDescription>
        </DialogHeader>
        <div class="inspiration-detail" v-if="current">
          <p><b>内容：</b>{{ current.content }}</p>
          <p v-if="current.promptHints"><b>提示词片段：</b>{{ current.promptHints }}</p>
          <p v-if="current.avoidNotes"><b>避让事项：</b>{{ current.avoidNotes }}</p>
          <p v-if="current.category"><b>分类：</b>{{ current.category }}</p>
          <p v-if="current.keywords?.length"><b>关键词：</b>{{ current.keywords.join('、') }}</p>
          <p v-if="current.images?.length"><b>参考图：</b>{{ current.images.length }} 张</p>
          <p><b>状态：</b>{{ current.status || 'pending' }} · 已产出 {{ current.producedCount || 0 }} 张</p>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" @click="showDetail = false">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Check, Copy, FileText, Sparkles, Wand2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { fetchInspirationPage, type DesignInspirationItem } from '@/ai/inspiration-source'
import { startBatch, batchProgress } from '@/ai/agent/batch'
import { canvasStickerOptionsOnlyChild } from '@/components/design/layout/canvas'
import { message } from '@/common/message'
import { usePromptAttachments } from '@/composables/usePromptAttachments'
import ResourceListShell from '../ResourceListShell.vue'
import ResourceCard from '../ResourceCard.vue'
const { toggle: toggleResource, has: hasResource } = usePromptAttachments()

const list = ref<DesignInspirationItem[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const queryParams = reactive({ keyword: '' })

const showDetail = ref(false)
const current = ref<DesignInspirationItem | null>(null)

function statusVariant(status: string) {
  if (status === 'done') return 'tonal' as const
  if (status === 'failed') return 'warning' as const
  return 'outline' as const
}

async function getList() {
  loading.value = true
  try {
    const page = await fetchInspirationPage({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      keyword: queryParams.keyword.trim() || undefined,
    })
    list.value = page.list
    total.value = page.total
    if (page.totalPage > 0 && currentPage.value > page.totalPage) {
      currentPage.value = page.totalPage
      await getList()
      return
    }
  } catch (error) {
    console.warn('[设计灵感] 加载失败:', error)
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  if (page < 1) return
  if (page * pageSize.value - pageSize.value >= total.value && total.value > 0) return
  currentPage.value = page
  getList()
}

/** 按指定灵感发起设计：取当前画布尺寸，在本机批量引擎里跑一张 */
function designFromInspiration(item: DesignInspirationItem) {
  if (['preparing', 'running', 'paused'].includes(batchProgress.status)) {
    message.warning('已有自动制作任务在进行中，请先停止或等待完成')
    return
  }
  const width = Number(canvasStickerOptionsOnlyChild.value?.width) || 3000
  const height = Number(canvasStickerOptionsOnlyChild.value?.height) || 1376

  startBatch({
    description: '',
    count: 1,
    taskPreset: 'standard',
    outputKind: 'independent-batch',
    customInstructions:
      '按灵感的提示词片段与避让事项执行；主文案几何中心落在画布正中心(50%,50%)，副文案挂其下；文字完整不截断；背景至少三层、不要大片纯色空白。',
    enableAnalysisOptimization: false,
    preserveCanvasSize: false,
    taskSource: {
      kind: 'inspirations',
      inspirationIds: [item.id],
      variantsPerInspiration: 1,
      sizes: [{ width, height, label: `${width}x${height}` }],
      reportBack: true,
    },
    saveMode: 'auto',
    failureStrategy: 'save_anyway',
  })
  message.success(`已按灵感「${item.title}」开始设计`)
}

function cardActions(item: DesignInspirationItem) {
  const added = hasResource('inspiration', String(item.id))
  return [
    {
      key: 'add',
      label: added ? '移出提示词' : '加入提示词',
      icon: added ? Check : Plus,
      onSelect: () =>
        toggleResource({ type: 'inspiration', id: item.id, label: item.title, payload: item }),
    },
    { key: 'detail', label: '查看详情', icon: FileText, onSelect: () => openDetail(item) },
    { key: 'copy', label: '复制内容', icon: Copy, onSelect: () => copyInspiration(item) },
    { key: 'design', label: '按此灵感设计', icon: Wand2, onSelect: () => designFromInspiration(item) },
  ]
}

function openDetail(item: DesignInspirationItem) {
  current.value = item
  showDetail.value = true
}

function copyInspiration(item: DesignInspirationItem) {
  const text = [item.title, item.content, item.promptHints, item.avoidNotes]
    .filter(Boolean)
    .join('\n')
  navigator.clipboard?.writeText(text)
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.inspiration-card {
  cursor: pointer;
  transition: all 0.2s;
}

.inspiration-card:hover {
  border-color: var(--1s-accent-color);
}

.inspiration-card__title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspiration-card__content {
  font-size: 11px;
  color: var(--1s-text-color-secondary);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 42px;
}

.inspiration-card__footer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--1s-border-color);
  font-size: 11px;
  color: var(--1s-text-color-tertiary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.inspiration-detail p {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.7;
}
</style>
