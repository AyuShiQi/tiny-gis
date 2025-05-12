import { GetUserInfo } from '@/interface/user'
import { request } from '.'
import qs from 'qs'

/** 获取用户信息 */
export const getUserInfo: GetUserInfo = res => {
  return request({
    url: '/user/info',
    method: 'get',
    headers: {
      satoken: res.token
    },
    data: qs.stringify(res)
  })
}
