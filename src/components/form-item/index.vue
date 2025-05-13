<template>
  <div class="vi-form-item" :class="[`vi-form-item-type-${type}`, `vi-form-item-size-${size}`, `vi-form-item-align-${align}`]">
    <div class="vi-form-label" v-if="label">
      {{ label }}
    </div>
    <div class="vi-form-input">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { label, type, size, align } = defineProps<{
  label: string
  type: string
  size: string
  align: string
}>()
</script>

<style lang="less"></style>
