<template>
  <div v-if="bindingFields.length" class="html-template-bindings">
    <div class="html-template-bindings__header">
      <div>
        <div class="html-template-bindings__title">当前模板变量</div>
        <div class="html-template-bindings__subtitle">
          {{ templateMeta?.name || "已启用模板" }} 的资源和文案在这里统一替换。
        </div>
      </div>
      <el-button link type="primary" @click="resetBindings">重置默认值</el-button>
    </div>

    <template v-for="field in bindingFields" :key="field.key">
      <operate-form-item
        v-if="field.type === 'text' || field.type === 'textarea' || field.type === 'number'"
        :style="{ alignItems: 'flex-start' }"
      >
        <template #icon>
          <component :is="getFieldIcon(field.type)"></component>
        </template>
        <template #name> {{ field.label }} </template>
        <template #content>
          <div class="html-template-bindings__input">
            <el-input
              v-if="field.type === 'text'"
              :model-value="getFieldValue(field)"
              size="small"
              :placeholder="field.placeholder || '请输入内容'"
              @update:model-value="updateFieldValue(field, $event)"
            />
            <el-input
              v-else-if="field.type === 'textarea'"
              :model-value="getFieldValue(field)"
              type="textarea"
              :rows="field.rows || 3"
              resize="none"
              :placeholder="field.placeholder || '请输入内容'"
              @update:model-value="updateFieldValue(field, $event)"
            />
            <el-input
              v-else
              :model-value="getFieldValue(field)"
              type="number"
              size="small"
              :min="field.min"
              :max="field.max"
              :step="field.step || 1"
              :placeholder="field.placeholder || '请输入数值'"
              @update:model-value="updateFieldValue(field, $event)"
            />
            <div v-if="field.description" class="html-template-bindings__desc">
              {{ field.description }}
            </div>
          </div>
        </template>
      </operate-form-item>

      <operate-item-color
        v-else-if="field.type === 'color'"
        :label="field.label"
        :tooltip="field.description || ''"
        :model-value="getFieldValue(field)"
        @update:model-value="updateFieldValue(field, $event)"
      />

      <operate-item-image-select
        v-else-if="field.type === 'image'"
        :label="field.label"
        :model-value="getFieldValue(field)"
        @update:model-value="updateFieldValue(field, $event)"
      />

      <operate-item-font-family
        v-else-if="field.type === 'font'"
        :label="field.label"
        :model-value="getFieldValue(field)"
        @update:model-value="updateFieldValue(field, $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import iconText from "@/components/design/assets/icon/text-content.svg?component";
import iconSize from "@/components/design/assets/icon/size.svg?component";
import operateFormItem from "@/components/design/layout/canvas/operate/operateFormItem.vue";
import operateItemColor from "@/components/design/layout/canvas/operate/color/index.vue";
import operateItemImageSelect from "@/components/design/layout/canvas/operate/imageSelect/index.vue";
import operateItemFontFamily from "@/components/design/layout/canvas/operate/fontFamily/fontFamily.vue";
import {
  ensureHtmlTemplateOptions,
  getValueByPath,
  normalizeHtmlTemplateBindings,
  setValueByPath,
} from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";

const model = defineModel({
  default: {} as any,
});

const templateMeta = computed(() => model.value?.htmlTemplateMeta || null);
const bindingFields = computed(() => model.value?.htmlTemplateFields || []);

watchEffect(() => {
  ensureHtmlTemplateOptions(model.value);
  if (!bindingFields.value.length) {
    return;
  }

  bindingFields.value.forEach((field) => {
    const currentValue = getValueByPath(model.value.htmlBindings, field.key);
    if (currentValue !== undefined && currentValue !== null && currentValue !== "") {
      return;
    }

    const defaultBindings = normalizeHtmlTemplateBindings(
      [field],
      model.value.htmlTemplateDefaultBindings || {}
    );
    const defaultValue = getValueByPath(defaultBindings, field.key);
    if (defaultValue !== undefined) {
      setValueByPath(model.value.htmlBindings, field.key, defaultValue);
    }
  });
});

function getFieldValue(field: any) {
  return getValueByPath(model.value?.htmlBindings || {}, field.key);
}

function updateFieldValue(field: any, value: any) {
  ensureHtmlTemplateOptions(model.value);
  setValueByPath(model.value.htmlBindings, field.key, value);
}

function resetBindings() {
  ensureHtmlTemplateOptions(model.value);
  model.value.htmlBindings = normalizeHtmlTemplateBindings(
    bindingFields.value,
    model.value.htmlTemplateDefaultBindings || {}
  );
}

function getFieldIcon(type: string) {
  if (type === "number") {
    return iconSize;
  }
  return iconText;
}
</script>

<style scoped lang="less">
.html-template-bindings {
  display: flex;
  flex-direction: column;
}

.html-template-bindings__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0 14px;
}

.html-template-bindings__title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.html-template-bindings__subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.html-template-bindings__input {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: min(320px, 100%);
  gap: 6px;
}

.html-template-bindings__desc {
  font-size: 11px;
  line-height: 1.5;
  color: #8a8f98;
  text-align: left;
}
</style>
