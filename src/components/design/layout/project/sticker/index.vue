<template>
  <div class="project-page">
    <ResourceListShell
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :item-count="list.length"
      empty-title="暂无贴纸资源"
      empty-description="可在贴纸制作或 AI 助手生成专属贴纸"
      @update:current-page="changePage"
    >
      <template #tabs>
        <slot name="tabs"></slot>
      </template>

      <template #toolbar-right>
        <Button variant="outline" size="sm" @click="reset" class="h-7 text-xs gap-1.5">
          <RotateCw class="h-3.5 w-3.5" :class="{ 'animate-spin': loading }" />
          刷新
        </Button>
      </template>

      <div v-for="item in list" :key="item.id">
        <ResourceCard
          :title="item.name || item.title"
          :summary="String((item as any).content || (item as any).description || (item as any).summary || '')"
          :media="item.src || item.url || item.image || item.previewUrl"
          resource-type="sticker"
          aspect-ratio="1/1"
          :badges="[]"
          :tags="(item as any).tags || (item as any).keywords || []"
          :footer-note="Utils.time.timeago(item.updateTime || item.createTime) || ''"
          :actions="cardActions(item)"
          :on-select="() => cardActions(item).find((a) => a.key === 'edit')?.onSelect?.()"
        />
      </div>
    </ResourceListShell>

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
import ResourceListShell from '../ResourceListShell.vue'
import ResourceCard from '../ResourceCard.vue'
import { ref, onMounted } from 'vue'
import {MoreVertical,
  Pencil,
  Palette,
  Grid,
  Download,
  Trash2,
  Sparkles,
  RotateCw,
  Plus,
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
import { usePromptAttachments } from '@/composables/usePromptAttachments'
const { toggle: toggleResource, has: hasResource } = usePromptAttachments()
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
function cardActions(item: any) {
  const added = hasResource('sticker', String(item.id))
  return [
    {
      key: 'add',
      label: added ? '移出提示词' : '加入提示词',
      onSelect: () => toggleResource({ type: 'sticker', id: String(item.id), label: item.name || item.title, payload: item }),
    },
    { key: 'edit', label: '编辑', onSelect: () => edit(item) },
    { key: 'use', label: '用到画布', onSelect: () => useInCanvasSticker(item) },
    { key: 'repeat', label: '重复特效', onSelect: () => showRepeatEffect(item) },
    { key: 'download', label: '下载', onSelect: () => download(item) },
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
  border: 1px solid var(--1s-dialog-border);
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
