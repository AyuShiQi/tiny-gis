<template>
  <div class="content">
    <div class="left-bar">
      <div class="profile">
        <div class="avatar">
          <vi-avater src="/public/avatar.png" alt="头像" class="ava"/>
          <div class="mask"></div>
        </div>
        <div class="title">TinyGIS</div>
      </div>
      <!-- <vi-menu @select="handleSelect"> -->
      <vi-menu class="menu" router>
        <vi-menu-item to="/home/project">
          <vi-icon type="xinyongka" class="ico"/>
          我的项目
        </vi-menu-item>
        <vi-menu-item to="/home/module">
          <vi-icon type="yingyong" class="ico"/>
          模型管理
        </vi-menu-item>
        <vi-menu-item to="/home/profile">
          <vi-icon type="shuju" class="ico"/>
          个人中心
        </vi-menu-item>
        <vi-menu-item to="/home/setting">
          <vi-icon type="shezhi" class="ico"/>
          设置
        </vi-menu-item>
      </vi-menu>
    </div>
    <router-view class="right-content"/>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
