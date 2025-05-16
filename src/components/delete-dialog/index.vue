<template>
  <vi-dialog
    class="dark-dialog-mine"
    dark
    :modelValue="props.modelValue"
    @update:modelValue="
      (o: boolean) => {
        emit('update:modelValue', o)
      }
    "
    title="您确认要删除该项目吗"
    :toSure="handleDelete"
  />
</template>

<script lang="ts" setup>
import { deleteProj } from '@/network/project'
import { ViMessage } from 'viog-ui'
import { ListProject, Project } from '@/interface/project'

const props = defineProps<{
  modelValue: boolean
  target: ListProject | Project | null
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', op: boolean): void
  (e: 'deleteFinish'): void
}>()

const handleDelete = () => {
  if (!props?.target) {
    ViMessage.append('删除异常！请刷新重试', 2000)
    return false
  }

  // console.log(props.target.id)

  deleteProj({
    id: props?.target.id
  })
    .then(() => {
      ViMessage.append('删除成功', 2000)
      emit('deleteFinish')
    })
    .catch(() => {
      ViMessage.append('删除失败', 2000)
    })

  return true
}
</script>

<style lang="less" src="./global.less"></style>
