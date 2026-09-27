<template>
    <operate-form-item>
        <template #icon> <icon></icon> </template>
        <template #name> {{ label }} </template>
        <template #content>
            <Switch v-model:checked="model" />
        </template>
    </operate-form-item>
</template>

<script setup lang='ts'>
import icon from "@/components/design/assets/icon/switch.svg?component";
import { Switch } from '@/components/ui/switch'
const model = defineModel({})

const props = defineProps({
    label: {
        default:'开关'
    }
})

</script>

<style></style>
