<template>
  <Transition name="image-editor-modal">
    <div v-if="isOpen" class="image-editor-modal-overlay" @click.self="handleClose">
      <div class="image-editor-modal-container">
        <div class="image-editor-modal-header">
          <span class="image-editor-modal-title">图片编辑</span>
          <el-button 
            text 
            type="primary" 
            @click="handleClose"
            class="image-editor-modal-close-btn"
          >
            <el-icon><Close></Close></el-icon>
          </el-button>
        </div>
        <div class="image-editor-modal-body">
          <KeepAlive>
            <imageEditor v-if="isOpen"></imageEditor>
          </KeepAlive>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { showImageEditorModal } from '../../store'
import imageEditor from './imageEditor.vue'

const isOpen = computed({
  get: () => showImageEditorModal.value,
  set: (val) => {
    showImageEditorModal.value = val
  }
})

function handleClose() {
  showImageEditorModal.value = false
}

// 监听 ESC 键关闭
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    handleClose()
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('keydown', handleKeyDown)
  
  // 组件卸载时移除监听器
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
</script>

<style lang="less" scoped>
.image-editor-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  z-index: 10000;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
}

.image-editor-modal-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-editor-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  background: #ffffff;
  z-index: 1;
}

.image-editor-modal-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.image-editor-modal-close-btn {
  margin-left: auto;
}

.image-editor-modal-body {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

// 动画效果
.image-editor-modal-enter-active,
.image-editor-modal-leave-active {
  transition: opacity 0.3s ease;
}

.image-editor-modal-enter-active .image-editor-modal-container,
.image-editor-modal-leave-active .image-editor-modal-container {
  transition: transform 0.3s ease;
}

.image-editor-modal-enter-from {
  opacity: 0;
  
  .image-editor-modal-container {
    transform: scale(0.95);
  }
}

.image-editor-modal-leave-to {
  opacity: 0;
  
  .image-editor-modal-container {
    transform: scale(0.95);
  }
}
</style>

