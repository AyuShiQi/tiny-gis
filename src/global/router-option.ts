import router from '@/router'

export function jumpToHome(tokenName: string, token: string) {
  // 保存token
  localStorage.setItem('tableCuteSatoken', token)
  router.push('/home/project')
}

export function jumpToLogin() {
  router.push({ path: '/login' })
}

export function jumpToFinPassword() {
  router.push({ path: '/hc/password_find' })
}
