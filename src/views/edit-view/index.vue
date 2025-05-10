<template>
  <div class="content">
    <div class="loading-mask" v-show="loading || !viewerIsExist">
      <vi-loading type="diamond" color="purple"/>
    </div>
    <div class="header">
      <div class="back"
      @click="() => {
        router.back()
      }">返回</div>
      <div class="title">{{ target?.title ?? '未命名' }}</div>
      <vi-icon type="shezhi" class="setting" @click="() => { settingOpen = true }"/>
    </div>
    <gis-cesium @viewerExistChange="(isExist) => { viewerIsExist = isExist }"/>
    <vi-drawer class="gis-drawer" v-model="leftOpen" direction="left"></vi-drawer>
    <vi-drawer class="gis-drawer" v-model="rightOpen"></vi-drawer>
  </div>
  <vi-dialog
  title="设置"
  v-model="settingOpen"
  class="setting-dialog"
  noUnsure>
    <div class="line">
      <div class="title">id</div>
      <div class="desc">{{ target?.id }}</div>
    </div>
    <div class="line">
      <div class="title">标题</div>
      <div class="desc">{{ target?.title }}</div>
    </div>
    <vi-divider/>
    <div class="line">
      <div class="title">创建时间</div>
      <div class="desc">{{ unixToStringFormat(target?.createTime) }}</div>
    </div>
    <vi-divider/>
    <div class="line">
      <div class="title">更新时间</div>
      <div class="desc">{{ unixToStringFormat(target?.updateTime) }}</div>
    </div>
    <vi-divider/>
    <div class="line">
      <vi-button color="red" mutate @click="() => { deleteOpen = true }">删除项目</vi-button>
    </div>
  </vi-dialog>
  <delete-dialog v-model="deleteOpen" :target="target" @deleteFinish="() => { router.replace('/home/project') }"/>
</template>

<script lang="ts" setup>
import DeleteDialog from '@/components/delete-dialog/index.vue'
import GisCesium from './components/gis-cesium/index.vue'
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router'
import router from '@/router'
import { Message } from 'viog-ui'
import { getProjDetail } from '@/network/project';
import { Project } from '@/interface/project';
import { unixToStringFormat } from '@/utils/date'

const route = useRoute()

const rightOpen = ref(true)
const leftOpen = ref(false)
const settingOpen = ref(false)
const deleteOpen = ref(false)
const loading = ref(true)
const viewerIsExist = ref(false)

const targetId = ref<string>()
const target = ref<Project | null>(null)

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