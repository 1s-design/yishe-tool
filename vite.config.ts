/*
 * @Author: chan-max 2651308363@qq.com
 * @Date: 2023-12-16 12:40:26
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-06-12 07:06:15
 * @FilePath: /yishe/vite.config.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
 */

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite';
// 编译文件支持旧游览器
import legacy from '@vitejs/plugin-legacy';
// import AntdvResolver from 'antdv-component-resolver'
import svgLoader from 'vite-svg-loader'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from "unplugin-auto-import/vite";

import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:1520";

  const build = {
    outDir: 'www',
    assetsDir: './',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    }
  }

  return {
    plugins: [
      // https dev
      // basicSsl(),
      Components({
        dts: "components.d.ts",
      }),
      legacy(),
      vue({
        template: {  }
      }),
      svgLoader(),
      vueJsx({
      }),

      // 自动引入
      AutoImport({
        imports: ["vue", "vue-router"],
        dts: "auto-imports.d.ts"
      }),

      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), "src/icon")],
        // 指定symbolId格式
        symbolId: 'icon-[name]',
      })
    ],
    base: '/',
    build,
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    server: {
      port: 1522,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false, // 防止证书引发的
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    resolve: {
      alias: {
        /*  @/ 代表src 路径下 ， @ 代表全局路径下 */
        "@": path.resolve(__dirname, "./src"),
        "@common": path.resolve(__dirname, "./common/"),
      },
    },
    define: {
      '__DEV__': mode !== 'production',
    }
  }
});
