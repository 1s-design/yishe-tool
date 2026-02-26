<template>
  <a-modal
    v-bind="$attrs"
    width="100%"
    :wrapClassName="'full-screen-modal'"
    title="颜色库"
    :footer="null"
    centered
    :destroyOnClose="true"
    @cancel="close"
  >
    <div class="color-library-container">
      <!-- Sidebar Categories -->
      <div class="sidebar">
        <div class="sidebar-header">选择分类</div>
        <div class="category-list">
          <!-- Advanced Editor Entry -->
          <div
            class="category-item expert-entry"
            :class="{ active: activeCategory === 'EXERT_EDITOR' }"
            @click="activeCategory = 'EXERT_EDITOR'"
          >
            <el-icon style="margin-right: 8px"><edit-pen /></el-icon>
            高级 CSS 编辑器
          </div>
          <div class="divider"></div>
          <div
            v-for="cat in colorLibrary"
            :key="cat.name"
            class="category-item"
            :class="{ active: activeCategory === cat.name }"
            @click="activeCategory = cat.name"
            :data-name="cat.name"
          >
            {{ cat.name }}
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="toolbar">
          <div class="breadcrumb">
            {{ activeCategory }} <span v-if="search"> / 搜索: "{{ search }}"</span>
          </div>
          <el-input
            v-model="search"
            style="width: 320px"
            placeholder="搜素颜色名称、描述或十六进制..."
            prefix-icon="Search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div v-if="activeCategory === 'EXERT_EDITOR'" class="expert-editor-view">
          <div class="editor-section">
            <div class="label">自定义背景 (CSS Background / Color)</div>
            <el-input
              v-model="customCSS"
              type="textarea"
              :rows="5"
              placeholder="例如: linear-gradient(to right, oklch(60% 0.3 0), oklch(60% 0.3 200)) 或 #ff0000"
              @input="updatePreview"
            />
            
            <div class="quick-templates">
              <div class="label">快速模板</div>
              <div class="template-tags">
                <el-tooltip
                  v-for="t in templates" 
                  :key="t.name"
                  effect="dark"
                  :content="t.value"
                  placement="top"
                >
                  <el-tag 
                    @click="applyTemplate(t.value)"
                    class="template-tag"
                    effect="plain"
                  >
                    {{ t.name }}
                    <span class="template-value-preview">{{ t.value.substring(0, 10) }}...</span>
                  </el-tag>
                </el-tooltip>
              </div>
            </div>

            <div class="actions">
              <el-button type="primary" @click="applyCustomCSS" large>确认应用此样式</el-button>
            </div>
          </div>

          <div class="preview-section">
            <div class="label">效果预览</div>
            <div class="expert-preview-box" :style="{ background: customCSSPreview }">
              <div class="preview-text" :style="{ color: isDarkPreview ? '#fff' : '#000' }">
                预览效果 PREVIEW
              </div>
            </div>
            <div class="preview-info">
              当前值: <code>{{ customCSS }}</code>
            </div>
          </div>
        </div>

        <div v-else class="color-grid-container">
          <div class="color-grid">
            <div
              v-for="item in filteredColors"
              :key="item.name + item.color"
              class="color-item-wrapper"
            >
              <el-tooltip
                effect="dark"
                :content="item.description || item.name"
                placement="top"
                :show-after="300"
              >
                <div class="color-item" @click="select(item)">
                  <div
                    class="color-preview"
                    :style="{ background: item.color }"
                  >
                    <div class="color-actions">
                      <el-button circle size="small" @click.stop="copyColor(item.color)">
                        <el-icon><CopyDocument /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div class="color-info">
                    <div class="color-name">{{ item.name }}</div>
                    <div class="color-value" :title="item.color">{{ getDisplayColor(item.color) }}</div>
                  </div>
                </div>
              </el-tooltip>
            </div>
          </div>
          
          <div v-if="filteredColors.length === 0" class="empty-state">
            <el-empty description="未找到匹配的颜色" />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { colorLibrary, ColorItem } from "./data";
