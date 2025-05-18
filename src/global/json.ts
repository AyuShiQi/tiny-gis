import { ModuleJSON } from '@/interface/module'
import { Module } from '@/interface/project'

const R = 6378137 // 地球半径，单位米（WGS84标准）
/**
 * 经纬度转二维平面坐标（墨卡托投影）
 */
export const latLngToMercator = (postion: number[]): [number, number, number] => {
  const x = R * ((postion[0] * Math.PI) / 180)
  const y = R * Math.log(Math.tan(Math.PI / 4 + (postion[1] * Math.PI) / 180 / 2))

  return [x, postion[2] || 0, y]
}

/**
 * 偏移转平面坐标
 */
export const parseToMercator = (postion: number[]): [number, number, number] => {
  return [postion[0], postion[2], postion[1]]
}

export const isValidJson = (json: string) => {
  try {
    const val = JSON.parse(json)
    return typeof val === 'object' && !Array.isArray(val) && val !== null
  } catch {
    return false
  }
}

// 计算相对于 basePosition 的偏移（结果单位：米）
export const getRelativePosition = (baseLngLat: number[], targetLngLat: number[]): [number, number, number] => {
  const [baseX, baseY] = latLngToMercator(baseLngLat)
  const [targetX, targetY] = latLngToMercator(targetLngLat)

  const dx = targetX - baseX
  const dz = targetY - baseY

  return [dx, targetLngLat[2], dz] // Y轴为高度
}

export const parseStandardModuleJSON = (positon: [number, number], module: Module): ModuleJSON => {
  if (module.type === 'json') {
    const json = JSON.parse(module.detail!)
    const curJson = {
      show: true,
      unit: 'coordinates',
      basePosition: [...positon, 0],
      objects: json.objects,
      label: {
        id: 'label',
        type: 'label',
        show: true,
        ...json.label
      }
    }

    return curJson as ModuleJSON
  }

  return {
    show: true,
    unit: 'coordinates',
    basePosition: [...positon, 0],
    objects: [
      {
        id: 'module',
        type: 'model',
        position: [0, 0, 0],
        url: module.detail!
      }
    ],
    label: {
      id: 'label',
      type: 'label',
      text: module.name,
      position: [0, 0, 1],
      font: '24px sans-serif',
      color: 'black',
      show: true
    }
  } as ModuleJSON
}
