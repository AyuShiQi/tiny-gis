<template>
  <div class="content">
    <div class="header">
      <div class="title">我的模型</div>
      <vi-button
        mutate
        color="purple"
        @click="
          () => {
            createOpen = true
          }
        "
        >新建模型</vi-button
      >
    </div>
    <vi-scroll class="project-lis">
      <div class="empty" v-if="modulesStore.defaultModulesList.length === 0 && !listLoading">
        <EmptyIcon />
      </div>
      <div class="project-content" v-else-if="!listLoading">
        <module-big-item
          v-for="(proj, index) in modulesStore.defaultModulesList"
          :key="proj.id"
          :proj="proj"
          :index="index"
          @delete="openDelete"
          @rename="openRename"
          @detail="openDetail"
          @jump="handleJump"
        />
      </div>
      <vi-loading type="diamond" color="purple" v-show="listLoading" />
    </vi-scroll>
    <create-dialog v-if="createOpen" v-model="createOpen" @createFinish="handleCreateFinish" />
    <vi-dialog class="dark-dialog" dark v-model="deleteOpen" title="您确认要删除该项目吗" :toSure="handleDelete" />
    <vi-dialog class="dark-dialog" dark v-model="detailOpen" title="项目详情" noSure noUnsure>
      <div class="line">
        <span class="title">id：</span>
        <span class="desc">{{ target?.id }}</span>
      </div>
      <div class="line">
        <span class="title">标题：</span>
        <span class="desc">{{ target?.name }}</span>
      </div>
      <div class="line">
        <span class="title">类型：</span>
        <span class="desc">{{ target?.type }}</span>
      </div>
      <div class="line">
        <span class="title">创建时间：</span>
        <span class="desc">{{ stringDateToStringFormat(target?.createTime) }}</span>
      </div>
      <div class="line">
        <span class="title">更新时间：</span>
        <span class="desc">{{ stringDateToStringFormat(target?.updateTime) }}</span>
      </div>
    </vi-dialog>
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import EmptyIcon from '/public/empty.svg?component'
import CreateDialog from '@/components/create-module-dialog/index.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { ViMessage } from 'viog-ui'
import router from '@/router'
import { deleteModule, getModules } from '@/network/module'
import ModuleBigItem from '@/components/module-big-item/index.vue'
import { stringDateToStringFormat } from '@/utils/date'
import { useModuleStore } from '@/store/modules'

const modulesStore = useModuleStore()

const targetIndex = ref(-1)
const deleteOpen = ref(false)
const createOpen = ref(false)
const renameOpen = ref(false)
const detailOpen = ref(false)

const renameVal = ref()
const listLoading = ref(false)

const target = computed(() => {
  if (targetIndex.value >= 0) {
    return modulesStore.defaultModulesList[targetIndex.value]
  }

  return null
})

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
  const tar = modulesStore.defaultModulesList[index]

  if (index < 0 || !tar) {
    ViMessage.append('跳转异常！请刷新重试', 2000)
    return
  }

  // router.push(`/edit/${tar.id}`)
}

const handleDelete = () => {
  if (!target.value) {
    ViMessage.append('删除异常！请刷新重试', 2000)
    return false
  }

  deleteModule(target.value.id)
    .then(() => {
      ViMessage.append('删除成功', 2000)
      modulesStore.getDefaultModulesList()
    })
    .catch(() => {
      ViMessage.append('删除失败', 2000)
    })

  return true
}

// const handleRename = () => {
//   if (!target.value) {
//     ViMessage.append('操作异常！请刷新重试', 2000)
//     return false
//   }

//   if (!renameVal.value) {
//     ViMessage.append('标题不可为空', 2000)
//     return false
//   }

//   if (target.value.title === renameVal.value) {
//     return false
//   }

//   renameProj({
//     id: target.value.id,
//     title: renameVal.value
//   })
//     .then(() => {
//       ViMessage.append('操作成功', 2000)
//       queryProjList()
//     })
//     .catch(() => {
//       ViMessage.append('操作失败', 2000)
//     })

//   return true
// }

const handleCreateFinish = (createRes: boolean, id?: string) => {
  // console.log(createRes)
  if (createRes) {
    // 刷新列表
    modulesStore.getDefaultModulesList()
  }
}

watch(target, () => {
  renameVal.value = target.value?.name
})
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
