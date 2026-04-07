<template>
  <operate-form-item>
    <template #icon> <icon></icon> </template>
    <template #name> 条形码格式 </template>
    <template #content>
      <el-select v-model="model" size="small" class="operate-compact-select">
        <template #label="{ label, value }">
          <span> {{ label }} </span>
        </template>
        <el-option
          v-for="item in barcodeFormatOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          <span> {{ item.label }} </span>
        </el-option>
      </el-select>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/barcode-format.svg?component";
import { ref, reactive } from "vue";
const model = defineModel({});

const barcodeFormatOptions = reactive([
  { value: "CODE128", label: "CODE128 (自动模式切换)" },
  { value: "EAN13", label: "EAN-13 (国际标准商品编号)" },
  { value: "EAN8", label: "EAN-8 (短条形码)" },
  { value: "EAN5", label: "EAN-5 (附加信息)" },
  { value: "EAN2", label: "EAN-2 (附加信息)" },
  { value: "UPC", label: "UPC (A) (通用商品编号)" },
  { value: "UPC-E", label: "UPC (E) (压缩格式的UPC)" },
  { value: "CODE39", label: "CODE39 (可变长度条形码)" },
  { value: "ITF14", label: "ITF-14 (用于运输单位的条形码)" },
  { value: "ITF", label: "ITF (交错二进制条形码)" },
  { value: "MSI", label: "MSI (可变长度条形码)" },
  { value: "MSI10", label: "MSI10 (10位数字的MSI条形码)" },
  { value: "MSI11", label: "MSI11 (11位数字的MSI条形码)" },
  { value: "MSI1010", label: "MSI1010 (10位数字的固定长度条形码)" },
  { value: "MSI1110", label: "MSI1110 (11位数字的固定长度条形码)" },
  { value: "Pharmacode", label: "Pharmacode (用于药品标识的条形码)" },
  { value: "Codabar", label: "Codabar (用于特定应用场合的条形码)" },
]);
</script>

<style scoped>
.operate-compact-select {
  width: min(180px, 100%);
}
</style>
