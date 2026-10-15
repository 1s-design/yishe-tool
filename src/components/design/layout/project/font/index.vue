<template>
  <div class="project-page flex flex-col min-h-full">
    <ResourceListShell
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :item-count="list.length"
      empty-title="暂无字体模板"
      empty-description="可在字体制作模块上传与生成自定义字体"
      @update:current-page="changePage"
    >
      <template #tabs>
        <slot name="tabs"></slot>
      </template>

      <template #toolbar-left>
        <Input
          v-model="searchText"
          placeholder="搜索字体名称或描述"
          class="w-48 h-7 text-xs"
          @keyup.enter="handleSearch"
        />
        <Button variant="outline" size="sm" @click="handleSearch" :disabled="loading" class="h-7 text-xs gap-1">
          <Search class="h-3.5 w-3.5" />
          搜索
        </Button>
      </template>

      <template #toolbar-right>
        <Button variant="ghost" size="sm" @click="reset" class="h-7 text-xs">刷新</Button>
      </template>

      <div v-for="item in list" :key="item.id">
        <ResourceCard
          :title="item.name"
          :summary="String((item as any).content || (item as any).description || (item as any).summary || '')"
          :media="item.thumbnail"
          resource-type="font"
          :badges="[
            ...(item.family ? [{ label: item.family, variant: 'tonal' as const }] : []),
          ]"
          :tags="(item as any).tags || (item as any).keywords || []"
          :footer-note="Utils.time.timeago(item.updateTime || item.createTime) || ''"
          :actions="cardActions(item)"
          :on-select="() => cardActions(item).find((a) => a.key === 'preview')?.onSelect?.() || cardActions(item).find((a) => a.key === 'edit')?.onSelect?.()"
        />
      </div>
    </ResourceListShell>

    <!-- 预览弹窗 -->
    <Dialog :modal="false" v-model:open="showPreviewModal">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ currentItem.name || '字体详情' }}</DialogTitle>
          <DialogDescription>
            字体模板信息与缩略图预览
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col sm:flex-row gap-4 items-center py-2">
          <s1-img
            :src="currentItem.thumbnail"
            class="w-48 h-48  object-contain bg-[var(--1s-control-surface-muted)] border border-[var(--1s-border-color)] flex-shrink-0"
          />
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <div>
              <span class="text-xs text-[var(--1s-text-color-tertiary)]">描述：</span>
              <p class="text-xs text-[var(--1s-text-color)] mt-0.5">{{ currentItem.description || '暂无描述' }}</p>
            </div>
            <div>
              <span class="text-xs text-[var(--1s-text-color-tertiary)]">标签：</span>
              <p class="text-xs text-[var(--1s-text-color)] mt-0.5">{{ currentItem.keywords || '无' }}</p>
            </div>
            <div>
              <span class="text-xs text-[var(--1s-text-color-tertiary)]">更新时间：</span>
              <p class="text-xs text-[var(--1s-text-color)] mt-0.5">{{ currentItem.updateTime }}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" @click="showPreviewModal = false">关闭</Button>
          <Button variant="default" size="sm" @click="downloadFile(currentItem)">
            <Download class="h-3.5 w-3.5 mr-1" />
            下载字体源文件
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 编辑弹窗 -->
    <Dialog :modal="false" v-model:open="showFormModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑字体信息</DialogTitle>
          <DialogDescription>
            修改字体模板的名称、描述与标签信息。
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3 py-2">
          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">名称</label>
            <Input v-model="editForm.name" placeholder="请输入字体名称" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">描述</label>
            <Input v-model="editForm.description" placeholder="请输入字体描述" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">标签</label>
            <tagsInput
              v-model="editForm.keywords"
              :string="true"
              :autocomplete-tags="fontAutoplacementTags"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" @click="showFormModal = false">取消</Button>
          <Button variant="default" size="sm" :disabled="submitLoading" @click="ok">
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
import {Search,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  Type,
  Plus,
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
import Utils from '@/common/utils'
import Api from '@/api'
import { s1Confirm } from '@/common/message'
import { usePromptAttachments } from '@/composables/usePromptAttachments'
const { toggle: toggleResource, has: hasResource } = usePromptAttachments()
import { message } from '@/common/message'
import { useLoginStatusStore } from '@/store/stores/login'
import { fontAutoplacementTags } from '@/components/design/components/tagsInput'
import { getFontList, deleteFontTemplate } from '@/api'

const loginStore = useLoginStatusStore()

// 搜索相关
const searchText = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const list = ref<any[]>([])
const loading = ref(false)

// 获取列表数据
function cardActions(item: any) {
  const added = hasResource('font', String(item.id))
  return [
    {
      key: 'add',
      label: added ? '移出提示词' : '加入提示词',
      onSelect: () => toggleResource({ type: 'font', id: String(item.id), label: item.name, payload: item }),
    },
    { key: 'edit', label: '编辑', onSelect: () => edit(item) },
    { key: 'download', label: '下载字体', onSelect: () => downloadFile(item) },
    { key: 'downloadThumb', label: '下载缩略图', onSelect: () => downloadThumbnail(item) },
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
    const res = await getFontList(params)
    list.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
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

// 重置
function reset() {
  currentPage.value = 1
  searchText.value = ''
  getList()
}

onMounted(() => {
  getList()
})

async function deleteItem(item: any) {
  try {
    await s1Confirm({
      content: '确认删除该字体？',
    })
    await deleteFontTemplate({ id: item.id })
    reset()
    message.success('删除成功')
  } catch (err) {
    // cancelled
  }
}

function downloadFile(item: any) {
  Api.downloadCOSFile(item.url)
}

function downloadThumbnail(item: any) {
  Api.downloadCOSFile(item.thumbnail)
}

const currentItem = ref({} as any)
const showPreviewModal = ref(false)

function itemClick(item: any) {
  currentItem.value = item
  showPreviewModal.value = true
}

const showFormModal = ref(false)
const submitLoading = ref(false)
const editForm = ref({} as any)

// 编辑
function edit(item: any) {
  editForm.value = {
    id: item.id,
    description: item.description,
    name: item.name,
    keywords: item.keywords,
  }
  currentItem.value = item
  showFormModal.value = true
}

async function ok() {
  submitLoading.value = true
  try {
    await Api.updateFontTemplate(editForm.value)
    message.success('修改成功')
    showFormModal.value = false
    await getList()
  } catch (err: any) {
    message.error(err?.message || '修改失败')
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped lang="less">
</style>
