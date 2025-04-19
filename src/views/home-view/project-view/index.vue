<template>
  <div class="content">
    <div class="header">
      <div class="title">我的项目</div>
      <vi-button mutate color="purple">新建项目</vi-button>
    </div>
    <vi-scroll class="project-lis">
      <div class="empty" v-if="projectList.length === 0">
        <EmptyIcon/>
      </div>
      <div class="project-content" v-else>
        <project-item v-for="(proj, index) in projectList" :key="proj.id" :proj="proj" :index="index"/>
      </div>
    </vi-scroll>
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import EmptyIcon from '/public/empty.svg?component'
import ProjectItem from '@/components/project-item/index.vue'
import { onMounted, reactive } from 'vue'
import { deleteProj } from '@/network/project';
import { ViMessage } from 'viog-ui'
import { ListProject } from '@/interface/project';

const projectList = reactive<ListProject[]>([])

const handleDelete = (index: number) => {
  const target = projectList[index]
  if (!target) {
    ViMessage.append('删除异常！请刷新重试', 2000)
    return
  }

  // TODO
  deleteProj({
    token: '',
    id: target.id
  }).then(() => {
    ViMessage.append('删除成功', 2000)
  }).catch(() => {
    ViMessage.append('删除失败', 2000)
  })
}

onMounted(() => {

})
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
