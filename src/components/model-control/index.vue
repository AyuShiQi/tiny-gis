<template></template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { ViMessage } from 'viog-ui'
import { ModelRegistryEntry } from '@/global/module'
import FormItem from '@/components/form-item/index.vue'

const props = defineProps<{ model?: ModelRegistryEntry }>()

const emit = defineEmits<{
  (e: 'update:modelValue', op: boolean): void
  (e: 'createFinish', res: false): void
  (e: 'createFinish', res: true, id: string): void
}>()

const formData = reactive({
  id: 0,
  title: '',
  scale: 1,
  titleDirection: [0, 0, 0] as [number, number, number],
  direction: [0, 0, 0] as [number, number, number]
})

const createLoading = ref(false)

watch(props, () => {
  const { model } = props
  if (model) {
    formData.id = model.jsonData.id
    formData.scale = model.jsonData.scale!
    formData.title = model.jsonData.label.text
    formData.direction = model.jsonData.basePosition
    formData.titleDirection = model.jsonData.label.position
  }
})
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
