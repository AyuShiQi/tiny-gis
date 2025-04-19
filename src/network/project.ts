import { request } from '.'
import qs from 'qs'

import { 
  CreateProj,
  GetProjs,
  GetProjDetail,
  DeleteProj,
  UpdateProj
} from '@/interface/project'

/** 创建项目 */
export const createProj: CreateProj = (res) => {
  return request({
      url: '/project/create',
      method: 'post',
      headers: {
        satoken: res.token
      },
      data: qs.stringify(res)
  })
}

/** 获取项目列表 */
export const getProjs: GetProjs = (res) => {
  return request({
    url: '/project/lists',
    method: 'get',
    headers: {
      satoken: res.token
    }
  })
}

/** 获取项目详情 */
export const getProjDetail: GetProjDetail = (res) => {
  return request({
    url: '/project/detail',
    method: 'get',
    headers: {
      satoken: res.token
    }
  }).then((val: any) => {
    for (const item of val.data) {
      item.json1 = JSON.parse(item.json1)
      item.json2 = JSON.parse(item.json2)
    }
    return val
  })
}

/** 删除项目 */
export const deleteProj: DeleteProj = (res) => {
  return request({
    url: '/project/delete',
    method: 'post',
    headers: {
      satoken: res.token
    },
    data: qs.stringify({
      id: res.id
    })
  })
}

/** 更新项目 */
export const updateProj: UpdateProj = (res) => {
  return request({
    url: '/project/update',
    method: 'post',
    headers: {
      satoken: res.token
    },
    data: qs.stringify({
      TabId: res.id,
      json1: JSON.stringify(res.json1),
      json2: JSON.stringify(res.json2)
    })
  })
}