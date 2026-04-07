<template>
    <operate-form-item>
        <template #icon>
            <icon></icon>
        </template>
        <template #name> 元素裁剪 </template>
        <template #content>
            <el-popover width="auto" :visible="showPopover" :persistent="false" ref="popperRef"
                popper-class="el-popover-operation">
                <template #reference>
                    <el-button link @click="showPopover = !showPopover">
                        {{ label }}
                    </el-button>
                </template>
                <div class="clip-path-popover-panel">
                    <template v-if="activeTab == Tab.Custom">
                        <Dragger @change="customChange"></Dragger>
                    </template>
                    <template v-if="activeTab == Tab.BuiltIn">
                        <!-- <el-row>
                            <el-col :span="24">
                                <div style="height:64px;padding:0 2rem;" class="flex items-center">
                                    <el-input style="width:188px;" placeholder="关键字搜索"></el-input>
                                    <div style="flex:1"></div>
                                </div>
                            </el-col>
                        </el-row> -->
                        <el-row>
                            <el-scrollbar height="300px">
                                <el-col :span="24" class="clip-path-grid-wrap">
                                    <el-row class="w-full">
                                        <el-col :span="4" v-for="item in builtInClipPathList">
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
                                        </el-col>
                                    </el-row>
                                </el-col>
                            </el-scrollbar>
                        </el-row>
                    </template>

                    <div class="flex items-center" style="margin-top:1rem;">
                        <!-- <el-button v-if="activeTab == Tab.BuiltIn" @click="activeTab = Tab.Custom" size="small"> 自定义裁剪
                        </el-button>
                        <el-button v-else @click="activeTab = Tab.BuiltIn" size="small"> 使用内置裁剪 </el-button> -->
                        <div style="flex:1;min-width: 1rem;"></div>
                        <el-button @click="remove" size="small" type="danger" plain> 不使用裁剪 </el-button>
                        <el-button @click="showPopover = false" size="small" type="danger"> 关闭 </el-button>
                    </div>
                </div>
            </el-popover>
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
        color: #666;
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
  
