<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <icon-empty></icon-empty>
    <div style="color: var(--1s-text-color-tertiary); padding: 20px 0">工作台暂无内容</div>
    <Button variant="ghost" class="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">选择模型</Button>
  </div>
</template>
<script setup>
import iconEmpty from "@/icon/image/box-empty.svg?component";
import { Button } from "@/components/ui/button";
</script>
<style lang="less"></style>
