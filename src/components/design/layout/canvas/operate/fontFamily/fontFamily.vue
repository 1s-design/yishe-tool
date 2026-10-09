<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> {{ label }} </template>
    <template #content>
      <div class="font-selector-wrapper">
        <Button
          size="sm"
          variant="outline"
          @click="openFontDialog"
          class="font-select-button"
        >
          <span class="font-display-name" v-if="model">
            <span class="font-display-name__text">{{ model.name }}</span>
            <span class="font-display-name__family">{{ getFontFamilyId(model.id) }}</span>
          </span>
          <span class="font-display-name font-display-name--placeholder" v-else>请选择字体</span>
        </Button>
        <!-- <Button size="sm" @click="openFontModal"> 字体库 </Button> -->
        <Button
          v-if="model"
          size="sm"
          variant="link"
          class="text-destructive hover:text-destructive"
          @click="clearFont"
        >
          清除
        </Button>
      </div>
      
      <!-- 字体选择弹窗（全屏） -->
      <Dialog v-model:open="dialogVisible">
        <DialogContent
          class="font-picker-dialog max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col"
          @interact-outside="e => e.preventDefault()"
          @pointer-down-outside="e => e.preventDefault()"
        >
          <!-- 顶部：标题 + 搜索 + 上传 -->
          <DialogHeader class="shrink-0 px-5 py-3 border-b border-border flex flex-row items-center gap-3 space-y-0">
            <DialogTitle class="text-sm font-semibold shrink-0">选择字体</DialogTitle>
            <div class="relative flex-1 min-w-0 max-w-[420px]">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                v-model="searchKeyword"
                placeholder="搜索字体名称或描述"
                class="pl-8 h-7 text-xs"
                @input="handleSearchInput"
              />
              <button
                v-if="searchKeyword"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="handleSearchClear"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="flex-1"></div>
            <Button size="sm" variant="outline" @click="emitUpload">
              <Download class="w-3.5 h-3.5 mr-1" />
              上传字体
            </Button>
          </DialogHeader>

          <!-- 当前选中条 -->
          <div
            v-if="pendingFont || model"
            class="shrink-0 px-5 py-2.5 border-b border-border bg-muted/40 flex items-center gap-3"
          >
            <div class="text-[11px] text-muted-foreground shrink-0">当前选中</div>
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div class="w-10 h-10  overflow-hidden border border-border bg-background shrink-0">
                <desimage
                  v-if="(pendingFont || model)?.thumbnail"
                  :src="(pendingFont || model)!.thumbnail"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="min-w-0">
                <div class="text-xs font-medium truncate">{{ (pendingFont || model)?.name }}</div>
                <div class="text-[11px] text-muted-foreground truncate">
                  {{ getFontFamilyId((pendingFont || model)!.id) }}
                </div>
              </div>
              <Badge v-if="isFontLoaded((pendingFont || model)!.id)" variant="success" class="shrink-0">已加载</Badge>
            </div>
            <Button size="sm" @click="confirmFont">使用此字体</Button>
          </div>

          <!-- 字体网格 -->
          <div ref="fontListWrapperRef" class="flex-1 min-h-0 overflow-y-auto p-5" v-loading="loading">
            <div v-if="!loading && displayList.length === 0" class="h-full flex items-center justify-center">
              <s1-empty>
                <template #description>
                  <p class="text-xs text-muted-foreground">无相关字体，换个关键字试试</p>
                </template>
              </s1-empty>
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
              <div
                v-for="item in displayList"
                :key="item.id"
                :id="'font-item-' + item.id"
                class="font-card group"
                :class="{
                  'font-card--selected': pendingFont?.id === item.id,
                }"
                @click="selectFont(item)"
                @dblclick="applyFont(item)"
              >
                <div class="font-card__thumb">
                  <desimage
                    v-if="item.thumbnail"
                    :src="item.thumbnail"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    {{ item.name }}
                  </div>
                  <div class="font-card__check" v-if="pendingFont?.id === item.id">
                    <Check class="w-3.5 h-3.5" />
                  </div>
                  <div class="font-card__loaded" v-if="isFontLoaded(item.id)">
                    <Check class="w-2.5 h-2.5" />
                    <span class="text-[10px]">已加载</span>
                  </div>
                </div>

                <div class="font-card__body">
                  <div class="text-xs font-medium truncate" :title="item.name">{{ item.name }}</div>
                  <div class="text-[11px] text-muted-foreground truncate" :title="item.description">
                    {{ item.description || '—' }}
                  </div>
                  <div
                    class="font-card__family"
                    :title="'点击复制 ' + getFontFamilyId(item.id)"
                    @click.stop="copyFontFamily(item.id)"
                  >
                    <span class="truncate">{{ getFontFamilyId(item.id) }}</span>
                    <Copy class="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div class="font-card__actions" @click.stop>
                  <Button size="xs" variant="ghost" @click="openFontDetail(item)" title="详情">
                    <View class="w-3 h-3" />
                  </Button>
                  <Button
                    v-if="!isFontLoaded(item.id)"
                    size="xs"
                    variant="ghost"
                    @click="loadFontToCanvas(item)"
                    title="加载到画布"
                  >
                    <Download class="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部：分页 + 确认 -->
          <div class="shrink-0 px-5 py-2.5 border-t border-border flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Select :model-value="String(pageSize)" @update:model-value="v => handleSizeChange(Number(v))">
                <SelectTrigger class="h-7 text-[11px] w-[92px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in [12, 24, 48, 96]" :key="s" :value="String(s)">
                    {{ s }} 条/页
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="handleCurrentChange(currentPage - 1)">
                上一页
              </Button>
              <span class="text-xs text-muted-foreground tabular-nums">
                {{ currentPage }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}
              </span>
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage >= Math.max(1, Math.ceil(total / pageSize))"
                @click="handleCurrentChange(currentPage + 1)"
              >
                下一页
              </Button>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" @click="dialogVisible = false">取消</Button>
              <Button size="sm" :disabled="!pendingFont" @click="confirmFont">使用此字体</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog :modal="false" v-model:open="detailVisible">
        <DialogContent class="max-w-[560px] w-[560px] font-detail-dialog">
          <DialogHeader>
            <DialogTitle>{{ detailFont?.name || '字体详情' }}</DialogTitle>
          </DialogHeader>
        <div v-if="detailFont" class="font-detail-content">
          <div class="font-detail-preview">
            <desimage
              v-if="detailFont.thumbnail"
              :src="detailFont.thumbnail"
              class="font-detail-thumbnail"
            ></desimage>
            <div v-else class="font-detail-preview-empty">
              暂无预览
            </div>
          </div>

          <div class="font-detail-main">
            <div class="font-detail-header">
              <div class="font-detail-title">{{ detailFont.name }}</div>
              <Badge
                :variant="isFontLoaded(detailFont.id) ? 'success' : 'secondary'"
              >
                {{ isFontLoaded(detailFont.id) ? '已加载' : '未加载' }}
              </Badge>
            </div>

            <div class="font-detail-desc">
              {{ detailFont.description || '暂无描述' }}
            </div>

            <div class="font-detail-meta">
              <div class="font-detail-row">
                <span class="font-detail-label">FontFamily</span>
                <button
                  class="font-detail-value font-detail-copyable"
                  type="button"
                  @click="copyFontFamily(detailFont.id)"
                >
                  <span>{{ getFontFamilyId(detailFont.id) }}</span>
                  <Copy class="w-3 h-3" />
                </button>
              </div>
              <div class="font-detail-row">
                <span class="font-detail-label">字体 ID</span>
                <span class="font-detail-value">{{ detailFont.id }}</span>
              </div>
              <div class="font-detail-row">
                <span class="font-detail-label">资源地址</span>
                <button
                  v-if="detailFont.url"
                  class="font-detail-value font-detail-copyable"
                  type="button"
                  @click="copyFontUrl(detailFont.url)"
                >
                  <span>{{ detailFont.url }}</span>
                  <Copy class="w-3 h-3" />
                </button>
                <span v-else class="font-detail-value font-detail-empty-value">暂无资源地址</span>
              </div>
            </div>
          </div>
        </div>

          <div class="font-detail-footer">
            <Button variant="outline" @click="detailVisible = false">关闭</Button>
            <Button
              variant="outline"
              v-if="detailFont"
              :disabled="!detailFont.url || isFontLoaded(detailFont.id)"
              @click="loadFontToCanvas(detailFont)"
            >
              {{ detailFont.url ? (isFontLoaded(detailFont.id) ? '已加载' : '加载到画布') : '无资源地址' }}
            </Button>
            <Button
              v-if="detailFont"
              @click="applyFontFromDetail"
            >
              应用字体
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/font-family.svg?component";
import { ref, watch, computed, nextTick } from "vue";
import desimage from "@/components/image.vue";
import { fetchFontFaceWithMessage } from "./index.ts";
import { showUpload, showFontModal, cacheFontFamily } from "@/components/design/store";
import { useDebounceFn } from "@vueuse/core";
import { Search, Check, Copy, Download, View, X } from "lucide-vue-next";
import { getFontList } from "@/api";
import { message } from '@/common/message';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface FontItem {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  hide?: boolean;
}

