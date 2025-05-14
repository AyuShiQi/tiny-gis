<template>
  <div class="setting-content">
    <vi-button
      color="red"
      @click="
        () => {
          userStore.clearInfo()
        }
      "
      >退出登录</vi-button
    >
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
