<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 元素裁剪 </template>
        <template #content>
            <Popover v-model:open="showPopover">
                <PopoverTrigger as-child>
                    <Button variant="link">
                        {{ label }}
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto">
                    <div class="clip-path-popover-panel">
                        <template v-if="activeTab == Tab.Custom">
                            <Dragger @change="customChange"></Dragger>
                        </template>
                        <template v-if="activeTab == Tab.BuiltIn">
                            <!-- <div class="flex flex-wrap" style="row-gap: 4px">
                                <div :style="{ flex: `0 0 ${(100 / 24) * 24}%` }" class="flex flex-col items-center">
                                    <div style="height:64px;padding:0 2rem;" class="flex items-center">
                                        <Input style="width:188px;" placeholder="关键字搜索"></Input>
                                        <div style="flex:1"></div>
                                    </div>
                                </div>
                            </div> -->
                            <div class="flex flex-col">
                                <ScrollArea style="height:300px">
                                    <div class="clip-path-grid-wrap">
                                        <div class="flex flex-wrap w-full" style="row-gap: 4px">
                                            <div :style="{ flex: `0 0 ${(100 / 24) * 4}%` }" v-for="item in builtInClipPathList">
                                                <div class="flex flex-col items-center preview-item"
                                                    :class="{ checked: isChecked(item) }" @click="useCurrent(item)">
                                                    <div style="width:36px;height:36px;" class="preview-box">
                                                        <div style="width:100%;height:100%;"
                                                            :style="createPreviewBoxStyle(item)">
                                                        </div>
                                                    </div>
                                                    <div class="label"> {{
                                                        item.label }} </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        </template>

                        <div class="flex items-center" style="margin-top:1rem;">
                            <!-- <Button v-if="activeTab == Tab.BuiltIn" @click="activeTab = Tab.Custom" size="sm"> 自定义裁剪
                            </Button>
                            <Button v-else @click="activeTab = Tab.BuiltIn" size="sm"> 使用内置裁剪 </Button> -->
                            <div style="flex:1;min-width: 1rem;"></div>
                            <Button @click="remove" size="sm" variant="outline" class="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"> 不使用裁剪 </Button>
                            <Button @click="showPopover = false" size="sm" variant="destructive"> 关闭 </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </template>
    </operate-form-item>
</template>
  
<script setup lang="ts">
import icon from "@/components/design/assets/icon/clip-path.svg?component";
import { Dragger } from './dragger.tsx'
import Utils from '@/common/utils'
import { builtInClipPathList } from '@/components/design/layout/canvas/children/svg/clipPath/index.tsx'
// 通用的颜色操作
import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

const popperRef = ref()

/**
 * @description 自定义的裁剪
*/
function customChange(modelValue) {
    model.value = modelValue
}


const props = defineProps({
})

enum Tab {
    BuiltIn = 'builtIn',
    Custom = 'custom',
}

const activeTab = useLocalStorage('_1s_clipPathActiveTab', Tab.BuiltIn)

const showPopover = useLocalStorage('_1s_clipPathShowPopover', false)


const label = computed(() => {

    let clipPathId = model.value?.id

    if (!clipPathId) {
        return '无裁剪'
    }

    let current = builtInClipPathList.find((item) => item.id == clipPathId)

    return current.label

})


function createPreviewBoxStyle(item) {
    return { clipPath: item.type == 'css' ? item.cssValue : `url(#${item.url})`, background: item.previewBackground }
}


function isChecked(item) {
    return item.id == model.value?.id
}

function remove() {
    model.value = null
}

function useCurrent(item) {
    model.value = {
        ...item
    }
}

const model = defineModel({
    default: null
});


</script>
  
<style lang="less" scoped>
.clip-path-popover-panel {
    width: min(480px, calc(100vw - 40px));
    max-width: 100%;
}

.clip-path-grid-wrap {
    width: 100%;
    padding: 12px 16px;
}

.preview-item {
    row-gap: 8px;
    padding: 10px 8px;
    border-radius: .2rem;
    transition: all .2s;

    .preview-box {
        cursor: pointer;
    }

    .label {
        cursor: pointer;
        color: var(--1s-text-color-secondary);
        font-size: 11px;
        text-align: center;
    }
}

.checked {
    background: #100a09;

    .label {
        color: #fff;
    }
}
</style>
