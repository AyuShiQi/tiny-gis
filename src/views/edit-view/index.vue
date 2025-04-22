<template>
  <div class="content">
    <div class="loading-mask" v-show="loading">
      <vi-loading type="diamond" color="purple"/>
    </div>
    <div class="header">
      <div class="back"
      @click="() => {
        router.back()
      }">返回</div>
      <div class="title">{{ target?.title ?? '未命名' }}</div>
      <vi-icon type="shezhi" class="setting"/>
    </div>
    <gis-cesium/>
    <vi-drawer class="gis-drawer" v-model="leftOpen" direction="left"></vi-drawer>
    <vi-drawer class="gis-drawer" v-model="rightOpen"></vi-drawer>
  </div>
</template>

<script lang="ts" setup>
import GisCesium from './components/gis-cesium/index.vue'
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router'
import router from '@/router'
import { Message } from 'viog-ui'
import { getProjDetail } from '@/network/project';
import { Project } from '@/interface/project';

const route = useRoute()

const rightOpen = ref(true)
const leftOpen = ref(false)
const loading = ref(true)

const targetId = ref<string>()
const target = ref<Project>()

const queryDetail = async (id: string) => {
  loading.value = true
  const res = await getProjDetail({
    token: '',
    id
  })

  target.value = res.data
  loading.value = false
}

onMounted(() => {
  const { id } = route.params
  
  if (!id) {
    Message.append('项目不存在！', 2000)
    router.back()
  }

  targetId.value = id as string
  queryDetail(id as string)
})
</script>

<style lang="less" src="./global.less"></style>
<style scoped lang="less" src="./index.less"></style>