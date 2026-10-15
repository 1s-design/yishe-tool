<template>
  <div class="project-page flex flex-col min-h-full">
    <ResourceListShell
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :item-count="list.length"
      empty-title="暂无设计提示词"
      empty-description="创建提示词以便在 AI Agent 设计中快速调用"
      empty-action-label="新建提示词"
      @empty-action="openCreateModal"
      @update:current-page="changePage"
    >
      <template #tabs>
        <slot name="tabs"></slot>
      </template>

      <template #toolbar-left>
        <Input
          v-model="queryParams.keyword"
          placeholder="搜索提示词标题或内容"
          class="w-48 h-7 text-xs"
          @keyup.enter="getList"
        />
        <Button variant="outline" size="sm" @click="getList" :disabled="loading" class="h-7 text-xs gap-1">
          <Search class="h-3.5 w-3.5" />
          搜索
        </Button>
      </template>

      <template #toolbar-right>
        <Button variant="default" size="sm" @click="openCreateModal" class="h-7 text-xs gap-1">
          <Plus class="h-3.5 w-3.5" />
          新建提示词
        </Button>
      </template>

      <div v-for="item in list" :key="item.id">
        <ResourceCard
          :title="item.title"
          :summary="String((item as any).content || (item as any).description || (item as any).summary || '')"
          resource-type="prompt"
          :badges="[
            ...((item as any).category ? [{ label: (item as any).category, variant: 'tonal' as const }] : []),
          ]"
          :tags="(item as any).tags || (item as any).keywords || []"
          :footer-note="Utils.time.timeago(item.updateTime || item.createTime)"
          :actions="cardActions(item)"
          :on-select="() => cardActions(item).find((a) => a.key === 'edit')?.onSelect?.()"
        />
      </div>
    </ResourceListShell>

    <!-- 创建 / 编辑弹窗 -->
    <Dialog :modal="false" v-model:open="showModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ isEdit ? '编辑设计提示词' : '新建设计提示词' }}</DialogTitle>
          <DialogDescription>
            保存常用的提示词模板，可在 AI Agent 对话与构图中直接引用。
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3 py-2">
          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">标题</label>
            <Input v-model="formData.title" placeholder="例如：极简扁平插画风" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">分类</label>
            <Input v-model="formData.category" placeholder="例如：style, layout, color" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">提示词内容</label>
            <textarea
              v-model="formData.content"
              rows="5"
              placeholder="输入完整的 Prompt 描述文本..."
              class="flex w-full  border border-[var(--1s-border-color)] bg-[var(--1s-control-surface-muted)] px-3 py-2 text-xs text-[var(--1s-text-color)] placeholder:text-[var(--1s-text-color-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--1s-accent-color)]"
            ></textarea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" @click="showModal = false">取消</Button>
          <Button variant="default" size="sm" :disabled="submitLoading" @click="handleSubmit">
            {{ submitLoading ? '保存中...' : '确定保存' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import ResourceListShell from '../ResourceListShell.vue'
import ResourceCard from '../ResourceCard.vue'
import { ref, reactive, onMounted } from 'vue'
import { message } from '@/common/message'
import { usePromptAttachments } from '@/composables/usePromptAttachments'
const { toggle: toggleResource, has: hasResource } = usePromptAttachments()
import {
  Search,
  Plus,
  MoreVertical,
  Copy,
  Star,
  Pencil,
  Trash2,
  Sparkles,
} from 'lucide-vue-next'
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
import {
  queryDesignPromptPage,
  createDesignPrompt,
  updateDesignPrompt,
  deleteDesignPrompt,
  favoriteDesignPrompt,
  unfavoriteDesignPrompt,
} from '@/ai/design-prompts/api'
import type { DesignPromptItem, DesignPromptCategory } from '@/ai/design-prompts/types'
import Utils from '@/common/utils'

const list = ref<DesignPromptItem[]>([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

const queryParams = reactive({
  keyword: '',
  category: '',
})

const showModal = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)

const formData = reactive({
  id: '',
  title: '',
  category: 'custom',
  content: '',
})

function cardActions(item: any) {
  const added = hasResource('prompt', String(item.id))
  return [
    {
      key: 'add',
      label: added ? '移出提示词' : '加入提示词',
      onSelect: () => toggleResource({ type: 'prompt', id: String(item.id), label: item.title, payload: item }),
    },
    { key: 'add', label: '加入提示词', onSelect: () => toggleResource({ type: 'prompt', id: String(item.id), label: item.title, payload: item }) },
    { key: 'copy', label: '复制内容', onSelect: () => copyPrompt(item) },
    { key: 'fav', label: '收藏/取消收藏', onSelect: () => toggleFavorite(item) },
    { key: 'edit', label: '编辑', onSelect: () => openEditModal(item) },
    { key: 'delete', label: '删除', onSelect: () => handleDelete(item), danger: true },
  ]
}

async function getList() {
  loading.value = true
  try {
    const res = await queryDesignPromptPage({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      keyword: queryParams.keyword || undefined,
      category: (queryParams.category as DesignPromptCategory) || undefined,
    })
    list.value = res.list || []
    total.value = res.total || 0
  } catch (err: any) {
    message.error(err?.message || '获取设计提示词失败')
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  currentPage.value = page
  getList()
}

function openCreateModal() {
  isEdit.value = false
  formData.id = ''
  formData.title = ''
  formData.category = 'custom'
  formData.content = ''
  showModal.value = true
}

function openEditModal(item: DesignPromptItem) {
  isEdit.value = true
  formData.id = item.id
  formData.title = item.title
  formData.category = item.category || 'custom'
  formData.content = item.content
  showModal.value = true
}

async function handleSubmit() {
  if (!formData.title.trim()) {
    message.warning('请输入提示词标题')
    return
  }
  if (!formData.content.trim()) {
    message.warning('请输入提示词内容')
    return
  }

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateDesignPrompt({
        id: formData.id,
        title: formData.title,
        category: (formData.category as DesignPromptCategory) || 'custom',
        content: formData.content,
      })
      message.success('更新成功')
    } else {
      await createDesignPrompt({
        title: formData.title,
        category: (formData.category as DesignPromptCategory) || 'custom',
        content: formData.content,
      })
      message.success('创建成功')
    }
    showModal.value = false
    getList()
  } catch (err: any) {
    message.error(err?.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(item: DesignPromptItem) {
  try {
    await deleteDesignPrompt(item.id)
    message.success('删除成功')
    getList()
  } catch (err: any) {
    message.error(err?.message || '删除失败')
  }
}

async function toggleFavorite(item: DesignPromptItem) {
  try {
    if (item.isFavorite) {
      await unfavoriteDesignPrompt(item.id)
      item.isFavorite = false
      message.success('已取消收藏')
    } else {
      await favoriteDesignPrompt(item.id)
      item.isFavorite = true
      message.success('已加入收藏')
    }
  } catch (err: any) {
    message.error(err?.message || '操作失败')
  }
}

function copyPrompt(item: DesignPromptItem) {
  navigator.clipboard.writeText(item.content)
  message.success('提示词已复制到剪贴板')
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="less">
.prompt-card {
  display: flex;
  flex-direction: column;
  background: var(--1s-surface-background);
  border: 1px solid var(--1s-dialog-border);
  border-radius: var(--1s-radius-lg);
  padding: 16px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);

  &:hover {
    box-: none;
    border-color: var(--1s-accent-color);
  }

  &__title {
    color: var(--1s-text-color);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 6px;
  }

  &__content {
    color: var(--1s-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--1s-divider-color);
  }
}
</style>
