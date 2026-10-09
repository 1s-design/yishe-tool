<template>
  <Dialog
    :open="dialogVisible"
    @update:open="(val) => (dialogVisible = val)"
  >
    <DialogContent
      class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none knowledge-dialog"
    >
    <div class="knowledge-dialog-content">
      <div class="knowledge-toolbar">
        <div class="relative" style="width: 280px">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            v-model="searchKeyword"
            placeholder="搜索知识标题或内容"
            class="pl-8"
            @keyup.enter="handleSearch"
          />
        </div>
        <Select v-model="filterCategory" @update:model-value="handleSearch">
          <SelectTrigger style="width: 140px">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="css-trick">CSS技巧</SelectItem>
            <SelectItem value="color-value">颜色值</SelectItem>
            <SelectItem value="code-config">代码配置</SelectItem>
            <SelectItem value="design-principle">设计原则</SelectItem>
            <SelectItem value="template-tip">模板技巧</SelectItem>
            <SelectItem value="other">其他</SelectItem>
          </SelectContent>
        </Select>
        <Button @click="handleSearch">搜索</Button>
        <Button variant="outline" @click="resetSearch">重置</Button>
        <div class="toolbar-spacer"></div>
        <Button @click="handleCreate">
          <Plus class="w-3.5 h-3.5 mr-1" />
          新增
        </Button>
      </div>

      <div class="knowledge-content">
        <div v-if="loading" class="loading-state">加载中...</div>
        <div v-else-if="list.length === 0" class="empty-state">
          <Collection class="empty-icon w-16 h-16" />
          <div class="empty-text">暂无知识条目</div>
          <div class="empty-hint">点击"新增"录入设计知识</div>
        </div>

        <div v-else class="knowledge-grid">
          <div
            v-for="item in list"
            :key="item.id"
            class="knowledge-card"
            @click="handleEdit(item)"
          >
            <div class="card-header">
              <span class="card-title">{{ item.title }}</span>
              <Badge :variant="getCategoryType(item.category)">
                {{ getCategoryLabel(item.category) }}
              </Badge>
            </div>
            <div class="card-content">{{ truncateContent(item.content) }}</div>
            <div class="card-footer">
              <div class="card-tags">
                <Badge
                  v-for="tag in (item.tags || []).slice(0, 3)"
                  :key="tag"
                  variant="secondary"
                  class="tag-item"
                >
                  {{ tag }}
                </Badge>
                <Badge
                  v-if="(item.tags || []).length > 3"
                  variant="secondary"
                  class="tag-item"
                >
                  +{{ item.tags.length - 3 }}
                </Badge>
              </div>
              <div class="card-actions">
                <Button variant="link" size="sm" @click.stop="handleEdit(item)">
                  编辑
                </Button>
                <Button variant="link" size="sm" class="text-destructive hover:text-destructive" @click.stop="handleDelete(item)">
                  删除
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="knowledge-pagination" v-if="total > pageSize">
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">共 {{ total }} 条</span>
          <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage = currentPage - 1; loadList()">
            上一页
          </Button>
          <span class="text-xs text-muted-foreground">{{ currentPage }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}</span>
          <Button variant="outline" size="sm" :disabled="currentPage >= Math.max(1, Math.ceil(total / pageSize))" @click="currentPage = currentPage + 1; loadList()">
            下一页
          </Button>
        </div>
      </div>
    </div>

    <edit-dialog
      v-model:visible="editDialogVisible"
      :edit-data="currentEditItem"
      @success="handleEditSuccess"
    />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { confirm as uiConfirm } from '@/components/ui/confirm';
import { message } from '@/common/message';
import { Plus, Search, Library as Collection } from "lucide-vue-next";
import {
  getDesignKnowledgePage,
  deleteDesignKnowledge,
} from "@/api";
import EditDialog from "./edit-dialog.vue";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const dialogVisible = ref(false);

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) loadList();
  },
);

watch(dialogVisible, (val) => {
  emit("update:visible", val);
});

const loading = ref(false);
const list = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const searchKeyword = ref("");
const filterCategory = ref("");

const editDialogVisible = ref(false);
const currentEditItem = ref<any>(null);

const categoryMap: Record<string, { label: string; type: string }> = {
  "css-trick": { label: "CSS技巧", type: "default" },
  "color-value": { label: "颜色值", type: "success" },
  "code-config": { label: "代码配置", type: "warning" },
  "design-principle": { label: "设计原则", type: "destructive" },
  "template-tip": { label: "模板技巧", type: "secondary" },
  other: { label: "其他", type: "secondary" },
};

function getCategoryLabel(category: string) {
  return categoryMap[category]?.label || category;
}

function getCategoryType(category: string) {
  return (categoryMap[category]?.type as any) || "secondary";
}

function truncateContent(content: string) {
  if (!content) return "";
  return content.length > 150 ? content.slice(0, 150) + "..." : content;
}

async function loadList() {
  loading.value = true;
  try {
    const res = await getDesignKnowledgePage({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      category: filterCategory.value === "all" ? undefined : (filterCategory.value || undefined),
    });
    list.value = res?.list || [];
    total.value = res?.total || 0;
  } catch (error) {
    console.error("加载知识列表失败:", error);
    message.error("加载知识列表失败");
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1;
  loadList();
}

function resetSearch() {
  searchKeyword.value = "";
  filterCategory.value = "";
  currentPage.value = 1;
  loadList();
}

function handleSizeChange() {
  currentPage.value = 1;
  loadList();
}

function handleCreate() {
  currentEditItem.value = null;
  editDialogVisible.value = true;
}

function handleEdit(item: any) {
  currentEditItem.value = { ...item };
  editDialogVisible.value = true;
}

async function handleDelete(item: any) {
  try {
    const okDelete = await uiConfirm({
      title: "确认删除",
      description: `确定要删除知识条目"${item.title}"吗？`,
      okText: "确定",
      cancelText: "取消",
    });
    if (!okDelete) return;
    await deleteDesignKnowledge({ ids: [item.id] });
    message.success("删除成功");
    loadList();
  } catch (error) {
    if (error !== "cancel") {
      message.error("删除失败");
    }
  }
}

function handleEditSuccess() {
  loadList();
}
</script>

<style scoped>
.knowledge-dialog-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.knowledge-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--1s-border-color);
}

.toolbar-spacer {
  flex: 1;
}

.knowledge-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--1s-text-color-secondary);
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--1s-text-color-tertiary);
}

.empty-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: var(--1s-text-color-tertiary);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--1s-text-color-secondary);
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.knowledge-card {
  padding: 16px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--1s-surface-background);
}

.knowledge-card:hover {
  border-color: var(--1s-accent-color);
  
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--1s-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220px;
}

.card-content {
  font-size: 13px;
  color: var(--1s-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag-item {
  font-size: 11px;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.knowledge-card:hover .card-actions {
  opacity: 1;
}

.knowledge-pagination {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid var(--1s-border-color);
}
</style>
