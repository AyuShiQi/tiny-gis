import { GetModuleDetail, GetModules } from '@/interface/project'
import { request } from '.'
import { base64ToBlob, generateRandomFilename } from '@/global/module-data'

/**
 * 创建模块（支持上传文件）
 */
export const createModule = (data: {
  name: string
  detail?: string
  file?: File // 可选上传(gtlf文件)
  img?: string // 缩略图
}) => {
  const formData = new FormData()
  formData.append('name', data.name)

  if (data.img) {
    const thumbnailBlob = base64ToBlob(data.img)
    formData.append('img', new File([thumbnailBlob], generateRandomFilename(), { type: 'image/png' }))
  }

  if (data.detail) {
    formData.append('detail', data.detail)
  }

  if (data.file) {
    formData.append('file', data.file)
  }

  return request({
    url: '/module/create',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}

/**
 * 删除模块
 */
export const deleteModule = (id: number) => {
  return request({
    url: `/module/delete/${id}`,
    method: 'delete'
  })
}

/** 获取模型列表 */
export const getModules: GetModules = () => {
  return request({
    url: '/module/list',
    method: 'get'
  })
}

/** 获取模型列表 */
export const getModuleDetail: GetModuleDetail = res => {
  return request({
    url: `module/${res.id}`,
    method: 'get'
  })
}
