<template>
  <main>
    <Accordion type="multiple" :model-value="actives" @update:model-value="v => actives = v">
      <AccordionItem value="1">
        <AccordionTrigger>
          <div class="title">文字属性</div>
        </AccordionTrigger>
        <AccordionContent>
          <div class="grid grid-cols-2 gap-x-6 gap-y-2 items-center">
            <div>
              <operate-form-item>
                <template #icon> <icon-font-size></icon-font-size> </template>
                <template #name> 文字大小 </template>
                <template #content>
                  <Input
                    v-model="operatingTextStickerOptions.fontSize"
                  ></Input>
                </template>
              </operate-form-item>
            </div>
            <div>
              <operate-form-item>
                <template #icon> <icon-bold></icon-bold> </template>
                <template #name> 厚度 </template>
                <template #content>
                  <Select
                    v-model="operatingTextStickerOptions.fontWeight"
                    style="width: 72px"
                  >
                    <SelectTrigger class="h-6 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="item in fontWeightOptions"
                        :key="item.value"
                        :value="item.value"
                      >
                        <span :style="{ fontWeight: item.value }"> {{ item.label }} </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </template>
              </operate-form-item>
            </div>

            <div>
              <operate-form-item>
                <template #icon> <icon-italic></icon-italic> </template>
                <template #name> 斜体 </template>
                <template #content>
                  <Switch v-model:checked="operatingTextStickerOptions.italic" />
                </template>
              </operate-form-item>
            </div>
            <div>
              <operate-form-item>
                <template #icon> <icon-font-color></icon-font-color> </template>
                <template #name> 字体颜色</template>
                <template #content>
                  <!-- <color-picker
                    v-model:pureColor="operatingTextStickerOptions.fontColor"
                    v-model:gradientColor="operatingTextStickerOptions.fontGradientColor"
                  ></color-picker> -->
                </template>
              </operate-form-item>
            </div>

            <div class="col-span-2">
              <operate-form-item>
                <template #icon> <icon-font-family></icon-font-family> </template>
                <template #name> </template>
                <template #content>
                  <template v-if="operatingTextStickerOptions.fontFamilyInfo">
                    <img
                      @click="showFontModal = true"
                      style="background: #f3f4f6; border-radius: 0.2em; height: 2.4em"
                      class="object-contain cursor-pointer"
                      :src="operatingTextStickerOptions.fontFamilyInfo.thumbnail?.url"
                      alt=""
                    />
                  </template>
                  <div v-else @click="showFontModal = true">暂未选择</div>
                </template>
              </operate-form-item>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="2">
        <AccordionTrigger>
          <div class="title">布局相关</div>
        </AccordionTrigger>
        <AccordionContent>
          <div class="grid grid-cols-2 gap-x-6 gap-y-2 items-center">
            <div>
              <operate-form-item>
                <template #icon> <icon-line-height></icon-line-height> </template>
                <template #name> 行高 </template>
                <template #content>
                  <Input
                    v-model="operatingTextStickerOptions.lineHeight"
                    min="0"
                    max="5"
                    step=".1"
                  ></Input>
                </template>
              </operate-form-item>
            </div>
            <div>
              <operate-form-item>
                <template #icon> <icon-letter-spacing></icon-letter-spacing> </template>
                <template #name> 间距 </template>
                <template #content>
                  <Input
                    v-model="operatingTextStickerOptions.letterSpacing"
                    min="-1"
                    max="1"
                    step=".1"
                  ></Input>
                </template>
              </operate-form-item>
            </div>
            <div>
              <operate-form-item>
                <template #icon> <icon-writing-mode></icon-writing-mode> </template>
                <template #name> 排列方式 </template>
                <template #content> </template>
              </operate-form-item>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="3">
        <AccordionTrigger>
          <div class="title">边框</div>
        </AccordionTrigger>
        <AccordionContent>
          <div class="grid grid-cols-2 gap-x-6 gap-y-2 items-center">
            <div>
              <operate-form-item>
                <template #icon><icon-border-color></icon-border-color> </template>
                <template #name> 边框颜色 </template>
                <template #content>
                  <color-picker
                    v-model:pureColor="operatingTextStickerOptions.borderColor"
                  ></color-picker>
                </template>
              </operate-form-item>
            </div>
            <div>
              <operate-form-item>
                <template #icon><icon-border-style></icon-border-style> </template>
                <template #name> 边框样式 </template>
                <template #content> </template>
              </operate-form-item>
            </div>
            <div>
              <operate-form-item>
                <template #icon><icon-border-width></icon-border-width> </template>
                <template #name> 边框宽度 </template>
                <template #content>
                  <Input
                    v-model="operatingTextStickerOptions.borderWidth"
                    min="0"
                    max="5"
                    step=".1"
                  ></Input>
                </template>
              </operate-form-item>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="4">
        <AccordionTrigger>
          <div class="title">背景</div>
        </AccordionTrigger>
        <AccordionContent>
          <div class="grid grid-cols-2 gap-x-6 gap-y-2 items-center">
            <div>
              <operate-form-item>
                <template #icon> <icon-background-color></icon-background-color> </template>
                <template #name> 背景色 </template>
                <template #content>
                  <color-picker
                    v-model:pureColor="operatingTextStickerOptions.backgroundColor"
                    v-model:gradientColor="
                      operatingTextStickerOptions.gradientBackgroundColor
                    "
                  ></color-picker>
                </template>
              </operate-form-item>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="5">
        <AccordionTrigger>
          <div class="title">特殊效果</div>
        </AccordionTrigger>
        <AccordionContent>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </main>
