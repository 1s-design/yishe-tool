<template>
  <Dialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <DialogContent class="sm:max-w-[500px] p-5 gap-4">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-sm font-bold">
          <SlidersHorizontal class="h-4 w-4 text-primary" />
          <span>贴纸创作形式与参数配置</span>
        </DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          先选择单图或组图，再设置生成的数量或套数，逻辑更简单直接
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-1 text-xs">
        <!-- 1. 核心二选一：单图 vs 组图 -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-foreground text-xs">1. 选择创作形式</span>
            <span class="text-[11px] font-bold text-primary bg-primary/15 px-2.5 py-0.5 rounded-full border border-primary/30">
              当前生效：{{ currentFormatLabel }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <!-- 单图设计 -->
            <button
              type="button"
              class="flex flex-col items-start gap-2.5 p-3 rounded-lg border-2 text-left transition-all duration-150 relative overflow-hidden select-none cursor-pointer"
              :class="form.outputKind === 'single' ? 'border-primary bg-primary/20 dark:bg-primary/30 text-foreground ring-4 ring-primary/20 shadow-md font-bold scale-[1.02] opacity-100 z-10' : 'border-dashed border-border/70 bg-muted/10 text-muted-foreground hover:bg-muted/40 hover:opacity-85 opacity-40 grayscale-[25%]'"
              @click="setFormat('single')"
            >
              <div class="absolute top-2.5 right-2.5">
                <div v-if="form.outputKind === 'single'" class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30">
                  <Check class="h-3 w-3 stroke-[3.5]" />
                </div>
                <div v-else class="h-4.5 w-4.5 rounded-full border-2 border-dashed border-border/80 bg-background/40" />
              </div>

              <div class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" :class="form.outputKind === 'single' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/80 text-muted-foreground/60'">
                <Palette class="h-4 w-4" />
              </div>
              <div>
                <div class="text-xs" :class="form.outputKind === 'single' ? 'font-bold text-foreground' : 'font-medium'">单图设计</div>
                <div class="text-[10px] text-muted-foreground mt-0.5 leading-tight">制作独立的单张贴纸作品</div>
              </div>
            </button>

            <!-- 系列组图 -->
            <button
              type="button"
              class="flex flex-col items-start gap-2.5 p-3 rounded-lg border-2 text-left transition-all duration-150 relative overflow-hidden select-none cursor-pointer"
              :class="form.outputKind === 'group' ? 'border-primary bg-primary/20 dark:bg-primary/30 text-foreground ring-4 ring-primary/20 shadow-md font-bold scale-[1.02] opacity-100 z-10' : 'border-dashed border-border/70 bg-muted/10 text-muted-foreground hover:bg-muted/40 hover:opacity-85 opacity-40 grayscale-[25%]'"
              @click="setFormat('group')"
            >
              <div class="absolute top-2.5 right-2.5">
                <div v-if="form.outputKind === 'group'" class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30">
                  <Check class="h-3 w-3 stroke-[3.5]" />
                </div>
                <div v-else class="h-4.5 w-4.5 rounded-full border-2 border-dashed border-border/80 bg-background/40" />
              </div>

              <div class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" :class="form.outputKind === 'group' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/80 text-muted-foreground/60'">
                <Layers class="h-4 w-4" />
              </div>
              <div>
                <div class="text-xs" :class="form.outputKind === 'group' ? 'font-bold text-foreground' : 'font-medium'">系列组图</div>
                <div class="text-[10px] text-muted-foreground mt-0.5 leading-tight">制作成套同风格/主题的系列贴纸</div>
              </div>
            </button>
          </div>
        </div>

        <!-- 2. 数量与套数设置 -->
        <!-- 单图模式下的数量设置 -->
        <div v-if="form.outputKind === 'single'" class="space-y-2 rounded-lg border-2 border-primary/40 bg-primary/10 dark:bg-primary/20 p-3 shadow-xs animate-in fade-in-50 duration-200">
          <div class="flex items-center justify-between">
            <div class="font-bold text-foreground text-xs flex items-center gap-1.5">
              <Palette class="h-3.5 w-3.5 text-primary" />
              <span>生成张数设置</span>
            </div>
            <span class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary text-primary-foreground shadow-xs">
              {{ form.jobCount || 1 }} 张
            </span>
          </div>
          <div class="flex items-center gap-3 pt-1">
            <input
              v-model.number="form.jobCount"
              type="range"
              min="1"
              max="20"
              step="1"
              class="w-full accent-primary cursor-pointer h-1.5"
            />
          </div>
          <div class="text-[10px] text-muted-foreground leading-tight">
            <span>💡 {{ form.jobCount > 1 ? `将批量生成 ${form.jobCount} 款不同创意的单张贴纸设计` : '在画布直接生成 1 张最终贴纸设计' }}</span>
          </div>
        </div>

        <!-- 组图模式下的张数与套数设置 -->
        <div v-if="form.outputKind === 'group'" class="space-y-2.5 rounded-lg border-2 border-primary/40 bg-primary/10 dark:bg-primary/20 p-3 shadow-xs animate-in fade-in-50 duration-200">
          <div class="flex items-center justify-between">
            <div class="font-bold text-foreground text-xs flex items-center gap-1.5">
              <Layers class="h-3.5 w-3.5 text-primary" />
              <span>组图张数与套数设置</span>
            </div>
            <span class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary text-primary-foreground shadow-xs">
              共 {{ (form.jobCount || 1) * (form.memberCount || 4) }} 张贴纸
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2.5 pt-1">
            <!-- 每套张数 -->
            <div class="space-y-1 bg-background/70 p-2 rounded-lg border border-border/60">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-muted-foreground font-medium">每套组图张数:</span>
                <span class="font-bold text-primary font-mono">{{ form.memberCount || 4 }} 张/套</span>
              </div>
              <input
                v-model.number="form.memberCount"
                type="range"
                min="2"
                max="8"
                step="1"
                class="w-full accent-primary cursor-pointer h-1.5"
              />
            </div>

            <!-- 套组数量 -->
            <div class="space-y-1 bg-background/70 p-2 rounded-lg border border-border/60">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-muted-foreground font-medium">生成组图套数:</span>
                <span class="font-bold text-primary font-mono">{{ form.jobCount || 1 }} 套</span>
              </div>
              <input
                v-model.number="form.jobCount"
                type="range"
                min="1"
                max="10"
                step="1"
                class="w-full accent-primary cursor-pointer h-1.5"
              />
            </div>
          </div>

          <div class="text-[10px] text-muted-foreground leading-tight">
            <span>💡 制作规则：将生成 {{ form.jobCount || 1 }} 套系列贴纸，每套包含 {{ form.memberCount || 4 }} 张同风格贴纸，自动打包分组保存。</span>
          </div>
        </div>

        <!-- 3. 设计基础来源 -->
        <div class="space-y-1.5">
          <label class="font-bold text-foreground text-xs">2. 创作基础</label>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              class="flex items-center justify-between p-2.5 rounded-lg border-2 text-left transition-all duration-150 relative select-none cursor-pointer"
              :class="form.source === 'blank' && form.intent !== 'edit' ? 'border-primary bg-primary/20 dark:bg-primary/30 text-foreground font-bold ring-2 ring-primary/30 shadow-xs opacity-100' : 'border-dashed border-border/70 bg-muted/10 text-muted-foreground hover:bg-muted/40 hover:opacity-85 opacity-40 grayscale-[25%]'"
              @click="form.source = 'blank'; form.intent = 'create'"
            >
              <div class="flex items-center gap-2">
                <Sparkles class="h-3.5 w-3.5" :class="form.source === 'blank' && form.intent !== 'edit' ? 'text-primary' : 'text-muted-foreground/60'" />
                <span>从零全新设计 (清空画布)</span>
              </div>
              <div v-if="form.source === 'blank' && form.intent !== 'edit'" class="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs shrink-0">
                <Check class="h-2.5 w-2.5 stroke-[3.5]" />
              </div>
              <div v-else class="h-4.5 w-4.5 rounded-full border-2 border-dashed border-border/80 bg-background/40 shrink-0" />
            </button>

            <button
              type="button"
              class="flex items-center justify-between p-2.5 rounded-lg border-2 text-left transition-all duration-150 relative select-none cursor-pointer"
              :class="form.source === 'current-canvas' || form.intent === 'edit' ? 'border-primary bg-primary/20 dark:bg-primary/30 text-foreground font-bold ring-2 ring-primary/30 shadow-xs opacity-100' : 'border-dashed border-border/70 bg-muted/10 text-muted-foreground hover:bg-muted/40 hover:opacity-85 opacity-40 grayscale-[25%]'"
              @click="form.source = 'current-canvas'; form.intent = 'edit'"
            >
              <div class="flex items-center gap-2">
                <Edit3 class="h-3.5 w-3.5" :class="form.source === 'current-canvas' || form.intent === 'edit' ? 'text-primary' : 'text-muted-foreground/60'" />
                <span>基于当前画布修改优化</span>
              </div>
              <div v-if="form.source === 'current-canvas' || form.intent === 'edit'" class="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs shrink-0">
                <Check class="h-2.5 w-2.5 stroke-[3.5]" />
              </div>
              <div v-else class="h-4.5 w-4.5 rounded-full border-2 border-dashed border-border/80 bg-background/40 shrink-0" />
            </button>
          </div>
        </div>

        <!-- 4. 交付动作 -->
        <div class="space-y-1.5">
          <label class="font-bold text-foreground text-xs">3. 生成后交付动作</label>
          <div class="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              class="p-2.5 rounded-lg border-2 text-center transition-all duration-150 text-xs flex items-center justify-center gap-1.5 select-none cursor-pointer"
              :class="form.delivery === 'canvas' ? 'border-primary bg-primary/20 dark:bg-primary/30 text-foreground font-bold ring-2 ring-primary/30 shadow-xs opacity-100' : 'border-dashed border-border/70 bg-muted/10 text-muted-foreground hover:bg-muted/40 hover:opacity-85 opacity-40 grayscale-[25%]'"
              @click="form.delivery = 'canvas'"
            >
              <div v-if="form.delivery === 'canvas'" class="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                <Check class="h-2 w-2 stroke-[3.5]" />
              </div>
              <span>仅渲染到画布</span>
            </button>
            <button
              type="button"
              class="p-2.5 rounded-lg border-2 text-center transition-all duration-150 text-xs flex items-center justify-center gap-1.5 select-none cursor-pointer"
              :class="form.delivery === 'save' ? 'border-primary bg-primary/20 dark:bg-primary/30 text-foreground font-bold ring-2 ring-primary/30 shadow-xs opacity-100' : 'border-dashed border-border/70 bg-muted/10 text-muted-foreground hover:bg-muted/40 hover:opacity-85 opacity-40 grayscale-[25%]'"
              @click="form.delivery = 'save'"
            >
              <div v-if="form.delivery === 'save'" class="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                <Check class="h-2 w-2 stroke-[3.5]" />
              </div>
              <span>自动保存为贴纸</span>
            </button>
            <button
              type="button"
              class="p-2.5 rounded-lg border-2 text-center transition-all duration-150 text-xs flex items-center justify-center gap-1.5 select-none cursor-pointer"
              :class="form.delivery === 'export' ? 'border-primary bg-primary/20 dark:bg-primary/30 text-foreground font-bold ring-2 ring-primary/30 shadow-xs opacity-100' : 'border-dashed border-border/70 bg-muted/10 text-muted-foreground hover:bg-muted/40 hover:opacity-85 opacity-40 grayscale-[25%]'"
              @click="form.delivery = 'export'"
            >
              <div v-if="form.delivery === 'export'" class="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                <Check class="h-2 w-2 stroke-[3.5]" />
              </div>
              <span>直接下载 PNG</span>
            </button>
          </div>
        </div>

        <!-- 5. 附加设计约束 -->
        <div class="space-y-1.5">
          <label class="font-bold text-foreground text-xs">4. 附加偏好与约束 (可选)</label>
          <Input
            v-model="form.customInstructions"
            placeholder="例如：黑白复古风、高对比线条、去掉所有阴影、保持圆形轮廓..."
            class="h-8 text-xs bg-background"
          />
        </div>
      </div>

      <DialogFooter class="flex items-center justify-between gap-2 pt-2 border-t border-border/70">
        <Button variant="ghost" size="sm" class="text-xs text-muted-foreground hover:text-foreground" @click="handleReset">
          重置为默认 (1张单图)
        </Button>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" class="text-xs" @click="$emit('update:modelValue', false)">
            取消
          </Button>
          <Button size="sm" class="text-xs font-bold px-4 gap-1 shadow-sm" @click="handleConfirm">
            <Check class="h-3.5 w-3.5" />
            确认生效并在对话框反显
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from "vue";
import type { AgentTaskOptions } from "@/ai/agent/task-spec";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SlidersHorizontal,
  Palette,
  Layers,
  Sparkles,
  Edit3,
  Check,
} from "lucide-vue-next";

