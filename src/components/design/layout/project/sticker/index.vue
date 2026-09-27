<template>
  <div class="project-page flex flex-col min-h-full">
    <!-- 过滤区域 -->
    <div class="project-toolbar">
      <slot name="tabs"></slot>
      <div class="project-toolbar__controls">
        <Button variant="outline" size="sm" @click="reset" class="h-7 text-xs gap-1.5">
          <RotateCw class="h-3.5 w-3.5" :class="{ 'animate-spin': loading }" />
          刷新
        </Button>
      </div>
      <div class="project-toolbar__caption">{{ total }} 项</div>
    </div>
    
    <div class="flex-1 relative p-4">
      <div
        v-if="list.length > 0"
        class="grid grid-cols-1 gap-4 w-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="project-card project-gallery-card group"
        >
          <s1-img
            padding="5%"
            :src="item.url"
            @click="itemClick(item)"
            class="project-thumb project-gallery-card__media"
          >
            <s1-icon
              v-if="item.uploader?.isAdmin"
              name="official-badge"
              class="absolute right-[5%] top-[5%] opacity-80"
              :size="18"
            ></s1-icon>
          </s1-img>
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
                <Badge 
                  :variant="item.isCustom ? 'success' : 'destructive'"
                  v-if="item.isCustom !== undefined"
                >
                  {{ item.isCustom ? '自定义' : '系统' }}
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
                  编辑信息
                </DropdownMenuItem>
                <DropdownMenuItem @click="useInCanvasSticker(item)">
                  <Palette class="h-3.5 w-3.5 mr-2" />
                  在贴纸制作中使用
                </DropdownMenuItem>
                <DropdownMenuItem @click="showRepeatEffect(item)">
                  <Grid class="h-3.5 w-3.5 mr-2" />
                  查看重复效果
                </DropdownMenuItem>
                <DropdownMenuItem v-if="item.type == 'image'" @click="download(item)">
                  <Download class="h-3.5 w-3.5 mr-2" />
                  下载源文件
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
        <Sparkles class="h-10 w-10 text-[var(--1s-text-color-tertiary)] mb-2 opacity-50" />
        <div class="text-sm font-medium text-[var(--1s-text-color-secondary)]">暂无贴纸资源</div>
        <div class="text-xs text-[var(--1s-text-color-tertiary)] mt-1">可在贴纸制作或 AI 助手生成专属贴纸</div>
      </div>

      <!-- 加载遮罩 -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-[var(--1s-panel-background)]/60 flex items-center justify-center"
      >
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

    <!-- 编辑弹窗 -->
    <Dialog :modal="false" v-model:open="showFormModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑贴纸信息</DialogTitle>
          <DialogDescription>
            修改贴纸的标题、描述、标签及材质属性。
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3 py-2">
          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">贴纸名称</label>
            <Input v-model="editForm.name" placeholder="请输入贴纸名称" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">贴纸描述</label>
            <Textarea v-model="editForm.description" rows="3" placeholder="请输入贴纸描述..." />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-[var(--1s-text-color-secondary)]">关键字标签</label>
            <tagsInput
              v-model="editForm.keywords"
              :string="true"
              :autocomplete-tags="stickerAutoplacementTags"
              :autocomplete-width="400"
              autocompletePlacement="right"
            />
          </div>

          <div class="flex items-center justify-between py-2 border-t border-[var(--1s-divider-color)]">
            <div class="space-y-0.5">
              <div class="text-xs font-medium text-[var(--1s-text-color)]">是否作为材质</div>
              <div class="text-[11px] text-[var(--1s-text-color-tertiary)]">开启后该贴纸可用于 3D 服装/物体材质纹理</div>
            </div>
            <Switch v-model:checked="editForm.isTexture" />
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

    <!-- 重复效果预览 Modal -->
    <Dialog :modal="false" v-model:open="showRepeatModal">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>平铺重复效果预览</DialogTitle>
          <DialogDescription>
            查看 3x3 连续平铺无缝效果
          </DialogDescription>
        </DialogHeader>

        <div class="repeat-preview-container my-2">
          <div class="repeat-preview-grid">
            <div v-for="i in 9" :key="i" class="repeat-preview-item-wrapper">
              <img 
                :src="currentPreviewItem?.url" 
                class="repeat-preview-item"
                @load="onImageLoad"
                ref="previewImages"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" @click="showRepeatModal = false">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  MoreVertical,
  Pencil,
  Palette,
  Grid,
  Download,
  Trash2,
  Sparkles,
  RotateCw,
} from 'lucide-vue-next'
import { getStickerList } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { menuItems, menuState, setActiveMenu } from '@/components/design/store'
import { stickerAutoplacementTags } from '@/components/design/components/tagsInput/index.ts'
import {
  addCanvasChild,
  canvasStickerOptions,
  currentEditingCustomStickerId,
  currentEditingCustomStickerFolderId,
} from '@/components/design/layout/canvas/index.tsx'
import { createDefaultCanvasChildcanvasStickerOptions } from '@/components/design/layout/canvas/children/canvas.tsx'
import Utils from '@/common/utils'
import { message } from '@/common/message'
import { s1Confirm } from '@/common/message'
import Api from '@/api'
import tagsInput from '@/components/design/components/tagsInput/tagsInput.vue'
import { useStickerDetailModal } from './stickerModal.ts'
import { useLoginStatusStore } from '@/store/stores/login'
import {
  clearAgentDesignProvenance,
  restoreAgentDesignProvenance,
} from '@/ai/design-provenance'

