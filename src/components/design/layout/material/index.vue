<template>
  <div class="content flex flex-col">
    <div class="material-form pt-8">
      <!-- 原始材质开关 -->
      <div class="form-item">
        <Label class="form-label">原始材质</Label>
        <div class="form-content">
          <div class="switch-container">
            <span class="switch-text">自定义材质</span>
            <Switch
              v-model:checked="useRawMaterial"
              :disabled="!isControllerAvailable || isLoading"
              class="compact-switch"
              @update:model-value="handleRawMaterialToggle"
            />
            <span class="switch-text">原始材质</span>
          </div>
          <div class="switch-description">
            {{ useRawMaterial ? '保持模型原始外观' : '可调整颜色、纹理等属性' }}
          </div>
          <div v-if="!isControllerAvailable" class="error-tip">
            ⚠️ 模型控制器未初始化，请先加载模型
          </div>
        </div>
      </div>

      <!-- 材质设置区域，仅在非原始材质模式下显示 -->
      <template v-if="!useRawMaterial">
        <div class="form-item">
          <Label class="form-label">服装颜色</Label>
          <div class="form-content">
            <div class="flex flex-wrap" style="gap: 12px">
              <div
                v-for="item in builtInClothingColors"
                :key="item.value"
                class="color-item-wrapper"
                @click="currentModelController.state.material.color = item.value"
              >
                <div
                  :style="{ background: item.value }"
                  class="color-item"
                  :title="item.label"
                ></div>
                <div class="color-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-item">
          <Label class="form-label">自定义颜色</Label>
          <div class="form-content">
            <input
              type="color"
              v-model="currentModelController.state.material.color"
              class="h-7 w-10 rounded border border-input cursor-pointer"
            />
          </div>
        </div>

        <div class="form-item">
          <Label class="form-label">材质纹理</Label>
          <div class="form-content">
            <template v-if="currentModelController.state.material.textureInfo">
              <div>
                <s1-img
                  class="texture-preview"
                  :src="currentModelController.state.material?.textureInfo?.url"
                ></s1-img>
                <Button
                  style="margin-top: 12px"
                  @click="currentModelController.state.material.textureInfo = null"
                  variant="outline"
                  class="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive rounded-full"
                  >移除当前纹理</Button
                >
              </div>
            </template>
            <template v-else>
              <Button
                @click="viewDisplayController.showMaterialModal = true"
                class="rounded-full"
                >选择一个纹理</Button
              >
            </template>
          </div>
        </div>
        <div class="form-item">
          <Label class="form-label">纹理密度</Label>
          <div class="form-content">
            <Slider
              :min="1"
              :max="20"
              :step="1"
              :model-value="[currentModelController.state.material.textureRepeat]"
              @update:model-value="(v) => (currentModelController.state.material.textureRepeat = v[0])"
            />
          </div>
        </div>
        <div class="form-item">
          <Label class="form-label">粗糙度</Label>
          <div class="form-content">
            <Slider
              :min="0"
              :max="1"
              :step="0.01"
              :model-value="[currentModelController.state.material.roughness]"
              @update:model-value="(v) => (currentModelController.state.material.roughness = v[0])"
            />
          </div>
        </div>

        <div class="form-item">
          <Label class="form-label">金属感</Label>
          <div class="form-content">
            <Slider
              :min="0"
              :max="1"
              :step="0.01"
              :model-value="[currentModelController.state.material.metailness]"
              @update:model-value="(v) => (currentModelController.state.material.metailness = v[0])"
            />
          </div>
        </div>
      </template>

      <!-- 原始材质信息显示 -->
      <template v-if="useRawMaterial">
        <div class="form-item material-info">
          <Label class="form-label">材质信息</Label>
          <div class="form-content">
            <div class="info-container">
              <div class="info-text">
                当前使用原始材质，共 {{ rawMaterialCount }} 个材质
              </div>
              <Button
                @click="showRawMaterialDetails"
                variant="outline"
                size="sm"
                class="rounded-full detail-btn"
              >
                查看详情
              </Button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { viewDisplayController, currentModelController } from "@/components/design/store";
import { builtInClothingColors } from "./index.ts";
import { message } from '@/common/message';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

// 响应式的原始材质状态
// 默认使用自定义材质模式（false），只有在控制器明确设置为原始材质时才为true
const useRawMaterial = ref(false);

// 加载状态
const isLoading = ref(false);

// 计算原始材质数量
const rawMaterialCount = computed(() => {
  return currentModelController.value?.rawMaterial?.length || 0;
});

