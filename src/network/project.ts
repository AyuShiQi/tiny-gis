import { request } from '.'
import qs from 'qs'

import { CreateProj, GetProjs, GetProjDetail, DeleteProj, UpdateProj, RenameProj, GetProjDetailRes, GetModules } from '@/interface/project'
import { base64ToBlob, generateRandomFilename } from '@/global/module-data'

/** 创建项目 */
export const createProj: CreateProj = res => {
  return request({
    url: '/project/create',
    method: 'post',
    data: qs.stringify({
      ...res,
      coordinates: res.coordinates.map(item => Math.floor(item * 1000000))
    })
  })
}

/** 获取项目列表 */
export const getProjs: GetProjs = res => {
  return request({
    url: '/project/lists',
    method: 'get'
  })
}

/** 获取项目详情 */
export const getProjDetail: GetProjDetail = res => {
  return request({
    url: '/project/detail',
    method: 'get',
    params: {
      id: res.id
    }
  }).then((val: GetProjDetailRes) => {
    if (val.data) {
      val.data.coordinates = JSON.parse(val.data.coordinates as unknown as string).map((item: string) => Number(item) / 1000000)
      val.data.modelsArr = JSON.parse(val.data.modelsArr as unknown as string)
      val.data.globalObj = JSON.parse(val.data.globalObj as unknown as string)
    }
    return val
  })
}

/** 删除项目 */
export const deleteProj: DeleteProj = res => {
  return request({
    url: '/project/delete',
    method: 'post',
    data: qs.stringify({
      id: res.id
    })
  })
}

/** 更新项目 */
export const updateProj: UpdateProj = res => {
  const { id, img, modelsArr, globalObj } = res

  const formData = new FormData()
  formData.append('id', id)

  if (img) {
    const thumbnailBlob = base64ToBlob(img)
    formData.append('img', new File([thumbnailBlob], generateRandomFilename(), { type: 'image/png' }))
  }

  if (modelsArr) {
    formData.append('modelsArr', JSON.stringify(modelsArr))
  }

  if (globalObj) {
    formData.append('globalObj', JSON.stringify(res.globalObj))
  }

  return request({
    url: '/project/update',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}

/** 重命名项目 */
export const renameProj: RenameProj = res => {
  return request({
    url: '/project/update',
    method: 'post',
    data: qs.stringify({
      id: res.id,
      title: res.title
    })
  })
}

/** 获取场景列表 */
export const getModules: GetModules = () => {
  return request({
    url: '/project/modules',
    method: 'get'
  })
}
