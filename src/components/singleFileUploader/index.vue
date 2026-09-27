<template>
  <div class="single-file-uploader">
    <input
      ref="uploadRef"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleExceed"
    />
    <Button @click="uploadRef?.click()">选择文件</Button>
    <div class="text-xs text-muted-foreground mt-1">{{ tip }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Api from "@/api";
import { message } from '@/common/message';

/**
 * 这里采用的策略为选择及上传，删除即删除
 */

const props = defineProps({
  tip: {
    default: "",
  },
  accept: {
    default: "*",
  },
});

const model = defineModel({
  default: [],
});

const uploadRef = ref();

const handleExceed = (e) => {
  const input = e.target;
  const file = input.files?.[0];
  // limit 1：始终只保留最后一次选择的文件
  model.value = file ? [file] : [];
};

/**
 * @method 同步上传操作 ,包括新增的和删除的
 */
async function upload() {}

defineExpose({
  upload,
});
</script>

<style lang="less"></style>
