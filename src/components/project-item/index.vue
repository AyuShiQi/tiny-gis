<template>
  <div class="content">
    <div class="img" @click="handleJump">
      <img :src="proj?.url || 'https://picsum.photos/seed/edAp1/1680/1986'" alt="项目图" />
    </div>
    <div class="detail">
      <text-ellipsis class="title">{{ proj?.title ?? '未命名项目' }}</text-ellipsis>
      <div class="opt">
        <span class="time">{{ updateDate ?? '未知' }}</span>
        <vi-dropdown trigger="hover">
          <vi-icon class="icon" type="gengduo" />
          <template #content>
            <ul class="more-list">
              <li @click="handleDelete">删除</li>
              <vi-divider />
              <li @click="handleDetail">详情</li>
              <vi-divider />
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
import { computed } from 'vue'
import { ListProject } from '@/interface/project'
import { stringDateToStringFormat } from '@/utils/date'

const { proj, index } = defineProps<{ proj?: ListProject; index: number }>()
const emit = defineEmits<{
  (e: 'rename', index: number): void
  (e: 'detail', index: number): void
  (e: 'delete', index: number): void
  (e: 'jump', index: number): void
}>()

const updateDate = computed(() => {
  return stringDateToStringFormat(proj?.updateTime)
})

const handleDelete = () => {
  emit('delete', index)
}

const handleRename = () => {
  emit('rename', index)
}

const handleDetail = () => {
  emit('detail', index)
}

const handleJump = () => {
  emit('jump', index)
}
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
