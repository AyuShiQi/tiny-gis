<template>
  <div class="content">
    <div class="card">
      <vi-form class="form" @submit="handleSubmit">
        <template v-slot="{ submit, getSubmitFeedback }">
          <div class="ipt-box">
            <vi-form-item style="margin-bottom: 24px" label="用户名" :rules="isLogin ? usernameLRules : usernameRules" auto>
              <vi-input v-model="username" name="username" type="button" placeholder="请输入用户名"></vi-input>
            </vi-form-item>
            <vi-form-item label="密码" :rules="isLogin ? passwordLRules : passwordRules" auto>
              <vi-input v-model="password" name="password" type="button" password placeholder="请输入密码"></vi-input>
            </vi-form-item>
          </div>
          <vi-button class="btn" color="purple" mutate @click="submit" :disabled="loading">{{ isLogin ? '登录' : '注册' }}</vi-button>
          <vi-button
            class="link"
            size="small"
            type="transparent"
            :disabled="loading"
            @click="
              () => {
                isLogin = !isLogin
                getSubmitFeedback(new Map())
              }
            "
            >{{ isLogin ? '点击注册' : '点击登录' }}</vi-button
          >
        </template>
      </vi-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { usernameLRules, usernameRules, passwordLRules, passwordRules } from '@/rules'
import { login, register } from '@/network/user'
import { ViToast } from 'viog-ui'
import { jumpToHome } from '@/global/router-option'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const isLogin = ref(true)
const username = ref<string>('')
const password = ref<string>('')
const loading = ref(false)

watch(isLogin, () => {
  username.value = ''
  password.value = ''
})

function handleSubmit(formMap: any, r: boolean, opt: { getSubmitFeedback: (m: Map<string, string>) => void }) {
  if (!r) return

  loading.value = true
  const feedBackMap = new Map<string, string>()
  // 登录
  if (isLogin.value) {
    login({
      username: username.value,
      password: password.value
    })
      .then((e: any) => {
        if (e.code === 200) {
          ViToast.open('登录成功!')
          userStore.getProfile(e.data.token).then(() => {
            jumpToHome(e.data.token)
          })
        } else {
          ViToast.open('登录错误，请重试')
        }
      })
      .catch((e: any) => {
        if (e.status === 400) {
          feedBackMap.set('username', e.response.data.message)
          opt.getSubmitFeedback(feedBackMap)
        } else {
          ViToast.open('登录错误，请重试')
        }
      })
      .finally(() => {
        loading.value = false
      })
    // 注册
  } else {
    register({
      username: username.value,
      password: password.value
    })
      .then((e: any) => {
        if (e.code === 200) {
          ViToast.open('注册成功！请登录')
          setTimeout(() => {
            isLogin.value = true
            opt.getSubmitFeedback(feedBackMap)
          }, 1000)
        } else {
          ViToast.open('注册失败，请重试')
        }
      })
      .catch((e: any) => {
        if (e.status === 400) {
          feedBackMap.set('username', e.response.data.message)
          opt.getSubmitFeedback(feedBackMap)
        } else {
          ViToast.open('注册失败，请重试')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
}
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
