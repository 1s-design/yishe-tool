<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-18 18:49:18
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2024-01-28 20:55:22
 * @FilePath: /1s/src/modules/main/view/user/login/index.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
-->
<template>
  <div class="login-container">
    <password-login></password-login>
  </div>
</template>

<script setup>
import passwordLogin from "./passwordLogin.vue";
</script>

<style>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  flex: auto;
}
</style>
