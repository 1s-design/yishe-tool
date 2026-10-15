<template>
  <div class="project-page flex flex-col min-h-full">
    <ResourceListShell
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :item-count="list.length"
      empty-title="暂无文案句子"
      empty-description="添加常用文案与排版句子，设计时快速调用"
      empty-action-label="立即添加"
      @empty-action="openCreateModal"
      @update:current-page="changePage"
    >
      <template #tabs>
        <slot name="tabs"></slot>
      </template>

      <template #toolbar-left>
        <Input
          v-model="searchText"
          placeholder="搜索文案句子内容"
          class="w-48 h-7 text-xs"
          @keyup.enter="handleSearch"
        />
        <Button variant="outline" size="sm" @click="handleSearch" :disabled="loading" class="h-7 text-xs gap-1">
          <Search class="h-3.5 w-3.5" />
          搜索
        </Button>
      </template>

      <template #toolbar-right>
        <Button variant="default" size="sm" @click="openCreateModal" class="h-7 text-xs gap-1">
          <Plus class="h-3.5 w-3.5" />
          添加文案
        </Button>
      </template>

      <div v-for="item in list" :key="item.id">
        <ResourceCard
          :title="item.content || item.description"
          :summary="String((item as any).content || (item as any).description || (item as any).summary || '')"
          resource-type="sentence"
          :badges="[
            ...((item as any).category ? [{ label: (item as any).category, variant: 'tonal' as const }] : []),
          ]"
          :tags="(item as any).tags || (item as any).keywords || []"
          :footer-note="Utils.time.timeago((item as any).updateTime || (item as any).updatedAt || (item as any).createTime) || ''"
          :actions="cardActions(item)"
          :on-select="() => cardActions(item).find((a) => a.key === 'edit')?.onSelect?.()"
        />
      </div>
    </ResourceListShell>

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
import ResourceListShell from '../ResourceListShell.vue'
import ResourceCard from '../ResourceCard.vue'
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
import { usePromptAttachments } from '@/composables/usePromptAttachments'
const { toggle: toggleResource, has: hasResource } = usePromptAttachments()
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
function cardActions(item: any) {
  const added = hasResource('sentence', String(item.id))
  return [
    {
      key: 'add',
      label: added ? '移出提示词' : '加入提示词',
      onSelect: () => toggleResource({ type: 'sentence', id: String(item.id), label: item.content || item.description, payload: item }),
    },
    { key: 'add', label: '加入提示词', onSelect: () => toggleResource({ type: 'sentence', id: String(item.id), label: item.content || item.description, payload: item }) },
    { key: 'copy', label: '复制内容', onSelect: () => copySentence(item) },
    { key: 'edit', label: '编辑', onSelect: () => editItem(item) },
    { key: 'delete', label: '删除', onSelect: () => deleteItem(item), danger: true },
  ]
}

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
  border: 1px solid var(--1s-dialog-border);
  border-radius: var(--1s-radius-lg);
  padding: 16px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);

  &:hover {
    box-: none;
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
