<template>
  <div class="project-page flex flex-col min-h-full">
    <!-- 顶部操作与筛选栏 -->
    <div class="project-toolbar">
      <slot name="tabs"></slot>
      <div class="project-toolbar__controls">
        <Input
          v-model="queryParams.keyword"
          placeholder="搜索提示词标题或内容"
          class="w-48"
          @keyup.enter="getList"
        />
        <Button variant="outline" size="sm" @click="getList" :disabled="loading">
          <Search class="h-3.5 w-3.5 mr-1" />
          搜索
        </Button>
        <Button variant="tonal" size="sm" @click="openCreateModal">
          <Plus class="h-3.5 w-3.5 mr-1" />
          新建提示词
        </Button>
      </div>
      <div class="project-toolbar__caption">{{ total }} 条</div>
    </div>

    <!-- 提示词卡片网格 -->
    <div class="flex-1 relative p-4">
      <div
        v-if="list.length > 0"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="prompt-card group"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <Badge variant="tonal">{{ item.category || 'custom' }}</Badge>
              <Badge v-if="item.isFavorite" variant="warning" class="gap-1">
                <Star class="h-3 w-3 fill-current" />
                收藏
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon-sm" class="opacity-70 group-hover:opacity-100">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="copyPrompt(item)">
                  <Copy class="h-3.5 w-3.5 mr-2" />
                  复制内容
                </DropdownMenuItem>
                <DropdownMenuItem @click="toggleFavorite(item)">
                  <Star class="h-3.5 w-3.5 mr-2" :class="{ 'fill-amber-500 text-amber-500': item.isFavorite }" />
                  {{ item.isFavorite ? '取消收藏' : '加入收藏' }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="openEditModal(item)">
                  <Pencil class="h-3.5 w-3.5 mr-2" />
                  编辑提示词
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleDelete(item)" class="text-red-500 focus:text-red-500">
                  <Trash2 class="h-3.5 w-3.5 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div class="prompt-card__title">{{ item.title }}</div>
          <div class="prompt-card__content">{{ item.content }}</div>

          <div v-if="item.tags && item.tags.length" class="flex flex-wrap gap-1 mt-3">
            <Badge
              v-for="tag in item.tags"
              :key="tag"
              variant="secondary"
              class="text-[10px]"
            >
              #{{ tag }}
            </Badge>
          </div>

          <div class="prompt-card__footer">
            <span class="text-[11px] text-[var(--1s-text-color-tertiary)]">
              {{ Utils.time.timeago(item.updateTime || item.createTime) }}
            </span>
            <Button
              variant="secondary"
              size="sm"
              class="h-6 text-[11px] px-2"
              @click="copyPrompt(item)"
            >
              <Copy class="h-3 w-3 mr-1" />
              复制
            </Button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!loading"
        class="flex flex-col items-center justify-center h-64 text-center"
      >
        <Sparkles class="h-10 w-10 text-[var(--1s-text-color-tertiary)] mb-2 opacity-50" />
        <div class="text-sm font-medium text-[var(--1s-text-color-secondary)]">暂无设计提示词</div>
        <div class="text-xs text-[var(--1s-text-color-tertiary)] mt-1">创建提示词以便在 AI Agent 设计中快速调用</div>
        <Button variant="tonal" size="sm" class="mt-4" @click="openCreateModal">
          <Plus class="h-3.5 w-3.5 mr-1" />
          立即创建
        </Button>
      </div>

      <!-- 加载遮罩 -->
      <div v-if="loading" class="absolute inset-0 bg-[var(--1s-panel-background)]/60 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-[var(--1s-accent-color)] border-t-transparent"></div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="project-footer">
      <div class="flex items-center justify-between px-2">
        <div class="text-xs text-[var(--1s-text-color-tertiary)]">
          第 {{ currentPage }} 页 / 共 {{ Math.ceil(total / pageSize) || 1 }} 页
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage <= 1 || loading"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage * pageSize >= total || loading"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>

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
              class="flex w-full rounded-lg border border-[var(--1s-border-color)] bg-[var(--1s-control-surface-muted)] px-3 py-2 text-xs text-[var(--1s-text-color)] placeholder:text-[var(--1s-text-color-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--1s-accent-color)]"
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
import { ref, reactive, onMounted } from 'vue'
import { message } from '@/common/message'
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
  border: 1px solid var(--1s-border-color);
  border-radius: var(--1s-radius-lg);
  padding: 16px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--1s-shadow-md);
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
