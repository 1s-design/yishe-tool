<template>
  <section class="custom-sticker-panel u-panel">
    <header class="u-panel__header">
      <div class="custom-sticker-heading">
        <strong>自定义贴纸</strong>
        <span>{{ list.length }} 项</span>
      </div>
      <Button variant="ghost" size="icon-xs" title="刷新" aria-label="刷新" :disabled="loading" @click="loadList">
        <RefreshCw class="h-3 w-3" />
      </Button>
    </header>

    <div class="panel-actions">
      <Button size="sm" class="u-btn--block" @click="createNew">新建贴纸</Button>
    </div>
    <div class="u-panel__hint">保存后仍可再次编辑，导入素材库不会删除原作品。</div>

    <div class="sticker-list u-panel__body" :aria-busy="loading">
      <div v-if="loading" class="panel-loading">
        <Loader2 class="h-4 w-4 animate-spin" />
      </div>

      <div
        v-for="item in list"
        :key="item.id"
        class="u-list-row custom-sticker-row"
        :class="{ 'is-selected': currentEditingCustomStickerId === item.id }"
      >
        <img class="custom-sticker-thumb" :src="item.url" :alt="item.name || '自定义贴纸'" />
        <div class="custom-sticker-meta">
          <div class="name" :title="item.name">{{ item.name || '未命名贴纸' }}</div>
          <div class="date">{{ formatDate(item.updateTime || item.createTime) }}</div>
        </div>
        <div class="u-list-row__actions custom-sticker-actions">
          <Button variant="ghost" size="icon-xs" title="编辑" aria-label="编辑" @click="edit(item)">
            <Pencil class="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            title="导入素材库"
            aria-label="导入素材库"
            :disabled="importingId === item.id"
            @click="importItem(item)"
          >
            <Upload class="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon-xs" class="text-destructive" title="删除" aria-label="删除" @click="removeItem(item)">
            <Trash2 class="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div v-if="!loading && !list.length" class="u-panel__empty">
        暂无自定义贴纸，先制作一个吧
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Loader2, Pencil, RefreshCw, Trash2, Upload } from "lucide-vue-next";
import { Button } from '@/components/ui/button';
import { message, Modal } from '@/common/message';
import {
  getCustomStickerList,
  importCustomStickerToLibrary,
  deleteCustomSticker,
} from "@/api";
import { canvasStickerOptions, currentEditingCustomStickerId, currentEditingCustomStickerFolderId } from "../canvas";
import { menuItems, setActiveMenu } from "../../store";
import { executeAITool } from "@/ai/shared/execute-tool";
import { clearAgentDesignProvenance, restoreAgentDesignProvenance } from "@/ai/design-provenance";

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
  currentEditingCustomStickerId.value = null;
  currentEditingCustomStickerFolderId.value = null;
  await executeAITool("canvas.clear", {});
  clearAgentDesignProvenance(canvasStickerOptions.value);
  setActiveMenu(menuItems.canvas);
  message.success("已创建新的自定义贴纸画布");
}

function edit(item: any) {
  const data = item?.meta?.data;
  if (!data) {
    message.warning("该自定义贴纸缺少可编辑设计数据");
    return;
  }
  canvasStickerOptions.value = JSON.parse(JSON.stringify(data));
  restoreAgentDesignProvenance(canvasStickerOptions.value, item.meta);
  currentEditingCustomStickerId.value = item.id;
  currentEditingCustomStickerFolderId.value = item.folderId || null;
  setActiveMenu(menuItems.canvas);
  message.success(`已加载「${item.name || "未命名贴纸"}」，保存后将更新原作品`);
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
        currentEditingCustomStickerId.value = null;
        currentEditingCustomStickerFolderId.value = null;
      }
      await loadList();
      message.success("已删除");
    },
  });
}

function formatDate(value: any) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

onMounted(loadList);
</script>

<style scoped lang="less">
.custom-sticker-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding-bottom: 8px;
  box-sizing: border-box;
}

.custom-sticker-heading {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;

  strong {
    color: var(--1s-text-color);
    font-size: var(--1s-control-font-md);
    font-weight: 600;
    line-height: 1.2;
  }

  span {
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
    font-variant-numeric: tabular-nums;
  }
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--1s-divider-color);
}

.date {
  max-width: 72px;
  overflow: hidden;
  color: var(--1s-text-color-tertiary);
  font-size: 9px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticker-list {
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  align-content: start;
  gap: 1px;
}

.panel-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88px;
  color: var(--1s-text-color-secondary);
}

.custom-sticker-row {
  min-height: 34px;
  height: 34px;
  padding: 3px 6px;
}

.custom-sticker-thumb {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  object-fit: contain;
  border: none;
  border-radius: 0;
  background: var(--1s-control-surface-muted);
}

.custom-sticker-meta {
  min-width: 0;
  flex: 1;
}

.name {
  overflow: hidden;
  color: var(--1s-text-color);
  font-size: var(--1s-control-font-md);
  font-weight: 500;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-sticker-actions {
  display: flex;
  align-items: center;
  gap: 1px;
}

.custom-sticker-row:hover .date,
.custom-sticker-row.is-selected .date {
  opacity: 0.45;
}
</style>
