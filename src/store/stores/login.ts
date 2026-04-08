/*
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-16 12:40:26
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-10-20 07:31:28
 * @FilePath: /1s/src/store/stores/login.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
 */
import { getLocalUserInfo, updateLocalUserInfo } from "@/store/stores/loginAction";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { reactive, ref, watch, toRaw, isReactive, isRef, unref } from "vue";
import Api from '@/api'
import to from 'await-to-js';
import { message } from "ant-design-vue";

export function normalizeTokenValue(tokenValue: unknown) {
  if (typeof tokenValue === "string") {
    const normalizedValue = tokenValue.trim().replace(/^Bearer\s+/i, '').trim();
    if (!normalizedValue || normalizedValue === "null" || normalizedValue === "undefined") {
      return "";
    }
    return normalizedValue;
  }

  if (tokenValue == null) {
    return "";
  }

  return String(tokenValue);
}

export function hasValidToken(tokenValue: unknown) {
  return !!normalizeTokenValue(tokenValue);
}

export async function initLoginStoreUserInfo() {
  const loginStore = useLoginStatusStore()

  if (!hasValidToken(loginStore.token)) {
    loginStore.logout()
    return false
  }

  if (loginStore.userInfo) {
    loginStore.isLogin = true
    return true
  }

  let [err, res] = await to(loginStore.getUserInfo())
  return !err && !!res
}

export const useLoginStatusStore = defineStore("login_status", () => {

  const isLogin = ref(false);
  const loginTime = ref();
  const userInfo = ref();
  const token = useLocalStorage('token', '');
  const once = ref();
  const isAdmin = ref(false);

  token.value = normalizeTokenValue(token.value)

  async function getUserInfo() {
    const loginStore = useLoginStatusStore()
    const normalizedToken = normalizeTokenValue(loginStore.token)

    if (!normalizedToken) {
      logout()
      return null
    }

    loginStore.token = normalizedToken

    try {
      const _userInfo = await Api.getUserInfo()
      if (_userInfo) {
        userInfo.value = _userInfo
        loginStore.isAdmin = _userInfo.isAdmin
        isLogin.value = true
        return _userInfo
      }

      logout()
      return null
    } catch (error) {
      logout()
      return null
    }
  }


  // getUserInfo()改为在启动程序时调用


  function logout() {
    isLogin.value = false
    userInfo.value = null
    loginTime.value = null
    token.value = ''
    once.value = false
    isAdmin.value = false
  }

  // 虚拟登录方法：设置 token 并获取用户信息
  async function virtualLogin(tokenValue: string, options?: { silent?: boolean }) {
    try {
      // 先清除原来的登录状态
      isLogin.value = false;
      userInfo.value = null;
      loginTime.value = null;
      isAdmin.value = false;
      
      // 清理 token 格式，确保不包含 Bearer 前缀
      const cleanToken = normalizeTokenValue(tokenValue)
      if (!cleanToken) {
        throw new Error('无效的 token')
      }
      
      // 设置新的 token
      token.value = cleanToken;

      // 设置登录状态
      isLogin.value = true;
      
      // 设置登录时间
      loginTime.value = new Date().toISOString();
      
      // 获取用户信息
      const currentUserInfo = await getUserInfo();
      if (!currentUserInfo) {
        throw new Error('获取用户信息失败');
      }

      if (!options?.silent) {
        message.success('自动登录成功')
      }
      return true;
    } catch (error) {
      logout()
      return false;
    }
  }

  return {
    isLogin, //
    userInfo,
    loginTime,
    token,
    once,
    isAdmin,
    logout,
    getUserInfo,
    virtualLogin
  };
});




// 同步用户信息到本地
// export function syncUserInfoToLocal() {
//   const loginStore = useLoginStatusStore()
//   // 同步登录信息到本地
//   watch(loginStore.$state, () => {
//     updateLocalUserInfo(deepToRaw(loginStore.$state))
//   })
// }




function deepToRaw(data) {
  if (isRef(data)) {
    return deepToRaw(unref(data))
  }

  if (isReactive(data)) {
    return deepToRaw(toRaw(data))
  }

  if (Array.isArray(data)) {
    return data.map(deepToRaw)
  }

  if (data !== null && typeof (data) === 'object') {
    const result = {}
    for (let key in data) {
      result[key] = deepToRaw(data[key])
    }
    return result
  }

  return data
}
