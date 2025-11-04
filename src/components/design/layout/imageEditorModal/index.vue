<template>
  <Transition name="image-editor-modal">
    <div v-if="isOpen" class="image-editor-modal-overlay" @click.self="handleClose">
      <div class="image-editor-modal-container">
        <div class="image-editor-modal-body">
          <div class="image-editor-close-btn-wrapper">
            <el-button 
              text 
              type="primary" 
              @click="handleClose"
              class="image-editor-close-btn"
              circle
            >
              <el-icon><Close></Close></el-icon>
            </el-button>
          </div>
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

.image-editor-modal-body {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}

.image-editor-close-btn-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
}

.image-editor-close-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