import { Search, CopyDocument, EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const search = ref("");
const activeCategory = ref(colorLibrary[0].name);

const customCSS = ref("");
const customCSSPreview = ref("");

const templates = [
  // --- 现代色彩空间 ---
  { name: 'OKLCH 极光', value: 'linear-gradient(to right, oklch(60% 0.3 0), oklch(60% 0.3 200))' },
  { name: 'OKLCH 霓虹', value: 'linear-gradient(135deg, oklch(70% 0.3 300) 0%, oklch(60% 0.2 200) 100%)' },
  { name: 'OKLCH 柔光', value: 'linear-gradient(to bottom, oklch(90% 0.05 200), oklch(80% 0.1 250))' },
  
  // --- 复杂几何渐变 ---
  { name: '赛博锥形', value: 'conic-gradient(from 0deg at 50% 50%, #00f2fe, #4facfe, #00f2fe)' },
  { name: '金属拉丝', value: 'repeating-linear-gradient(90deg, #ccc 0px, #ccc 1px, #eee 1px, #eee 2px)' },
  { name: '深邃星空', value: 'radial-gradient(circle at 20% 30%, #222 0%, #000 100%), radial-gradient(circle at 80% 70%, #111 0%, #000 100%)' },
  
  // --- 顶级 UI 质感 ---
  { name: '浮光掠影 (Mesh)', value: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(339,49%,30%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(253,16%,7%,1) 0, transparent 50%)' },
  { name: '极简磨砂', value: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)), #f0f2f5' },
  { name: '全息极地', value: 'linear-gradient(217deg, rgba(255,0,0,.4), rgba(255,0,0,0) 70.71%), linear-gradient(127deg, rgba(0,255,0,.4), rgba(0,255,0,0) 70.71%), linear-gradient(336deg, rgba(0,255,0,.4), rgba(0,255,0,0) 70.71%)' },
  
  // --- 纹理与图案 ---
  { name: '经典波点', value: 'radial-gradient(#d1d5db 20%, transparent 20%), radial-gradient(#d1d5db 20%, transparent 20%)', style: 'background-position: 0 0, 10px 10px; background-size: 20px 20px;' }, // Note: handling full CSS properties might be tricky, keeping it to color/background
  { name: '斜纹织物', value: 'repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 10px, #ffffff 10px, #ffffff 20px)' },
  { name: '碳纤纹', value: 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%), #111' },
  
  // --- 艺术艺术色彩 ---
  { name: '油画午后', value: 'linear-gradient(to right, #cfd9df 0%, #e2ebf0 100%)' },
  { name: '莫兰迪蓝', value: 'linear-gradient(to top, #9dafc2 0%, #b4c5d6 100%)' },
  { name: '莫奈花园', value: 'radial-gradient(circle, #8ca3ba, #c5b5cf, #cbd4c1)' },

  // --- 霓虹与赛博 (Neon & Cyber) ---
  { name: '激光紫', value: 'linear-gradient(135deg, #6e8efb, #a777e3)' },
  { name: '深海霓虹', value: 'linear-gradient(to right, #00c6ff, #0072ff)' },
  { name: '电子蓝光', value: 'radial-gradient(circle at center, #00f2fe 0%, #4facfe 100%)' },
  { name: '赛博矩阵', value: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)), #222' },

  // --- 自然与景观 (Nature) ---
  { name: '极地之光', value: 'linear-gradient(135deg, #74ebd5 0%, #acb6e5 100%)' },
  { name: '晨曦霞光', value: 'linear-gradient(to right, #ffafbd, #ffc3a0)' },
  { name: '热带雨林', value: 'linear-gradient(to top, #134e5e, #71b280)' },
  { name: '暗夜星辰', value: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)' },

  // --- 极简主义 (Minimalist) ---
  { name: '优雅白', value: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)' },
  { name: '高级灰', value: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)' },
  { name: '暖心灰', value: 'linear-gradient(to right, #ece9e6, #ffffff)' },

  // --- 纹理与材质 (Textures) ---
  { name: '蓝图网格', value: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), #003366' },
  { name: '蜂巢几何', value: 'radial-gradient(circle at 100% 50%, transparent 20%, #222 21%, #222 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, #222 21%, #222 34%, transparent 35%, transparent), #333' },
  { name: '优雅亚麻', value: 'linear-gradient(90deg, rgba(255,255,255,0.05) 50%, transparent 50%), linear-gradient(rgba(255,255,255,0.05) 50%, transparent 50%), #fff', style: 'background-size: 2px 2px;' },
  
  // --- 复古风格 (Retro) ---
  { name: '80s 极光', value: 'repeating-linear-gradient(transparent, transparent 2px, #f43f5e 2px, #f43f5e 4px), linear-gradient(#fbbf24, #f43f5e)' },
  { name: '波普波点', value: 'radial-gradient(#ff0080 20%, transparent 20%), radial-gradient(#ff0080 20%, transparent 20%)', style: 'background-position: 0 0, 10px 10px; background-size: 20px 20px;' },
  { name: '怀旧报纸', value: 'linear-gradient(to bottom, #fdfcfb, #e2ebf0)' },
  
  // --- 活力渐变 (Vibrant Lux) ---
  { name: '全息彩虹', value: 'linear-gradient(135deg, #ff0080 0%, #ff8c00 25%, #40e0d0 50%, #8a2be2 75%, #ff0080 100%)' },
  { name: '极光之吻', value: 'linear-gradient(to right, #00c6ff, #0072ff, #2af598)' },
  { name: '暮光之城', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
  { name: '热情盛夏', value: 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)' },
];

function updatePreview() {
  customCSSPreview.value = customCSS.value;
}

function applyTemplate(val: string) {
  customCSS.value = val;
  updatePreview();
}

function applyCustomCSS() {
  if (!customCSS.value) return;
  const isGradient = customCSS.value.includes("-gradient") || customCSS.value.includes("oklch") || customCSS.value.includes("hsl");
  select({
    name: '自定义样式',
    color: customCSS.value,
    type: isGradient ? 'gradient' : 'pure'
  });
}

const isDarkPreview = computed(() => {
  // Simple check for dark background to invert text
  return customCSS.value.includes('black') || customCSS.value.includes('#000') || customCSS.value.includes('20%');
});

const emits = defineEmits(["select", "update:open"]);

const filteredColors = computed(() => {
  const category = colorLibrary.find((c) => c.name === activeCategory.value);
  if (!category) return [];

  if (!search.value) return category.items;

  const s = search.value.toLowerCase();
  return category.items.filter(
    (item) =>
      item.name.toLowerCase().includes(s) ||
      (item.description && item.description.toLowerCase().includes(s)) ||
      item.color.toLowerCase().includes(s)
  );
});

function select(item: ColorItem) {
  emits("select", item);
}

function close() {
  emits("update:open", false);
}

function copyColor(color: string) {
  navigator.clipboard.writeText(color);
  ElMessage.success("已复制: " + color);
}

function getDisplayColor(color: string) {
  return color;
}
</script>

<style lang="less">
.full-screen-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
    height: 100vh;
  }
  .ant-modal-content {
    height: 100vh;
    display: flex;
    flex-direction: column;
    border-radius: 0;
    box-shadow: none;
  }
  .ant-modal-body {
    flex: 1;
    padding: 0;
    overflow: hidden;
  }
  .ant-modal-header {
    border-bottom: 1px solid #eee;
    padding: 12px 24px;
    background: #fff;
  }
  .ant-modal-close {
    top: 12px;
  }
}
</style>

