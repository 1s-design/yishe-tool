<template>
  <Transition name="frame-modal">
    <div v-if="isOpen" class="frame-modal-overlay" @click.self="handleClose">
      <div class="frame-modal-container">
        <div class="frame-modal-header">
          <span class="frame-modal-title">制作画框</span>
          <el-button 
            text 
            type="primary" 
            @click="handleClose"
            class="frame-modal-close-btn"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="frame-modal-body">
          <KeepAlive>
            <frameEditor v-if="isOpen" />
          </KeepAlive>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { showFrameModal } from '../../store'
import frameEditor from './frameEditor.vue'

const isOpen = computed({
  get: () => showFrameModal.value,
  set: (val) => {
    showFrameModal.value = val
  }
})

function handleClose() {
  showFrameModal.value = false
}

// 监听 ESC 键关闭
watch(isOpen, (newVal) => {
  if (newVal) {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }
})
</script>

<style lang="less" scoped>
.frame-modal-overlay {
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

.frame-modal-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.frame-modal-header {
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

.frame-modal-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.frame-modal-close-btn {
  margin-left: auto;
}

.frame-modal-body {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

// 动画效果
.frame-modal-enter-active,
.frame-modal-leave-active {
  transition: opacity 0.3s ease;
}

.frame-modal-enter-active .frame-modal-container,
.frame-modal-leave-active .frame-modal-container {
  transition: transform 0.3s ease;
}

.frame-modal-enter-from {
  opacity: 0;
  
  .frame-modal-container {
    transform: scale(0.95);
  }
}

.frame-modal-leave-to {
  opacity: 0;
  
  .frame-modal-container {
    transform: scale(0.95);
  }
}
</style>

