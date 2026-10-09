<template>
  <div class="project-page flex flex-col min-h-full">
    <!-- 顶部工具条与 Tabs -->
    <div class="project-toolbar">
      <slot name="tabs"></slot>
      <div class="project-toolbar__controls">
        <Button size="sm" @click="createNew" class="h-7 text-xs gap-1.5">
          <Plus class="h-3.5 w-3.5" />
          新建空白贴纸
        </Button>
        <Button variant="outline" size="sm" @click="loadList" :disabled="loading" class="h-7 text-xs gap-1.5">
          <RotateCw class="h-3.5 w-3.5" :class="{ 'animate-spin': loading }" />
          刷新
        </Button>
      </div>
      <div class="project-toolbar__caption">{{ list.length }} 项作品</div>
    </div>

    <!-- 列表内容区 -->
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
          <!-- 缩略图预览 -->
          <div class="relative overflow-hidden  bg-[var(--1s-control-surface-muted)] aspect-[4/3]">
            <s1-img
              padding="5%"
              :src="item.url"
              class="w-full h-full object-contain"
            />
            <!-- 当前正在编辑的高亮标识 -->
            <div
              v-if="currentEditingCustomStickerId === item.id"
              class="absolute top-2 left-2 z-10"
            >
              <Badge class="bg-amber-500 text-white font-medium text-[10px] -sm">
                当前编辑中
              </Badge>
            </div>
          </div>

          <!-- 卡片信息与操作 -->
          <div class="project-gallery-card__body flex flex-col gap-2">
            <div class="flex items-start justify-between gap-2 min-w-0">
              <div class="flex-1 min-w-0">
                <div class="project-gallery-card__title text-ellipsis text-xs font-semibold" :title="item.name">
                  {{ item.name || "未命名贴纸" }}
                </div>
                <div class="project-timeago text-[11px] text-muted-foreground mt-0.5">
                  {{ Utils.time.timeago(item.updateTime || item.createTime) }}
                </div>
              </div>

              <!-- 更多操作菜单 -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon-xs" class="h-6 w-6 opacity-60 group-hover:opacity-100 shrink-0">
                    <MoreVertical class="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="importItem(item)">
                    <FolderInput class="h-3.5 w-3.5 mr-2" />
                    导入到素材库
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="removeItem(item)" class="text-destructive focus:text-destructive">
                    <Trash2 class="h-3.5 w-3.5 mr-2" />
                    删除作品
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <!-- 明确的双操作按钮：编辑 vs 基于此新建 -->
            <div class="grid grid-cols-2 gap-1.5 pt-1">
              <Button
                variant="default"
                size="xs"
                class="w-full text-[11px] h-6 font-medium gap-1"
                @click="editOriginal(item)"
              >
                <Pencil class="h-3 w-3" />
                编辑原作品
              </Button>
              <Button
                variant="outline"
                size="xs"
                class="w-full text-[11px] h-6 font-medium gap-1 hover:bg-accent"
                @click="forkAsNew(item)"
              >
                <Copy class="h-3 w-3" />
                基于此新建
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!loading"
        class="flex flex-col items-center justify-center h-64 text-center"
      >
        <Sparkles class="h-10 w-10 text-[var(--1s-text-color-tertiary)] mb-2 opacity-50" />
        <div class="text-sm font-medium text-[var(--1s-text-color-secondary)]">暂无自定义贴纸工程</div>
        <div class="text-xs text-[var(--1s-text-color-tertiary)] mt-1">点击右上角「新建空白贴纸」在画布中设计并保存作品</div>
      </div>

      <!-- 加载遮罩 -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-[var(--1s-panel-background)]/60 flex items-center justify-center"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-[var(--1s-accent-color)] border-t-transparent"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message, Modal } from '@/common/message';
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
