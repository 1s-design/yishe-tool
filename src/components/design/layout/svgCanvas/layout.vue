<template>
    <div class="flex items-center gap-4 mx-1.5 my-1.5">
        <div class="label" style="width: 41.666%">宽度</div>
        <div style="width: 58.333%">
            <Input size="small" v-model="svgCanvasWidth" min="100" step="10"></Input>
        </div>
    </div>
    <div class="flex items-center gap-4 mx-1.5 my-1.5">
        <div class="label" style="width: 41.666%">
            高度
        </div>
        <div style="width: 58.333%">
            <Input v-model="svgCanvasHeight" size="small" min="100" step="10"></Input>
        </div>
    </div>
    <div class="flex items-center gap-4 mx-1.5 my-1.5">
        <div class="label" style="width: 41.666%">
            宽高比 
        </div>
        <div style="width: 58.333%">
            <div>{{ svgCanvasWidth / svgCanvasHeight }}</div>
        </div>
    </div>
    <div class="flex items-center gap-4 mx-1.5 my-1.5 justify-end">
        <div class="label" style="width: 41.666%">
            主画布
        </div>
        <div style="width: 58.333%">
            <Switch v-model:checked="svgCanvasSyncMainCanvas" />
        </div>
    </div>
</template>
    
<script setup lang='ts'>
import { svgCanvasChildren, svgCanvasWidth,svgCanvasHeight,svgCanvasSyncMainCanvas} from '@/components/design/store'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
</script>
    
<style lang="less" scoped>
.label{
    height: 100%;
    align-content: center;
    text-align: end;
}
</style>
<style>

</style>
