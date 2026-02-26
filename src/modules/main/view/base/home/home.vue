<!--
 * @Author: chan-max 2651308363@qq.com
 * @Date: 2023-12-16 12:40:26
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-07-26 17:36:27
 * @FilePath: /yishe/src/modules/main/view/base/home/home.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <div class="launcher-portal">
    <div class="launcher-grid">
      <div 
        v-for="item in modules" 
        :key="item.path"
        class="launcher-tile"
        @click="router.push(item.path)"
      >
        <div class="tile-content" :style="{ '--hover-color': item.color }">
          <div class="tile-icon">
            <component :is="item.icon" />
          </div>
          <div class="tile-label">{{ item.title }}</div>
        </div>
      </div>
      
      <!-- Future tiles can be added here -->
      <div class="launcher-tile pending">
        <div class="tile-content">
          <div class="tile-icon">
            <PlusOutlined />
          </div>
          <div class="tile-label">更多</div>
        </div>
      </div>
    </div>
    
    <div class="launcher-footer">
      1S.DESIGN
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { 
  PlusOutlined,
  SkinOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const modules = [
  {
    title: '设计室',
    path: '/design',
    icon: SkinOutlined,
    color: '#6366f1'
  }
]
</script>

<style scoped lang="less">
.launcher-portal {
  width: 100vw;
  height: 100vh;
  background-color: #111;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 40%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.launcher-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 140px));
  gap: 40px;
  max-width: 90vw;
  justify-content: center;
}

.launcher-tile {
  width: 140px;
  height: 160px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.1);
    
    .tile-content {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--hover-color, #fff);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
      
      .tile-icon {
        color: var(--hover-color, #fff);
      }
      
      .tile-label {
        color: #fff;
        opacity: 1;
      }
    }
  }
  
  &.pending {
    cursor: default;
    opacity: 0.3;
    &:hover { transform: none; }
  }
}

.tile-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 28px;
  transition: all 0.3s ease;
  
  .tile-icon {
    font-size: 40px;
    color: #eee;
    margin-bottom: 16px;
    transition: all 0.3s ease;
  }
  
  .tile-label {
    font-size: 15px;
    font-weight: 500;
    color: #999;
    opacity: 0.8;
    transition: all 0.3s ease;
  }
}

.launcher-footer {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 4px;
}

@media (max-width: 600px) {
  .launcher-grid {
    grid-template-columns: repeat(2, 140px);
    gap: 20px;
  }
}
</style>




