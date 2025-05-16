import { ModelLabelId, ModuleJSON, MyPrimitive } from '@/interface/module'
import * as Cesium from 'cesium'
import { getPositionbyUnit } from './distance'
import { CesiumColorMapping } from './colorMap'

/** 高亮标签 */
export const highlightLabel = (label: Cesium.Label) => {
  if (!label) return
  // 保存原始颜色和显隐藏
  const originalColor = label.fillColor
  const defaultShow = label.show

  // 设置高亮色
  label.show = true
  label.fillColor = CesiumColorMapping['light']

  return {
    /** 恢复原始状态 */
    reset() {
      label.show = defaultShow
      label.fillColor = originalColor
    }
  }
}

/** 添加label */
const addLabel = (opt: { id: number; scale: number; labelCollection: any; jsonData: ModuleJSON; baseMatrix: Cesium.Matrix4 }) => {
  const { id, scale, labelCollection, jsonData, baseMatrix } = opt
  const { position, text, font, color } = jsonData.label
  // 相对位置
  const offset = new Cesium.Cartesian3(...position.map(v => v * scale))
  const labelMatrix = Cesium.Matrix4.multiplyByPoint(baseMatrix, offset, new Cesium.Cartesian3())
  const totalLabel = labelCollection.add({
    position: labelMatrix,
    text,
    font,
    fillColor: Cesium.Color.fromCssColorString(color),
    scale: 1
  })

  totalLabel.id = {
    id,
    label: totalLabel // 为标签添加数据，用于后续点击判断
  } as ModelLabelId

  return totalLabel
}

/** 移除模型 */
const removeMyModel = (viewer: Cesium.Viewer, module: ModelRegistryEntryExtra) => {
  const { labelCollection, primitives, modelEntities } = module
  viewer.scene.primitives.remove(labelCollection)
  primitives.forEach(p => viewer.scene.primitives.remove(p))
  modelEntities.forEach(m => viewer.scene.primitives.remove(m))
}

/** 改变模型标签位置 */
const changeLabelPosition = (opt: { totalLabel: Cesium.Label; newPosition: number[] }) => {
  const { totalLabel, newPosition } = opt
  const position = Cesium.Cartesian3.fromDegrees(...(newPosition as [number, number, number]))
  totalLabel.position = position
}

/** 改变模型位置 */
const changePosition = (opt: { viewer: Cesium.Viewer; target: ModelRegistryEntry; newBasePosition: number[] }) => {
  const { viewer, target, newBasePosition } = opt
  const { jsonData, extra } = target
  const { scale = 1, unit = 'coordinates' } = jsonData
  const totalLabel = extra.getTotalLabel

  const basePosition = Cesium.Cartesian3.fromDegrees(...getPositionbyUnit(newBasePosition as [number, number, number], unit))
  /** 渲染的基础点 */
  const baseMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(basePosition)

  // 更新 primtity 模型的位置
  extra.primitives.forEach((p, index) => {
    const offset = new Cesium.Cartesian3(...jsonData.objects[index].position.map(v => v * scale))
    const modelMatrix = Cesium.Matrix4.multiplyByTranslation(baseMatrix, offset, new Cesium.Matrix4())

    const instance = p.geometryInstances as Cesium.GeometryInstance
    if (!instance) return
    instance.modelMatrix = modelMatrix
  })

  // 更新 gltf 模型的位置
  extra.modelEntities.forEach((m, index) => {
    const offset = new Cesium.Cartesian3(...jsonData.objects[index].position.map(v => v * scale))
    const newMatrix = Cesium.Matrix4.multiplyByTranslation(baseMatrix, offset, new Cesium.Matrix4())
    m.modelMatrix = newMatrix
  })

  // 更新总 label 位置
  if (jsonData.label && totalLabel) {
    const offset = new Cesium.Cartesian3(...jsonData.label.position.map(v => v * scale))
    const newPos = Cesium.Matrix4.multiplyByPoint(baseMatrix, offset, new Cesium.Cartesian3())
    totalLabel.position = newPos
  }

  // 通知 Cesium 重新渲染（尤其在 requestRenderMode 模式下）
  viewer.scene.requestRender()
}

/** 显隐模型 */
const changeMyModelVisible = (target: ModelRegistryEntry, visible: boolean) => {
  const {
    extra: { primitives, modelEntities }
  } = target

  primitives.forEach(p => (p.show = visible))
  modelEntities.forEach(m => (m.show = visible))
}

