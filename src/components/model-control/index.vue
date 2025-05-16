<template>
  <div class="create-form" v-show="props.model">
    <form-item label="ID">{{ formData.id }}</form-item>
    <form-item label="模型名称">
      <vi-input
        type="button"
        v-model="formData.title"
        @change="
          () => {
            if (model) {
              model?.extra.updateLabel({
                ...model?.jsonData.label,
                text: formData.title
              })
            }
          }
        "
        placeholder="请输入模型名称"
      />
    </form-item>
    <form-item label="模型坐标">
      <vi-input
        class="ipt-c"
        v-model="formData.direction[0]"
        type="button"
        @change="
          () => {
            if (model) {
              const curValue = Number(formData.direction[0])
              formData.direction[0] = Number.isNaN(curValue) ? 0 : curValue
              const newPosition: [number, number, number] = [...model.jsonData.basePosition]
              newPosition[0] = formData.direction[0]
              model.extra.setNewPosition(newPosition)
            }
          }
        "
      >
        <template #prefix> 经度 </template>
      </vi-input>
      <vi-input
        class="ipt-c"
        v-model="formData.direction[1]"
        type="button"
        @change="
          () => {
            if (model) {
              const curValue = Number(formData.direction[1])
              formData.direction[1] = Number.isNaN(curValue) ? 0 : curValue
              const newPosition: [number, number, number] = [...model.jsonData.basePosition]
              newPosition[1] = formData.direction[1]
              model.extra.setNewPosition(newPosition)
            }
          }
        "
      >
        <template #prefix> 纬度 </template>
      </vi-input>
      <vi-input
        class="ipt-c"
        v-model="formData.direction[2]"
        type="button"
        @change="
          () => {
            if (model) {
              const curValue = Number(formData.direction[2])
              formData.direction[2] = Number.isNaN(curValue) ? 0 : curValue
              const newPosition: [number, number, number] = [...model.jsonData.basePosition]
              newPosition[2] = formData.direction[2]
              model.extra.setNewPosition(newPosition)
            }
          }
        "
      >
        <template #prefix> 高度 </template>
        <template #suffix> 米 </template>
      </vi-input>
    </form-item>
    <form-item label="标签坐标">
      <vi-input
        class="ipt-c"
        v-model="formData.titleDirection[0]"
        type="button"
        @change="
          () => {
            if (model) {
              const curValue = Number(formData.titleDirection[0])
              formData.titleDirection[0] = Number.isNaN(curValue) ? 0 : curValue
              const newPosition: [number, number, number] = [...model.jsonData.basePosition]
              newPosition[0] = formData.titleDirection[0]
              model.extra.updateLabel({
                ...model?.jsonData.label,
                position: newPosition
              })
            }
          }
        "
      >
        <template #prefix> 经度偏移 </template>
        <template #suffix> 米 </template>
      </vi-input>
      <vi-input
        class="ipt-c"
        v-model="formData.titleDirection[1]"
        type="button"
        @change="
          () => {
            if (model) {
              const curValue = Number(formData.titleDirection[1])
              formData.titleDirection[1] = Number.isNaN(curValue) ? 0 : curValue
              const newPosition: [number, number, number] = [...model.jsonData.basePosition]
              newPosition[1] = formData.titleDirection[1]
              model.extra.updateLabel({
                ...model?.jsonData.label,
                position: newPosition
              })
            }
          }
        "
      >
        <template #prefix> 纬度偏移 </template>
        <template #suffix> 米 </template>
      </vi-input>
      <vi-input
        class="ipt-c"
        v-model="formData.titleDirection[2]"
        type="button"
        @change="
          () => {
            if (model) {
              const curValue = Number(formData.titleDirection[2])
              formData.titleDirection[2] = Number.isNaN(curValue) ? 0 : curValue
              const newPosition: [number, number, number] = [...model.jsonData.basePosition]
              newPosition[2] = formData.titleDirection[2]
              model.extra.updateLabel({
                ...model?.jsonData.label,
                position: newPosition
              })
            }
          }
        "
      >
        <template #prefix> 高度偏移 </template>
        <template #suffix> 米 </template>
      </vi-input>
    </form-item>
  </div>
</template>

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
