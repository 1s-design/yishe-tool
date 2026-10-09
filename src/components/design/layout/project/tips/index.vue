<template>
  <div class="project-page flex flex-col min-h-full">
    <!-- 顶部操作与筛选栏 -->
    <div class="project-toolbar">
      <slot name="tabs"></slot>
      <div class="project-toolbar__controls">
        <Input
          v-model="searchText"
          placeholder="搜索技巧标题或内容"
          class="w-48"
          @keyup.enter="handleSearch"
        />
        <Button variant="outline" size="sm" @click="handleSearch" :disabled="loading">
          <Search class="h-3.5 w-3.5 mr-1" />
          搜索
        </Button>
        <Button variant="tonal" size="sm" @click="openCreateModal">
          <Plus class="h-3.5 w-3.5 mr-1" />
          添加技巧
        </Button>
      </div>
      <div class="project-toolbar__caption">{{ total }} 条</div>
    </div>

    <!-- 技巧卡片网格 -->
    <div class="flex-1 relative p-4">
      <div
        v-if="list.length > 0"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="tip-card group"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <Badge v-if="item.category" variant="tonal">{{ item.category }}</Badge>
              <Badge v-if="item.isPublic" variant="success">公开</Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon-sm" class="opacity-70 group-hover:opacity-100">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="copyContent(item)">
                  <Copy class="h-3.5 w-3.5 mr-2" />
                  复制内容
                </DropdownMenuItem>
                <DropdownMenuItem @click="editItem(item)">
                  <Pencil class="h-3.5 w-3.5 mr-2" />
                  编辑技巧
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="deleteItem(item)" class="text-red-500 focus:text-red-500">
                  <Trash2 class="h-3.5 w-3.5 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div class="tip-card__title">{{ item.title }}</div>
          <div class="tip-card__snippet">
            {{ item.content ? item.content.substring(0, 150) + (item.content.length > 150 ? '...' : '') : '暂无内容' }}
          </div>

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

          <div class="tip-card__footer">
            <span class="text-[11px] text-[var(--1s-text-color-tertiary)]">
              {{ Utils.time.timeago(item.updateTime || item.createTime) }}
            </span>
            <Button
              variant="secondary"
              size="sm"
              class="h-6 text-[11px] px-2"
              @click="copyContent(item)"
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
        <Lightbulb class="h-10 w-10 text-[var(--1s-text-color-tertiary)] mb-2 opacity-50" />
        <div class="text-sm font-medium text-[var(--1s-text-color-secondary)]">暂无设计技巧</div>
        <div class="text-xs text-[var(--1s-text-color-tertiary)] mt-1">沉淀设计方法论、CSS 样式技巧与排版规范</div>
        <Button variant="tonal" size="sm" class="mt-4" @click="openCreateModal">
          <Plus class="h-3.5 w-3.5 mr-1" />
          立即添加
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

    <!-- 创建 / 编辑模态框 -->
    <Dialog :modal="false" v-model:open="showFormModal">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ isEdit ? '编辑技巧' : '添加设计技巧' }}</DialogTitle>
          <DialogDescription>
            支持 Markdown 语法与 CSS 样式片段。
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-1">
          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">标题</label>
            <Input v-model="form.title" placeholder="请输入技巧标题" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">分类</label>
              <Input v-model="form.category" placeholder="如：css-glass、layout" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">标签</label>
              <Input v-model="form.tags" placeholder="逗号分隔，如：毛玻璃, 阴影" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">内容</label>
            <Textarea
              v-model="form.content"
              rows="8"
              placeholder="请输入技巧内容（支持 Markdown / CSS 属性示例）..."
              class="font-mono"
            />
          </div>

          <div class="flex items-center justify-between py-2 border-t border-[var(--1s-divider-color)]">
            <div class="space-y-0.5">
              <div class="text-xs font-medium text-[var(--1s-text-color)]">公开分享</div>
              <div class="text-[11px] text-[var(--1s-text-color-tertiary)]">开启后该技巧对社区成员可见</div>
            </div>
            <Switch v-model:checked="form.isPublic" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" @click="showFormModal = false">取消</Button>
          <Button variant="default" size="sm" :disabled="submitLoading" @click="handleSubmit">
            {{ submitLoading ? '保存中...' : '确定保存' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Lightbulb,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import Utils from '@/common/utils'
import Api from '@/api'
import { s1Confirm } from '@/common/message'
import { message } from '@/common/message'

interface TipItem {
  id: string | number
  title: string
  category: string
  tags?: string[]
  content: string
  isPublic?: boolean
  createTime?: string | number
  updateTime?: string | number
}

// 数据状态
const list = ref<TipItem[]>([])
const loading = ref(false)
const searchText = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 表单相关
const showFormModal = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const form = ref({
  id: null as any,
  title: '',
  category: 'other',
  tags: '',
  content: '',
  isPublic: false,
})

// 获取技巧列表
async function getList() {
  loading.value = true
  try {
    const params: any = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    }
    if (searchText.value.trim()) {
      params.keyword = searchText.value.trim()
    }
    const res = await Api.getDesignKnowledgePage(params)
    list.value = res.list || []
    total.value = res.total || 0
  } catch (error: any) {
    console.error('获取设计技巧列表失败:', error)
    message.error(error?.message || '获取设计技巧列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  getList()
}

function changePage(page: number) {
  currentPage.value = page
  getList()
}

function openCreateModal() {
  isEdit.value = false
  form.value = {
    id: null,
    title: '',
    category: 'other',
    tags: '',
    content: '',
    isPublic: false,
  }
  showFormModal.value = true
}

function editItem(item: TipItem) {
  isEdit.value = true
  form.value = {
    id: item.id,
    title: item.title,
    category: item.category || 'other',
    tags: Array.isArray(item.tags) ? item.tags.join(',') : '',
    content: item.content || '',
    isPublic: !!item.isPublic,
  }
  showFormModal.value = true
}

function copyContent(item: TipItem) {
  navigator.clipboard.writeText(item.content)
  message.success('技巧内容已复制')
}

// 删除技巧
async function deleteItem(item: TipItem) {
  try {
    await s1Confirm({
      content: `确认删除设计技巧"${item.title}"？`,
    })
    await Api.deleteDesignKnowledge(item.id)
    message.success('删除成功')
    await getList()
  } catch (error) {
    if (error) {
      message.error('删除失败')
    }
  }
}

// 提交表单
async function handleSubmit() {
  if (!form.value.title.trim()) {
    message.warning('请输入技巧标题')
    return
  }
  if (!form.value.category.trim()) {
    message.warning('请输入分类')
    return
  }
  if (!form.value.content.trim()) {
    message.warning('请输入内容')
    return
  }

  submitLoading.value = true
  try {
    const tagArray = form.value.tags
      ? form.value.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    const payload = {
      title: form.value.title,
      category: form.value.category,
      tags: tagArray,
      content: form.value.content,
      isPublic: form.value.isPublic,
      extras: {},
    }

    if (isEdit.value && form.value.id) {
      await Api.updateDesignKnowledge(form.value.id, payload)
      message.success('更新成功')
    } else {
      await Api.createDesignKnowledge(payload)
      message.success('创建成功')
    }

    showFormModal.value = false
    await getList()
  } catch (error: any) {
    message.error(error?.message || (isEdit.value ? '更新失败' : '创建失败'))
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="less">
.tip-card {
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
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    margin-top: 4px;
    margin-bottom: 6px;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__snippet {
    color: var(--1s-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-wrap;
    font-family: inherit;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--1s-divider-color);
  }
}
</style>
