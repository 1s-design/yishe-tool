<template>
  <div class="designiy-setting">
    <Accordion
      type="multiple"
      class="setting-collapse"
      :model-value="activeNames"
      @update:model-value="v => (activeNames = v)"
    >
      <AccordionItem value="1" class="setting-collapse-item">
        <AccordionTrigger class="setting-collapse-header">最近更新</AccordionTrigger>
        <AccordionContent class="setting-collapse-wrap">
          <div>
            Consistent with real life: in line with the process and logic of real life, and
            comply with languages and habits that the users are used to;
          </div>
          <div>
            Consistent within interface: all elements should be consistent, such as: design
            style, icons and texts, position of elements, etc.
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="2" class="setting-collapse-item">
        <AccordionTrigger class="setting-collapse-header">当前最热</AccordionTrigger>
        <AccordionContent class="setting-collapse-wrap">
          <div>
            Operation feedback: enable the users to clearly perceive their operations by
            style updates and interactive effects;
          </div>
          <div>
            Visual feedback: reflect current state by updating or rearranging elements of
            the page.
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="3" class="setting-collapse-item">
        <AccordionTrigger class="setting-collapse-header">我的收藏</AccordionTrigger>
        <AccordionContent class="setting-collapse-wrap">
          <div>Simplify the process: keep operating process simple and intuitive;</div>
          <div>
            Definite and clear: enunciate your intentions clearly so that the users can
            quickly understand and make decisions;
          </div>
          <div>
            Easy to identify: the interface should be straightforward, which helps the users
            to identify and frees them from memorizing and recalling.
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="4" class="setting-collapse-item">
        <AccordionTrigger class="setting-collapse-header">分类</AccordionTrigger>
        <AccordionContent class="setting-collapse-wrap">
          <div>
            Decision making: giving advices about operations is acceptable, but do not make
            decisions for the users;
          </div>
          <div>
            Controlled consequences: users should be granted the freedom to operate,
            including canceling, aborting or terminating current operation.
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
<script setup>
import { onMounted, ref, computed } from "vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  showBaseModelSelect,
  currentOperatingBaseModelInfo,
  canvasBgColor,
  canvasBgOpacity,
} from "../../store.ts";
</script>
<style lang="less">
.designiy-setting {
  padding: 10px;

  .setting-collapse {
    border: none;
  }
  .setting-collapse-item {
    padding-bottom: 2px;
    border-bottom: none;
  }
  .setting-collapse-header {
    height: 25px;
    padding-left: 10px;
    background-color: #3d3d3d;
    border: none;
    color: #e5e5e5;
    font-size: 12px;
    font-weight: 100;
  }

  .setting-collapse-wrap {
    background-color: #3d3d3d;
    border: none;
  }
}
</style>
