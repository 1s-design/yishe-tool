<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <slot></slot>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-[340px]">
            <div class="addchild">
                <template v-for="v, k in canvasChildLabelMap">
                    <Button v-if="k !== 'canvas' && k !== 'html'" size="sm" class="rounded-full" @click="add(k)"> {{ v }} </Button>
                </template>

                <div style="flex: 1"></div>
            </div>
        </PopoverContent>
    </Popover>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import {
    CanvasController,
    addCanvasChild,
    removeCavnasChild,
    currentOperatingCanvasChild,
    showMainCanvas,
    canvasChildLabelMap
} from "./index.tsx";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const open = ref(false);

function add(type) {
    addCanvasChild({
        type: type,
    });
    document.body.click();
    open.value = false;
}
</script>

<style lang="less" scoped>
.addchild {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: .8em 0.4em;

    :deep(.el-button + .el-button) {
        margin-left: 0;
    }

    :deep(.el-button) {
        max-width: 100%;
        min-width: 0;
    }
}
</style>
