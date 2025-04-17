<template>
  <div class="content">
    <div class="header">
      <div class="title">我的项目</div>
      <vi-button mutate color="purple">新建项目</vi-button>
    </div>
    <ul class="project-lis">
      <project-item/>
      <project-item/>
      <project-item/>
      <project-item/>
      <project-item/>
      <project-item/>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import ProjectItem from '@/components/project-item/index.vue'
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
