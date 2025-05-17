import { Response } from '.'
import { ModuleJSON } from './module'

export enum CreateProjMode {
  Default = 0,
  Template = 1
}

/** 项目接口 */
export type Project = {
  // 项目id
  id: string
  updateTime: string
  createTime: string
  title: string // 标题
  modelsArr: ModuleJSON[] // 用于储存所有的模型数据
  // 基础信息
  globalObj: {
    showDistance: boolean
    showGrid: boolean
    gridCellSize: number
    layersColor: string
    distanceColor: string
    gridColor: string
    showSkybox: boolean
    skyboxName: string
    skyColor: string
    showSkyAtmosphere: boolean
  } // 储存所有基础数据
  url: string // 图像url
  coordinates: [number, number]
  radius: number
  layers: boolean
}

export type ListProject = {
  id: string
  updateTime: string
  createTime: string
  title: string // 标题
  url: string // 图像url
  layers: boolean
}

interface CreateProjReq {
  title: string
  coordinates: [number, number]
  radius: number
  mode: CreateProjMode
  /** 模板id */
  templateId?: string
  layers: boolean
}

interface GetProjsReq {}

interface GetProjDetailReq {
  id: Project['id']
}

interface DeleteProjReq {
  id: Project['id']
}

type UpdateProjReq = Pick<Project, 'id' | 'globalObj' | 'modelsArr'> & { img?: string }

interface RenameProjReq {
  id: Project['id']
  title?: string // 标题
}

interface GetModuleDetailReq {
  id: number
}

export interface DefaultModules {
  id: number
  name: string
  url: string
  type: string
  createTime: string
  updateTime: string
}

export interface Module {
  id: number
  url: string
  name: string
  type: string
  updateTime: string
  userId?: number | null
  detail?: string
  file?: File
}

export type CreateProjRes = Response<{
  // 项目id
  id: string
}>
export type GetProjsRes = Response<ListProject[]>
export type GetProjDetailRes = Response<Project>
export type DeleteProjRes = Response<any>
export type UpdateProjRes = Response<any>
export type RenameProjRes = Response<any>
export type GetModulesRes = Response<DefaultModules[]>
export type GetModuleDetailRes = Response<Module>

export type CreateProj = (res: CreateProjReq) => Promise<CreateProjRes>
export type GetProjs = (res: GetProjsReq) => Promise<GetProjsRes>
export type GetProjDetail = (res: GetProjDetailReq) => Promise<GetProjDetailRes>
export type DeleteProj = (res: DeleteProjReq) => Promise<DeleteProjRes>
export type UpdateProj = (res: UpdateProjReq) => Promise<UpdateProjRes>
export type RenameProj = (res: RenameProjReq) => Promise<RenameProjRes>
export type GetModules = () => Promise<GetModulesRes>
export type GetModuleDetail = (res: GetModuleDetailReq) => Promise<GetModuleDetailRes>
