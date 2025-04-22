import { Response } from '.'

enum CreateProjMode {
  Default = 0,
  Template = 1
}

/** 项目接口 */
export type Project = {
  id: string
  updateTime: string
  createTime: string
  title: string // 标题 
  json1: any // data
  json2: any // style
  url: string // 图像url
}

export type ListProject = {
  id: string
  updateTime: string
  createTime: string
  title: string // 标题 
  url: string // 图像url
}

interface CreateProjReq {
  token: string
  mode: CreateProjMode
  /** 模板id */
  templateId?: string
}

interface GetProjsReq {
  token: string
}

interface GetProjDetailReq {
  token: string,
  id: Project['id']
}

interface DeleteProjReq {
  token: string,
  id: Project['id']
}

interface UpdateProjReq {
  token: string
  id: Project['id']
  json1?: any // data
  json2?: any // style
}

interface RenameProjReq {
  token: string
  id: Project['id']
  title?: string // 标题 
}

export type CreateProjRes = Response<any>
export type GetProjsRes = Response<ListProject[]>
export type GetProjDetailRes = Response<Project>
export type DeleteProjRes = Response<any>
export type UpdateProjRes= Response<any>
export type RenameProjRes= Response<any>

export type CreateProj = (res: CreateProjReq) => Promise<CreateProjRes>
export type GetProjs = (res: GetProjsReq) => Promise<GetProjsRes>
export type GetProjDetail = (res: GetProjDetailReq) => Promise<GetProjDetailRes>
export type DeleteProj = (res: DeleteProjReq) => Promise<DeleteProjRes>
export type UpdateProj = (res: UpdateProjReq) => Promise<UpdateProjRes>
export type RenameProj = (res: RenameProjReq) => Promise<RenameProjRes>