<template>
  <section class="custom-sticker-panel">
    <header class="panel-header">
      <div>
        <strong>自定义贴纸</strong>
        <small>1s 设计工具作品，独立保存并可再次编辑</small>
      </div>
      <Button variant="link" size="sm" :disabled="loading" @click="loadList">刷新</Button>
    </header>
    <div class="panel-actions">
      <Button size="sm" @click="createNew">新建贴纸</Button>
      <span class="hint">保存时会更新当前作品，不会直接进入素材库</span>
    </div>
    <div class="sticker-list">
      <div v-if="loading" class="flex items-center justify-center py-6">
        <Loader2 class="h-5 w-5 animate-spin" />
      </div>
      <div v-for="item in list" :key="item.id" class="sticker-card">
        <img :src="item.url" :alt="item.name || '自定义贴纸'" />
        <div class="card-body">
          <div class="name" :title="item.name">{{ item.name || '未命名贴纸' }}</div>
          <div class="date">{{ formatDate(item.updateTime || item.createTime) }}</div>
          <div class="card-actions">
            <Button variant="link" size="sm" @click="edit(item)">编辑</Button>
            <Button variant="link" size="sm" :disabled="importingId === item.id" @click="importItem(item)">导入素材库</Button>
            <Button variant="link" size="sm" class="text-destructive" @click="removeItem(item)">删除</Button>
          </div>
        </div>
      </div>
      <div v-if="!loading && !list.length" class="py-8 text-center text-sm text-muted-foreground">
        暂无自定义贴纸，先制作一个吧
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Loader2 } from "lucide-vue-next";
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
.custom-sticker-panel { width: 100%; height: 100%; display: flex; flex-direction: column; padding: 14px; box-sizing: border-box; }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; }
.panel-header strong { display: block; font-size: 16px; }
.panel-header small { display: block; color: #8a94a6; margin-top: 4px; }
.panel-actions { display: flex; align-items: center; gap: 8px; margin: 14px 0 8px; }
.hint, .date { color: #8a94a6; font-size: 12px; }
.sticker-list { flex: 1; min-height: 0; overflow: auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: start; gap: 10px; }
.sticker-card { overflow: hidden; border: 1px solid var(--1s-control-border-color, #e5e7eb); border-radius: 8px; background: var(--1s-surface-background, #fff); }
.sticker-card img { display: block; width: 100%; height: 105px; object-fit: contain; background: var(--1s-control-surface-muted); }
.card-body { padding: 7px; }.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }.card-actions { display: flex; gap: 2px; margin-top: 4px; flex-wrap: wrap; }
</style>
