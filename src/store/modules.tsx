import { onMounted, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { getModuleDetail, getModules } from '@/network/module'
import { DefaultModules, Module } from '@/interface/project'

export const useModuleStore = defineStore('module', () => {
  const defaultModulesList = ref<DefaultModules[]>([])
  const moduleMap = ref<Map<number, Module>>(new Map())

  const getModuleDetails = async (id: number) => {
    try {
      const res = await getModuleDetail({
        id
      })

      if (res.code) {
        moduleMap.value.set(id, res.data)
        return res.data
      }
    } catch (e) {
      console.log(e)
    }
  }

  const getDefaultModulesList = async () => {
    try {
      const res = await getModules()

      if (res.code === 200) {
        defaultModulesList.value = res.data
      }

      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  onMounted(() => {
    getDefaultModulesList()
  })

  return {
    moduleMap,
    defaultModulesList,
    getModuleDetails,
    getDefaultModulesList
  }
})
