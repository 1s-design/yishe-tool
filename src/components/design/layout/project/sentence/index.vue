<template>
  <div class="project-page flex flex-col min-h-screen">
    <div class="flex-1 relative">
      <!-- 顶部操作栏 -->
      <div class="project-toolbar flex justify-between items-center p-4">
        <h2 class="project-section-title text-lg font-semibold">句子管理</h2>
        <el-button type="primary" @click="showFormModal = true">
          <el-icon><Plus /></el-icon>
          添加句子
        </el-button>
      </div>

      <!-- 句子列表 -->
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div
            v-for="item in list"
            :key="item.id"
            class="project-card rounded-lg p-3 project-hover-lift min-h-[120px]"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <div class="project-placeholder-text text-xs mb-1">
                  ID: {{ item.id }}
                </div>
                <div class="project-section-title leading-relaxed text-2xl font-medium min-h-[50px] mb-1">
                  {{ item.content }}
                </div>
                <div v-if="item.description" class="project-muted-text text-sm leading-relaxed">
                  {{ item.description }}
                </div>
              </div>
              <a-dropdown trigger="click">
                <el-button link>
                  <el-icon size="14">
                    <MoreFilled />
                  </el-icon>
                </el-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="editItem(item)">编辑</a-menu-item>
                    <a-menu-item @click="deleteItem(item)">
                      <span style="color: var(--el-color-danger)">删除</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
            
            <div class="project-placeholder-text flex justify-between items-center text-xs">
              <span>创建: {{ Utils.time.timeago(item.createdAt) }}</span>
              <span>更新: {{ Utils.time.timeago(item.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="project-loading-overlay absolute inset-0 flex items-center justify-center">
        <el-icon class="animate-spin text-2xl"><Loading /></el-icon>
      </div>

      <!-- 空状态 -->
      <s1-empty v-if="isEmpty">
        <template #description>暂无句子</template>
      </s1-empty>
    </div>
    
    <!-- 分页 -->
    <div class="project-footer sticky bottom-0 left-0 right-0 py-4">
      <div class="mx-auto flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 40, 60, 80]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>

  <!-- 创建/编辑模态框 -->
  <a-modal
    v-model:open="showFormModal"
    :centered="true"
    :destroyOnClose="true"
    width="600px"
    :title="isEdit ? '编辑句子' : '添加句子'"
    :okText="isEdit ? '保存' : '创建'"
    cancelText="取消"
    @ok="handleSubmit"
    :confirmLoading="submitLoading"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="内容" required>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请输入句子内容"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述信息（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </a-modal>
</template>

<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import { MoreFilled, Loading, Plus } from "@element-plus/icons-vue";
import Utils from "@/common/utils";
import Api from "@/api";
import { s1Confirm } from "@/common/message";
import { message } from "ant-design-vue";

// 数据状态
const list = ref([]);
const loading = ref(false);
const isEmpty = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 表单相关
const showFormModal = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const form = ref({
  id: null,
  content: '',
  description: ''
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
    isEmpty.value = list.value.length === 0;
  } catch (error) {
    console.error('获取句子列表失败:', error);
    message.error('获取句子列表失败');
  } finally {
    loading.value = false;
  }
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

// 创建句子
async function createSentence(data) {
  try {
    const res = await Api.createSentence(data);
    return res;
  } catch (error) {
    console.error('创建句子失败:', error);
    throw error;
  }
}

// 更新句子
async function updateSentence(id, data) {
  try {
    const res = await Api.updateSentence(id, data);
    return res;
  } catch (error) {
    console.error('更新句子失败:', error);
    throw error;
  }
}

// 删除句子
async function deleteSentence(id) {
  try {
    const res = await Api.deleteSentence(id);
    return res;
  } catch (error) {
    console.error('删除句子失败:', error);
    throw error;
  }
}

// 编辑句子
function editItem(item) {
  isEdit.value = true;
  form.value = {
    id: item.id,
    content: item.content,
    description: item.description
  };
  showFormModal.value = true;
}

// 删除句子
async function deleteItem(item) {
  try {
    await s1Confirm({
      content: `确认删除句子"${item.content.substring(0, 20)}..."？`,
    });
    
    await deleteSentence(item.id);
    message.success('删除成功');
    await getList();
  } catch (error) {
    if (error) {
      message.error('删除失败');
    }
  }
}

// 提交表单
async function handleSubmit() {
  if (!form.value.content.trim()) {
    message.error('请输入句子内容');
    return;
  }

  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await updateSentence(form.value.id, { content: form.value.content, description: form.value.description });
      message.success('更新成功');
    } else {
      await createSentence({ content: form.value.content, description: form.value.description });
      message.success('创建成功');
    }
    
    showFormModal.value = false;
    resetForm();
    await getList();
  } catch (error) {
    message.error(isEdit.value ? '更新失败' : '创建失败');
  } finally {
    submitLoading.value = false;
  }
}

// 重置表单
function resetForm() {
  form.value = {
    id: null,
    content: '',
    description: ''
  };
  isEdit.value = false;
}

// 监听模态框关闭
function handleModalClose() {
  resetForm();
}

onBeforeMount(() => {
  getList();
});
</script>

<style scoped lang="less">
.sentence-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
