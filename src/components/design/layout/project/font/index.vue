<template>
  <div class="project-page flex flex-col min-h-full">
    <div class="flex-1 relative">
      <div class="grid grid-cols-1 gap-3 w-full p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        <div
          v-for="item in list"
          class="project-card project-gallery-card"
        >
          <s1-image
            padding="5%"
            :src="item.thumbnail"
            @click="itemClick(item)"
            class="project-thumb project-gallery-card__media"
          >
            <s1-icon
              v-if="item.uploader?.isAdmin"
              name="official-badge"
              class="absolute right-[5%] top-[5%] opacity-80"
              :size="18"
            ></s1-icon>
          </s1-image>
          <div class="project-gallery-card__body">
            <div class="project-gallery-card__content">
              <div class="project-gallery-card__title text-ellipsis">
                {{ item.name || "未命名" }}
              </div>
              <div class="project-gallery-card__meta">
                <div class="project-tag project-tag--accent" v-if="item.isPublic">已共享</div>
                <div
                  class="project-tag"
                  v-if="item?.uploader?.account == loginStore.userInfo?.account"
                >
                  我
                </div>
                <div class="project-timeago">{{ Utils.time.timeago(item.updateTime) }}</div>
              </div>
            </div>

            <a-dropdown trigger="click" class="project-gallery-card__actions">
              <el-button link class="project-action-button">
                <el-icon size="12">
                  <MoreFilled />
                </el-icon>
              </el-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="edit(item)"> 编辑基本信息 </a-menu-item>
                  <a-menu-item @click="deleteItem(item)">
                    <span style="color: var(--el-color-danger)"> 删除</span>
                  </a-menu-item>
                  <a-menu-item> 分享给好友 </a-menu-item>
                  <a-menu-item> 发布 </a-menu-item>
                  <a-menu-item @click="downloadFile(item)"> 下载源文件 </a-menu-item>
                  <a-menu-item @click="downloadThumbnail(item)"> 下载缩略图 </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
      <div v-if="loading" class="project-loading-overlay absolute inset-0 flex items-center justify-center">
        <div class="project-loading-overlay__spinner">
          <el-icon class="animate-spin text-lg"><Loading /></el-icon>
        </div>
      </div>
      <s1-empty v-if="isEmpty">
        <template #description> 暂无字体 </template>
      </s1-empty>
    </div>
    
    <div class="project-footer">
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

  <a-modal
    v-model:open="showPreviewModal"
    :footer="null"
    :centered="true"
    :destroyOnClose="true"
    style="min-width: 980px"
    width="980px"
  >
    <div class="flex">
      <s1-img
        :src="currentItem.thumbnail"
        style="width: 480px; height: 480px; flex-shrink: 0"
      >
      </s1-img>
      <div style="padding: 24px; row-gap: 12px" class="flex flex-col">
        <h1>{{ currentItem.name }}</h1>
        <h6>{{ currentItem.description }}</h6>
        <h6>{{ currentItem.keywords }}</h6>
        <h6>{{ currentItem.updateTime }}</h6>
      </div>
    </div>
  </a-modal>

  <a-modal
    v-model:open="showFormModal"
    :centered="true"
    :destroyOnClose="true"
    width="540px"
    title="更新信息"
    okText="修改"
    cancelText="取消"
    @ok="ok"
    :confirmLoading="submitLoading"
  >
    <el-form style="padding: 24px 12px">
      <el-form-item label="名称">
        <el-input v-model="editForm.name" placeholder="名称"></el-input
      ></el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editForm.description" placeholder="描述"></el-input
      ></el-form-item>
      <el-form-item label="标签">
        <tagsInput
          v-model="editForm.keywords"
          :string="true"
          :autocomplete-tags="fontAutoplacementTags"
        >
        </tagsInput>
      </el-form-item>
    </el-form>
  </a-modal>
</template>

<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import { MoreFilled, Loading } from "@element-plus/icons-vue";
import { useLoadingOptions } from "@/components/loading/index.tsx";
import { currentOperatingCanvasChild } from "@/components/design/layout/canvas/index.tsx";
import Utils from "@/common/utils";
import Api from "@/api";
import { s1Confirm } from "@/common/message";
import { message } from "ant-design-vue";
import { useLoginStatusStore } from "@/store/stores/login";
import { fontAutoplacementTags } from "@/components/design/components/tagsInput";
import { getFontList, deleteFontTemplate } from "@/api";

const loginStore = useLoginStatusStore();

const loadingOptions = useLoadingOptions({});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const list = ref([]);
const loading = ref(false);
const isEmpty = ref(false);

// 获取列表数据
async function getList() {
  loading.value = true;
  try {
    const res = await getFontList({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    list.value = res.list;
    total.value = res.total;
    isEmpty.value = list.value.length === 0;
  } catch (error) {
    console.error(error);
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

// 重置
function reset() {
  currentPage.value = 1;
  getList();
}

onBeforeMount(() => {
  getList();
});

async function deleteItem(item) {
  await s1Confirm({
    content: "确认删除该字体？",
  });

  await deleteFontTemplate({ id: item.id });
  reset();
  await getList();
  message.success("删除成功");
}

function downloadFile(item) {
  Api.downloadCOSFile(item.url);
}

function downloadThumbnail(item) {
  Api.downloadCOSFile(item.thumbnail);
}

const currentItem = ref({} as any);

const showPreviewModal = ref(false);

function itemClick(item) {
  currentItem.value = item;
  showPreviewModal.value = true;
}

const showFormModal = ref(false);

const submitLoading = ref(false);
const editForm = ref({} as any);
// 编辑
function edit(item) {
  editForm.value = {
    id: item.id,
    description: item.description,
    name: item.name,
    keywords: item.keywords,
  };


  currentItem.value = item;
  showFormModal.value = true;
}

async function ok() {
  submitLoading.value = true;
  let res = await Api.updateFontTemplate(editForm.value);
  message.success("修改成功");
  submitLoading.value = false;
  await getList()
  showFormModal.value = false;
}
</script>

<style scoped lang="less">
</style>
