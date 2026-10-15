<template>
  <ResourceListShell
    :loading="loading"
    :total="list.length"
    :current-page="1"
    :page-size="100"
    :item-count="list.length"
    empty-title="暂无自定义贴纸工程"
    empty-description="点击右上角「新建空白贴纸」在画布中设计并保存作品"
    empty-action-label="新建空白贴纸"
    @empty-action="createNew"
  >
    <template #tabs>
      <slot name="tabs"></slot>
    </template>

    <template #toolbar-right>
      <Button size="sm" @click="createNew" class="h-7 text-xs gap-1.5">
        <Plus class="h-3.5 w-3.5" />
        新建空白贴纸
      </Button>
      <Button variant="outline" size="sm" @click="loadList" :disabled="loading" class="h-7 text-xs gap-1.5">
        <RotateCw class="h-3.5 w-3.5" :class="{ 'animate-spin': loading }" />
        刷新
      </Button>
    </template>

    <div v-for="item in list" :key="item.id">
      <ResourceCard
        :title="item.name || item.title"
        :summary="String((item as any).content || (item as any).description || (item as any).summary || '')"
        :media="item.url || item.previewUrl"
        resource-type="customSticker"
        aspect-ratio="1/1"
        :badges="[]"
        :tags="(item as any).tags || (item as any).keywords || []"
        :footer-note="Utils.time.timeago(item.updateTime || item.createTime) || ''"
        :actions="cardActions(item)"
        :on-select="() => editOriginal(item)"
      />
    </div>
  </ResourceListShell>
</template>

<script setup lang="ts">
import ResourceListShell from '../ResourceListShell.vue'
import ResourceCard from '../ResourceCard.vue'
import { ref, onMounted } from "vue";
import { message, Modal } from '@/common/message'
import { usePromptAttachments } from '@/composables/usePromptAttachments'
const { toggle: toggleResource, has: hasResource } = usePromptAttachments();
import {
  getCustomStickerList,
  importCustomStickerToLibrary,
  deleteCustomSticker,
} from "@/api";
import {
  canvasStickerOptions,
  currentEditingCustomStickerId,
  currentEditingCustomStickerFolderId,
  currentEditingCustomStickerName,
  exitCustomStickerEditMode,
} from "@/components/design/layout/canvas/index.tsx";
import { menuItems, setActiveMenu } from "@/components/design/store";
import { executeAITool } from "@/ai/shared/execute-tool";
import { clearAgentDesignProvenance, restoreAgentDesignProvenance } from "@/ai/design-provenance";
import Utils from "@/common/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  RotateCw,
  MoreVertical,
  Pencil,
  Copy,
  FolderInput,
  Trash2,
  Sparkles,
} from "lucide-vue-next";

const list = ref<any[]>([]);
const loading = ref(false);
const importingId = ref<string | null>(null);

function cardActions(item: any) {
  const added = hasResource('sticker', String(item.id))
  return [
    {
      key: 'add',
      label: added ? '移出提示词' : '加入提示词',
      onSelect: () => toggleResource({ type: 'sticker', id: String(item.id), label: item.name || item.title, payload: item }),
    },
    { key: 'import', label: '导入素材库', onSelect: () => importItem(item) },
    { key: 'remove', label: '删除', onSelect: () => removeItem(item), danger: true },
  ]
}

async function loadList() {
  loading.value = true;
  try {
    const result: any = await getCustomStickerList({ page: 1, pageSize: 100 });
    list.value = result?.items || result?.list || [];
  } catch (error: any) {
    list.value = [];
    message.error(error?.message || "获取自定义贴纸失败");
  } finally {
    loading.value = false;
  }
}

async function createNew() {
  exitCustomStickerEditMode();
  await executeAITool("canvas.clear", {});
  clearAgentDesignProvenance(canvasStickerOptions.value);
  setActiveMenu(menuItems.canvas);
  message.success("已创建新的空白贴纸画布");
}

/** 模式 1: 编辑原作品 (保存将直接覆盖原作品) */
function editOriginal(item: any) {
  const data = item?.meta?.data;
  if (!data) {
    message.warning("该自定义贴纸缺少可编辑设计数据");
    return;
  }
  canvasStickerOptions.value = JSON.parse(JSON.stringify(data));
  restoreAgentDesignProvenance(canvasStickerOptions.value, item.meta);
  
  // 绑定编辑状态
  currentEditingCustomStickerId.value = item.id;
  currentEditingCustomStickerFolderId.value = item.folderId || null;
  currentEditingCustomStickerName.value = item.name || "未命名贴纸";
  
  setActiveMenu(menuItems.canvas);
  message.success(`已进入编辑模式：「${currentEditingCustomStickerName.value}」（保存将覆盖原作品）`);
}

/** 模式 2: 基于此贴纸新建 (副本模式，保存将作为全新贴纸) */
function forkAsNew(item: any) {
  const data = item?.meta?.data;
  if (!data) {
    message.warning("该自定义贴纸缺少可编辑设计数据");
    return;
  }
  canvasStickerOptions.value = JSON.parse(JSON.stringify(data));
  restoreAgentDesignProvenance(canvasStickerOptions.value, item.meta);
  
  // 清空原作品绑定，转为全新贴纸模式
  exitCustomStickerEditMode();
  
  setActiveMenu(menuItems.canvas);
  message.success(`已载入「${item.name || "贴纸"}」设计副本（保存将作为全新贴纸作品）`);
}

async function importItem(item: any) {
  importingId.value = item.id;
  try {
    await importCustomStickerToLibrary({ customStickerId: item.id });
    message.success("已复制到素材库，原自定义贴纸仍保留");
    await loadList();
  } catch (error: any) {
    message.error(error?.message || "导入素材库失败");
  } finally {
    importingId.value = null;
  }
}

function removeItem(item: any) {
  Modal.confirm({
    title: "删除自定义贴纸？",
    content: "删除后将无法继续编辑该设计，已导入素材库的副本不受影响。",
    onOk: async () => {
      await deleteCustomSticker(item.id);
      if (currentEditingCustomStickerId.value === item.id) {
        exitCustomStickerEditMode();
      }
      await loadList();
      message.success("已删除");
    },
  });
}

onMounted(loadList);
</script>
