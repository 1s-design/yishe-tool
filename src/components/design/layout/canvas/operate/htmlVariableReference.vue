<template>
  <div class="html-var-reference scrollable-panel">
    <div class="html-var-reference__tip">
      <span>提示：点击变量名可快速插入到编辑器光标处</span>
    </div>

    <!-- 当前模板已识别变量 -->
    <div class="html-var-reference__section">
      <div class="html-var-reference__section-name">
        当前模板变量
        <span class="badge" v-if="templateMagicVariableItems.length">
          {{ templateMagicVariableItems.length }}
        </span>
      </div>
      <div v-if="templateMagicVariableItems.length" class="html-var-reference__list">
        <div v-for="field in templateMagicVariableItems" :key="field.key" class="html-var-reference__row">
          <div class="variable-row-left">
            <div class="variable-header">
              <Badge
                class="type-tag"
                :variant="getBadgeType(field.type) === 'danger' ? 'destructive' : getBadgeType(field.type) === 'primary' ? 'default' : getBadgeType(field.type) === 'info' ? 'secondary' : getBadgeType(field.type) === 'success' ? 'success' : 'warning'"
              >{{ field.type.toUpperCase() }}</Badge>
              <span class="field-label">{{ field.label }}</span>
            </div>
            <div class="tokens-container">
              <span
                v-for="tokenItem in field.tokens"
                :key="tokenItem.token"
                class="clickable-token-tag"
                :title="tokenItem.description"
                @click="emit('insert', tokenItem.token)"
              >
                {{ tokenItem.token.replace(/^\{\{/, '').replace(/\}\}$/, '') }}
              </span>
            </div>
          </div>
          <div class="variable-row-right" v-if="getFieldBoundId(field)">
            <Button
              size="sm"
              variant="outline"
              class="configure-btn text-primary border-primary/40 hover:bg-primary/10 hover:text-primary"
              @click.stop="emit('configure', getFieldBoundId(field))"
            >
              配置
            </Button>
          </div>
        </div>
      </div>
      <div v-else class="html-var-reference__empty">当前暂无已识别的模板变量。</div>
    </div>

    <!-- 内置系统变量 -->
    <div class="html-var-reference__section">
      <div class="html-var-reference__section-name">内置系统变量</div>
      <div class="html-var-reference__list">
        <div v-for="group in systemGroupedVariables" :key="group.label" class="html-var-reference__row">
          <div class="variable-row-left">
            <div class="variable-header">
              <Badge variant="secondary" class="type-tag">{{ group.type.toUpperCase() }}</Badge>
              <span class="field-label">{{ group.label }}</span>
            </div>
            <div class="tokens-container">
              <span
                v-for="tokenItem in group.tokens"
                :key="tokenItem.token"
                class="clickable-token-tag"
                :title="tokenItem.description"
                @click="emit('insert', tokenItem.token)"
              >
                {{ tokenItem.token.replace(/^\{\{/, '').replace(/\}\}$/, '') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 可插入组件 -->
    <div class="html-var-reference__section html-var-reference__section--docs">
      <div class="html-var-reference__section-name html-var-reference__section-name--strong">可插入组件</div>
      <div class="component-reference-list">
        <div v-for="group in componentReferenceItems" :key="group.category" class="doc-section">
          <div class="doc-title">{{ group.category }}</div>
          <div class="doc-content">
            <div
              v-for="item in group.items"
              :key="item.token"
              class="component-reference-item"
              @click="emit('insert', item.token)"
            >
              <span class="component-ref-name">{{ item.name }}</span>
              <span class="component-ref-token">{{ item.token.replace(/^\{\{/, '').replace(/\}\}$/, '') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getValueByPath } from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";
import {
  buildTemplateVariableItems,
  componentReferenceItems,
  getHtmlVariableBadgeType,
  systemGroupedVariables,
} from "./htmlVariableTokens.ts";

const props = defineProps<{
  content: string;
  target: any;
}>();

const emit = defineEmits<{
  (e: "insert", token: string): void;
  (e: "configure", id: string): void;
}>();

const getBadgeType = getHtmlVariableBadgeType;

function getFieldBoundId(field: any) {
  if (field.type !== "child" && field.type !== "html") return null;
  const key = field.key;
  const bindings = props.target?.htmlBindings || {};

  const boundValue = getValueByPath(bindings, key);
  if (boundValue && typeof boundValue === "object" && boundValue.id) {
    return boundValue.id;
  }
  return null;
}

const templateMagicVariableItems = computed(() => buildTemplateVariableItems(props.content, props.target));
</script>

<style scoped lang="less">
.html-var-reference {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 12px;
  color: var(--1s-text-color, #09090b);
}

.html-var-reference__tip {
  padding: 6px 8px;
  background: var(--1s-elevated-background, #f4f4f5);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 4px;
  margin-bottom: 10px;

  span {
    color: var(--1s-text-color-secondary, #71717a);
    font-size: 10px;
    font-weight: 500;
  }
}

.html-var-reference__section {
  & + & {
    margin-top: 12px;
  }
}

.html-var-reference__section--docs {
  margin-top: 14px;
  border-top: 1px solid var(--1s-border-color);
  padding-top: 12px;
}

.html-var-reference__section-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: var(--1s-text-color, #09090b);
  margin-bottom: 6px;

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--1s-elevated-background, #f4f4f5);
    color: var(--1s-text-color-secondary, #71717a);
    font-size: 10px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 9999px;
    border: 1px solid var(--1s-border-color, #e4e4e7);
  }
}

.html-var-reference__section-name--strong {
  color: var(--1s-text-color);
  font-weight: 700;
}

.html-var-reference__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.html-var-reference__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--1s-surface-background, #ffffff);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: var(--1s-radius-medium);
  gap: 8px;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--1s-accent-color);
  }

  .variable-row-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .variable-row-right {
    flex-shrink: 0;
  }
}

.variable-header {
  display: flex;
  align-items: center;
  gap: 6px;

  .field-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--1s-text-color, #09090b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.type-tag {
  font-size: 8px;
  font-weight: 700;
  padding: 0 3px;
  height: 14px;
  line-height: 14px;
}

.tokens-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.clickable-token-tag {
  display: inline-flex;
  align-items: center;
  font-family: monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--1s-text-color, #09090b);
  background: var(--1s-elevated-background, #f4f4f5);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  padding: 1px 5px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
  word-break: break-all;

  &:hover {
    color: #ffffff;
    background: #3b82f6;
    border-color: #3b82f6;
  }
}

.html-var-reference__empty {
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--1s-elevated-background, #f4f4f5);
  font-size: 11px;
  line-height: 1.5;
  color: var(--1s-text-color-secondary, #71717a);
}

.component-reference-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.doc-section {
  background: var(--1s-surface-background, #ffffff);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 6px;
  padding: 8px;

  .doc-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--1s-text-color, #09090b);
    margin-bottom: 6px;
  }
}

.component-reference-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--1s-hover-background, rgba(0, 0, 0, 0.04));
  }

  .component-ref-name {
    font-size: 11px;
    color: var(--1s-text-color, #09090b);
    font-weight: 500;
    flex: 1;
    min-width: 0;
  }

  .component-ref-token {
    font-family: monospace;
    font-size: 10px;
    color: var(--1s-accent-color);
    background: var(--1s-hover-background);
    border: 1px solid color-mix(in srgb, var(--1s-accent-color) 25%, transparent);
    padding: 1px 4px;
    border-radius: 3px;
    flex-shrink: 0;
  }
}
</style>
