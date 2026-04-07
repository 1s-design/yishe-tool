<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 内置背景 </template>
    <template #content>
      <el-popover
        width="auto"
        trigger="click"
        :visible="showPopover"
        popper-class="el-popover-operation"
      >
        <template #reference>
          <el-button link size="small" @click="showPopover = !showPopover">
            {{ modelLabel }}
          </el-button>
        </template>
        <div class="background-popover-panel">
          <el-row style="row-gap: 1rem">
            <el-col :span="24">
              <div class="background-toolbar w-full flex justify-between items-center">
                <el-input
                  v-model="searchInput"
                  class="background-search-input"
                  placeholder="关键字搜索"
                ></el-input>
                <el-tooltip content="取消背景" placement="top">
                  <el-button link @click="removeCurrentBackground">
                    <el-icon size="14">
                      <StopOutlined />
                    </el-icon>
                  </el-button>
                </el-tooltip>
              </div>
              <el-tabs v-model="activeCategory">
                <el-tab-pane
                  v-for="category in CustomBackgroundCategoryOptions"
                  :name="category.value"
                  :label="category.label"
                >
                  <el-scrollbar height="360px">
                    <el-row
                      v-if="withSearchFilter(category.children).length"
                      class="background-grid"
                    >
                      <el-col
                        v-for="(item, index) in withSearchFilter(category.children)"
                        :key="index"
                        :span="4"
                      >
                        <div
                          class="flex flex-col justify-center items-center preview-item"
                          :class="{ checked: isChecked(item) }"
                          @click="useCurrent(item)"
                        >
                          <div class="preview-box">
                            <template v-if="item.renderSlot">
                              <component :is="item.renderSlot"></component>
                            </template>
                          </div>
                          <div
                            style="text-align: center; height: 16px; line-height: 16px"
                            class="text-ellipsis"
                          >
                            {{ item.label }}
                          </div>
                        </div>
                      </el-col>
                    </el-row>
                    <el-empty
                      v-else
                      @click="searchInput = ''"
                      class="cursor-pointer"
                      description="无结果"
                      :image="emptyImage"
                      :image-size="64"
                    >
                    </el-empty>
                  </el-scrollbar>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="flex toolbar items-center background-footer">
                <div style="flex: 1"></div>
                <el-button size="small" type="danger" @click="showPopover = false">
                  关闭
                </el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-popover>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/custom-background.svg?component";
import { canvasStickerOptions } from "@/components/design/layout/canvas/index.tsx";
import {
  addSvgFilterEffect,
  SvgFilterEffects,
  SvgFilterEffectDisplayLabelMap,
  FeMorphologyOperatorOptions,
  SvgFilterResource,
} from "@/components/design/layout/canvas/children/svgFilter/index";
import { ref, computed, h } from "vue";
import { StopOutlined } from "@ant-design/icons-vue";
import { Switch } from "@element-plus/icons-vue";
import desimage from "@/components/image.vue";
import { CustomBackgroundCategoryOptions } from "@/components/design/layout/canvas/children/background/builtIn/index";
import { useLocalStorage } from "@vueuse/core";
import { SvgFilterCategory } from "@/types/filter.ts";
import Utils from "@/common/utils";
import { GlobalConst } from "@/types/index.ts";

const model = defineModel({
  default: null,
});

const emptyImage = computed(() => {
  return Utils.transform.svgStringToUrl(GlobalConst.EMPTY_PLACEHOLDER_URL);
});

const searchInput = ref();

function withSearchFilter(children) {
  return children.filter((child) => {
    if (searchInput.value) {
      return child.label.includes(searchInput.value);
    }
    return true;
  });
}

const activeCategory = useLocalStorage(
  "_1s_BuiltInBackgroundActiveCategory",
  SvgFilterCategory.Normal
);

const props = defineProps({
  tooltip: {
    default: "",
  },
});

/*
    移除当前滤镜 , 设为默认原始
*/
function removeCurrentBackground() {
  model.value.id = null;
  model.value.label = null;
}

const showPopover = ref(false);

// 标签明显
const modelLabel = computed(() => {
  return model.value.label || "未使用";
});

// 当前滤镜是否在使用中
function isChecked(effect) {
  let id = effect.id;

  return model.value?.id == id;
}

function useCurrent(effect) {
  // 使用或取消使用

  let { id, label } = effect;

  model.value.id = id;
  model.value.label = label;
}
</script>

<style scoped lang="less">
.background-popover-panel {
  width: min(760px, calc(100vw - 40px));
  max-width: 100%;
}

.background-toolbar {
  min-height: 44px;
  padding: 0 12px;
  gap: 10px;
}

.background-search-input {
  width: min(240px, 100%);
}

.background-grid {
  row-gap: 8px;
  margin: 12px;
}

.background-footer {
  min-height: 44px;
  column-gap: 10px;
}

.label {
  width: 64px;
  text-wrap: nowrap;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__active-bar) {
  display: none;
}

:deep(.el-tabs__item) {
  padding: 0 12px;
  color: rgba(0, 0, 0, 0.3);
}

:deep(.el-tabs__item.is-active) {
  color: rgba(0, 0, 0, 0.8);
}

:deep(.el-tabs__header) {
  margin: 0 15px;
}

.preview-item {
  margin: 8px 0;
  row-gap: 8px;

  .preview-box {
    width: 88px;
    height: 88px;
    overflow: hidden;
    transition: 0.1s;
    border-radius: 0.4rem;
    cursor: pointer;
    box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
      rgba(27, 31, 35, 0.06) 0px 0px 0px 1px;
  }

  &.checked {
    .preview-box {
      box-shadow: rgba(115, 0, 255, 0.6) 0px 0px 0px 2px,
        rgba(115, 0, 255, 0.4) 0px 0px 0px 6px, rgba(115, 0, 255, 0.2) 0px 0px 0px 9px;
    }
  }

  &:hover {
  }
}

@media (max-width: 1080px) {
  .background-popover-panel {
    width: min(680px, calc(100vw - 32px));
  }

  .background-toolbar {
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 10px 12px;
  }

  .background-search-input {
    width: 100%;
  }
}
</style>
