<template>
    <operate-form-item>
        <template #icon>  </template>
        <template #name> 文字旋转方向 </template>
        <template #content>
            <Switch v-model:checked="model" />
        </template>
    </operate-form-item>
</template>
    
<script setup lang='ts'>
import icon from "@/components/design/assets/icon/italic.svg?component";
import { Switch } from '@/components/ui/switch'
const model = defineModel({})
</script> 
    
<style></style>
