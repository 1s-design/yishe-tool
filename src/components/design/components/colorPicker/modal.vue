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

        <div class="color-grid-container">
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
                    <div class="color-value">{{ getDisplayColor(item.color) }}</div>
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
import { ref, computed } from "vue";
import { colorLibrary, ColorItem } from "./data";
import { Search, CopyDocument } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const search = ref("");
const activeCategory = ref(colorLibrary[0].name);

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
  if (color.startsWith("linear-gradient")) {
    return "GRADIENT";
  }
  return color.toUpperCase();
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
    font-size: 11px;
    color: #999;
    margin-top: 2px;
    font-family: monospace;
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
