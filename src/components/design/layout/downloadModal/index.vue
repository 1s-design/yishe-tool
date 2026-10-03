<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[580px] p-6 gap-5 bg-background/95 backdrop-blur-md border-border/80 shadow-2xl">
      <DialogHeader class="space-y-1.5 text-left">
        <DialogTitle class="text-lg font-bold flex items-center gap-2">
          <div class="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Download class="h-4 w-4" />
          </div>
          <span>下载客户端与插件</span>
        </DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          获取官方桌面端生产力工具与浏览器扩展，享受离线推理、自动化采集与高速渲染体验。
        </DialogDescription>
      </DialogHeader>

      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="card in cards"
          :key="card.key"
          class="flex flex-col justify-between p-4 rounded-lg bg-muted/40 border border-border/60 hover:border-primary/40 transition-colors gap-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center text-foreground shrink-0 shadow-xs">
                <Monitor v-if="card.key === 'client-unified'" class="h-5 w-5 text-indigo-500" />
                <Puzzle v-else class="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
                  {{ card.title }}
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-normal border border-border/40">
                    {{ card.platform }}
                  </span>
                </h4>
                <p class="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {{ card.description }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
            <Button
              v-for="action in card.actions"
              :key="action.key"
              size="sm"
              :variant="action.key === 'windows' || action.key === 'extension-zip' ? 'default' : 'outline'"
              class="h-8 text-xs gap-1.5 px-3 rounded-lg"
              :disabled="!action.downloadUrl"
              @click="handleDownload(action.downloadUrl)"
            >
              <Download class="h-3.5 w-3.5" />
              <span>{{ action.label }}</span>
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter class="sm:justify-between items-center pt-2 text-[11px] text-muted-foreground border-t border-border/40">
        <span>版本：最新稳定版 · 自动同步官方发布源</span>
        <Button variant="ghost" size="sm" class="h-7 text-xs" @click="emit('update:open', false)">
          关闭
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Monitor, Puzzle } from 'lucide-vue-next'
import { getDownloadConfig, DEFAULT_DOWNLOAD_CONFIG } from '@/api'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const cards = ref(DEFAULT_DOWNLOAD_CONFIG.cards)

async function loadConfig() {
  try {
    const res = await getDownloadConfig()
    if (res && res.cards && res.cards.length) {
      cards.value = res.cards
    }
  } catch {
    cards.value = DEFAULT_DOWNLOAD_CONFIG.cards
  }
}

function handleDownload(url: string) {
  if (!url) return
  window.open(url, '_blank', 'noopener')
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      loadConfig()
    }
  }
)

onMounted(loadConfig)
</script>
