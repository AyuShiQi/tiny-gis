<template>
  <div class="content">
    <div class="header">
      <div class="title">我的项目</div>
      <vi-button mutate color="purple" @click="() => { createOpen = true }">新建项目</vi-button>
    </div>
    <vi-scroll class="project-lis">
      <div class="empty" v-if="projectList.length === 0">
        <EmptyIcon/>
      </div>
      <div class="project-content" v-else>
        <project-item
        v-for="(proj, index) in projectList":key="proj.id"
        :proj="proj"
        :index="index"
        @delete="openDelete"
        @rename="openRename"
        @detail="openDetail"
        @jump="handleJump"/>
      </div>
    </vi-scroll>
  </div>
  <delete-dialog v-model="deleteOpen" :target="target"/>
  <create-dialog v-model="createOpen" @createFinish="handleCreateFinish"/>
  <vi-dialog class="dark-dialog" dark v-model="deleteOpen" title="您确认要删除该项目吗" :toSure="handleDelete"/>
  <vi-dialog v-model="renameOpen" title="重命名" :toSure="handleRename">
    <vi-input v-model="renameVal" type="button" round class="rename-ipt" />
  </vi-dialog>
  <vi-dialog class="dark-dialog" dark v-model="detailOpen" title="项目详情" noSure noUnsure>
    <div class="line">
      <span class="title">id：</span>
      <span class="desc">{{ target?.id }}</span>
    </div>
    <div class="line">
      <span class="title">标题：</span>
      <span class="desc">{{ target?.title }}</span>
    </div>
    <div class="line">
      <span class="title">创建时间：</span>
      <span class="desc">{{ target?.createTime }}</span>
    </div>
    <div class="line">
      <span class="title">更新时间：</span>
      <span class="desc">{{ target?.updateTime }}</span>
    </div>
  </vi-dialog>
</template>

<script lang="ts" setup>
// @ts-ignore
import EmptyIcon from '/public/empty.svg?component'
import ProjectItem from '@/components/project-item/index.vue'
import DeleteDialog from '@/components/delete-dialog/index.vue'
import CreateDialog from '@/components/create-dialog/index.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { deleteProj, getProjs, renameProj } from '@/network/project';
import { ViMessage } from 'viog-ui'
import { ListProject } from '@/interface/project';
import router from '@/router';

const projectList = reactive<ListProject[]>([])
const targetIndex = ref(-1)
const deleteOpen = ref(false)
const createOpen = ref(true)
const renameOpen = ref(false)
const detailOpen = ref(false)
const listLoading = ref(false)

const renameVal = ref<string>()

const target = computed<ListProject | null>(() => {
  if (targetIndex.value >= 0) {
    return projectList[targetIndex.value]
  }

  return null
})

const queryProjList = async () => {
  try {
    listLoading.value = true
    const res = await getProjs({
      token: '123'
    })

    projectList.length = 0
    projectList.push(...res.data)
  } finally {
    listLoading.value = false
  }
}

const openDelete = (index: number) => {
  deleteOpen.value = true
  targetIndex.value = index
}

const openRename = (index: number) => {
  renameOpen.value = true
  targetIndex.value = index
}

const openDetail = (index: number) => {
  detailOpen.value = true
  targetIndex.value = index
}

const handleJump = (index: number) => {
  const tar = projectList[index]

  if (index < 0 || !tar) {
    ViMessage.append('删除异常！请刷新重试', 2000)
    return
  }

  router.push(`/edit/${tar.id}`)
}

const handleDelete = () => {
  if (!target.value) {
    ViMessage.append('删除异常！请刷新重试', 2000)
    return false
  }

  // TODO
  deleteProj({
    token: '',
    id: target.value.id
  }).then(() => {
    ViMessage.append('删除成功', 2000)
    // TODO: 更新列表
    queryProjList()
  }).catch(() => {
    ViMessage.append('删除失败', 2000)
  })

  return true
}

const handleRename = () => {
  if (!target.value) {
    ViMessage.append('操作异常！请刷新重试', 2000)
    return false
  }

  if (!renameVal.value) {
    ViMessage.append('标题不可为空', 2000)
    return false
  }

  if (target.value.title === renameVal.value) {
    return false
  }

  renameProj({
    token: '',
    id: renameVal.value,
    title: target.value.title
  }).then(() => {
    ViMessage.append('操作成功', 2000)
  }).catch(() => {
    ViMessage.append('操作失败', 2000)
  })

  return true
}

const handleCreateFinish = (createRes: boolean, id?: string) => {
  if (createRes) {
    // 刷新列表
    queryProjList()
    router.push(`/edit/${id}`)
  }
}

watch(target, () => {
  renameVal.value = target.value?.title
})

onMounted(() => {
  queryProjList()
})
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
