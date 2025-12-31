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
      class="designiy-header-logo flex items-center justify-center shrink-0"
      style="width: 64px; height: 100%"
    >
      <img src="/favicon.png" style="height: 32px; object-fit: contain;" />
    </div>

    <template v-if="isEdit">
      <div class="edit-mode-info flex items-center gap-2 shrink-0">
        <span class="model-id-text">模型ID: {{ currentEditingModelId }}</span>
        <el-button type="danger" size="small" @click="confirmExitEditMode">退出</el-button>
      </div>
    </template>

    <div style="flex-grow: 1"></div>

    <a-button size="small" type="text"> 快速指南 </a-button>

    <!-- 连接状态显示 -->
    <connection-status />

    <div class="header-actions flex items-center gap-2 shrink-0">
      <!-- <el-button @click="showUpload = true" round text :icon="UploadFilled" class="action-btn">
        素材上传
      </el-button> -->

      <el-tooltip :content="showThreeCanvas ? '点击关闭3D画布' : '点击开启3D画布'" placement="bottom">
        <el-switch
          v-model="showThreeCanvas"
          inline-prompt
          active-text="3D"
          inactive-text="3D"
          :active-icon="View"
          :inactive-icon="Hide"
          class="three-canvas-switch"
        />
      </el-tooltip>

      <el-switch
        v-model="isDarkMode"
        inline-prompt
        style="--el-switch-off-color: #bbb"
        active-text="夜间"
        inactive-text="白天"
        class="theme-switch"
      />

      <el-button type="primary" @click="showSaveModel = true" round class="save-btn" :icon="Download">
        <span>保存</span>
      </el-button>
    </div>
    <user-avatar v-if="loginStatusStore.isLogin" />
    <el-button @click="login" v-else round type="primary"> 登 录 </el-button>
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
  showSaveModel,
  showUpload,
  lastModifiedTime,
  storageName,
  builtInCanvasBackgrounds,
  currentCanvasBackground,
  isDarkMode,
  isEdit,
  currentEditingModelId,
  exitEditMode,
  showThreeCanvas,
} from "../store";

import { openFileModal } from "@/components/design/layout/upload/index.tsx";
import { Share, UploadFilled, Download, View, Hide } from "@element-plus/icons-vue";
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
import connectionStatus from "@/components/connectionStatus.vue";

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
  column-gap: 1rem;
  padding-right: 1rem;
  min-width: 0; // 防止flex子元素溢出
  // background: #121212;
}

.icon-btn {
  --el-button-text-color: #bbb;
}

.designiy-header-menu {
  width: 64px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-mode-info {
  min-width: 0;
  
  .model-id-text {
    font-size: 10px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
}

.header-actions {
  min-width: 0;
  flex-wrap: nowrap;
  
  .action-btn {
    white-space: nowrap;
  }
  
  .theme-switch {
    flex-shrink: 0;
  }
  
  .three-canvas-switch {
    flex-shrink: 0;
  }
  
  .save-btn {
    flex-shrink: 0;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .edit-mode-info .model-id-text {
    max-width: 150px;
  }
  
  .header-actions .action-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 1000px) {
  .edit-mode-info .model-id-text {
    max-width: 120px;
  }
  
  .header-actions {
    gap: 4px;
    
    .action-btn {
      padding: 6px 10px;
      font-size: 12px;
    }
  }
}

@media (max-width: 800px) {
  .designiy-header {
    column-gap: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .edit-mode-info .model-id-text {
    max-width: 100px;
    font-size: 12px;
  }
  
  .header-actions {
    gap: 2px;
    
    .action-btn {
      padding: 4px 8px;
      font-size: 11px;
    }
    
    .theme-switch,
    .three-canvas-switch {
      transform: scale(0.9);
    }
  }
}

@media (max-width: 600px) {
  .edit-mode-info {
    .model-id-text {
      display: none; // 在很小屏幕上隐藏模型ID文本
    }
  }
  
  .header-actions {
    .action-btn {
      padding: 4px 6px;
      font-size: 10px;
      min-width: 32px;
      
      // 隐藏按钮文字，只显示图标
      span {
        display: none;
      }
    }
    
    .save-btn {
      min-width: 32px;
      
      span {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  .designiy-header {
    column-gap: 0.25rem;
    padding-right: 0.25rem;
  }
  
  .header-actions {
    gap: 1px;
    
    .action-btn,
    .save-btn {
      padding: 3px 4px;
      min-width: 28px;
      height: 28px;
    }
    
    .theme-switch,
    .three-canvas-switch {
      transform: scale(0.8);
    }
  }
}
</style>
