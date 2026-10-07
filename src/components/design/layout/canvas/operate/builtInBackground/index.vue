<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 内置背景 </template>
    <template #content>
      <Popover v-model:open="showPopover">
        <PopoverTrigger as-child>
          <Button variant="link" size="sm">
            {{ modelLabel }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto">
          <div class="background-popover-panel">
            <div class="flex flex-col w-full" style="row-gap: 1rem">
              <div class="background-toolbar w-full flex justify-between items-center">
                <Input
                  v-model="searchInput"
                  class="background-search-input"
                  placeholder="关键字搜索"
                ></Input>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="link" @click="removeCurrentBackground">
                      <Square class="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">取消背景</TooltipContent>
                </Tooltip>
              </div>
              <Tabs :model-value="activeCategory" @update:model-value="v => (activeCategory = v as any)">
                <TabsList>
                  <TabsTrigger
                    v-for="category in CustomBackgroundCategoryOptions"
                    :key="category.value"
                    :value="category.value"
                  >
                    {{ category.label }}
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  v-for="category in CustomBackgroundCategoryOptions"
                  :key="category.value"
                  :value="category.value"
                >
                  <ScrollArea style="height:360px">
                    <div
                      v-if="withSearchFilter(category.children).length"
                      class="background-grid flex flex-wrap"
                    >
                      <div
                        v-for="(item, index) in withSearchFilter(category.children)"
                        :key="index"
                        :style="{ flex: `0 0 ${(100 / 24) * 4}%` }"
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
                      </div>
                    </div>
                    <div
                      v-else
                      @click="searchInput = ''"
                      class="cursor-pointer flex flex-col items-center justify-center py-10 text-xs text-muted-foreground"
                    >
                      无结果
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <div class="flex toolbar items-center background-footer">
                <div style="flex: 1"></div>
                <Button size="sm" variant="destructive" @click="showPopover = false">
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
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
import { Square } from 'lucide-vue-next';
import desimage from "@/components/image.vue";
import { CustomBackgroundCategoryOptions } from "@/components/design/layout/canvas/children/background/builtIn/index";
import { useLocalStorage } from "@vueuse/core";
import { SvgFilterCategory } from "@/types/filter.ts";
import Utils from "@/common/utils";
import { GlobalConst } from "@/types/index.ts";
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

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

.preview-item {
  margin: 8px 0;
  row-gap: 8px;

  .preview-box {
    width: 88px;
    height: 88px;
    overflow: hidden;
    transition: box-shadow 0.1s;
    border-radius: var(--1s-radius-small);
    cursor: pointer;
    box-shadow: 0 0 0 1px var(--1s-border-color);
  }

  &.checked {
    .preview-box {
      box-shadow: 0 0 0 2px var(--1s-accent-color);
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
