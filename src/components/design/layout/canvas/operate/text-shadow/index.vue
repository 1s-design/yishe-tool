<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 文字阴影 </template>
    <template #content>
      <div>
        <Button size="sm" variant="outline"> 选择阴影 </Button>
        <Popover
          :open="showPopover"
        >
          <PopoverTrigger as-child>
            <Button @click="click" size="sm" variant="link">
              <Settings class="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" class="w-[800px] max-w-[calc(100vw-2rem)]">
          <div>
            <div
              class="flex flex-wrap items-center"
              style="row-gap: 0.8rem; column-gap: 1rem; justify-content: space-around"
            >
              <template v-for="(item, index) in model">
                <div class="w-full">
                  <div class="flex items-center justify-between" style="column-gap: 1rem">
                    <span> {{ index + 1 }}: </span>
                    水平偏移:
                    <size-input
                      :unit-options="unitOptions"
                      v-model="model[index].horizontal.value"
                      v-model:unit="model[index].horizontal.unit"
                    ></size-input>
                    垂直偏移:
                    <size-input
                      :unit-options="unitOptions"
                      v-model="model[index].vertical.value"
                      v-model:unit="model[index].horizontal.unit"
                    ></size-input>
                    模糊半径:
                    <size-input
                      :unit-options="unitOptions"
                      v-model="model[index].blur.value"
                      v-model:unit="model[index].horizontal.unit"
                    ></size-input>
                    颜色:
                    <color-picker type="pure" v-model="model[index].color"></color-picker>
                    隐藏：
                    <Switch v-model:checked="model[index].disabled"></Switch>
                    <Button variant="outline" class="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" size="sm" @click="remove(index)">
                      移除
                    </Button>
                  </div>
                </div>
              </template>
              <div class="w-full">
                <div class="w-full flex items-stretch gap-0">
                  <Button @click="clear" size="sm" variant="outline"> 清空 </Button>
                  <Button @click="addShadow" size="sm" variant="outline" style="flex: 1">
                    添加阴影
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </PopoverContent>
        </Popover>
      </div>
    </template>
  </operate-form-item>
</template>

<script setup lang="tsx">
import icon from "@/components/design/assets/icon/text-shadow.svg?component";
import { ref, computed, onMounted, onBeforeMount } from "vue";
import { canvasStickerOptions,canvasStickerOptionsOnlyChild } from "@/components/design/layout/canvas/index.tsx";
import sizeInput from "../sizeInput.vue";
import colorPicker from "@/components/design/components/colorPicker/colorPicker.vue";
import {
  getPositionInfoFromOptions,
  formatToNativeSizeOption,
  parseTextShadowOptionsToCSS,
} from "@/components/design/layout/canvas/helper.tsx";
import { Settings } from "lucide-vue-next";
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

const model = defineModel({
  default: [],
});

const showPopover = ref(false);

function click() {
  console.log("click");
  showPopover.value = !showPopover.value;
}

const props = defineProps({
  tooltip: {
    default: "",
  },
});

function addShadow() {
  const unit = canvasStickerOptionsOnlyChild.value.width.unit;

  model.value.push({
    horizontal: {
      unit: unit,
      value: 5,
    },
    vertical: {
      unit: unit,
      value: 5,
    },
    blur: {
      unit: unit,
      value: 5,
    },
    color: {
      color: "#fff",
      type: "pure",
    },
  });
}

function remove(index) {
  model.value.splice(index, 1);
}

function clear() {
  model.value = [];
}

const unitOptions = computed(() => {
  return [
    {
      label: `使用当前画布单位(${canvasStickerOptionsOnlyChild.value.width.unit})`,
      value: canvasStickerOptionsOnlyChild.value.width.unit,
    },
    {
      label: "相对于画布宽的百分比",
      value: "vw",
    },
    {
      label: "相对于画布高的百分比",
      value: "vh",
    },
  ];
});
</script>

<style></style>