<style scoped lang="less">
.color-library-container {
  display: flex;
  height: 100%;
  background: #fff;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 20px;
    font-size: 12px;
    font-weight: bold;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .category-list {
    flex: 1;
    overflow-y: auto;
  }

  .category-item {
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;
    font-size: 14px;
    border-left: 3px solid transparent;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    position: relative;

    // Use a pseudo-element to reserve space for the bold text to prevent layout shift
    &::after {
      content: attr(data-name);
      font-weight: 600;
      height: 0;
      overflow: hidden;
      visibility: hidden;
    }

    &:hover {
      background: #f0f0f0;
      color: #333;
    }

    &.active {
      background: #fff;
      color: #000;
      font-weight: 600;
      border-left-color: #000;
    }
  }

  .expert-entry {
    background: #fdf2f2;
    color: #e63946;
    font-weight: 600;
    &:hover {
      background: #fcebeb;
      color: #d62828 !important;
    }
    &.active {
      background: #e63946 !important;
      color: #fff !important;
      border-left-color: #000;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .breadcrumb {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    
    span {
      font-size: 12px;
      color: #ccc;
      font-weight: normal;
      margin-left: 8px;
    }
  }
}

.color-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 0; // Remove container padding for edge-to-edge feel if desired, or keep minimal
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1px; // Gap of 1px creates a minimal grid line effect if background is different
}

.color-item {
  background: #fff;
  overflow: hidden;
  transition: opacity 0.2s;
  cursor: pointer;
  position: relative;

  &:hover {
    .color-actions {
      opacity: 1;
    }
    .color-preview {
      filter: brightness(0.95);
    }
  }
}

.color-preview {
  height: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.2s;

  .color-actions {
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    gap: 8px;
    z-index: 10;
  }
}

.expert-editor-view {
  flex: 1;
  display: flex;
  padding: 40px;
  gap: 40px;
  background: #fdfdfd;
  height: 100%;
  overflow-y: auto;

  .editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .label {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .quick-templates {
      margin-top: 20px;
      .template-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .template-tag {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        height: auto;
        padding: 6px 12px;
        
        &:hover {
          border-color: #000;
          color: #000;
        }

        .template-value-preview {
          font-size: 10px;
          color: #bbb;
          font-weight: normal;
          font-family: monospace;
          margin-top: 2px;
        }
      }
    }

    .actions {
      margin-top: auto;
      padding-top: 20px;
    }
  }

  .preview-section {
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .expert-preview-box {
      aspect-ratio: 1;
      border-radius: 12px;
      border: 1px solid #eee;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      transition: all 0.3s ease;

      .preview-text {
        font-size: 24px;
        font-weight: 900;
        letter-spacing: 2px;
        opacity: 0.8;
      }
    }

    .preview-info {
      font-size: 12px;
      color: #666;
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      code {
        word-break: break-all;
      }
    }
  }
}

.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 10px 20px;
}

.color-info {
  padding: 10px;
  background: #fff;

  .color-name {
    font-size: 13px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .color-value {
    font-size: 10px;
    color: #bbb;
    margin-top: 4px;
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #fff;
}
</style>