const loginStore = useLoginStatusStore()

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
    const res = await getStickerList(params)
    list.value = res?.list || []
    total.value = res?.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  currentPage.value = page
  getList()
}

// 刷新/重置
function reset() {
  currentPage.value = 1
  getList()
}

onMounted(() => {
  getList()
})

function useInCanvasSticker(item: any) {
  currentEditingCustomStickerId.value = null
  currentEditingCustomStickerFolderId.value = null
  if (item.meta?.data) {
    canvasStickerOptions.value = item.meta.data
    restoreAgentDesignProvenance(canvasStickerOptions.value, item.meta)
  } else {
    canvasStickerOptions.value = {
      unit: 'px',
      showCanvasRealSize: false,
      supportBackgroundColor: {
        type: 'pure',
        color: 'rgba(0,0,0,0)',
      },
      svgFilter: {
        children: [],
      },
      children: [createDefaultCanvasChildcanvasStickerOptions()],
    }
    addCanvasChild({
      type: 'image',
      imageInfo: item,
    })
    clearAgentDesignProvenance(canvasStickerOptions.value)
  }
  menuState.value.showProject = false
  setActiveMenu(menuItems.canvas)
  message.success('已加载到贴纸制作')
}

async function deleteItem(item: any) {
  try {
    await s1Confirm({
      content: '确认删除该贴纸吗？',
    })
    await Api.deleteSticker({ ids: [item.id] })
    reset()
    message.success('删除成功')
  } catch (err) {
    // cancelled
  }
}

function download(item: any) {
  Api.downloadCOSFile(item.url)
}

const currentItem = ref({} as any)
const showFormModal = ref(false)
const submitLoading = ref(false)
const editForm = ref({} as any)

// 编辑
function edit(item: any) {
  editForm.value = {
    ...item,
  }
  showFormModal.value = true
  currentItem.value = item
}

async function ok() {
  submitLoading.value = true
  try {
    let res = await Api.updateSticker(editForm.value)
    message.success('修改成功')
    let ind = list.value.indexOf(currentItem.value)
    if (ind !== -1) {
      list.value[ind] = {
        ...currentItem.value,
        ...res,
      }
    }
    showFormModal.value = false
  } catch (err: any) {
    message.error(err?.message || '修改失败')
  } finally {
    submitLoading.value = false
  }
}

const { open } = useStickerDetailModal()

function itemClick(item: any) {
  currentItem.value = item
  open(item)
}

const showRepeatModal = ref(false)
const currentPreviewItem = ref<any>(null)
const previewImages = ref<any[]>([])

function showRepeatEffect(item: any) {
  currentPreviewItem.value = item
  showRepeatModal.value = true
}

function onImageLoad(event: any) {
  const img = event.target
  const wrapper = img.parentElement
  
  const aspectRatio = img.naturalWidth / img.naturalHeight
  const maxWidth = 150
  const maxHeight = 150
  
  let width, height
  if (aspectRatio > 1) {
    width = Math.min(maxWidth, img.naturalWidth)
    height = width / aspectRatio
  } else {
    height = Math.min(maxHeight, img.naturalHeight)
    width = height * aspectRatio
  }
  
  wrapper.style.width = `${width}px`
  wrapper.style.height = `${height}px`
}
</script>

<style scoped lang="less">
.repeat-preview-container {
  width: 100%;
  overflow: hidden;
  background: var(--1s-control-surface-muted);
  padding: 16px;
  border-radius: var(--1s-radius-lg);
  border: 1px solid var(--1s-border-color);
  display: flex;
  justify-content: center;
  align-items: center;
}

.repeat-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 0;
  width: fit-content;
}

.repeat-preview-item-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.repeat-preview-item {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.5);
    z-index: 1;
  }
}
</style>
