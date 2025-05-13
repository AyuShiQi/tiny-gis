import { ModelLabelId, ModuleJSON, MyPrimitive } from '@/interface/module'
import * as Cesium from 'cesium'
import { getPositionbyUnit } from './distance'
import { CesiumColorMapping } from './colorMap'

// 高亮标签
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

/**
 * 渲染模型
 * @param jsonData
 * @param viewer
 * @param scale
 * @returns
 */
export const renderRelativeModel = (jsonData: ModuleJSON, viewer: Cesium.Viewer) => {
  const { scale = 1, id, unit = 'coordinates' } = jsonData

  const basePosition = Cesium.Cartesian3.fromDegrees(...getPositionbyUnit(jsonData.basePosition, unit))
  const baseMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(basePosition)
  const primitives: MyPrimitive[] = []
  const modelEntities: Cesium.Model[] = []

  // 创建 LabelCollection 用于标签
  const labelCollection = viewer.scene.primitives.add(new Cesium.LabelCollection())
  let totalLabel: Cesium.Label

  primitives.push(labelCollection)

  /** 添加总label */
  const addLabel = (labelData: ModuleJSON['label']) => {
    const { position, text, font, color } = labelData
    // 相对位置
    const offset = new Cesium.Cartesian3(...position.map(v => v * scale))
    const labelMatrix = Cesium.Matrix4.multiplyByPoint(baseMatrix, offset, new Cesium.Cartesian3())
    totalLabel = labelCollection.add({
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
  }

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
        appearance: new Cesium.PerInstanceColorAppearance({ closed: true })
      }) as MyPrimitive

      ;(primitive.geometryInstances as Cesium.GeometryInstance).id.model = primitive
      primitives.push(viewer.scene.primitives.add(primitive))

      // 如果该模型有标签，添加标签
      if (obj.label) {
        const { label } = obj
        labelCollection.add({
          id,
          position: Cesium.Cartesian3.fromDegrees(label.position[0], label.position[1], label.position[2]),
          text: label.text,
          font: label.font,
          fillColor: Cesium.Color.fromCssColorString(label.color),
          scale: 1.0
        })
      }

      viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: instance,
          appearance: new Cesium.PerInstanceColorAppearance({ closed: true })
        })
      )
    }

    if (obj.type === 'model') {
      Cesium.Model.fromGltfAsync({
        url: obj.url,
        modelMatrix,
        scale: (obj.scale ?? 1.0) * scale
      }).then(model => {
        viewer.scene.primitives.add(model)
        modelEntities.push(model)
      })
    }
  })

  // 如果是整体模型名称标签
  if (jsonData.label) {
    addLabel(jsonData.label)
  }

  return {
    primitives,
    modelEntities,
    /** 移除模型 */
    remove: () => {
      primitives.forEach(p => viewer.scene.primitives.remove(p))
      modelEntities.forEach(m => viewer.scene.primitives.remove(m))
    },
    /** 设置显隐 */
    setVisible: (visible: boolean) => {
      primitives.forEach(p => (p.show = visible))
      modelEntities.forEach(m => (m.show = visible))
    },
    /** 更新label */
    updateLabel: (opt: ModuleJSON['label']) => {
      if (totalLabel) {
        labelCollection.remove(totalLabel)
        addLabel(opt)
      } else {
        addLabel(opt)
      }
    },
    /** 修改label显隐 */
    changeLabelShow: (visible: boolean) => {
      if (totalLabel) {
        totalLabel.show = visible
      }
    },
    get getTotalLabel() {
      return totalLabel
    }
  }
}

export interface ModelRegistryEntry {
  primitive: Cesium.Primitive[]
  entity: Cesium.Model[]
  jsonData: ModuleJSON
  extra: ReturnType<typeof renderRelativeModel>
}

/** 注册全局Module数组 */
export const initModelRegistry = (viewer: Cesium.Viewer) => {
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

  return {
    /** 模型数组 */
    modelRegistry,
    /** 注册模型 */
    registerModel(jsonData: ModuleJSON) {
      const backRes = renderRelativeModel(jsonData, viewer)
      modelRegistry.push({
        jsonData,
        primitive: backRes.primitives,
        entity: backRes.modelEntities,
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
        target.extra.remove()
        modelRegistry.splice(curIndex, 1)
      }
    },
    /** 选择模型 */
    pickRegisteredModel(viewer: Cesium.Viewer, windowPosition: Cesium.Cartesian2) {
      const picked = viewer.scene.pick(windowPosition)
      if (!picked) return undefined
      return modelRegistry.find(entry => entry.primitive === picked.primitive)
    },
    /** 添加点击事件函数 */
    addClickControl(viewer: Cesium.Viewer) {
      // 监听点击事件
      return viewer.screenSpaceEventHandler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = viewer.scene.pick(movement.position) // 获取点击的对象

        // console.log(pickedObject.primitive._modelId)
        if (Cesium.defined(pickedObject)) {
          if (pickedObject.id) {
            const model = findModelDataById(pickedObject.id.id) // 找到对应的model

            // console.log(model, pickedObject)
            if (model) {
              const { basePosition, unit } = model.jsonData
              const base = getPositionbyUnit(basePosition, unit)
              // 这个地方需要加上basePsoiton
              const targetPosition = Cesium.Cartesian3.fromDegrees(base[0], base[1], base[2] + 5)

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
    }
  }
}
