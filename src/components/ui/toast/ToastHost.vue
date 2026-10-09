<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto min-w-[240px] max-w-[360px] rounded-lg border p-3 shadow-lg"
        style="
          background-color: var(--1s-menu-background);
          border-color: var(--1s-menu-border);
          color: var(--1s-menu-text);
        "
      >
        <div class="flex items-start gap-2">
          <CheckCircle2
            v-if="t.type === 'success'"
            class="h-4 w-4 shrink-0 mt-0.5"
            style="color: #79d297"
          />
          <AlertCircle
            v-else-if="t.type === 'error'"
            class="h-4 w-4 shrink-0 mt-0.5"
            style="color: #fca397"
          />
          <AlertTriangle
            v-else-if="t.type === 'warning'"
            class="h-4 w-4 shrink-0 mt-0.5"
            style="color: #f7d15f"
          />
          <Info
            v-else-if="t.type === 'info'"
            class="h-4 w-4 shrink-0 mt-0.5"
            style="color: #7cc4f8"
          />
          <div class="flex-1 min-w-0">
            <p v-if="t.title" class="text-xs font-medium" style="color: var(--1s-menu-text)">
              {{ t.title }}
            </p>
            <p
              class="text-xs break-words"
              style="color: var(--1s-menu-text-secondary)"
            >
              {{ t.message }}
            </p>
          </div>
          <button
            class="shrink-0 hover:opacity-100 opacity-70"
            style="color: var(--1s-menu-text-secondary)"
            @click="remove(t.id)"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { toasts, remove } from './toast'
</script>