const model = defineModel<FontItem | null>({ default: null });
const props = defineProps({
  label: {
    default: "个性字体",
  },
});
const dialogVisible = ref(false);
const list = ref<FontItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const searchKeyword = ref('');
const detailVisible = ref(false);
const pendingFont = ref<FontItem | null>(null);
const detailFont = ref<FontItem | null>(null);
const fontListWrapperRef = ref<HTMLElement | null>(null);

// 计算显示的列表（当前页的数据）
const displayList = computed(() => {
  return list.value.filter(item => !item.hide);
});

function emitUpload() {
  dialogVisible.value = false;
  showUpload.value = true;
}

function openFontModal() {
  try {
    console.log('Opening font modal...');
    showFontModal.value = true;
    console.log('showFontModal value:', showFontModal.value);
  } catch (error) {
    console.error('Error opening font modal:', error);
  }
}

function openFontDialog() {
  pendingFont.value = model.value;
  dialogVisible.value = true;
}

function clearFont() {
  model.value = null;
}

function selectFont(item: FontItem) {
  // 点选只高亮，由「使用此字体」或双击确认，便于浏览比对
  pendingFont.value = item;
}

function applyFont(item: FontItem) {
  model.value = item;
  pendingFont.value = item;
  dialogVisible.value = false;
}

