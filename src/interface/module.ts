import { Label, Primitive } from 'cesium'

export interface ModuleEntity {
  id: number
  name: string
  url: string
  detail: string
  userId: number
  createTime: string
}

export interface ModuleLabel {
  text: string
  position: [number, number, number]
  font: string
  color: string
}

// 模型组件类型
export type ModuleObject =
  | {
      id: string
      type: 'box'
      position: [number, number, number]
      dimensions: [number, number, number]
      color: [number, number, number, number]
      label?: ModuleLabel
    }
  | {
      id: string
      type: 'model'
      position: [number, number, number]
      url: string
      scale?: number
    }

// 场景 JSON 结构
export interface ModuleJSON {
  id: number
  unit?: 'coordinates' | 'meter'
  basePosition: [number, number, number] // 经纬度原点
  objects: ModuleObject[]
  label: {
    id: string
    type: 'label'
  } & ModuleLabel
  scale?: number
}

export interface ModelLabelId {
  label: Label
  id: ModuleJSON['id']
}

export interface ModelId {
  model: Primitive
  id: ModuleJSON['id']
}

export type MyPrimitive = Primitive & { modelId: ModelId }