/** 显隐标签 */
const changeMyModelLabelVisible = (label: Cesium.Label, visible: boolean) => {
  label.show = visible
}

/**
 * 渲染模型
 * @param jsonData
 * @param viewer
 * @param scale
 * @returns
 */
const renderRelativeModel = (jsonData: ModuleJSON, viewer: Cesium.Viewer) => {
  const { scale = 1, id, unit = 'coordinates' } = jsonData

  /** 渲染的基础坐标 */
  const basePosition = Cesium.Cartesian3.fromDegrees(...getPositionbyUnit(jsonData.basePosition, unit))

  /** 渲染的基础点 */
  const baseMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(basePosition)
  const primitives: MyPrimitive[] = []
  const modelEntities: Cesium.Model[] = []

  // 创建 LabelCollection 用于标签
  const labelCollection = viewer.scene.primitives.add(new Cesium.LabelCollection())
  let totalLabel: Cesium.Label

  jsonData.objects.forEach(obj => {
    // 相对位置
    const offset = new Cesium.Cartesian3(...obj.position.map(v => v * scale))
    const modelMatrix = Cesium.Matrix4.multiplyByTranslation(baseMatrix, offset, new Cesium.Matrix4())

    if (obj.type === 'box') {
      const dimensions = new Cesium.Cartesian3(...obj.dimensions.map(v => v * scale))
      const color = Cesium.Color.fromBytes(obj.color[0] * 255, obj.color[1] * 255, obj.color[2] * 255, obj.color[3] * 255)

      const geometry = Cesium.BoxGeometry.fromDimensions({
        dimensions,
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
      })

      const instance = new Cesium.GeometryInstance({
        id: {
          model: null,
          id
        },
        geometry,
        modelMatrix,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
        }
      })

      const primitive = new Cesium.Primitive({
        geometryInstances: instance,
        appearance: new Cesium.PerInstanceColorAppearance({ closed: true }),
        // 必须设置为 false 以让 Cesium 重新使用更新后的数据
        releaseGeometryInstances: false
      }) as MyPrimitive

      ;(primitive.geometryInstances as Cesium.GeometryInstance).id.model = primitive

      primitives.push(viewer.scene.primitives.add(primitive))
    }

    // 如果是model的话
    if (obj.type === 'model') {
      const model = Cesium.Model.fromGltf({
        id: {
          model: null,
          id
        },
        url: obj.url,
        modelMatrix,
        scale: (scale ?? 1.0) * scale
      })

      model.id.model = model

      modelEntities.push(viewer.scene.primitives.add(model))
    }
  })

  // 如果是整体模型名称标签
  if (jsonData.label) {
    totalLabel = addLabel({
      id,
      scale,
      labelCollection,
      jsonData,
      baseMatrix
    })
  }

  return {
    primitives,
    modelEntities,
    labelCollection,
    get getTotalLabel() {
      return totalLabel
    }
  }
}

export type ModelRegistryEntryExtra = ReturnType<typeof renderRelativeModel>
/** 注册的Module实体 */
export interface ModelRegistryEntry {
  jsonData: ModuleJSON
  extra: ModelRegistryEntryExtra
}

