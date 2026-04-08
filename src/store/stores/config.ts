/*
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2024-01-23 22:50:51
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-07-26 06:37:48
 * @FilePath: /1s/src/store/stores/config.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
 */
import { defineStore } from "pinia"
import { ref } from 'vue'
import Api from '@/api'
import { createDefaultProjectConfig, normalizeProjectConfig } from "@/config/public";

export async function initConfigStoreBasicConfig() {
    const configStore = useConfigStore()
    // getBasicConfig 已经在 API 层解密了，直接使用即可
    const config = await Api.getBasicConfig()

    configStore.$patch(config)
}

export const useConfigStore = defineStore("global_config", () => {

    const ok = ref(false)

    // 文件对象存储
    const cos = ref()

    const json = ref(createDefaultProjectConfig() as any)
    // 本地配置，可以通过json文件修改
    fetch('/project.config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('project.config.json load error')
            }
            return response.json();
        })
        .then(data => {
            json.value = normalizeProjectConfig(data)
        })
        .catch(error => {
            json.value = createDefaultProjectConfig()
        });

    return {
        ok,
        cos,
        json
    }
})
