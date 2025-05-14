import { request } from '.'

/**
 * 创建模块（支持上传文件）
 */
export const createModule = (data: {
  name: string
  detail: string
  userId: number
  file?: File // 可选上传
}) => {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('detail', data.detail)
  formData.append('userId', String(data.userId))
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