</template>

<script setup>
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";
import operateFormItem from "@/components/design/layout/canvas/operate/operateFormItem.vue";
import colorPicker from "@/components/design/components/colorPicker/colorPicker.vue";
import iconBold from "@/components/design/assets/icon/bold.svg?component";
import iconFontSize from "@/components/design/assets/icon/font-size.svg?component";
import iconFontColor from "@/components/design/assets/icon/font-color.svg?component";
import iconLineHeight from "@/components/design/assets/icon/line-height.svg?component";
import iconLetterSpacing from "@/components/design/assets/icon/letter-spacing.svg?component";
import iconWritingMode from "@/components/design/assets/icon/writing-mode.svg?component";
import iconFontFamily from "@/components/design/assets/icon/font-family.svg?component";
import iconBackgroundColor from "@/components/design/assets/icon/background-color.svg?component";
import iconItalic from "@/components/design/assets/icon/italic.svg?component";
import iconBorderWidth from "@/components/design/assets/icon/border-width.svg?component";
import iconBorderStyle from "@/components/design/assets/icon/border-style.svg?component";
import iconBorderColor from "@/components/design/assets/icon/border-color.svg?component";

import { operatingTextStickerOptions, showFontModal } from "../../store";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const r = ref();

const actives = ref(["1", "2", "3", "4"]);

const fontWeightOptions = reactive([
  {
    value: "100",
    label: "超细体",
  },
  {
    value: "200",
    label: "特细体",
  },
  {
    value: "300",
    label: "细体",
  },
  {
    value: "400",
    label: "正常体",
  },
  {
    value: "500",
    label: "中等体",
  },
  {
    value: "600",
    label: "半粗体",
  },
  {
    value: "700",
    label: "粗体",
  },
  {
    value: "800",
    label: "特粗体",
  },
  {
    value: "900",
    label: "超粗体",
  },
]);
</script>

<style scoped lang="less">
main {
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 20px;
}

.title {
  font-size: 10px;
  font-weight: bold;
  // height: 12px;
  // line-height: 12px;
  // padding-left: 0.5em;
  // border-left: 3px solid var(--primary);
}
</style>
