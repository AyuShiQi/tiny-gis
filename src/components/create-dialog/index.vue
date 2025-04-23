<template>
  <vi-dialog
  title="新建项目"
  class="create-dialog"
  noSure
  :modelValue="props.modelValue"
  @update:modelValue="(o: boolean) => { emit('update:modelValue', o) }">
  </vi-dialog>
</template>

<script lang="ts" setup>
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', op: boolean): void
  (e: 'createFinish'): void
}>()


</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
