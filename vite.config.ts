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
      '/project': {
        target: 'http://127.0.0.1:4523/m1/3408606-1087246-default',
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