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
  instance.interceptors.request.use(config => {
    // config.data = qs.stringify(config.data)
    // console.log(config)
    return config;
  },err => {
    console.log(err);
  });

  // 2.响应拦截
  instance.interceptors.response.use(res => {
    console.log(res.data)
    return res.data;
  },err=>{
    console.log(err);
  });

  return instance(config);
}