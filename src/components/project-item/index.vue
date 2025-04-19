<template>
  <div class="content">
    <div class="img">
      <img :src="proj?.url ?? '/public/projectDefault.png'" alt="头像">
    </div>
    <div class="detail">
      <text-ellipsis class="title">{{ proj?.title ?? '这是一个项目' }}</text-ellipsis>
      <div class="opt">
        <span class="time">{{ proj?.updateTime ?? '2024年1月2日 12:59:59' }}</span>
        <vi-dropdown trigger="hover">
          <vi-icon class="icon" type="gengduo"/>
          <template #content>
            <ul class="more-list">
              <li @click="handleDelete">删除</li>
              <vi-divider/>
              <li @click="handleDetail">详情</li>
              <vi-divider/>
              <li @click="handleRename">重命名</li>
            </ul>
          </template>
        </vi-dropdown>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TextEllipsis from '@/components/text-ellipsis/index.vue'
import { defineProps } from 'vue'
import { ListProject } from '@/interface/project';

const { proj, index } = defineProps<{ proj?: ListProject, index: number }>()
const emit = defineEmits<{
  (e: 'rename', index: number): void
  (e: 'detail', index: number): void
  (e: 'delete', index: number): void
}>()

const handleDelete = () => {
  emit('delete', index)
}

const handleRename = () => {
  emit('rename', index)
}

const handleDetail = () => {
  emit('detail', index)
}
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
