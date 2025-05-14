import { request } from '.'
import qs from 'qs'
import { LoginReq, RegisterReq, RenameReq, UpdatePasswordReq, TokenHeader } from '@/interface/user'

/** 注册 */
export const register = (res: RegisterReq) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data: qs.stringify(res)
  })
}

/** 登录 */
export const login = (res: LoginReq) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: qs.stringify(res)
  })
}

/** 获取用户信息（验证token是否有效） */
export const getUserProfile = (res: TokenHeader) => {
  return request({
    url: '/auth/profile',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + res.token
    }
  })
}

/** 修改用户名 */
export const renameUser = (res: RenameReq) => {
  return request({
    url: '/auth/rename',
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + res.token
    },
    data: qs.stringify({ username: res.username })
  })
}

/** 修改密码 */
export const updatePassword = (res: UpdatePasswordReq) => {
  return request({
    url: '/auth/password',
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + res.token
    },
    data: qs.stringify({
      oldPassword: res.oldPassword,
      newPassword: res.newPassword
    })
  })
}
