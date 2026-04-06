/*
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-16 12:40:26
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2024-01-21 13:17:16
 * @FilePath: /1s/src/store/stores/loginAction.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
 */
import { useLoginStatusStore } from "@/store/stores/login";
import router from "@/modules/main/router";
import Api from '@/api'

const LOGIN_FLAG = "1s_login";

// 是否为单次登录

export const getLocalUserInfo = () =>
  JSON.parse(
    localStorage.getItem(LOGIN_FLAG) || sessionStorage.getItem(LOGIN_FLAG)
  );


export const clearLocalUserInfo = () => {
  localStorage.removeItem(LOGIN_FLAG);
  sessionStorage.removeItem(LOGIN_FLAG);
};

export const updateLocalUserInfo = (data: Record<string, any>) => {
  const localUserInfo = getLocalUserInfo();
  const newLocalUserInfo = {
    ...localUserInfo,
    ...data,
  };

  if (useLoginStatusStore().once) {
    sessionStorage.setItem(LOGIN_FLAG, JSON.stringify(newLocalUserInfo));
  } else {
    localStorage.setItem(LOGIN_FLAG, JSON.stringify(newLocalUserInfo));
  }
};

export const isLogin = () => {
  let local = getLocalUserInfo()
  return local && local.isLogin
};

export const doLoginAction = async (data, once = false) => {
  // 保存登录时间
  const now = new Date().getTime();
  
  console.log('🔑 登录响应数据:', data);
  
  // 正确解析login响应结构：{ data: { token: "xxx" }, code: 0, status: true }
  const token = data?.data?.token;
  
  console.log('🔑 登录成功，获取到token:', token);
  
  // 同步用户信息
  const loginStatusStore = useLoginStatusStore();
  loginStatusStore.isLogin = true;
  loginStatusStore.loginTime = now;
  loginStatusStore.once = once;
  
  // 确保token被正确设置
  if (token) {
    loginStatusStore.token = token;
    console.log('🔑 设置token到store:', loginStatusStore.token);
  } else {
    console.log('❌ 没有找到token，检查响应数据结构:', {
      data: data,
      'data.data': data?.data,
      'data.data.token': data?.data?.token
    });
  }
  
  // 等待token设置完成后再调用getUserInfo
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log('🔑 开始调用getUserInfo，当前store中的token:', loginStatusStore.token);
  await loginStatusStore.getUserInfo();
};



export const doLogout = async () => {
  await Api.logout().catch((error) => {
    console.warn('退出登录接口调用失败，继续清理本地登录态:', error);
  });
  const loginStatusStore = useLoginStatusStore();
  loginStatusStore.logout();
};
