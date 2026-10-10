<template>
  <div class="project-page flex flex-col min-h-full">
    <!-- 顶部操作与筛选栏 -->
    <div class="project-toolbar">
      <slot name="tabs"></slot>
      <div class="project-toolbar__controls">
        <Input
          v-model="searchText"
          placeholder="搜索文档标题或内容"
          class="w-48"
          @keyup.enter="handleSearch"
        />
        <Button variant="outline" size="sm" @click="handleSearch" :disabled="loading">
          <Search class="h-3.5 w-3.5 mr-1" />
          搜索
        </Button>
        <Button variant="tonal" size="sm" @click="openCreateModal">
          <Plus class="h-3.5 w-3.5 mr-1" />
          添加文档
        </Button>
      </div>
      <div class="project-toolbar__caption">{{ total }} 篇</div>
    </div>

    <!-- 文档卡片网格 -->
    <div class="flex-1 relative p-4">
      <div
        v-if="list.length > 0"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="document-card group"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-mono text-[var(--1s-text-color-tertiary)]">
                {{ String(item.id).substring(0, 8) }}...
              </span>
              <Badge v-if="item.category" variant="tonal">{{ item.category }}</Badge>
              <Badge
                v-if="item.status && item.status !== 'published'"
                :variant="item.status === 'draft' ? 'secondary' : 'outline'"
              >
                {{ item.status === 'draft' ? '草稿' : item.status }}
              </Badge>
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
                  编辑文档
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="deleteItem(item)" class="text-red-500 focus:text-red-500">
                  <Trash2 class="h-3.5 w-3.5 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div class="document-card__title">{{ item.title }}</div>
          <div class="document-card__summary">
            {{ item.summary || (item.content ? item.content.substring(0, 120) + '...' : '暂无内容') }}
          </div>

          <div v-if="item.tags" class="flex flex-wrap gap-1 mt-3">
            <Badge
              v-for="tag in String(item.tags).split(',').filter(Boolean)"
              :key="tag"
              variant="secondary"
              class="text-[10px]"
            >
              #{{ tag }}
            </Badge>
          </div>

          <div class="document-card__footer">
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
        <FileText class="h-10 w-10 text-[var(--1s-text-color-tertiary)] mb-2 opacity-50" />
        <div class="text-sm font-medium text-[var(--1s-text-color-secondary)]">暂无文档</div>
        <div class="text-xs text-[var(--1s-text-color-tertiary)] mt-1">创建品牌故事、宣传推介等长文案库</div>
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

    <!-- 创建 / 编辑模态框 -->
    <Dialog :modal="false" v-model:open="showFormModal">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ isEdit ? '编辑文档' : '添加文档' }}</DialogTitle>
          <DialogDescription>
            管理您的设计长文本材料与文章故事。
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-1">
          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">标题</label>
            <Input v-model="form.title" placeholder="请输入文档标题" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">分类</label>
              <Input v-model="form.category" placeholder="如：宣传推介、品牌故事" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">标签</label>
              <Input v-model="form.tags" placeholder="逗号分隔，如：国风, 潮牌" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">摘要（可选）</label>
            <Textarea
              v-model="form.summary"
              rows="2"
              placeholder="请输入简要说明..."
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">正文内容</label>
            <Textarea
              v-model="form.content"
              rows="6"
              placeholder="请输入完整文档内容..."
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">内容类型</label>
              <Select v-model="form.contentType">
                <SelectTrigger>
                  <SelectValue placeholder="请选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain">纯文本</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="latex">LaTeX</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">状态</label>
              <Select v-model="form.status">
                <SelectTrigger>
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
import Pagination from '../pagination.vue';
import { ref, onMounted } from 'vue'
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  FileText,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
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

interface DocumentItem {
  id: string | number
  title: string
  category?: string
  tags?: string
  summary?: string
  content: string
  contentType?: string
  status?: string
  createTime?: string | number
  updateTime?: string | number
}

// 数据状态
const list = ref<DocumentItem[]>([])
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
  category: '',
  tags: '',
  summary: '',
  content: '',
  contentType: 'plain',
  status: 'published',
})

// 获取文档列表
async function getList() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    if (searchText.value.trim()) {
      params.keyword = searchText.value.trim()
    }
    const res = await Api.getTextDocumentList(params)
    list.value = res.list || []
    total.value = res.total || 0
  } catch (error: any) {
    console.error('获取文档列表失败:', error)
    message.error(error?.message || '获取文档列表失败')
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
    category: '',
    tags: '',
    summary: '',
    content: '',
    contentType: 'plain',
    status: 'published',
  }
  showFormModal.value = true
}

function editItem(item: DocumentItem) {
  isEdit.value = true
  form.value = {
    id: item.id,
    title: item.title,
    category: item.category || '',
    tags: item.tags || '',
    summary: item.summary || '',
    content: item.content || '',
    contentType: item.contentType || 'plain',
    status: item.status || 'published',
  }
  showFormModal.value = true
}

function copyContent(item: DocumentItem) {
  navigator.clipboard.writeText(item.content)
  message.success('文档内容已复制')
}

// 删除文档
async function deleteItem(item: DocumentItem) {
  try {
    await s1Confirm({
      content: `确认删除文档《${item.title}》？`,
    })
    await Api.deleteTextDocument(item.id)
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
    message.warning('请输入文档标题')
    return
  }
  if (!form.value.content.trim()) {
    message.warning('请输入文档内容')
    return
  }

  submitLoading.value = true
  try {
    const payload = {
      title: form.value.title,
      category: form.value.category || null,
      tags: form.value.tags || null,
      summary: form.value.summary || null,
      content: form.value.content,
      contentType: form.value.contentType,
      status: form.value.status,
    }

    if (isEdit.value && form.value.id) {
      await Api.updateTextDocument(form.value.id, payload)
      message.success('更新成功')
    } else {
      await Api.createTextDocument(payload)
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
.document-card {
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

  &__summary {
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
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--1s-divider-color);
  }
}
</style>
