import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cesium()],
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
  // server: {
  //   // 跨域配置
  //   proxy: {
  //     '/user': {
  //       target: 'http://182.43.52.124:8267',
  //     },
  //     '/passport': {
  //       target: 'http://182.43.52.124:8267',
  //     },
  //     '/getcodebye': {
  //       target: 'http://182.43.52.124:8267',
  //     },
  //     '/addEmail': {
  //       target: 'http://182.43.52.124:8267',
  //     },
  //     '/tab': {
  //       target: 'http://182.43.52.124:8267',
  //     },
  //     '/thumbnail': {
  //       target: 'http://182.43.52.124:8267',
  //     }
  //   }
  // },
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