/** 注册全局Module数组 */
export const initModelRegistry = (
  viewer: Cesium.Viewer,
  opt: {
    focusModule: (model: ModelRegistryEntry) => void
  }
) => {
  // 全局ModelRegister，记录模型对应JSON
  const modelRegistry: ModelRegistryEntry[] = []
  const highlightLabels: ReturnType<typeof highlightLabel>[] = []

  // 根据标签文本找到对应的模型数据
  const findModelDataById = (id: ModuleJSON['id']) => {
    return modelRegistry.find(model => model.jsonData.id === id)
  }

  // 根据标签文本找到对应的模型数据下标
  const findModelIndexById = (id: ModuleJSON['id']) => {
    return modelRegistry.findIndex(model => model.jsonData.id === id)
  }

  // 根据标签文本找到对应的模型数据Label
  const findModelLabelById = (id: ModuleJSON['id']) => {
    return modelRegistry.find(model => model.jsonData.id === id)?.extra.getTotalLabel
  }

  /** 根据下标或id找到模型数据 */
  const findModelByIndexOrId = (opt: { index?: number; id?: number }) => {
    let curIndex: number = -1

    if (opt.id) {
      curIndex = findModelIndexById(opt.id)
    } else if (opt.index) {
      curIndex = opt.index
    }

    if (curIndex < 0) return

    return modelRegistry[curIndex]
  }

  return {
    /** 模型数组 */
    modelRegistry,
    /** 注册模型 */
    registerModel(jsonData: ModuleJSON) {
      if (jsonData.id === undefined) {
        jsonData.id = Math.floor(10000000 + Math.random() * 90000000)
      }

      const backRes = renderRelativeModel(jsonData, viewer)
      modelRegistry.push({
        jsonData,
        extra: backRes
      })
    },
    /** 移除模型 */
    removeModel(opt: { index?: number; id?: number }) {
      let curIndex: number = -1

      if (opt.id) {
        curIndex = findModelIndexById(opt.id)
      } else if (opt.index) {
        curIndex = opt.index
      }

      if (curIndex < 0) return

      const target = modelRegistry[curIndex]
      if (target) {
        removeMyModel(viewer, target.extra)
        modelRegistry.splice(curIndex, 1)
      }
    },
    /** 选择模型 */
    pickRegisteredModel(windowPosition: Cesium.Cartesian2) {
      const picked = viewer.scene.pick(windowPosition)
      if (!picked) return undefined
      return modelRegistry.find(entry => entry.extra.primitives === picked.primitive)
    },
    /** 添加点击事件函数 */
    addClickControl() {
      // 监听点击事件
      return viewer.screenSpaceEventHandler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = viewer.scene.pick(movement.position) // 获取点击的对象

        // console.log(pickedObject.primitive._modelId)
        if (Cesium.defined(pickedObject)) {
          if (pickedObject.id) {
            const model = findModelDataById(pickedObject.id.id) // 找到对应的model

            // console.log(model, pickedObject)
            if (model) {
              opt.focusModule(model)
              const { basePosition, unit } = model.jsonData
              const base = getPositionbyUnit(basePosition, unit)
              // 这个地方需要加上basePsoiton
              const targetPosition = Cesium.Cartesian3.fromDegrees(base[0], base[1], base[2] + 20)

              // 跳转到目标位置
              viewer.camera.flyTo({
                destination: targetPosition,
                duration: 1,
                orientation: {
                  // 默认(0, -90, 0)
                  // 头两边摆
                  heading: Cesium.Math.toRadians(0),
                  // 头左右摆
                  pitch: Cesium.Math.toRadians(-90),
                  // 头上下摇
                  roll: Cesium.Math.toRadians(0)
                }
              })

              const targetLable = pickedObject.id.model ? findModelLabelById(pickedObject.id.id) : pickedObject.id.label
              if (highlightLabels.length) {
                highlightLabels.forEach(l => l?.reset())
                highlightLabels.length = 0
              }
              // 高亮标签
              highlightLabels.push(highlightLabel(targetLable))
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /** 更改标签位置 */
    changeLabelPosition(opt: { newPosition: number[]; index?: number; id?: number }) {
      const { newPosition } = opt

      const target = findModelByIndexOrId(opt)

      if (target) {
        changeLabelPosition({
          totalLabel: target.extra.getTotalLabel,
          newPosition
        })

        target.jsonData.label.position = newPosition as [number, number, number]
      }
    },
    /** 更改模型位置 */
    changePosition(opt: { newBasePosition: number[]; index?: number; id?: number }) {
      const target = findModelByIndexOrId(opt)

      if (target) {
        changePosition({
          viewer,
          target,
          newBasePosition: opt.newBasePosition
        })

        // 修改jsonData
        target.jsonData.basePosition = opt.newBasePosition as [number, number, number]
      }
    },
    /** 设置显隐 */
    setVisible: (opt: { visible: boolean; index?: number; id?: number }) => {
      const { visible } = opt
      const target = findModelByIndexOrId(opt)

      if (target) {
        changeMyModelVisible(target, visible)

        target.jsonData.show = visible
      }
    },
    /** 修改label显隐 */
    changeLabelShow: (opt: { visible: boolean; index?: number; id?: number }) => {
      const { visible } = opt
      const target = findModelByIndexOrId(opt)

      if (target) {
        changeMyModelLabelVisible(target.extra.getTotalLabel, visible)

        target.jsonData.label.show = visible
      }
    }
  }
}
