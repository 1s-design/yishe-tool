

<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-07-17 18:51:54
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-07-23 05:35:48
 * @FilePath: /design-server/Users/jackie/workspace/1s/src/components/design/layout/project/customModel/customModelModal/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <Dialog v-bind="$attrs" v-model:open="show">
    <DialogContent class="max-w-[1200px] w-[1200px]">
      <div class="project-detail-layout flex gap-6">
        <!-- 左侧：3D模型预览 -->
        <div class="project-detail-col flex-[14] min-w-0">
          <div class="project-detail-viewer">
            <gltf-viewer
              v-if="show && detailInfo"
              :model="detailInfo.meta.modelInfo"
              style="width: 100%; height: 100%;"
            />
          </div>
        </div>

        <!-- 右侧：模型信息 -->
        <div class="project-detail-col flex-[10] min-w-0">
          <div class="project-detail-side">
            <!-- 模型基本信息 -->
            <div>
              <h1 class="project-detail-title">
                {{ detailInfo.name || "--" }}
              </h1>
              <p class="project-detail-desc">
                {{ detailInfo.description || "暂无描述" }}
              </p>

              <!-- 缩略图 -->
              <div v-if="detailInfo.thumbnail" class="project-detail-thumbnail-wrap">
                <img
                  :src="detailInfo.thumbnail"
                  class="project-detail-thumbnail object-cover"
                />
              </div>
            </div>

            <!-- 上传者信息 -->
            <div class="project-detail-uploader flex items-center">
              <Avatar class="h-10 w-10">
                <AvatarImage :src="detailInfo?.uploader?.avatar" alt="?" />
                <AvatarFallback>
                  <User class="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div class="project-detail-uploader-name">{{ detailInfo.uploader?.name || "--" }}</div>
                <div class="project-detail-uploader-label">上传者</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useCustomModelDetailModal } from "./index.ts";
import gltfViewer from "@/components/model/gltfViewer/index.vue";
import { User } from 'lucide-vue-next';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { saveAs } from "file-saver";

const { show, detailInfo } = useCustomModelDetailModal();

function downloadThumbnail(item) {
  return saveAs(item.url, "thumbnail");
}
</script>

<style lang="less">
.project-detail-layout {
  height: 560px;
  margin: 24px 12px;
  overflow: auto;
}

.project-detail-col {
  height: 100%;
}

.project-detail-viewer {
  height: 100%;
  background: var(--1s-control-surface-muted);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--1s-control-border-color);
}

.project-detail-side {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--project-text-primary, var(--1s-text-color));
}

.project-detail-title {
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 700;
  color: var(--project-text-primary, var(--1s-text-color));
}

.project-detail-desc {
  margin-bottom: 24px;
  color: var(--project-text-secondary, var(--1s-text-color-secondary));
  line-height: 1.6;
}

.project-detail-thumbnail-wrap {
  margin-bottom: 24px;
}

.project-detail-thumbnail {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--1s-control-border-color);
  box-shadow: var(--1s-shadow-sm);
}

.project-detail-uploader {
  column-gap: 1rem;
  padding-top: 16px;
  border-top: 1px solid var(--1s-border-color);
}

.project-detail-uploader-name {
  font-weight: 700;
  color: var(--project-text-primary, var(--1s-text-color));
}

.project-detail-uploader-label {
  font-size: 12px;
  color: var(--project-text-tertiary, var(--1s-text-color-tertiary));
}
</style>
