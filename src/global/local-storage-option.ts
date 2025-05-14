export function saveToken(token: string) {
  // 保存token
  localStorage.setItem('tinyGISToken', token)
}

/**
 * 获取token
 */
export function getToken() {
  return localStorage.getItem('tinyGISToken')
}
