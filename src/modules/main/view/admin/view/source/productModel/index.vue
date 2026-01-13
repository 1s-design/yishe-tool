<template>
  <div>
    <s1Table v-bind="gridOptions">
      <template #toolbar-left>
        <el-button plain @click="handleCreate"> 添加 </el-button>
      </template>
      <template #toolbar-right>
        <el-button plain @click="refresh" :icon="RefreshRight"> </el-button>
      </template>

      <template #thumbnailDefault="{ row }">
        <s1-image
          :src="row.thumbnail?.url"
          style="width: 100px; height: 100px"
        ></s1-image>
      </template>

      <template #operationDefault="{ row }">
        <el-button link @click="handleUpdate(row)"> 修改 </el-button>
        <el-button link type="danger" @click="handleDelete(row)"> 删除 </el-button>
      </template>
    </s1Table>
    <s1Pagination
      :total="total"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
    >
    </s1Pagination>
    <a-modal
      v-model:open="showModal"
      title="基础商品模型信息"
      @ok="handleOk"
      centered
      @cancel="close"
      :afterClose="close"
      width="820px"
      :destroyOnClose="true"
      :confirmLoading="confirmLoading"
    >
      <div style="margin: 24px 0">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="64px">
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="名称" prop="name">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="描述" prop="description">
                <el-input v-model="form.description" type="textarea"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="关键字" prop="keywords">
                <s1-tagsInput v-model="form.keywords" :string="true"> </s1-tagsInput>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item v-if="modalType == 'create'" label="模型文件" prop="file">
                <el-upload
                  ref="uploadRef"
                  :limit="1"
                  :on-exceed="handleExceed"
                  :auto-upload="false"
                  accept=".glb"
                  class="w-full"
                  :on-change="onChange"
                  :on-remove="onRemove"
                >
                  <template #trigger>
                    <el-button type="primary">选择模型文件</el-button>
                  </template>
                  <template #tip>
                    <div class="el-upload__tip text-red">支持glb文件</div>
                  </template>
                </el-upload>
              </el-form-item>

              <el-form-item v-else label="提示">
                <a-alert show-icon message="模型文件上传后不允许修改" type="warning" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="模型预览">
                <s1-base-gltf-viewer
                  ref="baseViewerRef"
                  style="width: 240px; height: 240px; background: #f5f6f7"
                  :src="objectUrl"
                ></s1-base-gltf-viewer>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <a-button @click="close">取消</a-button>
        <a-button v-if="modalType == 'update'" @click="handleOk()" type="primary"
          >更新缩略图并保存</a-button
        >
        <a-button @click="handleOk" :loading="confirmLoading" type="primary"
          >确定</a-button
        >
      </template>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeMount, computed } from "vue";
import Api from "@/api";
import { usePaging } from "@/hooks/data/paging";
import { message } from "ant-design-vue";
import { RefreshRight } from "@element-plus/icons-vue";
import { s1Confirm } from "@/common/message";
import { genFileId } from "element-plus";

const {
  list,
  total,
  currentPage,
  pageSize,
  loading,
  refresh,
  reset,
  getList,
} = usePaging(
  (params) => {
    return Api.getProductModelList({
      ...params,
    });
  },
  {
    isSinglePageMode: true,
  }
);

const rules = ref({
  name: [
    {
      required: true,
      trigger: "change",
      message: "",
    },
  ],
  url: [
    {
      required: true,
      trigger: "change",
      message: "",
    },
  ],
  file: [
    {
      required: true,
      trigger: "change",
      message: "请选择模型文件",
    },
  ],
});

const gridOptions = ref({
  columns: [
    { type: "seq", width: 60 },
    {
      field: "thumbnail",
      title: "缩略图",
      width: 120,
      slots: {
        default: "thumbnailDefault",
      },
    },
    { field: "name", title: "模型名称", width: 160, showOverflow: true },
    { field: "description", title: "描述", minWidth: 240 },
    { field: "keywords", title: "关键字", width: 160 },
    {
      field: "operation",
      fixed: "right",
      width: "120",
      title: "操作",
      slots: {
        default: "operationDefault",
      },
    },
  ],
  data: list,
  loading: loading,
});

const formRef = ref();

const form = ref({
  name: "",
} as any);

const baseViewerRef = ref();

const objectUrl = computed(() => {
  return form.value.file?.raw
    ? URL.createObjectURL(form.value.file?.raw)
    : form.value.url;
});

const modalType = ref();

const showModal = ref(false);

function close() {
  form.value = {};
  showModal.value = false;
}

const confirmLoading = ref(false);

function onChange(e) {
  form.value.file = e;
}

function onRemove() {
  form.value.file = null;
}

const uploadRef = ref();
const handleExceed = (files) => {
  uploadRef.value!.clearFiles();
  const file = files[0];
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
};

async function handleOk() {
  await formRef.value.validate();

  confirmLoading.value = true;

  // 获取用户账号
  let userAccount = 'anonymous'
  try {
    const { getLocalUserInfo } = await import('@/store/stores/loginAction')
    const userInfo = getLocalUserInfo()
    userAccount = userInfo?.account || userInfo?.name || 'anonymous'
  } catch (e) {
    console.warn('无法获取用户信息:', e)
  }

  if (modalType.value == "create") {
    let { url } = await Api.uploadToCOS({ 
      file: form.value.file.raw,
      category: 'product-model',
      account: userAccount
    });

    let cos = await Api.uploadToCOS({
      file: baseViewerRef.value.getScreenShotFile(),
      category: 'product-model',
      account: userAccount,
      isThumbnail: true
    });

    await Api.createProductModel({
      name: form.value.name,
      description: form.value.description,
      keywords: form.value.keywords,
      url: url,
      thumbnail: cos,
    });
    reset();
    await getList();
    message.success("创建成功");
  } else if (modalType.value == "update") {
    let cos = await Api.uploadToCOS({
      file: baseViewerRef.value.getScreenShotFile(),
      category: 'product-model',
      account: userAccount,
      entityId: form.value.id, // 编辑时使用模型 ID
      isThumbnail: true
    });

    // 删除旧的缩略图

    await Api.deleteCOSFile(form.value.thumbnail.key);

    await Api.updateProductModel({
      id: form.value.id,
      name: form.value.name,
      description: form.value.description,
      keywords: form.value.keywords,
      thumbnail: cos,
    });
    refresh();
    message.success("更新成功");
  }
  showModal.value = false;
  confirmLoading.value = false;
}

async function handleCreate() {
  modalType.value = "create";
  showModal.value = true;
}

function handleUpdate(row) {
  modalType.value = "update";
  showModal.value = true;
  form.value = {
    ...row,
  };
}

async function handleDelete(row) {
  await s1Confirm({
    content: "确认删除吗?",
    okButtonProps: {
      danger: true,
    },
  });

  await Api.deleteCOSFile(row.url);

  await Api.deleteProductModel({
    id: row.id,
  });
  refresh();
  message.success("删除成功");
}
</script>

<style></style>
