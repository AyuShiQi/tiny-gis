import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'
import svgLoader from 'vite-svg-loader'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cesium(), svgLoader()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
        less: {
            modifyVars: {
                hack: `true; @import (reference) "${path.resolve("src/assets/css/base.less")}";`,
            },
            javascriptEnabled: true,
        },
    },
  },
  server: {
    // 跨域配置
    proxy: {
      // 代理 /project 模块
      '/project': {
        target: 'http://127.0.0.1:3000', // 后端服务地址
        changeOrigin: true, // 是否修改 origin
      },
      // 代理 /user 模块
      '/user': {
        target: 'http://127.0.0.1:3000', // 后端服务地址
        changeOrigin: true,
      },
      // 代理 /auth 模块
      '/auth': {
        target: 'http://127.0.0.1:3000', // 后端服务地址
        changeOrigin: true,
      },
      '/module': {
        target: 'http://127.0.0.1:3000', // 后端服务地址
        changeOrigin: true,
      },
    }
  },
  build: {
    outDir: './dist',
    assetsDir: './assetsDir',
    cssCodeSplit: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        entry: path.resolve(__dirname, './index.html'),
        // project: path.resolve(__dirname, './project/index.html')
      }
    }
  }
})