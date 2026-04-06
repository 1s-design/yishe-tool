<template>
  <el-collapse v-model="htmlCollapseActives">
    <el-collapse-item name="1" title="HTML代码">
      <operateItemHtmlInput
        label="HTML"
        placeholder="<div class='card'>这里输入 HTML 代码</div>"
        v-model="currentOperatingCanvasChild.htmlContent"
      />
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { ref } from "vue";
import operateItemHtmlInput from "@/components/design/layout/canvas/operate/htmlInput.vue";
import { currentOperatingCanvasChild } from "../index.tsx";

const htmlCollapseActives = ref(["1"]);
</script>

<style></style>
