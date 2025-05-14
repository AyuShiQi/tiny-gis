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
const {
  label = '',
  type = 'default',
  size = 'middle',
  align = 'right'
} = defineProps<{
  label?: string
  type?: 'default' | 'inline'
  size?: string
  align?: 'right'
}>()
</script>

<style lang="less"></style>
