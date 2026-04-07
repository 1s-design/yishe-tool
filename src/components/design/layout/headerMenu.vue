<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-27 19:20:45
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-12-14 08:07:29
 * @FilePath: /1s/src/components/design/layout/headerMenu.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <div class="designiy-header">
    <div
      class="designiy-header__brand flex items-center justify-center shrink-0"
    >
      <img src="/favicon.png" class="designiy-header__brand-logo" />
    </div>

    <template v-if="isEdit">
      <div class="edit-mode-info flex items-center gap-2 shrink-0">
        <span class="model-id-text">模型ID: {{ currentEditingModelId }}</span>
        <el-button type="danger" size="small" @click="confirmExitEditMode">退出</el-button>
      </div>
    </template>

    <div class="designiy-header__spacer"></div>

    <a-button size="small" type="text" class="header-link">快速指南</a-button>

    <!-- 连接状态显示 (已移除) -->
    
    <div class="header-actions flex items-center gap-2 shrink-0">
      <!-- <el-button @click="showUpload = true" round text :icon="UploadFilled" class="action-btn">
        素材上传
      </el-button> -->

      <el-switch
        v-model="isDarkMode"
        inline-prompt
        style="--el-switch-off-color: var(--1s-border-color-strong)"
        active-text="夜"
        inactive-text="昼"
        class="theme-switch"
      />

      <!--
      <el-button type="primary" size="small" @click="showSaveModel = true" class="save-btn" :icon="Download">
        <span>保存</span>
      </el-button>
      -->
    </div>
    <user-avatar v-if="loginStatusStore.isLogin" />
    <el-button @click="login" v-else type="primary" size="small" class="login-btn">登录</el-button>
  </div>
</template>

<script setup>
import { getBaseModel, getBaseSkybox } from "@/api/index.ts";
import { ref, defineEmits, defineProps, computed, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import {
  canvasBgColor,
  canvasBgOpacity,
  currentModelController,
  showUpload,
  lastModifiedTime,
  storageName,
  builtInCanvasBackgrounds,
  currentCanvasBackground,
  isDarkMode,
  isEdit,
  currentEditingModelId,
  exitEditMode,
} from "../store";

import { openFileModal } from "@/components/design/layout/upload/index.tsx";
import { Share, UploadFilled } from "@element-plus/icons-vue";
import userAvatar from "@/components/user/userAvatar.vue";
import headerMenuDropdown from "./headerMenuDropdown/index.vue";
import { onShortcutTrigger } from "../shortcut/index";
import iconHelp from "@/icon/help.svg?component";
import { useLoginStatusStore } from "@/store/stores/login";
import { useDateFormat, useNow } from "@vueuse/core";
import {
  LoadingOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useFileDialog } from "@vueuse/core";
import { openLoginDialog } from "@/modules/main/view/user/login/index.tsx";
import Utils from "@/common/utils";
import { localFileListResource } from "@/components/design/store";

const router = useRouter();

const loginStatusStore = useLoginStatusStore();

const displayDate = useDateFormat(lastModifiedTime, "YYYY-MM-DD hh:mm:ss");

const props = defineProps([]);

function login() {
  openLoginDialog();
}

const { open: openFileDialog, reset, onCancel, onChange } = useFileDialog({
  accept: Utils.const.ImageFontFileAcceptString,
  multiple: true,
});

// 本地上传的文件

onChange((fileList) => {
  localFileListResource.value.push(...fileList);
});

function openUplaodModal(file) {
  openFileModal(file);
}

//
function remove(file) {}

function confirmExitEditMode() {
  ElMessageBox.confirm(
    '退出编辑模式后，所有改动不会影响到已保存的模型，截图也不会关联到该模型。确定要退出吗？',
    '确认退出编辑模式',
    {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      exitEditMode();
    })
    .catch(() => {
      // 用户取消退出
    });
}

</script>

<style lang="less" scoped>
.designiy-header {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
  column-gap: var(--1s-control-gap);
  padding: 0 10px 0 6px;
  min-width: 0;
  background: var(--1s-surface-background);
  color: var(--1s-text-color);
}

.designiy-header__brand {
  width: 44px;
  height: 100%;
  flex-shrink: 0;
}

.designiy-header__brand-logo {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.designiy-header__spacer {
  flex: 1;
  min-width: 0;
}

.edit-mode-info {
  min-width: 0;
  
  .model-id-text {
    font-size: 10px;
    color: var(--1s-text-color-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
}

.header-link {
  padding-inline: 4px;
  font-size: 10px;
  color: var(--1s-text-color-secondary);
}

.header-actions {
  min-width: 0;
  flex-wrap: nowrap;
  gap: 6px;
  
  .action-btn {
    white-space: nowrap;
  }
  
  .theme-switch {
    flex-shrink: 0;
  }
  
  .three-canvas-switch {
    flex-shrink: 0;
  }
  
  .save-btn,
  .login-btn {
    flex-shrink: 0;
  }
}

.save-btn,
.login-btn {
  min-width: 50px;
  padding-inline: 10px;
}

:deep(.el-switch) {
  --el-switch-height: 18px;
  --el-switch-width: 34px;
  --el-switch-border-radius: 999px;
}

:deep(.el-switch__label) {
  font-size: 9px;
}

// 响应式设计
@media (max-width: 1200px) {
  .edit-mode-info .model-id-text {
    max-width: 150px;
  }

  .header-link {
    display: none;
  }
}

@media (max-width: 1000px) {
  .edit-mode-info .model-id-text {
    max-width: 120px;
  }
  
  .header-actions {
    gap: 4px;
  }
}

@media (max-width: 800px) {
  .designiy-header {
    padding: 0 8px 0 4px;
  }
  
  .edit-mode-info .model-id-text {
    max-width: 100px;
    font-size: 9px;
  }
  
  .header-actions {
    gap: 2px;
    
    .theme-switch,
    .three-canvas-switch {
      transform: scale(0.9);
    }
  }
}

@media (max-width: 600px) {
  .edit-mode-info {
    .model-id-text {
      display: none;
    }
  }
  
  .header-actions {
    .save-btn {
      min-width: 36px;
      
      span {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  .designiy-header {
    column-gap: 4px;
    padding-right: 6px;
  }
  
  .header-actions {
    gap: 1px;
    
    .save-btn {
      min-width: 32px;
      padding-inline: 8px;
    }
    
    .theme-switch,
    .three-canvas-switch {
      transform: scale(0.8);
    }
  }
}
</style>
