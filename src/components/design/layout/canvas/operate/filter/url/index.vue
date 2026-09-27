<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 高级滤镜 </template>
    <template #content>
      <Popover v-model:open="showPopover">
        <PopoverTrigger as-child>
          <Button variant="link" size="sm">
            {{ modelLabel }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto">
        <div class="filter-popover-panel">
          <template v-if="activeTab == Tab.BuiltIn">
            <div class="flex flex-col w-full" style="row-gap: 1rem">
              <div class="w-full">
              <div class="filter-toolbar w-full flex justify-between items-center">
                <Input
                  v-model="searchInput"
                  class="filter-search-input"
                  placeholder="关键字搜索"
                ></Input>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button variant="link" @click="removeCurrentFilter">
                        <Square class="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">禁用滤镜效果</TooltipContent>
                  </Tooltip>
                </div>
                <Tabs :model-value="activeCategory" @update:model-value="v => (activeCategory = v as any)">
                  <TabsList>
                    <TabsTrigger
                      v-for="category in SvgFilterCategoryOptions"
                      :key="category.value"
                      :value="category.value"
                    >
                      {{ category.label }}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    v-for="category in SvgFilterCategoryOptions"
                    :key="category.value"
                    :value="category.value"
                  >
                    <ScrollArea style="height:360px">
                      <div
                        v-if="withSearchFilter(category.children).length"
                        class="filter-grid flex flex-wrap"
                      >
                        <div
                          v-for="item in withSearchFilter(category.children)"
                          :style="{ flex: `0 0 ${(100 / 24) * 4}%` }"
                        >
                          <div
                            class="flex flex-col justify-center items-center filter-item"
                            :class="{ checked: filterIsChecked(item) }"
                            @click="useCurrentFiter(item)"
                          >
                            <div class="preview-box">
                              <div
                                class="w-full h-full flex justify-center items-center"
                                :style="{ filter: `url( #${item.filterId})` }"
                              >
                                <template v-if="item.displayRender">
                                  <component :is="item.displayRender"></component>
                                </template>
                                <template v-else>
                                  <desimage
                                    :src="SvgFilterResource.NORMAL_PREVIEW_IMAGE_URL"
                                  >
                                  </desimage>
                                </template>
                              </div>
                            </div>
                            <div
                              style="text-align: center; height: 16px; line-height: 16px"
                              class="text-ellipsis"
                            >
                              {{ item.filterLabel }}
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
            </div>
          </template>

          <!-- <template v-if="activeTab == Tab.Custom">
            <div>
              <ScrollArea height="360px">
                <div
                  v-for="(opt, index) in canvasStickerOptions.svgFilter.children"
                  :span="24"
                >
                  <template v-if="opt.type == SvgFilterEffects.DROP_SHADOW">
                    <div class="flex items-center flex-wrap" style="gap: 1rem">
                      <div>
                        {{ SvgFilterEffectDisplayLabelMap[opt.type] }}
                      </div>
                      <div class="label">横向偏移</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        v-model="opt.dx.value"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>
                      <div class="label">纵向偏移</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        v-model="opt.dy.value"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>
                      <div class="label">横向模糊</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        v-model="opt.stdDeviationX.value"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>
                      <div class="label">纵向模糊</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        v-model="opt.stdDeviationY.value"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>
                      <div class="label">投影颜色</div>
                      <colorPicker type="pure" v-model="opt.floodColor"></colorPicker>
                      <div class="label">投影透明度</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        max="1"
                        min="0.01"
                        step=".1"
                        v-model="opt.floodOpacity"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>

                      <Button @click="remove(index)" type="danger" size="small" plain>
                        移除
                      </Button>
                    </div>
                  </template>

                  <template v-if="opt.type == SvgFilterEffects.GAUSSIAN_BLUR">
                    <div class="flex items-center" style="column-gap: 1rem">
                      <div>
                        {{ SvgFilterEffectDisplayLabelMap[opt.type] }}
                      </div>
                      <div class="label">横向模糊</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        v-model="opt.stdDeviationX.value"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>
                      <div class="label">纵向模糊</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        v-model="opt.stdDeviationY.value"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>
                      <Button @click="remove(index)" type="danger" size="small" plain>
                        移除
                      </Button>
                    </div>
                  </template>

                  <template v-if="opt.type == SvgFilterEffects.MORPHOLOGY">
                    <div class="flex items-center" style="column-gap: 1rem">
                      <div>
                        {{ SvgFilterEffectDisplayLabelMap[opt.type] }}
                      </div>
                      <div class="label">横向半径</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        v-model="opt.radiusX.value"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>
                      <div class="label">纵向半径</div>
                      <Input
                        style="width: 80px"
                        type="number"
                        v-model="opt.radiusY.value"
                        size="small"
                      >
                        <template #suffix>
                          <span> {{ canvasStickerOptions.unit }}</span>
                        </template>
                      </Input>
                      <div class="label">模式</div>
                      <Select
                        style="width: 80px"
                        type="number"
                        v-model="opt.operator"
                        size="small"
                      >
                        <SelectItem
                          v-for="op in FeMorphologyOperatorOptions"
                          :value="op.value"
                          :label="op.label"
                        />
                      </Select>
                      <Button @click="remove(index)" type="danger" size="small" plain>
                        移除
                      </Button>
                    </div>
                  </template>
                </div>
              </ScrollArea>
            </div>
          </template> -->

          <div>
            <div class="w-full">
              <div class="flex toolbar items-center filter-footer">
                <!-- <template v-if="activeTab == Tab.BuiltIn">
                  <Button :icon="Switch" size="small" @click="activeTab = Tab.Custom">
                    使用自定义高级滤镜
                  </Button>

                  <Tooltip
                    content="开始组合滤镜时，可以为同一元素使用多种滤镜"
                    placement="bottom"
                  >
                    <Switch
                      inline-prompt
                      v-model:checked="model.isCompositeFilter"
                      disabled
                      active-text="组合滤镜"
                      inactive-text="单滤镜"
                    />
                  </Tooltip>
                </template>

                
                <template v-if="activeTab == Tab.Custom">
                  <Button :icon="Switch" size="small" @click="activeTab = Tab.BuiltIn">
                    使用内置滤镜
                  </Button>

                  <DropdownMenu>
                    <Button
                      style="margin-left: 1rem"
                      size="small"
                      type="primary"
                      plain
                    >
                      添加滤镜特效
                    </Button>
                    <template #dropdown>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          v-for="item in SvgFilterEffects"
                          @click="addSvgFilterEffect(item)"
                        >
                          {{ SvgFilterEffectDisplayLabelMap[item] }}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </template>
                  </DropdownMenu>
                </template> -->

                <div style="flex: 1"></div>

                <Button size="sm" variant="destructive" @click="showPopover = false">
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
        </PopoverContent>
      </Popover>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/filter.svg?component";
import { canvasStickerOptions } from "@/components/design/layout/canvas/index.tsx";
import {
  addSvgFilterEffect,
  SvgFilterEffects,
  SvgFilterEffectDisplayLabelMap,
  FeMorphologyOperatorOptions,
  SvgFilterResource,
} from "@/components/design/layout/canvas/children/svgFilter/index";
import { ref, computed } from "vue";
import { Square } from 'lucide-vue-next';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area' 
import desimage from "@/components/image.vue";
import {
  SvgFilterCategoryOptions,
  SvgFilterCustomEffectType,
} from "@/components/design/layout/canvas/children/svgFilter/builtIn/index";
import { useLocalStorage } from "@vueuse/core";
import { SvgFilterCategory } from "@/types/filter.ts";
import Utils from "@/common/utils";
import { GlobalConst } from "@/types/index.ts";

const model = defineModel({
  default: null,
});

type FilterModel = {
  filterId: string;
  isCompositeFilter: boolean;
};

const emptyImage = computed(() => {
  return Utils.transform.svgStringToUrl(GlobalConst.EMPTY_PLACEHOLDER_URL);
});

const searchInput = ref();

function withSearchFilter(children) {
  return children.filter((child) => {
    if (searchInput.value) {
      return child.filterLabel.includes(searchInput.value);
    }
    return true;
  });
}

const activeCategory = useLocalStorage(
  "_1s_svgFilterActiveCategory",
  SvgFilterCategory.Normal
);

const props = defineProps({
  tooltip: {
    default: "",
  },
});

enum Tab {
  BuiltIn, // 内置滤镜
  Custom, // 内置
}

const activeTab = useLocalStorage("_1s_svgFilterModeTab", Tab.BuiltIn);

/*
    移除当前滤镜 , 设为默认原始
*/
function removeCurrentFilter() {
  model.value.filterId = null;
  model.value.filterLabel = null;
  model.value.filterChildren = [];
}

const showPopover = ref(false);

function remove(index) {
  canvasStickerOptions.value.svgFilter.children.splice(index, 1);
}

function removeAll() {
  canvasStickerOptions.value.svgFilter.children = [];
}

// 标签明显
const modelLabel = computed(() => {
  if (model.value.isCompositeFilter) {
    return model.value.filterChildren.length > 0
      ? model.value.filterChildren.map((item) => item.filterLabel).join(",")
      : "未使用滤镜";
  } else {
    return model.value.filterLabel || "未使用滤镜";
  }
});

// 当前滤镜是否在使用中
function filterIsChecked(effect) {
  let filterId = effect.filterId;

  if (model.value?.isCompositeFilter) {
    return model.value.filterChildren.find((item) => item.filterId == filterId);
  } else {
    return model.value?.filterId == filterId;
  }
}

function useCurrentFiter(effect: SvgFilterCustomEffectType) {
  // 使用或取消使用

  let { filterId, filterLabel } = effect;
  let filterChildren = model.value.filterChildren;

  if (model.value.isCompositeFilter) {
    let find = filterChildren.find((child) => child.filterId == filterId);

    if (find) {
      // 移除
      filterChildren.splice(filterChildren.indexOf(find), 1);
    } else {
      filterChildren.push({
        filterId: filterId,
        filterLabel: filterLabel,
      });
    }
  } else {
    model.value.filterId = filterId;
    model.value.filterLabel = filterLabel;
  }
}
</script>

<style scoped lang="less">
.filter-popover-panel {
  width: min(760px, calc(100vw - 40px));
  max-width: 100%;
}

.filter-toolbar {
  min-height: 44px;
  padding: 0 12px;
  gap: 10px;
}

.filter-search-input {
  width: min(240px, 100%);
}

.filter-grid {
  row-gap: 8px;
  margin: 12px;
}

.filter-footer {
  min-height: 44px;
  column-gap: 10px;
}

.label {
  width: 64px;
  text-wrap: nowrap;
}

:deep([data-state="inactive"]) {
  color: rgba(0, 0, 0, 0.3);
}

:deep([data-state="active"]) {
  color: rgba(0, 0, 0, 0.8);
}

:deep([role="tablist"]) {
  margin: 0 15px;
}

.filter-item {
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
      rgba(27, 31, 35, 0.04) 0px 0px 0px 1px;
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
  .filter-popover-panel {
    width: min(680px, calc(100vw - 32px));
  }

  .filter-toolbar {
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 10px 12px;
  }

  .filter-search-input {
    width: 100%;
  }
}
</style>
