<template>
  <div class="project-page flex flex-col min-h-full">
    <!-- 顶部操作与筛选栏 -->
    <div class="project-toolbar">
      <slot name="tabs"></slot>
      <div class="project-toolbar__controls">
        <Input
          v-model="searchText"
          placeholder="搜索文案句子内容"
          class="w-48"
          @keyup.enter="handleSearch"
        />
        <Button variant="outline" size="sm" @click="handleSearch" :disabled="loading">
          <Search class="h-3.5 w-3.5 mr-1" />
          搜索
        </Button>
        <Button variant="tonal" size="sm" @click="openCreateModal">
          <Plus class="h-3.5 w-3.5 mr-1" />
          添加文案
        </Button>
      </div>
      <div class="project-toolbar__caption">{{ total }} 条</div>
    </div>

    <!-- 句子卡片网格 -->
    <div class="flex-1 relative p-4">
      <div
        v-if="list.length > 0"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="sentence-card group"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-[11px] font-mono text-[var(--1s-text-color-tertiary)]">
              #{{ item.id }}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon-sm" class="opacity-70 group-hover:opacity-100">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="copySentence(item)">
                  <Copy class="h-3.5 w-3.5 mr-2" />
                  复制内容
                </DropdownMenuItem>
                <DropdownMenuItem @click="editItem(item)">
                  <Pencil class="h-3.5 w-3.5 mr-2" />
                  编辑文案
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="deleteItem(item)" class="text-red-500 focus:text-red-500">
                  <Trash2 class="h-3.5 w-3.5 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div class="sentence-card__content">{{ item.content }}</div>
          <div v-if="item.description" class="sentence-card__description">
            {{ item.description }}
          </div>

          <div class="sentence-card__footer">
            <span class="text-[11px] text-[var(--1s-text-color-tertiary)]">
              {{ Utils.time.timeago(item.updatedAt || item.createdAt) }}
            </span>
            <Button
              variant="secondary"
              size="sm"
              class="h-6 text-[11px] px-2"
              @click="copySentence(item)"
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
        <Quote class="h-10 w-10 text-[var(--1s-text-color-tertiary)] mb-2 opacity-50" />
        <div class="text-sm font-medium text-[var(--1s-text-color-secondary)]">暂无文案句子</div>
        <div class="text-xs text-[var(--1s-text-color-tertiary)] mt-1">添加常用文案与排版句子，设计时快速调用</div>
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

    <!-- 创建 / 编辑弹窗 -->
    <Dialog :modal="false" v-model:open="showFormModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ isEdit ? '编辑文案句子' : '添加文案句子' }}</DialogTitle>
          <DialogDescription>
            保存精美文案或文字段落，支持在设计画布中一键引用。
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3 py-2">
          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">句子内容</label>
            <Textarea
              v-model="form.content"
              rows="4"
              placeholder="请输入句子内容..."
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">描述（可选）</label>
            <Textarea
              v-model="form.description"
              rows="2"
              placeholder="请输入描述信息或出处..."
            />
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
  Quote,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

interface SentenceItem {
  id: string | number
  content: string
  description?: string
  createdAt?: string | number
  updatedAt?: string | number
}

// 数据状态
const list = ref<SentenceItem[]>([])
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
  content: '',
  description: '',
})

// 获取句子列表
async function getList() {
  loading.value = true
  try {
    const params: any = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    }
    if (searchText.value.trim()) {
      params.match = [searchText.value.trim()]
    }
    const res = await Api.getSentenceList(params)
    list.value = res.list || []
    total.value = res.total || 0
  } catch (error: any) {
    console.error('获取句子列表失败:', error)
    message.error(error?.message || '获取句子列表失败')
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
    content: '',
    description: '',
  }
  showFormModal.value = true
}

function editItem(item: SentenceItem) {
  isEdit.value = true
  form.value = {
    id: item.id,
    content: item.content,
    description: item.description || '',
  }
  showFormModal.value = true
}

function copySentence(item: SentenceItem) {
  navigator.clipboard.writeText(item.content)
  message.success('句子内容已复制')
}

// 删除句子
async function deleteItem(item: SentenceItem) {
  try {
    await s1Confirm({
      content: `确认删除句子"${item.content.substring(0, 20)}..."？`,
    })
    await Api.deleteSentence(item.id)
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
  if (!form.value.content.trim()) {
    message.warning('请输入句子内容')
    return
  }

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await Api.updateSentence(form.value.id, {
        content: form.value.content,
        description: form.value.description,
      })
      message.success('更新成功')
    } else {
      await Api.createSentence({
        content: form.value.content,
        description: form.value.description,
      })
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
.sentence-card {
  display: flex;
  flex-direction: column;
  background: var(--1s-surface-background);
  border: 1px solid var(--1s-border-color);
  border-radius: var(--1s-radius-lg);
  padding: 16px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);

  &:hover {
    box-shadow: var(--1s-shadow-md);
    border-color: var(--1s-accent-color);
  }

  &__content {
    color: var(--1s-text-color);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    margin-bottom: 6px;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__description {
    color: var(--1s-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
