<template>
  <div class="my-text-ellipsis">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="less">
  .my-text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>