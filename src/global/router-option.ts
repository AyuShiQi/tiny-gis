import router from '@/router'

export function jumpToHome(token: string, tokenName = 'tinyGISToken') {
  // 保存token
  localStorage.setItem(tokenName, token)
  router.push('/home/project')
}

export function jumpToLogin() {
  router.push({ path: '/home/login' })
}

export function jumpToFinPassword() {
  router.push({ path: '/hc/password_find' })
}
