<template>
  <div class="frame-editor">
    <div class="frame-editor-container">
      <div class="editor-placeholder">
        <h2>制作画框功能</h2>
        <p>功能内容待开发...</p>
        <p class="tip">此组件已启用缓存，关闭弹窗后重新打开时内容会保留</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 这里可以添加需要缓存的状态
const editorState = ref({
  // 示例：编辑内容
  content: '',
  // 示例：配置选项
  config: {}
})

onMounted(() => {
  console.log('FrameEditor mounted')
  // 组件挂载时的初始化逻辑
})

onUnmounted(() => {
  console.log('FrameEditor unmounted (but cached by KeepAlive)')
  // 注意：由于使用了 KeepAlive，onUnmounted 不会在切换时触发
  // 如果需要清理逻辑，可以使用 onActivated/onDeactivated
})
</script>

<style lang="less" scoped>
.frame-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.frame-editor-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  margin: 0;
  padding: 0;
}

.editor-placeholder {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 24px;
  }
  
  p {
    margin: 8px 0;
    color: #666;
    font-size: 14px;
  }
  
  .tip {
    margin-top: 24px;
    padding: 12px;
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    color: #1890ff;
    font-size: 12px;
  }
}
</style>

