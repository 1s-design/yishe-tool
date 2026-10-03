<template>
  <div class="ops-panel">
    <div class="ops-panel__groups">
      <div
        v-for="group in groups"
        :key="group"
        class="ops-group"
      >
        <div class="ops-group__title">{{ group }}</div>
        <div class="ops-group__grid">
          <div
            v-for="op in getOpsByGroup(group)"
            :key="op.id"
            class="ops-card"
            :class="{ 'ops-card--active': activeOpId === op.id }"
            @click="toggleOp(op.id)"
          >
            <div class="ops-card__head">
              <div class="ops-card__name">{{ op.name }}</div>
              <div class="ops-card__desc">{{ op.description }}</div>
              <div class="ops-card__id">{{ op.id }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeOp" class="ops-detail">
      <div class="ops-detail__header">
        <div class="ops-detail__title">{{ activeOp.name }}</div>
        <div class="ops-detail__desc">{{ activeOp.description }}</div>
      </div>

      <div class="ops-detail__body">
        <div
          v-for="param in activeOp.params"
          :key="param.name"
          class="ops-param"
        >
          <label class="ops-param__label">
            {{ param.label }}
            <span v-if="param.required" class="ops-param__required">*</span>
          </label>
          <div class="ops-param__desc" v-if="param.description">{{ param.description }}</div>

          <Select
            v-if="param.type === 'select'"
            :model-value="formValues[activeOp.id][param.name] === '' || formValues[activeOp.id][param.name] === undefined ? '__empty__' : String(formValues[activeOp.id][param.name])"
            @update:model-value="v => formValues[activeOp.id][param.name] = (v === '__empty__' ? '' : v)"
          >
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="opt in param.options"
                :key="opt.value"
                :value="opt.value === '' ? '__empty__' : String(opt.value)"
              >
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <input
            v-else-if="param.type === 'color'"
            v-model="formValues[activeOp.id][param.name]"
            type="color"
            class="h-6 w-8 cursor-pointer rounded border border-input bg-transparent p-0"
          />

          <Switch
            v-else-if="param.type === 'boolean'"
            v-model:checked="formValues[activeOp.id][param.name]"
          />

          <Input
            v-else-if="param.type === 'number'"
            type="number"
            :model-value="formValues[activeOp.id][param.name]"
            :min="param.min"
            :max="param.max"
            class="w-full"
            @update:model-value="v => formValues[activeOp.id][param.name] = Number(v)"
          />

          <Input
            v-else
            v-model="formValues[activeOp.id][param.name]"
            :placeholder="param.description"
          />
        </div>
      </div>

      <div class="ops-detail__footer">
        <div
          v-if="lastResult"
          class="ops-result"
          :class="{ 'ops-result--success': lastResult.success, 'ops-result--fail': !lastResult.success }"
        >
          {{ lastResult.message }}
        </div>
        <Button
          variant="default"
          size="lg"
          :disabled="executing"
          @click="handleExecute(activeOp)"
        >
          执行操作
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from '@/common/message'
import {
  getOperationList,
  getOperationGroups,
  getOperationsByGroup,
  executeOperation,
  createDesignOperationContext,
} from '@/operations'
import type { OperationListItem, OperationResult } from '@/operations'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

const operations = ref<OperationListItem[]>([])
const groups = ref<string[]>([])
const activeOpId = ref<string | null>(null)
const executing = ref(false)
const lastResult = ref<OperationResult | null>(null)
const formValues = reactive<Record<string, Record<string, any>>>({})

const activeOp = computed(() => {
  if (!activeOpId.value) return null
  return operations.value.find((op) => op.id === activeOpId.value) || null
})

onMounted(() => {
  operations.value = getOperationList()
  groups.value = getOperationGroups()
  for (const op of operations.value) {
    formValues[op.id] = {}
    for (const param of op.params) {
      formValues[op.id][param.name] = param.default !== undefined ? param.default : (param.type === 'number' ? undefined : '')
    }
  }
})

function getOpsByGroup(group: string): OperationListItem[] {
  return operations.value.filter((op) => op.group === group)
}

function toggleOp(id: string) {
  activeOpId.value = activeOpId.value === id ? null : id
  lastResult.value = null
}

async function handleExecute(op: OperationListItem) {
  executing.value = true
  lastResult.value = null
  try {
    const ctx = createDesignOperationContext()
    const result = await executeOperation(op.id, { ...formValues[op.id] }, ctx)
    lastResult.value = result
    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  } catch (err: any) {
    lastResult.value = { success: false, message: err?.message || '执行失败' }
    message.error(lastResult.value.message)
  } finally {
    executing.value = false
  }
}
</script>

<style lang="less" scoped>
.ops-panel {
  display: flex;
  gap: 24px;
  height: calc(100vh - 120px);
  color: var(--1s-text-color);
}

.ops-panel__groups {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding-right: 8px;
}

.ops-group {
  margin-bottom: 20px;
}

.ops-group__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--1s-text-color-secondary);
  padding: 0 0 10px;
  letter-spacing: 0.5px;
}

.ops-group__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.ops-card {
  border: 1px solid var(--1s-border-color);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition:
    border-color var(--1s-transition-base),
    box-shadow var(--1s-transition-base),
    transform var(--1s-transition-base),
    background-color var(--1s-transition-base);
  background: var(--1s-elevated-background);

  &:hover {
    border-color: var(--1s-accent-color);
    box-shadow: var(--1s-shadow-md);
    transform: translateY(-2px);
  }

  &:active {
    
  }

  &--active {
    border-color: var(--1s-accent-color);
    box-shadow: 0 0 0 2px var(--1s-focus-ring-color);
  }
}

.ops-card__name {
  font-size: 14px;
  font-weight: 500;
}

.ops-card__desc {
  font-size: 12px;
  color: var(--1s-text-color-secondary);
  margin-top: 6px;
  line-height: 1.5;
}

.ops-card__id {
  font-size: 11px;
  color: var(--1s-text-color-secondary);
  opacity: 0.6;
  margin-top: 8px;
  font-family: monospace;
}

.ops-detail {
  width: 360px;
  flex-shrink: 0;
  border: 1px solid var(--1s-border-color);
  border-radius: 10px;
  background: var(--1s-elevated-background);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ops-detail__header {
  padding: 20px;
  border-bottom: 1px solid var(--1s-border-color);
  flex-shrink: 0;
}

.ops-detail__title {
  font-size: 16px;
  font-weight: 600;
}

.ops-detail__desc {
  font-size: 12px;
  color: var(--1s-text-color-secondary);
  margin-top: 6px;
  line-height: 1.5;
}

.ops-detail__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.ops-param {
  margin-bottom: 16px;
}

.ops-param__label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.ops-param__required {
  color: #ff4d4f;
}

.ops-param__desc {
  font-size: 11px;
  color: var(--1s-text-color-secondary);
  margin-bottom: 6px;
}

.ops-detail__footer {
  padding: 16px 20px;
  border-top: 1px solid var(--1s-border-color);
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.ops-result {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;

  &--success {
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    color: #52c41a;
  }

  &--fail {
    background: color-mix(in srgb, var(--el-color-danger) 10%, transparent);
    border: 1px solid #ffccc7;
    color: #ff4d4f;
  }
}
</style>
