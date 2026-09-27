<template>
  <Dialog :modal="false" v-model:open="showShareCardModal">
    <DialogContent class="max-w-[540px] w-[540px]">
      <DialogHeader>
        <DialogTitle>分享卡片</DialogTitle>
      </DialogHeader>
      <div
        style="height: 640px; overflow: auto; row-gap: 24px"
        class="flex flex-col justify-center items-center"
      >
        <shareCard ref="shareCardRef" :info="shareCardCustomModelInfo"></shareCard>

        <div>
          <Button class="rounded-full" @click="copy"> 复制链接 </Button>
          <Button class="rounded-full" @click="download"> 下载卡片 </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  openShareCardModal,
  showShareCardModal,
  createCustomModelShareLink,
  shareCardCustomModelInfo,
} from "./index.ts";
import { ref, unref } from "vue";
import shareCard from "./shareCard.vue";
import { message } from '@/common/message';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const shareCardRef = ref();

function copy() {
  navigator.clipboard.writeText(createCustomModelShareLink());
  message.success("链接复制成功");
}

function download() {
  shareCardRef.value.download();
}
</script>

<style scoped lang="less"></style>
