/*
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-16 12:40:25
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2024-02-02 11:21:47
 * @FilePath: /1s/src/api/apiInstance.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
 */

import axios from "axios";
import {
    formDataFormatRequestInterceptor,
    messageResponseInterceptor,
    tokenRequestInterceptor,
    tokenResponseInterceptor,
    defaultResponseInterceptors
} from "./apiInterception";


// 全局设置
axios.defaults.timeout = 1000000; // 时间超时设置100s

// 读取配置中的请求地址
axios.defaults.baseURL = import.meta.env.VITE_API;

export const apiInstance: any = axios.create({
    validateStatus: function (status) {
        return status >= 200 && status < 300 || status === 401; // 允许 401
    }
});

export const source = axios.CancelToken.source();


apiInstance.interceptors.request.use(tokenRequestInterceptor);
apiInstance.interceptors.request.use(formDataFormatRequestInterceptor)
apiInstance.interceptors.response.use(tokenResponseInterceptor);
apiInstance.interceptors.response.use(messageResponseInterceptor);
apiInstance.interceptors.response.use(defaultResponseInterceptors);

