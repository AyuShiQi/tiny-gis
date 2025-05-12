import { reactive, ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo } from '@/network/user'
// import { getInfo, hasAccount as account } from '@/network/user'
import { jumpToLogin } from '@/global/router-option'
import { saveToken } from '@/global/local-storage-option'

export const useUserStore = defineStore('user', () => {
  /**
   * 是否登录
   */
  const isLogin = ref(false)
  const token = ref('')
  const userName = ref()
  const nickName = ref()
  const mobile = ref()
  const email = ref()
  const hasAccount = ref(false)

  function getProfile(nowToken?: string) {
    return new Promise(res => {
      if (nowToken) token.value = nowToken
      getUserInfo({
        token: token.value
      }).then(data => {
        if (data.code === 200) {
          userName.value = data.data.userName
          nickName.value = data.data.nickname
          email.value = data.data.email
          mobile.value = data.data.mobile
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
    nickName.value = undefined
    mobile.value = undefined
    email.value = undefined
    hasAccount.value = false
    isLogin.value = false
    saveToken('')
  }

  watch(isLogin, (newVal: boolean) => {
    if (!newVal) jumpToLogin()
  })

  return {
    isLogin,
    token,
    userName,
    nickName,
    mobile,
    email,
    hasAccount,
    getProfile,
    clearInfo
  }
})
