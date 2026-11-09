<template>
  <operate-form-item style="align-items: start">
    <template #icon>
      <icon></icon>
    </template>
    <template #name> {{ label }} </template>
    <template #content>
      <div class="html-editor-trigger">
        <div class="html-editor-trigger__actions">
          <Button size="sm" variant="outline" class="text-primary border-primary/40 hover:bg-primary/10 hover:text-primary" @click="openEditor">编辑</Button>
          <Button size="sm" variant="outline" @click="clearContent" :disabled="!model">清空</Button>
        </div>
      </div>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/text-content.svg?component";
import { Button } from "@/components/ui/button";
import { detachHtmlTemplateFromTarget } from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";
import { openCodeCanvasDock } from "@/components/design/layout/rightDock.ts";

const model = defineModel<string>({ default: "" });

const props = defineProps({
  label: {
    default: "代码画布",
  },
  placeholder: {
    default: "请输入",
  },
  templateTarget: {
    type: Object,
    default: null,
  },
});

/** 在右侧 Dock 的「代码画布」分页中打开编辑器 */
function openEditor() {
  openCodeCanvasDock();
}

function clearContent() {
  model.value = "";
  if (props.templateTarget) {
    detachHtmlTemplateFromTarget(props.templateTarget);
  }
}
</script>

<style scoped lang="less">
.html-editor-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.html-editor-trigger__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
