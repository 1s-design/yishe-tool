<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> {{ label }} </template>
        <template #content>
            <div class="size-inputs-wrapper">
                <div class="input-group">
                    <span class="label-text">宽</span>
                    <div class="size-input flex items-center gap-1">
                        <Input class="h-6 text-[11px] min-w-0 flex-1" v-model.number="width.value" step="10" placeholder="宽" type="number" @input="onWidthChange" />
                        <span class="unit-text">{{ canvasStickerOptions.unit }}</span>
                    </div>
                </div>

                <Tooltip>
                    <TooltipTrigger as-child>
                        <div class="lock-btn" :class="{ 'lock-btn--active': locked }" @click="toggleLock">
                            <Lock v-if="locked" class="w-3.5 h-3.5" />
                            <Unlock v-else class="w-3.5 h-3.5" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">{{ locked ? '点击解锁比例' : '点击锁定比例' }}</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger as-child>
                        <div class="flip-btn" @click="flipSize">
                            <ArrowUpDown class="w-3.5 h-3.5" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">翻转宽高</TooltipContent>
                </Tooltip>
                
                <div class="input-group input-group--secondary">
                    <span class="label-text">高</span>
                    <div class="size-input flex items-center gap-1">
                        <Input class="h-6 text-[11px] min-w-0 flex-1" v-model.number="height.value" step="10" placeholder="高" type="number" @input="onHeightChange" />
                        <span class="unit-text">{{ canvasStickerOptions.unit }}</span>
                    </div>
                </div>
            </div>
        </template>
    </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/size.svg?component";
import { canvasStickerOptions } from '@/components/design/layout/canvas/index.tsx'
import { Lock, Unlock, ArrowUpDown } from "lucide-vue-next";
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { ref } from 'vue'

const props = defineProps({
    label: {
        default: "尺寸",
    }
});

const width = defineModel<any>("width", { default: { value: 0 } });
const height = defineModel<any>("height", { default: { value: 0 } });

const locked = ref(false)
let lockedRatio = 1
let updating = false

function toggleLock() {
    if (!locked.value) {
        const w = Number(width.value?.value) || 0
        const h = Number(height.value?.value) || 0
        lockedRatio = h === 0 ? 1 : w / h
    }
    locked.value = !locked.value
}

function onWidthChange() {
    if (!locked.value || updating) return
    const w = Number(width.value?.value) || 0
    if (w <= 0) return
    updating = true
    const newH = Math.round(w / lockedRatio)
    height.value = { ...height.value, value: newH || 1 }
    updating = false
}

function onHeightChange() {
    if (!locked.value || updating) return
    const h = Number(height.value?.value) || 0
    if (h <= 0) return
    updating = true
    const newW = Math.round(h * lockedRatio)
    width.value = { ...width.value, value: newW || 1 }
    updating = false
}

function flipSize() {
    const w = Number(width.value?.value) || 0
    const h = Number(height.value?.value) || 0
    width.value = { ...width.value, value: h }
    height.value = { ...height.value, value: w }
    // 如果锁定了比例，更新锁定比例
    if (locked.value) {
        lockedRatio = h === 0 ? 1 : w / h
    }
}
</script>

<style scoped lang="less">
.size-inputs-wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 12px;
    width: 100%;
    min-width: 0;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 0 1 auto;
    min-width: 0;
    
    .label-text {
        font-size: 11px;
        color: var(--1s-text-color-tertiary);
        flex-shrink: 0;
    }
}

.input-group--secondary {
    margin-left: 0;
}

.size-input {
    width: 86px;
}

.unit-text {
    font-size: 9px;
    color: #ccc;
}

.lock-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    cursor: pointer;
    color: #bbb;
    flex-shrink: 0;
    transition: all 0.15s;

    &:hover {
        color: var(--1s-text-color-secondary);
        background: var(--1s-control-surface-muted);
    }

    &--active {
        color: var(--1s-accent-color);
        background: rgba(64, 158, 255, 0.08);

        &:hover {
            background: rgba(64, 158, 255, 0.15);
        }
    }
}

.flip-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    cursor: pointer;
    color: #bbb;
    flex-shrink: 0;
    transition: all 0.15s;
    transform: rotate(90deg);

    &:hover {
        color: var(--1s-text-color-secondary);
        background: var(--1s-control-surface-muted);
    }
}

@media (max-width: 1080px) {
    .size-input {
        width: 82px;
    }

    .input-group {
        gap: 3px;
    }

    .input-group .label-text {
        font-size: 10px;
    }
}
</style>


