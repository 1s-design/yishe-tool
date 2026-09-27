<template>
    <div class="bar flex items-center justify-between">
        <Button variant="ghost" size="sm" class="gap-1.5" @click="showWorkspace = !showWorkspace">
            <Monitor class="h-3.5 w-3.5" />
            工作台
        </Button>

        <Button variant="ghost" size="sm" class="gap-1.5" @click="showDecalList = !showDecalList">
            <List class="h-3.5 w-3.5" />
            已引用贴纸 ({{ decals }})
        </Button>
        <div style="flex:1"></div>
    </div>
</template>
    
<script setup lang='ts'>
import { List, Monitor } from 'lucide-vue-next'
import { currentModelController, showWorkspace, showDecalList } from '@/components/design/store'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

const decals = computed(() => {
    return currentModelController.value.decalControllers.length
})

</script>
    
<style scoped lang="less">
.bar {
    // margin: 1rem;
    width: 100%;
    height: 40px;
    background: var(--1s-surface-background);
    padding: 0 2rem;
    // box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}
</style>