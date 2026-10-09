<template>
  <div class="project-page flex flex-col min-h-full">
    <!-- 顶部操作栏 -->
    <div class="project-toolbar">
      <slot name="tabs"></slot>
      <div class="project-toolbar__controls">
        <Input
          v-model="searchText"
          placeholder="搜索字体名称或描述"
          class="w-48"
          @keyup.enter="handleSearch"
        />
        <Button variant="outline" size="sm" @click="handleSearch" :disabled="loading">
          <Search class="h-3.5 w-3.5 mr-1" />
          搜索
        </Button>
        <Button variant="ghost" size="sm" @click="reset">刷新</Button>
      </div>
      <div class="project-toolbar__caption">{{ total }} 项</div>
    </div>

    <!-- 字体列表网格 -->
    <div class="flex-1 relative p-4">
      <div
        v-if="list.length > 0"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="project-card project-gallery-card group"
        >
          <s1-image
            padding="5%"
            :src="item.thumbnail"
            @click="itemClick(item)"
            class="project-thumb project-gallery-card__media"
          >
            <s1-icon
              v-if="item.uploader?.isAdmin"
              name="official-badge"
              class="absolute right-[5%] top-[5%] opacity-80"
              :size="18"
            ></s1-icon>
          </s1-image>

          <div class="project-gallery-card__body">
            <div class="project-gallery-card__content">
              <div class="project-gallery-card__title text-ellipsis">
                {{ item.name || "未命名" }}
              </div>
              <div class="project-gallery-card__meta">
                <Badge variant="tonal" v-if="item.isPublic">已共享</Badge>
                <Badge
                  variant="secondary"
                  v-if="item?.uploader?.account == loginStore.userInfo?.account"
                >
                  我
                </Badge>
                <div class="project-timeago">{{ Utils.time.timeago(item.updateTime) }}</div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon-sm" class="project-action-button opacity-70 group-hover:opacity-100">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="edit(item)">
                  <Pencil class="h-3.5 w-3.5 mr-2" />
                  编辑基本信息
                </DropdownMenuItem>
                <DropdownMenuItem @click="downloadFile(item)">
                  <Download class="h-3.5 w-3.5 mr-2" />
                  下载源文件
                </DropdownMenuItem>
                <DropdownMenuItem @click="downloadThumbnail(item)">
                  <Download class="h-3.5 w-3.5 mr-2" />
                  下载缩略图
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="deleteItem(item)" class="text-red-500 focus:text-red-500">
                  <Trash2 class="h-3.5 w-3.5 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!loading"
        class="flex flex-col items-center justify-center h-64 text-center"
      >
        <Type class="h-10 w-10 text-[var(--1s-text-color-tertiary)] mb-2 opacity-50" />
        <div class="text-sm font-medium text-[var(--1s-text-color-secondary)]">暂无字体模板</div>
        <div class="text-xs text-[var(--1s-text-color-tertiary)] mt-1">可在字体制作模块上传与生成自定义字体</div>
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
import { ref, onMounted } from 'vue'
import {
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  Type,
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
