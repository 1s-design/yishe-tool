<template>
  <Dialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <DialogContent class="sm:max-w-[480px] p-5 gap-4">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-sm font-bold">
          <Sliders class="h-4 w-4 text-primary" />
          <span>AI 运行时连接设置</span>
        </DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          配置 AI Agent 与大模型后端的网络连接与鉴权模式
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-1 text-xs">
        <!-- 1. 连接模式卡片选择 (High Contrast Grid) -->
        <div class="space-y-2">
          <label class="font-bold text-foreground text-xs">1. 请求连接模式</label>
          <div class="grid grid-cols-2 gap-2.5">
            <!-- 服务端代理 -->
            <button
              type="button"
              class="flex flex-col items-start gap-2 p-3  border-2 text-left transition-all duration-150 relative overflow-hidden select-none cursor-pointer"
              :class="form.mode === 'proxy' ? 'border-primary bg-primary/10 text-foreground font-[550]' : 'border-border/70 bg-transparent text-muted-foreground hover:bg-muted/30 opacity-70'"
              @click="form.mode = 'proxy'"
            >
              <div class="absolute top-2.5 right-2.5">
                <div v-if="form.mode === 'proxy'" class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground -sm ring-2 ring-primary/30">
                  <Check class="h-3 w-3 stroke-[3.5]" />
                </div>
                <div v-else class="h-4.5 w-4.5 rounded-full border-2 border-dashed border-border/80 bg-background/40" />
              </div>

              <div class="flex items-center gap-1.5">
                <div class="flex h-6 w-6 items-center justify-center " :class="form.mode === 'proxy' ? 'bg-primary text-primary-foreground ' : 'bg-muted text-muted-foreground/60'">
                  <Zap class="h-3.5 w-3.5" />
                </div>
                <span class="text-xs" :class="form.mode === 'proxy' ? 'font-bold text-foreground' : 'font-medium'">服务端代理</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">推荐</span>
              </div>
              <div class="text-[10px] text-muted-foreground leading-tight">
                后端安全中转，专线加速，无需配置跨域与本地 API Key。
              </div>
            </button>

            <!-- 前端直连 -->
            <button
              type="button"
              class="flex flex-col items-start gap-2 p-3  border-2 text-left transition-all duration-150 relative overflow-hidden select-none cursor-pointer"
              :class="form.mode === 'direct' ? 'border-primary bg-primary/10 text-foreground font-[550]' : 'border-border/70 bg-transparent text-muted-foreground hover:bg-muted/30 opacity-70'"
              @click="form.mode = 'direct'"
            >
              <div class="absolute top-2.5 right-2.5">
                <div v-if="form.mode === 'direct'" class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground -sm ring-2 ring-primary/30">
                  <Check class="h-3 w-3 stroke-[3.5]" />
                </div>
                <div v-else class="h-4.5 w-4.5 rounded-full border-2 border-dashed border-border/80 bg-background/40" />
              </div>

              <div class="flex items-center gap-1.5">
                <div class="flex h-6 w-6 items-center justify-center " :class="form.mode === 'direct' ? 'bg-primary text-primary-foreground ' : 'bg-muted text-muted-foreground/60'">
                  <Link2 class="h-3.5 w-3.5" />
                </div>
                <span class="text-xs" :class="form.mode === 'direct' ? 'font-bold text-foreground' : 'font-medium'">前端直连</span>
              </div>
              <div class="text-[10px] text-muted-foreground leading-tight">
                浏览器直接请求大模型，延迟最低，支持私有 Key 或本地 Ollama。
              </div>
            </button>
          </div>
        </div>

        <!-- 2. 直连模式专属配置 (当开启直连时高亮展开) -->
        <div v-if="form.mode === 'direct'" class="space-y-3  border-2 border-primary/40 bg-primary/10 dark:bg-primary/20 p-3.5 animate-in fade-in-50 duration-200">
          <div class="flex items-center justify-between">
            <span class="font-bold text-foreground text-xs">直连凭证来源</span>
            <span class="px-2 py-0.5 text-[11px] font-bold bg-primary text-primary-foreground">
              系统解密 Key
            </span>
          </div>
          <div class="text-[10px] text-muted-foreground leading-tight">
            只能使用「AI 使用设置」中为本功能绑定的 Key，模型与 Base URL 取该 Key 的绑定配置。
          </div>
        </div>

        <!-- 3. 连通性测试区 -->
        <div class=" border border-border/70 bg-card p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-foreground text-xs">网络连通性诊断</span>
            <Button
              variant="outline"
              size="xs"
              class="h-6 text-[11px] gap-1 font-semibold"
              :disabled="testing"
              @click="handleTestConnection"
            >
              <Loader2 v-if="testing" class="h-3 w-3 animate-spin text-primary" />
              <Zap v-else class="h-3 w-3 text-amber-500" />
              <span>{{ testing ? '正在测试...' : '测试当前连接' }}</span>
            </Button>
          </div>

          <!-- 测试结果 -->
          <div
            v-if="testResult"
            class=" p-2 text-xs flex items-start gap-2 border"
            :class="testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200' : 'bg-destructive/10 border-destructive/30 text-destructive'"
          >
            <CheckCircle2 v-if="testResult.success" class="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <AlertCircle v-else class="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div class="space-y-0.5 min-w-0">
              <div class="font-bold flex items-center gap-2">
                <span>{{ testResult.success ? '连接正常' : '连接失败' }}</span>
                <span v-if="testResult.latencyMs > 0" class="text-[10px] font-mono font-normal opacity-80">
                  耗时 {{ testResult.latencyMs }}ms
                </span>
              </div>
              <div class="text-[11px] opacity-90 break-words">{{ testResult.message }}</div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="flex items-center justify-between gap-2 pt-2 border-t border-border/70">
        <Button variant="ghost" size="sm" class="text-xs text-muted-foreground hover:text-foreground" @click="handleReset">
          恢复默认 (代理模式)
        </Button>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" class="text-xs" @click="handleClose">
            取消
          </Button>
          <Button size="sm" class="text-xs font-bold px-4 gap-1" @click="handleSave">
            <Check class="h-3.5 w-3.5" />
            保存并应用
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import {
  aiSettings,
  updateAiSettings,
  resetAiSettings,
  testAiConnection,
  type AiSettings,
  type ConnectionTestResult,
} from "@/ai/settings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sliders,
  Zap,
  Link2,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-vue-next";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "saved"): void;
}>();

const testing = ref(false);
const testResult = ref<ConnectionTestResult | null>(null);

const form = reactive<AiSettings>({
  mode: "proxy",
});

function initForm() {
  form.mode = aiSettings.value.mode || "proxy";
  testResult.value = null;
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initForm();
    }
  },
  { immediate: true },
);

function handleClose() {
  emit("update:modelValue", false);
}

async function handleTestConnection() {
  testing.value = true;
  testResult.value = null;
  try {
    const result = await testAiConnection(form);
    testResult.value = result;
  } catch (err: any) {
    testResult.value = {
      success: false,
      latencyMs: 0,
      message: err.message || "测试请求异常",
    };
  } finally {
    testing.value = false;
  }
}

function handleSave() {
  updateAiSettings({
    mode: form.mode,
  });
  emit("saved");
  handleClose();
}

function handleReset() {
  resetAiSettings();
  initForm();
}
</script>