function confirmFont() {
  if (!pendingFont.value) return;
  applyFont(pendingFont.value);
}

function openFontDetail(item?: FontItem | null) {
  if (!item) {
    return;
  }
  detailFont.value = item;
  detailVisible.value = true;
}

function applyFontFromDetail() {
  if (!detailFont.value) {
    return;
  }
  applyFont(detailFont.value);
  detailVisible.value = false;
}

function getFontFamilyId(fontId: string) {
  return `font_${fontId}`;
}

// 检查字体是否已加载（响应式）
function isFontLoaded(fontId: string): boolean {
  // 访问 cacheFontFamily.value 让 Vue 追踪依赖
  const cache = cacheFontFamily.value;
  return !!cache[fontId];
}

// 加载字体到画布（不应用）
async function loadFontToCanvas(item: FontItem) {
  if (isFontLoaded(item.id)) {
    message.info('字体已加载到画布');
    return;
  }
  
  try {
    await fetchFontFaceWithMessage({
      url: item.url || '',
      id: item.id,
      name: item.name
    });
    message.success(`字体 "${item.name}" 已加载到画布，可通过 FontFamily ID "${getFontFamilyId(item.id)}" 使用`);
  } catch (error) {
    message.error(`字体 "${item.name}" 加载失败`);
  }
}

// 复制 FontFamily ID
async function copyFontFamily(fontId: string) {
  const fontFamilyId = getFontFamilyId(fontId);
  await copyText(fontFamilyId, 'FontFamily ID 已复制到剪贴板');
}

async function copyFontUrl(url: string) {
  await copyText(url, '字体资源地址已复制到剪贴板');
}

async function copyText(value: string, successText: string) {
  try {
    await navigator.clipboard.writeText(value);
    message.success(successText);
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      message.success(successText);
    } catch (e) {
      message.error('复制失败，请手动复制');
    }
    document.body.removeChild(textarea);
  }
}

watch(dialogVisible, (visible) => {
  // 程序化打开时 Dialog 不会 emit update:open，必须在这里初始化
  if (visible) {
    handleDialogOpened();
  } else {
    handleDialogClosed();
  }
});

