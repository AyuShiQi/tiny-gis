<template>
  <div class="setting-content">
    <form-item label="用户id">{{ userStore.id }}</form-item>
    <form-item label="用户名">{{ userStore.userName }}</form-item>
  </div>
</template>

<script lang="ts" setup>
import FormItem from '@/components/form-item/index.vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
