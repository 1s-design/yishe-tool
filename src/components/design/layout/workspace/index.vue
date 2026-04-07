<template>
  <div class="container">
    <div class="info">
      <div class="preview">
        <base-gltf-viewer
          class="workspace-preview-viewer"
          :src="currentOperatingBaseModelInfo?.url"
        ></base-gltf-viewer>
      </div>
    </div>
    <div class="decal">
      <div class="decal-content" v-if="currentModelController?.decalControllers.length">
        <template
          v-for="(decal, index) in currentModelController.decalControllers"
          :key="index"
        >
          <div
            class="decal-item"
            @click="decalItemClick(decal)"
            :class="{ active: isMouseover(decal) || isCurrent(decal) }"
          >
            <s1-img
              :src="decal.state.src"
              fit="contain"
              class="decal-item-image"
            ></s1-img>
            <div class="decal-item-content">
              <div class="decal-item-content-title text-ellipsis">
                {{ decal.info.name }}
              </div>
              <div class="decal-item-content-desc text-ellipsis">
                添加于 {{ formatDate(decal.createdAt) }}
              </div>
            </div>
            <div style="flex: 1"></div>
            <div class="decal-item-bar">
              <el-button-group>
                <el-button link round :icon="iconMore"> </el-button>
                <el-button link round @click="setting(decal)" :icon="iconSetting">
                </el-button>
                <el-popconfirm
                  title="确定要移除该贴纸吗？"
                  @confirm="removeDecal(decal)"
                  confirm-button-type="danger"
                >
                  <template #reference>
                    <el-button link round type="danger" :icon="iconDelete"> </el-button>
                  </template>
                </el-popconfirm>
              </el-button-group>
            </div>
          </div>
        </template>
      </div>
      <template v-else>
        <div class="w-full h-full flex items-center justify-center">暂无贴纸</div>
      </template>
    </div>

    <div class="bottom">
      <el-button-group type="primary">
        <el-button @click="clear">
          <span> 清空当前场景 </span>
        </el-button>
        <!-- <el-button>
          <span> 上传 </span>
        </el-button>
        <el-button>
          <span> 上传 </span>
        </el-button>
        <el-button>
          <span> 上传 </span>
        </el-button>
        <el-button>
          <span> 上传 </span>
        </el-button> -->
      </el-button-group>
    </div>
  </div>
</template>
<script setup>
import {
  currentOperatingBaseModelInfo,
  currentModelController,
  showSaveModel,
  currentOperatingDecalController,
  showDecalControl,
  viewDisplayController,
  showWorkspace,
} from "../../store";
import { computed, ref } from "vue";
import baseGltfViewer from "@/components/model/baseGltfViewer/index.vue";
import { useNow, useDateFormat } from "@vueuse/core";
import { MoreFilled, CloseBold, Edit, EditPen } from "@element-plus/icons-vue";
import iconSetting from "./setting.svg";
import iconDelete from "./remove.svg";
import iconMore from "./more.svg";
import desimage from "@/components/image.vue";

function formatDate(date) {
  const d = useDateFormat(date, "YYYY-MM-DD HH:mm:ss");
  return d.value;
}

function isMouseover(decal) {
  return decal.mouseover.value;
}

function decalItemClick(decal) {
  return (currentOperatingDecalController.value = decal);
}

function isCurrent(decal) {
  if (!currentOperatingDecalController.value) {
    return false;
  }
  return decal.id.value == currentOperatingDecalController.value?.id.value;
}

function setting(decal) {
  currentOperatingDecalController.value = decal;
  showWorkspace.value = false;
  showDecalControl.value = true;
}

function removeDecal(decal) {
  decal.remove();
}

function clear() {
  currentModelController.value.clear();
}
</script>
<style lang="less" scoped>
.container {
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.info {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
}

.preview {
  position: relative;
  width: 100%;
  height: 240px;
}

.workspace-preview-viewer {
  flex-shrink: 0;
  background: var(--1s-control-surface-muted);
  border-radius: 8px;
}

.decal {
  flex: 1;
  overflow: auto;
}

.decal-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  row-gap: 1rem;
}

.decal-item {
  width: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  background-color: var(--1s-control-surface-background);
  border: 1px solid var(--1s-control-border-color);
  column-gap: 1rem;
  padding: 1rem;
  border-radius: 0.4rem;
  transition: all 0.2s;

  &:hover {
    box-shadow: var(--1s-control-focus-ring);
    cursor: pointer;
  }
}

.active {
  box-shadow: 0 0 0 1px var(--1s-accent-color) !important;
  border-color: var(--1s-accent-color);
}

.decal-item-image {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.decal-item-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.decal-item-content-title {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap; //溢出不换行
  font-size: 1em;
  color: var(--1s-text-color);
}

.decal-item-content-desc {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  font-size: 0.9em;
  color: var(--1s-text-color-tertiary);
}

.decal-item-bar {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  :deep(.el-button) {
    padding: 0 0.5em;
  }
}

.bottom {
  padding: 1em;
  display: flex;
}
</style>
