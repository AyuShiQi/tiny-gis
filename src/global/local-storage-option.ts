export function saveToken(token: string) {
  // 保存token
  localStorage.setItem('tableCuteSatoken', `Bearer ${token}`)
}

/**
 * 获取token
 */
export function getToken() {
  return localStorage.getItem('tableCuteSatoken')
}