const props = defineProps<{
  modelValue: boolean;
  options: AgentTaskOptions;
}>();

const emit = defineEmits<{
  "update:modelValue": [val: boolean];
  "update:options": [val: AgentTaskOptions];
}>();

const form = reactive<AgentTaskOptions>({
  preset: "single",
  source: "blank",
  intent: "create",
  outputKind: "single",
  jobCount: 1,
  memberCount: 4,
  delivery: "save",
  customInstructions: "",
});

const currentFormatLabel = computed(() => {
  if (form.outputKind === "group") {
    const sets = form.jobCount || 1;
    const members = form.memberCount || 4;
    return `系列组图 (${sets} 套 × ${members} 张 = 共 ${sets * members} 张)`;
  }
  if (form.source === "current-canvas" || form.intent === "edit") {
    return "修改当前画布";
  }
  const count = form.jobCount || 1;
  return count > 1 ? `单图设计 (批量 ${count} 张)` : "单图设计 (1 张)";
});

watch(
  () => props.options,
  (newVal) => {
    Object.assign(form, {
      preset: newVal.preset || "single",
      source: newVal.source || "blank",
      intent: newVal.intent || "create",
      outputKind: newVal.outputKind || "single",
      jobCount: newVal.jobCount ?? 1,
      memberCount: newVal.memberCount || 4,
      delivery: newVal.delivery || "save",
      customInstructions: newVal.customInstructions || "",
    });
  },
  { immediate: true, deep: true }
);

function setFormat(kind: "single" | "group") {
  if (kind === "single") {
    form.preset = "single";
    form.outputKind = "single";
    form.source = "blank";
    form.intent = "create";
    form.delivery = form.delivery || "save";
    if (!form.jobCount) form.jobCount = 1;
  } else if (kind === "group") {
    form.preset = "group";
    form.outputKind = "group";
    form.source = "blank";
    form.intent = "create";
    form.delivery = "save";
    if (!form.jobCount) form.jobCount = 1;
    if (!form.memberCount) form.memberCount = 4;
  }
}

function handleReset() {
  Object.assign(form, {
    preset: "single",
    source: "blank",
    intent: "create",
    outputKind: "single",
    jobCount: 1,
    memberCount: 4,
    delivery: "save",
    customInstructions: "",
  });
  emit("update:options", { ...form });
  emit("update:modelValue", false);
}

function handleConfirm() {
  emit("update:options", { ...form });
  emit("update:modelValue", false);
}
</script>