async function handleDialogOpened() {
  if (list.value.length === 0) {
    await fetchFontList();
  }
  // 滚动到当前选中的字体
  if (model.value) {
    nextTick(() => {
      const el = document.getElementById('font-item-' + model.value!.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

function handleDialogClosed() {
  // 弹窗关闭时的清理工作（如果需要）
}

async function fetchFontList(params = {}) {
  loading.value = true;
  
  try {
    const res = await getFontList({
      ...params,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    
    list.value = res.list || [];
    total.value = res.total || 0;
    
  } catch (error) {
    console.error('获取字体列表失败:', error);
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// 分页大小变化
function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  fetchFontList({
    match: searchKeyword.value,
  });
}

// 页码变化
function handleCurrentChange(page: number) {
  currentPage.value = page;
  fetchFontList({
    match: searchKeyword.value,
  });
}

// 搜索输入
const handleSearchInput = useDebounceFn(function (val: string) {
  searchKeyword.value = val;
  currentPage.value = 1;
  fetchFontList({
    match: val,
  });
}, 333);

// 清除搜索
function handleSearchClear() {
  searchKeyword.value = '';
  currentPage.value = 1;
  fetchFontList();
}

// 初始化时不加载，等弹窗打开时再加载
// onBeforeMount(() => {
//   fetchFontList();
// });

/**
 * */
const emits = defineEmits(["font-load"]);

watch(
  model,
  async () => {
    const info = model.value;
    if (!info || !info.url) {
      return;
    }
    const { url, id, name } = info;

    await fetchFontFaceWithMessage({
      url,
      id,
      name
    });

    emits("font-load");
  },
  {
    immediate: true,
  }
);
</script>

<style scoped>
.font-selector-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.font-select-button {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  justify-content: flex-start;
  overflow: hidden;
  width: 0;
  margin-right: 4px;
}

.font-select-button :deep(span) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-display-name {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.font-select-icon {
  flex-shrink: 0;
}

.font-detail-text-button {
  flex: 0 0 auto;
  min-width: auto;
  height: 24px;
  padding: 0 4px;
  border: 0;
  color: var(--1s-text-color-secondary);
  font-size: 12px;
  background: transparent;
}

.font-detail-text-button:hover,
.font-detail-text-button:focus {
  color: var(--1s-accent-color);
  background: var(--1s-hover-background);
}


/* ===== 全屏字体选择弹窗 ===== */
.font-picker-dialog {
  background: var(--1s-dialog-bg, var(--el-bg-color-overlay, #fff));
  color: var(--1s-dialog-fg, inherit);
}

.font-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--1s-border-color, var(--el-border-color-lighter));
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--1s-surface-background, transparent);
  transition: border-color 0.15s ease, box- 0.15s ease;
}

.font-card:hover {
  border-color: var(--1s-accent-color);
  box-: none;
}

.font-card--selected {
  border-color: var(--1s-accent-color);
  box-: none;
}

.font-card__thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--1s-control-surface-muted, var(--el-fill-color-light));
  overflow: hidden;
}

.font-card__check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--1s-accent-color);
  color: var(--1s-surface-background, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-card__loaded {
  position: absolute;
  left: 6px;
  bottom: 6px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  background: color-mix(in srgb, #16a34a 18%, transparent);
  color: #16a34a;
}

.dark .font-card__loaded {
  background: color-mix(in srgb, #22c55e 22%, transparent);
  color: #4ade80;
}

.font-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px 10px;
  min-width: 0;
}

.font-card__family {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  color: var(--1s-text-color-tertiary, var(--el-text-color-secondary));
  cursor: copy;
  min-width: 0;
}

.font-card__family:hover {
  color: var(--1s-accent-color);
}

.font-card__actions {
  position: absolute;
  top: 6px;
  left: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.font-card:hover .font-card__actions {
  opacity: 1;
}

.font-card__actions :deep(.el-button),
.font-card__actions button {
  background: var(--1s-surface-background);
}


.font-detail-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.font-detail-preview {
  width: 100%;
  height: 180px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--1s-control-surface-muted);
}

.font-detail-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.font-detail-preview-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--1s-text-color-tertiary);
  font-size: 13px;
}

.font-detail-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.font-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.font-detail-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--1s-text-color);
  font-size: 16px;
  font-weight: 600;
}

.font-detail-desc {
  color: var(--1s-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.font-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: var(--1s-control-surface-muted);
}

.font-detail-row {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.font-detail-label {
  color: var(--1s-text-color-tertiary);
  font-size: 12px;
}

.font-detail-value {
  min-width: 0;
  color: var(--1s-text-color);
  font-size: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-detail-copyable {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--1s-accent-color);
  cursor: pointer;
  text-align: left;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.font-detail-copyable:hover {
  background: var(--1s-hover-background);
}

.font-detail-copyable span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-detail-empty-value {
  color: var(--1s-text-color-tertiary);
}

.font-detail-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 1080px) {
  }

@media (max-width: 640px) {
  .font-detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
