<template>
  <div class="gif-recorder">
    <Popover v-model:open="popoverVisible">
      <PopoverTrigger as-child>
        <Button
          :variant="isRecording ? 'destructive' : 'default'"
          size="sm"
          :disabled="isProcessing"
        >
          <Pause v-if="isRecording" class="w-3.5 h-3.5 mr-1" />
          <Play v-else class="w-3.5 h-3.5 mr-1" />
          {{ isRecording ? "停止录制" : "录制 GIF" }}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" class="w-[320px]">
      <div class="gif-recorder-panel">
        <div class="gif-recorder-header">
          <span class="gif-recorder-title">GIF 录制</span>
          <Badge v-if="isRecording" variant="destructive">
            录制中 {{ recordingDuration }}s
          </Badge>
          <Badge v-else-if="frameCount > 0" variant="success">
            {{ frameCount }} 帧
          </Badge>
        </div>

        <Separator class="my-3" />

        <div class="gif-recorder-config">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <Label class="w-[80px] shrink-0 text-xs">帧间隔</Label>
              <div class="flex items-center gap-2 flex-1">
                <Slider
                  :model-value="[config.interval]"
                  :min="50"
                  :max="1000"
                  :step="50"
                  class="flex-1"
                  @update:model-value="v => (config.interval = v[0])"
                />
                <Input
                  type="number"
                  :model-value="config.interval"
                  :min="50"
                  :max="1000"
                  :step="50"
                  class="h-6 text-[11px] w-16"
                  @update:model-value="v => (config.interval = Number(v))"
                />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Label class="w-[80px] shrink-0 text-xs">质量</Label>
              <div class="flex items-center gap-2 flex-1">
                <Slider
                  :model-value="[config.quality]"
                  :min="1"
                  :max="30"
                  :step="1"
                  class="flex-1"
                  @update:model-value="v => (config.quality = v[0])"
                />
                <Input
                  type="number"
                  :model-value="config.quality"
                  :min="1"
                  :max="30"
                  :step="1"
                  class="h-6 text-[11px] w-16"
                  @update:model-value="v => (config.quality = Number(v))"
                />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Label class="w-[80px] shrink-0 text-xs">循环播放</Label>
              <Switch v-model:checked="config.loop" />
            </div>

            <div class="flex items-center gap-2">
              <Label class="w-[80px] shrink-0 text-xs">宽度</Label>
              <Input
                type="number"
                :model-value="config.width"
                :min="0"
                :max="2000"
                :step="10"
                placeholder="自动"
                class="h-6 text-[11px] flex-1"
                @update:model-value="v => (config.width = Number(v))"
              />
            </div>

            <div class="flex items-center gap-2">
              <Label class="w-[80px] shrink-0 text-xs">高度</Label>
              <Input
                type="number"
                :model-value="config.height"
                :min="0"
                :max="2000"
                :step="10"
                placeholder="自动"
                class="h-6 text-[11px] flex-1"
                @update:model-value="v => (config.height = Number(v))"
              />
            </div>
          </div>
        </div>

        <Separator class="my-3" />

        <div class="gif-recorder-actions">
          <Button
            v-if="!isRecording && frameCount === 0"
            variant="default"
            size="sm"
            @click="handleStart"
          >
            开始录制
          </Button>

          <template v-if="isRecording">
            <Button variant="destructive" size="sm" @click="handleStop">
              停止录制
            </Button>
          </template>

          <template v-if="!isRecording && frameCount > 0">
            <Button
              variant="default"
              size="sm"
              :disabled="isProcessing"
              @click="handleExport"
            >
              导出 GIF
            </Button>
            <Button size="sm" variant="outline" @click="handleClear"> 清空 </Button>
          </template>
        </div>
      </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Play, Pause } from "lucide-vue-next";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { gifRecorder } from "./gifRecorder";
import { currentCanvasControllerInstance } from "./index.tsx";
import { message } from '@/common/message';

const popoverVisible = ref(false);

const {
  config,
  isRecording,
  isProcessing,
  frameCount,
  recordingDuration,
  startRecording,
  stopRecording,
  exportGif,
  clearFrames,
} = gifRecorder;

function getCanvasElement(): HTMLElement | null {
  const controller = currentCanvasControllerInstance.value;
  if (!controller) return null;
  return controller.el || null;
}

function handleStart() {
  const element = getCanvasElement();
  if (!element) {
    message.warning("请先打开画布");
    return;
  }
  startRecording(element);
  message.success("开始录制");
}

function handleStop() {
  stopRecording();
  message.success("录制完成");
}

async function handleExport() {
  try {
    await exportGif();
    message.success("GIF 导出成功");
  } catch (error: any) {
    message.error(error?.message || "导出失败");
  }
}

function handleClear() {
  clearFrames();
  message.info("已清空录制帧");
}
</script>

<style scoped>
.gif-recorder {
  display: inline-flex;
}

.gif-recorder-panel {
  padding: 4px 0;
}

.gif-recorder-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gif-recorder-title {
  font-size: 14px;
  font-weight: 600;
}

.gif-recorder-config {
  padding: 0 4px;
}

.gif-recorder-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
