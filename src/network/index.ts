import { getToken } from '@/global/local-storage-option'
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

export const request = (config: AxiosRequestConfig): any => {
  // 1.创建axios实例
  const instance = axios.create({
    baseURL: '/',
    timeout: 20000
  })

  // 2.axios拦截器

  // 1.请求拦截
  instance.interceptors.request.use(
    config => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    err => {
      console.log(err)
    }
  )

  // 2.响应拦截
  instance.interceptors.response.use(
    res => {
      console.log(res.data)
      return res.data
    },
    err => {
      console.log(err)
      throw err
    }
  )

  return instance(config)
}
