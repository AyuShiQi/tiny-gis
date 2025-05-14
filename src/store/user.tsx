import { reactive, ref, watch, computed, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { getUserProfile } from '@/network/user'
// import { getInfo, hasAccount as account } from '@/network/user'
import { jumpToLogin } from '@/global/router-option'
import { getToken, saveToken } from '@/global/local-storage-option'

export const useUserStore = defineStore('user', () => {
  /**
   * 是否登录
   */
  const isLogin = ref(false)
  const token = ref('')
  const id = ref()
  const userName = ref()

  function getProfile(nowToken?: string) {
    return new Promise(res => {
      if (nowToken) token.value = nowToken
      getUserProfile({
        token: token.value
      }).then((data: any) => {
        console.log(data)
        if (data.code === 200) {
          userName.value = data.data.username
          id.value = data.data.id
          isLogin.value = true
          res(undefined)
        } else {
          jumpToLogin()
        }
      })
    })
  }

  function clearInfo() {
    token.value = ''
    userName.value = undefined
    id.value = undefined
    isLogin.value = false
    saveToken('')
  }

  watch(isLogin, (newVal: boolean) => {
    if (!newVal) jumpToLogin()
  })

  watch(token, newVal => {
    saveToken(newVal)
  })

  return {
    isLogin,
    token,
    userName,
    id,
    getProfile,
    clearInfo
  }
})
