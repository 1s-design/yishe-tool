/*
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-16 12:40:25
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-10-20 07:34:01
 * @FilePath: /1s/src/api/apiInterception.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
 */
import { useLoginStatusStore } from "@/store/stores/login";
import { ElMessage } from 'element-plus'
import { message } from 'ant-design-vue'
import { doLogout } from "@/store/stores/loginAction";
import { useRouter } from "vue-router";
import { openLoginDialog, showLoginFormModal } from '@/modules/main/view/user/login/index.tsx'

const ownershipExcludedKeywords = ['/login', '/signup', '/page', '/list', '/delete', '/logout']
const ownershipWriteKeywords = [
  '/create',
  '/update',
  '/api/sticker-psd-set',
  '/api/publish-config',
  '/api/product',
  '/api/product-model',
  '/api/sticker',
  '/api/psd-template',
  '/api/font-template',
  '/api/custom-model',
  '/api/clip-material',
  '/api/draft',
  '/api/crawler/material/add',
  '/api/crawler/material/update',
  '/api/ai/tti-record',
  '/api/ai/tts-record',
  '/api/ai/tts/custom-voice',
  '/api/remotion-video-record',
  '/api/common-url',
  '/api/design-request'
]
const ownershipLegacyKeywords = [
  '/api/sticker',
  '/api/psd-template',
  '/api/font-template',
  '/api/custom-model',
  '/api/clip-material',
  '/api/draft',
  '/api/sticker-psd-set',
  '/api/crawler/material'
]

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function shouldInjectOwnership(url = '', method = '') {
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  const upperMethod = String(method).toUpperCase();
  if (!['POST', 'PUT', 'PATCH'].includes(upperMethod)) {
    return false;
  }
  if (ownershipExcludedKeywords.some((keyword) => normalizedUrl.includes(keyword))) {
    return false;
  }
  return ownershipWriteKeywords.some((keyword) => normalizedUrl.includes(keyword));
}

function shouldInjectUploaderId(url = '') {
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  return ownershipLegacyKeywords.some((keyword) => normalizedUrl.includes(keyword));
}

function appendOwnership(payload, userId, includeUploaderId) {
  if (payload instanceof FormData) {
    if (!payload.get('userId')) {
      payload.append('userId', userId);
    }
    if (includeUploaderId && !payload.get('uploaderId')) {
      payload.append('uploaderId', userId);
    }
    return payload;
  }

  if (!isPlainObject(payload)) {
    return payload;
  }

  if (payload.userId === undefined || payload.userId === null || payload.userId === '') {
    payload.userId = userId;
  }
  if (includeUploaderId && (payload.uploaderId === undefined || payload.uploaderId === null || payload.uploaderId === '')) {
    payload.uploaderId = userId;
  }
  return payload;
}

function ensureFormData(obj) {
  if (obj instanceof FormData) {
    return obj;
  } else if (obj instanceof Object) {
    const formData = new FormData();
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        formData.append(key, obj[key]);
      }
    }
    return formData;
  }
  return new FormData()
}


/*
    对象转 formData
*/
function objectToFormData(obj, form, namespace) {
  const formData = form || new FormData();

  for (let property in obj) {
    if (!obj.hasOwnProperty(property)) {
      continue;
    }

    const key = namespace ? `${namespace}[${property}]` : property;
    const value = obj[property];

    if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (value instanceof Array) {
      value.forEach((element, index) => {
        const arrayKey = `${key}[${index}]`;
        if (typeof element === 'object' && !(element instanceof File)) {
          objectToFormData(element, formData, arrayKey);
        } else {
          formData.append(arrayKey, element);
        }
      });
    } else if (typeof value === 'object' && !(value instanceof File)) {
      objectToFormData(value, formData, key);
    } else {
      formData.append(key, value);
    }
  }
  return formData;
}

/*
 暂时不需要兼容文件上传
*/
export const formDataFormatRequestInterceptor = (request) => {
  // request.data = ensureFormData(request.data);
  return request
}

/*
   保存token
*/
export const tokenResponseInterceptor = (response) => {
  let loginStore = useLoginStatusStore();
  
  // 优先从响应头获取token
  if (response.headers.authorization) {
    loginStore.token = response.headers.authorization
    console.log('🔑 从响应头获取token:', response.headers.authorization);
  }
  // 如果响应头没有token，尝试从响应体获取
  else if (response.data && response.data.data && response.data.data.token) {
    loginStore.token = response.data.data.token
    console.log('🔑 从响应体获取token:', response.data.data.token);
  }
  // 兼容旧的响应结构
  else if (response.data && response.data.token) {
    loginStore.token = response.data.token
    console.log('🔑 从响应体获取token(旧结构):', response.data.token);
  }
  
  return response;
}

export const tokenRequestInterceptor = (request) => {
  let loginStore = useLoginStatusStore();
  console.log('🔑 tokenRequestInterceptor被调用，当前token:', loginStore.token);
  console.log('🔑 请求URL:', request.url);

  const currentUserId = loginStore.userInfo?.id ? String(loginStore.userInfo.id) : '';
  if (currentUserId && shouldInjectOwnership(request.url, request.method)) {
    request.data = appendOwnership(
      request.data,
      currentUserId,
      shouldInjectUploaderId(request.url)
    );
  }

  if (loginStore.token) {
    request.headers.authorization = `Bearer ${loginStore.token}`;
    console.log('🔑 请求头设置token:', request.headers.authorization);
    console.log('🔑 完整请求头:', request.headers);
  } else {
    console.log('❌ 没有找到token，store状态:', {
      isLogin: loginStore.isLogin,
      token: loginStore.token,
      userInfo: loginStore.userInfo
    });
  }
  return request
}

/*
    建议处理接口定义的消息提示
*/
export const messageResponseInterceptor = (response) => {
  return response
}



import router from '@/modules/main/router'

export const defaultResponseInterceptors = (response) => {

  if (response?.data?.code === 400) {
    message.error(response.data.message)
    return Promise.reject()
  }



  // 无权限
  if (response?.data?.code === 401) {
    let loginStore = useLoginStatusStore()
    loginStore.logout()
    openLoginDialog()
    message.error('请登录 :-)')
    return Promise.reject()
  }

  if (response.data.code == 0) {
    return response
  }

  message.error(response?.data?.message)
  throw new Error(response)
}


import { showToast } from "vant";
export const mobileDefaultResponseInterceptors = (response) => {

  if (response?.data?.code === 400) {
    showToast(response.data.message)
    return Promise.reject()
  }

  // 无权限
  if (response?.data?.code === 401) {
    let loginStore = useLoginStatusStore()
    loginStore.logout()
    showToast('登录状态已失效，请重新登录')
    return Promise.reject()
  }

  if (response.data.code == 0) {
    return response
  }

  showToast(response?.data?.message)
  throw new Error(response)
}
