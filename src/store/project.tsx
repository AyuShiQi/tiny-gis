import { reactive, ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { getModules } from '@/network/project'
import { DefaultModules } from '@/interface/project'

export const useProjectStore = defineStore('project', () => {
  const defaultModulesList = ref<DefaultModules[]>([])

  const getDefaultModulesList = async (nowToken?: string) => {
    // const res = await getModules({
    //   token: '1'
    // })
    // if (res.data) {
    //   defaultModulesList.value = res.data
    // }
  }

  // TODO:暂时的
  getDefaultModulesList()

  return {
    defaultModulesList,
    getDefaultModulesList
  }
})
