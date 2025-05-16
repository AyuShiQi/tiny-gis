import { Module } from '@/interface/project'

export const isValidJson = (json: string) => {
  try {
    const val = JSON.parse(json)
    return typeof val === 'object' && !Array.isArray(val) && val !== null
  } catch {
    return false
  }
}

export const parseStandardModuleJSON = (positon: [number, number], module: Module) => {
  if (module.type === 'json') {
    const json = JSON.parse(module.detail!)
    return {
      unit: 'coordinates',
      basePosition: [...positon, 0],
      ...json
    }
  }

  return {
    unit: 'coordinates',
    basePosition: [...positon, 0],
    objects: [
      {
        id: 'module',
        type: 'model',
        position: [0, 0, 0],
        url: module.detail
      }
    ],
    label: {
      type: 'label',
      text: module.name,
      position: [0, 0, 1],
      font: '24px sans-serif',
      color: 'black'
    }
  }
}
