<template>
  <div
    class="crop-preset-item"
    :class="{
      'crop-preset-item--highlighted': highlightedPresetId === guide.presetId,
    }"
    @click="$emit('toggle-highlight')"
  >
    <!-- Visibility checkbox -->
    <Checkbox
      :checked="guide.visible"
      @update:checked="$emit('toggle-visibility')"
      @click.stop
    />

    <!-- Color picker -->
    <input
      :value="guide.color"
      type="color"
      class="h-6 w-6 cursor-pointer rounded border border-input bg-transparent p-0"
      @click.stop
      @input="(e: Event) => $emit('color-change', (e.target as HTMLInputElement).value)"
    />

    <!-- Preset info -->
    <div class="crop-preset-item__info">
      <div class="crop-preset-item__name">
        {{ preset.name }}
        <span v-if="preset.type === 'pixel'" class="crop-preset-item__badge crop-preset-item__badge--pixel">像素</span>
        <span v-else class="crop-preset-item__badge crop-preset-item__badge--ratio">比例</span>
      </div>
      <div class="crop-preset-item__size">
        <template v-if="preset.type === 'pixel'">
          {{ preset.width }}×{{ preset.height }} px
        </template>
        <template v-else>
          {{ preset.width }}:{{ preset.height }}
          ({{ preset.ratio.toFixed(2) }})
        </template>
      </div>
    </div>

    <div style="flex: 1" />

    <!-- Remove button -->
    <Button
      variant="ghost"
      size="icon-sm"
      class="text-destructive hover:text-destructive"
      @click.stop="$emit('remove')"
    >
      <XCircle class="w-3.5 h-3.5" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { XCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { highlightedPresetId } from '../store'
import type { CropGuide, CropPreset } from '../types'

defineProps<{
  guide: CropGuide
  preset: CropPreset
}>()

defineEmits<{
  'toggle-visibility': []
  'toggle-highlight': []
  remove: []
  'color-change': [color: string]
}>()

const predefineColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#FF4757', '#2ED573', '#1E90FF', '#FFA502', '#7B68EE',
]
</script>

<style scoped>
.crop-preset-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
  border: 1px solid transparent;
}

.crop-preset-item:hover {
  background-color: var(--1s-control-hover-background, rgba(0, 0, 0, 0.04));
}

.crop-preset-item--highlighted {
  background-color: var(--1s-accent-color-faint, rgba(99, 102, 241, 0.08));
  border-color: var(--1s-accent-color, #6366f1);
}

.crop-preset-item__info {
  min-width: 0;
}

.crop-preset-item__name {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.crop-preset-item__size {
  font-size: 11px;
  color: var(--1s-text-color-secondary, #888);
  line-height: 1.3;
}

.crop-preset-item__badge {
  display: inline-block;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 600;
  margin-left: 4px;
  vertical-align: middle;
}

.crop-preset-item__badge--ratio {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}

.crop-preset-item__badge--pixel {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
</style>
