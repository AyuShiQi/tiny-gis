import { reactive, ref, watch, computed } from 'vue'
import { createPinia, defineStore } from 'pinia'
// import { getInfo, hasAccount as account } from '@/network/user'
// import { jumpToLogin } from '@/global/router-option'
// import { saveToken } from '@/global/local-storage-option'
// // 网络接口
// import { getProj } from '@/network/tab'
// import { ViMessage } from 'viog-ui'
// import type { TuProject } from '@/network/interface/tab'

const pinia = createPinia()

export default pinia

/**
 * 项目仓库
 */
// export const useProjectStore = defineStore('project', () => {
//   const isUpdating = ref(true)
//   const projectList = reactive({
//     total: 0,
//     list: [] as TuProject[]
//   })

//   /**
//    * 更新当前项目列表
//    * @param token 用户token
//    */
//   function updateProjectList (token: string) {
//     return new Promise((res) => {
//       getProj(token).then((val) => {
//         if (val.code === 200) {
//           isUpdating.value = false
//           projectList.list = val.data
//           projectList.total = val.data.length
//         } else if (val.message === '查询失败') {
//           isUpdating.value = false
//           projectList.list = []
//           projectList.total = 0
//         } else {
//           ViMessage.append('用户信息登录过期！')
//         }
//         res(val)
//       })
//     })
//   }

//   const latestList = computed(() => {
//     const nowList = [...projectList.list]
//     return nowList.sort((a, b) => {
//       return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
//     }).slice(0, 5)
//   })

//   const chartList = computed(() => {
//     const nowList = []
//     for (const project of projectList.list) {
//       if (project.id !== 999) {
//         nowList.push(project)
//       }
//     }
//     return nowList
//   })

//   const tableList = computed(() => {
//     const nowList = []
//     for (const project of projectList.list) {
//       if (project.id === 999) {
//         nowList.push(project)
//       }
//     }
//     return nowList
//   })

//   return {
//     projectList,
//     latestList,
//     chartList,
//     tableList,
//     updateProjectList
//   }
// })
