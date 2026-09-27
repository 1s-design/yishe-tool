<template>
  <div v-if="bindingFields.length" class="html-template-bindings">
    <div class="html-template-bindings__header">
      <div>
        <div class="html-template-bindings__title">当前模板变量</div>
        <div class="html-template-bindings__subtitle">
          {{ templateMeta?.name || "已启用模板" }} 的资源和文案在这里统一替换。
        </div>
      </div>
      <Button variant="link" @click="resetBindings">重置默认值</Button>
    </div>

    <template v-for="field in bindingFields" :key="field.key">
      <operate-form-item
        v-if="field.type === 'text' || field.type === 'textarea'"
        :style="{ alignItems: 'flex-start' }"
      >
        <template #icon>
          <component :is="getFieldIcon(field.type)"></component>
        </template>
        <template #name> {{ field.label }} </template>
        <template #content>
          <div class="html-template-bindings__input">
            <Input
              v-if="field.type === 'text'"
              :model-value="getFieldValue(field)"
              class="h-6 text-[11px]"
              :placeholder="field.placeholder || '请输入内容'"
              @update:model-value="updateFieldValue(field, $event)"
            />
            <Textarea
              v-else
              :model-value="getFieldValue(field)"
              :rows="field.rows || 3"
              class="resize-none"
              :placeholder="field.placeholder || '请输入内容'"
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

      <!-- child 组件类型绑定 -->
      <operate-form-item
        v-else-if="field.type === 'child'"
        :style="{ alignItems: 'center' }"
      >
        <template #icon>
          <component :is="getFieldIcon(field.type)"></component>
        </template>
        <template #name> {{ field.label }} </template>
        <template #content>
          <div class="html-template-bindings__child-controls">
            <Button
              v-if="getFieldValue(field)?.id"
              size="sm"
              variant="outline"
              class="text-primary border-primary/40 hover:bg-primary/10 hover:text-primary"
              @click="selectBoundElement(getFieldValue(field).id)"
            >
              配置此组件
            </Button>
            <span v-else style="font-size: 11px; color: #94a3b8;">未绑定组件</span>
          </div>
        </template>
      </operate-form-item>

      <!-- html 嵌套片段类型绑定 -->
      <template v-else-if="field.type === 'html'">
        <operate-item-html-input
          :label="field.label"
          :template-target="getFieldValue(field)"
          :model-value="getFieldValue(field)?.htmlContent || ''"
          @update:model-value="updateSubHtmlContent(field, $event)"
        />
        <div v-if="getFieldValue(field)?.htmlTemplateFields?.length" class="html-template-bindings__sub-bindings">
          <bindings-editor
            v-model="model.value.htmlBindings[field.key]"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import iconText from "@/components/design/assets/icon/text-content.svg?component";
import operateFormItem from "@/components/design/layout/canvas/operate/operateFormItem.vue";
import operateItemColor from "@/components/design/layout/canvas/operate/color/index.vue";
import operateItemImageSelect from "@/components/design/layout/canvas/operate/imageSelect/index.vue";
import operateItemFontFamily from "@/components/design/layout/canvas/operate/fontFamily/fontFamily.vue";
import operateItemHtmlInput from "@/components/design/layout/canvas/operate/htmlInput.vue";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  canvasStickerOptions,
  currentOperatingCanvasChildId,
  canvasChildDefaultOptionsMap,
} from "@/components/design/layout/canvas/index.tsx";
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

const bindableCanvasChildren = computed(() => {
  const children = canvasStickerOptions.value?.children || [];
  return children
    .filter((c: any) => c.type !== "canvas" && c.type !== "html")
    .map((c: any) => ({
      id: c.id,
      name: `${c.type.toUpperCase()} (${c.id.slice(-4)})`,
    }));
});

function selectBoundElement(id: string) {
  currentOperatingCanvasChildId.value = id;
}

function updateSubHtmlContent(field: any, value: string) {
  const subObj = getFieldValue(field);
  if (subObj) {
    subObj.htmlContent = value;
  }
}

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
  padding: 6px 0 10px;
  border-bottom: 1px solid var(--1s-border-color, #e4e4e7);
  margin-bottom: 8px;
}

.html-template-bindings__title {
  font-size: 11px;
  font-weight: 700;
  color: var(--1s-text-color, #09090b);
  letter-spacing: 0.02em;
}

.html-template-bindings__subtitle {
  margin-top: 2px;
  font-size: 10px;
  color: var(--1s-text-color-secondary, #71717a);
}

.html-template-bindings__input {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: min(320px, 100%);
  gap: 4px;
}

.html-template-bindings__desc {
  font-size: 10px;
  line-height: 1.4;
  color: var(--1s-text-color-tertiary, #a1a1aa);
  text-align: left;
}

.html-template-bindings__child-controls {
  display: flex;
  align-items: center;
}

.html-template-bindings__sub-bindings {
  padding-left: 12px;
  border-left: 2px solid var(--1s-border-color, #e4e4e7);
  margin: 4px 0 8px 8px;
}
</style>
