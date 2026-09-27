<template>
  <operate-form-item>
    <template #icon> <icon-bold></icon-bold> </template>
    <template #name> 厚度 </template>
    <template #content>
      <Select v-model="model">
        <SelectTrigger class="w-[80px] h-6 text-[11px]">
          <SelectValue>
            <span :style="{ fontWeight: model }"> {{ (fontWeightOptions.find(o => o.value === model) || {}).label }} </span>
          </SelectValue>
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
</template>

<script setup lang="ts">
import iconFontSize from "@/components/design/assets/icon/font-size.svg?component";
import { ref, reactive } from "vue";
import iconBold from "@/components/design/assets/icon/bold.svg?component";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
const model = defineModel({});

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

<style></style>
