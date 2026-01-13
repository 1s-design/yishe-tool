<template>
  <div class="image-list-uploader">
    <el-upload
      v-model:file-list="fileList"
      :auto-upload="false"
      accept="image/*"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      multiple
      :on-change="handleChange"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
  </div>

  <el-dialog v-model="dialogVisible">
    <img
      style="width: 100%; max-height: 480px; object-fit: contain"
      :src="dialogImageUrl"
      alt="Preview Image"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import Api from "@/api";
import { message } from "ant-design-vue";

/**
 * 这里采用的策略为选择及上传，删除即删除
 */

const model = defineModel({
  default: [],
});

const fileList = ref([]);

fileList.value = [...(model.value || [])];

const dialogImageUrl = ref("");
const dialogVisible = ref(false);

const deleteList = ref([]);
const handleRemove = (uploadFile, uploadFiles) => {
  // 这里应该在确定保存再删除
  if (uploadFile.key) {
    deleteList.value.push(uploadFile);
  }
};

const uploadList = ref([]);

// 选择文件 , 多选会多次触发
async function handleChange(e) {
  uploadList.value.push(e);
}

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

watch(fileList, () => {
  console.log(fileList);
});

/**
 * @method 同步上传操作 ,包括新增的和删除的
 */
async function upload(category?: string, entityId?: string | number) {
  // 获取用户账号
  let userAccount = 'anonymous'
  try {
    const { getLocalUserInfo } = await import('@/store/stores/loginAction')
    const userInfo = getLocalUserInfo()
    userAccount = userInfo?.account || userInfo?.name || 'anonymous'
  } catch (e) {
    console.warn('无法获取用户信息:', e)
  }

  await Promise.all(
    uploadList.value.map((u) => {
      return new Promise(async (resolve, reject) => {
        let cos = await Api.uploadToCOS({ 
          file: u.raw,
          category: category || 'manual', // 默认使用 manual，调用方可以传入
          account: userAccount,
          entityId: entityId
        });
        u.url = cos.url;
        u.key = cos.key;
        resolve(void 0);
      });
    })
  );

  await Promise.all(
    deleteList.value.map((u) => {
      return new Promise(async (resolve, reject) => {
        let cos = await Api.deleteCOSFile(u.key);
        resolve(void 0);
      });
    })
  );

  model.value = fileList.value.map((item) => {
    return {
      url: item.url,
      key: item.key,
    };
  });
}

defineExpose({
  upload,
});
</script>

<style lang="less">
.image-list-uploader {
  .el-upload--picture-card,
  .el-upload-list__item {
    width: 108px;
    height: 108px;
  }
}
</style>
