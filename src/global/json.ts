import { ModuleJSON } from '@/interface/module'
import { Module } from '@/interface/project'

export const isValidJson = (json: string) => {
  try {
    const val = JSON.parse(json)
    return typeof val === 'object' && !Array.isArray(val) && val !== null
  } catch {
    return false
  }
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
