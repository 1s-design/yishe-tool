<template>
  <div class="image-list-uploader">
    <div class="upload-list">
      <div
        v-for="(item, index) in fileList"
        :key="index"
        class="upload-card"
        @click="handlePictureCardPreview(item)"
      >
        <img :src="item.url" class="upload-card-image" alt="" />
        <div class="upload-card-actions">
          <ZoomIn
            class="h-5 w-5 cursor-pointer text-white"
            @click.stop="handlePictureCardPreview(item)"
          />
          <Trash2
            class="h-5 w-5 cursor-pointer text-white"
            @click.stop="fileList.splice(index, 1); handleRemove(item, fileList)"
          />
        </div>
      </div>
      <label class="upload-card upload-card-add">
        <Plus class="h-6 w-6 text-muted-foreground" />
        <input
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="
            (e) => {
              const input = e.target as HTMLInputElement;
              Array.from(input.files || []).forEach((f) => {
                const item = { name: f.name, raw: f, url: objectUrl(f) };
                fileList.push(item);
                handleChange(item);
              });
              input.value = '';
            }
          "
        />
      </label>
    </div>
  </div>

  <Dialog v-model:open="dialogVisible">
    <DialogContent class="max-w-3xl">
      <img
        class="w-full max-h-[480px] object-contain"
        :src="dialogImageUrl"
        alt="Preview Image"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
const objectUrl = (f: File) => URL.createObjectURL(f)

import { ref, watch } from "vue";
import { Plus, ZoomIn, Trash2 } from "lucide-vue-next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Api from "@/api";
import { message } from '@/common/message';

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
  let userId
  try {
    const { getLocalUserInfo } = await import('@/store/stores/loginAction')
    const userInfo = getLocalUserInfo()
    const currentUser = userInfo?.userInfo || userInfo || {}
    userAccount = currentUser?.account || currentUser?.name || 'anonymous'
    userId = currentUser?.id
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
          userId: userId,
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
  .upload-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .upload-card {
    width: 108px;
    height: 108px;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
  }

  .upload-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .upload-card-actions {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .upload-card:hover .upload-card-actions {
    opacity: 1;
  }

  .upload-card-add {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--1s-border-color, #dcdfe6);
  }
}
</style>
