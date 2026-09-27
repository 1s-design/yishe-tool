<template>
    <operate-form-item>
        <template #icon> <icon-italic></icon-italic> </template>
        <template #name> 斜体 </template>
        <template #content>
            <Switch v-model:checked="model" />
        </template>
    </operate-form-item>
</template>

<script setup lang='ts'>
import iconItalic from "@/components/design/assets/icon/italic.svg?component";
import { Switch } from '@/components/ui/switch'
const model = defineModel({})
</script>

<style></style>
