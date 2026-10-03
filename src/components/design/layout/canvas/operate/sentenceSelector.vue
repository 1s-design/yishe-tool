<template>
  <Dialog :modal="false" v-model:open="visible">
    <DialogContent class="max-w-[800px] w-[800px]">
      <DialogHeader>
        <DialogTitle>选择句子</DialogTitle>
      </DialogHeader>
      <div class="sentence-selector">
        <!-- 搜索框 -->
        <div class="mb-4">
          <div class="relative">
            <Search class="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              v-model="searchText"
              placeholder="搜索句子内容"
              class="pl-7"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- 句子列表 -->
        <div class="sentence-list max-h-[400px] overflow-y-auto">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="sentence-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
            @click="selectSentence(item)"
          >
            <div class="text-lg font-medium text-gray-800 mb-1">
              {{ item.content }}
            </div>
            <div v-if="item.description" class="text-sm text-gray-600">
              {{ item.description }}
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="mt-4 flex items-center justify-between gap-2">
          <div class="text-xs text-muted-foreground">
            共 {{ total }} 条
          </div>
          <div class="flex items-center gap-2">
            <Select :model-value="String(pageSize)" @update:model-value="v => handleSizeChange(Number(v))">
              <SelectTrigger class="h-6 text-[11px] w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in [10, 20, 30]" :key="s" :value="String(s)">
                  {{ s }} 条/页
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage <= 1"
              @click="handleCurrentChange(currentPage - 1)"
            >
              上一页
            </Button>
            <span class="text-xs text-muted-foreground">{{ currentPage }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}</span>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage >= Math.max(1, Math.ceil(total / pageSize))"
              @click="handleCurrentChange(currentPage + 1)"
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Search } from 'lucide-vue-next';
import Api from '@/api';
import { message } from '@/common/message';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'select': [sentence: any];
}>();

// 数据状态
const list = ref([]);
const loading = ref(false);
const searchText = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const filteredList = computed(() => {
  if (!searchText.value) {
    return list.value;
  }
  return list.value.filter(item => 
    item.content.toLowerCase().includes(searchText.value.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchText.value.toLowerCase()))
  );
});

// 获取句子列表
async function getList() {
  loading.value = true;
  try {
    const res = await Api.getSentenceList({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    list.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('获取句子列表失败:', error);
    message.error('获取句子列表失败');
  } finally {
    loading.value = false;
  }
}

// 处理搜索
function handleSearch() {
  // 实时搜索，不需要重新请求API
}

// 处理页码改变
function handleCurrentChange(val: number) {
  currentPage.value = val;
  getList();
}

// 处理每页条数改变
function handleSizeChange(val: number) {
  pageSize.value = val;
  currentPage.value = 1;
  getList();
}

// 选择句子
function selectSentence(sentence: any) {
  emit('select', sentence);
  visible.value = false;
}

// 监听模态框打开
function handleVisibleChange(val: boolean) {
  if (val) {
    getList();
  }
}

onMounted(() => {
  // 监听visible变化
  watch(() => props.visible, handleVisibleChange);
});
</script>

<style scoped lang="less">
.sentence-selector {
  .sentence-item {
    &:hover {
      
    }
  }
}
</style> 