// 检查控制器是否可用
const isControllerAvailable = computed(() => {
  return !!currentModelController.value;
});

// 监听控制器变化，同步状态
watch(() => currentModelController.value?.state?.useRawMaterial, (newValue) => {
  console.log('=== 监听器触发 ===');
  console.log('新的 useRawMaterial 值:', newValue);
  console.log('当前 useRawMaterial.value:', useRawMaterial.value);
  
  // 只有在控制器状态明确设置为true时才同步，保持默认的false状态
  if (newValue === true) {
    useRawMaterial.value = true;
    console.log('已更新 useRawMaterial.value 为:', useRawMaterial.value);
  }
}, { immediate: true });

// 处理原始材质开关切换
const handleRawMaterialToggle = async (value: boolean) => {
  console.log('=== 开关切换事件触发 ===');
  console.log('新值:', value);
  console.log('当前控制器:', currentModelController.value);
  
  if (!currentModelController.value) {
    message.error('模型控制器未初始化');
    return;
  }

  try {
    isLoading.value = true;
    
    console.log('调用 setUseRawMaterial 方法...');
    // 使用正确的方法来切换材质模式
    currentModelController.value.setUseRawMaterial(value);
    
    console.log('setUseRawMaterial 调用完成');
    
    // 等待下一个 tick 确保状态更新
    await nextTick();
    
    console.log('状态更新后的 useRawMaterial:', currentModelController.value.state.useRawMaterial);
    
    // 显示提示信息
    if (value) {
      message.success('已切换到原始材质模式');
    } else {
      message.success('已切换到自定义材质模式');
    }
  } catch (error) {
    console.error('切换材质模式失败:', error);
    message.error('切换材质模式失败');
    // 恢复开关状态
    useRawMaterial.value = !value;
  } finally {
    isLoading.value = false;
  }
};

// 显示原始材质详情
const showRawMaterialDetails = () => {
  if (currentModelController.value?.rawMaterial) {
    const details = currentModelController.value.rawMaterial.map((item, index) => ({
      index: index + 1,
      name: item.name || `材质${index + 1}`,
      type: item.material?.type || '未知',
      transparent: item.material?.transparent || false,
      opacity: item.material?.opacity || 1,
      visible: item.material?.visible !== false
    }));
    
    console.log('=== 原始材质详情 ===');
    console.table(details);
    console.log('====================');
    
    message.info('材质详情已输出到控制台，请按 F12 查看');
  } else {
    message.warning('暂无原始材质信息');
  }
};

// 监听控制器实例变化
watch(() => currentModelController.value, (controller) => {
  if (controller) {
    // 只有在控制器状态明确设置为true时才同步，保持默认的false状态
    if (controller.state.useRawMaterial === true) {
      useRawMaterial.value = true;
    }
  }
}, { immediate: true });
</script>

<style scoped lang="less">
.content {
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow: auto;
}

.material-form {
  width: 100%;
  margin: 0;
  padding: 0 16px 16px;
  box-sizing: border-box;
}

.form-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.form-label {
  width: 84px;
  flex-shrink: 0;
  text-align: right;
  padding-top: 2px;
  font-size: 12px;
  color: var(--1s-text-color);
}

.form-content {
  flex: 1;
  min-width: 0;
}

.color-item-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    
  }
}

.color-item {
  width: 20px;
  height: 20px;
  box-: none;
  border-radius: 3px;
  margin: 4px 0 6px 0;

  &:hover {
    box-: none;
  }
}

.color-label {
  font-size: 9px;
  color: var(--1s-text-color-tertiary);
  text-align: center;
  line-height: 1.1;
  max-width: 50px;
  word-break: break-all;
}

.texture-preview {
  width: min(100%, 200px);
  height: min(100%, 200px);
  background: var(--1s-control-surface-muted);
  border: none;
  border-radius: 8px;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.switch-text {
  font-size: 8px;
  color: var(--1s-control-text-muted);
  font-weight: 400;
  line-height: 1;
}

.switch-description {
  font-size: 8px;
  color: var(--1s-control-text-muted);
  line-height: 1.2;
  margin-top: 2px;
}

.error-tip {
  font-size: 8px;
  color: #ef4444;
  line-height: 1.2;
  margin-top: 2px;
}

.material-info {
  .info-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-text {
    font-size: 9px;
    color: var(--1s-control-text-muted);
    line-height: 1.2;
  }

  .detail-btn {
    align-self: flex-start;
    font-size: 9px;
    height: 20px;
    padding: 0 8px;
  }
}

@media (max-width: 1080px) {
  .material-form {
    padding-inline: 12px;
  }
}
</style>
