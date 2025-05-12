import { GridEntities, GridPaintOption } from '@/interface/grid'
import * as Cesium from 'cesium'
import { getCesiumColorByName } from './colorMap'
import { metersToDegrees } from './distance'

// 初始化网格线
export const initGrid = (viewer: Cesium.Viewer, opt: GridPaintOption) => {
  // 存储网格线实体
  const gridEntities: GridEntities = []
  return paintGrid(viewer, gridEntities, opt)
}

export const removeGrid = (viewer: Cesium.Viewer, gridEntities: GridEntities) => {
  gridEntities.forEach(entity => {
    viewer.entities.remove(entity)
  })
  gridEntities.length = 0 // 清空网格实体数组
}

const paintGrid = (viewer: Cesium.Viewer, gridEntities: GridEntities, opt: GridPaintOption): GridEntities => {
  // 删除现有网格线
  removeGrid(viewer, gridEntities)

  // 设置网格的大小和间距
  const { type, baseOrigin, color = 'black', alpha = 1, lineWidth = 1 } = opt

  // 经纬线起始坐标点
  const basePosition = Cesium.Cartesian3.fromDegrees(...baseOrigin)

  if (type === 'grid') {
    const { unit = 'meter', gridSize, lineCnt } = opt
    const [startLongitude, startLatitude] = baseOrigin
    const [latStep, lonStep] =
      unit === 'meter'
        ? [metersToDegrees(gridSize, 0, startLatitude).latDegree, metersToDegrees(0, gridSize, startLatitude).lonDegree]
        : [startLatitude, startLongitude]

    for (let i = 0; i <= lineCnt; i++) {
      // 纵向网格（纬度变化）
      const latStart = startLatitude + i * latStep

      const latLinePoints = []
      for (let j = 0; j <= lineCnt; j++) {
        const lon = startLongitude + j * lonStep
        const position = Cesium.Cartesian3.fromDegrees(lon, latStart)
        latLinePoints.push(position)
      }

      // 创建纵向网格线
      const latLine = viewer.entities.add({
        polyline: {
          positions: latLinePoints,
          material: getCesiumColorByName(color).withAlpha(alpha),
          width: lineWidth
        }
      })
      gridEntities.push(latLine)

      // 横向网格（经度变化）
      const lonStart = startLongitude + i * lonStep

      const lonLinePoints = []
      for (let j = 0; j <= lineCnt; j++) {
        const lat = startLatitude + j * latStep
        const position = Cesium.Cartesian3.fromDegrees(lonStart, lat)
        lonLinePoints.push(position)
      }

      // 创建横向网格线
      const lonLine = viewer.entities.add({
        polyline: {
          positions: lonLinePoints,
          material: getCesiumColorByName(color).withAlpha(alpha),
          width: lineWidth
        }
      })
      gridEntities.push(lonLine)
    }
  } else if (type === 'coordinates') {
    const { latStep, lonStep } = opt
    if (!Number.isInteger(latStep) || !Number.isInteger(lonStep) || lonStep >= 180 || latStep >= 90) {
      console.log('经纬线渲染错误')
      return gridEntities
    }

    // 绘制纬线网格
    for (let lat = -90; lat <= 90; lat += latStep) {
      const points: Cesium.Cartesian3[] = []
      for (let lon = -180; lon <= 180; lon += 1) {
        // 计算相对位置
        const offsetPosition = Cesium.Cartesian3.fromDegrees(lon, lat)
        const relativePosition = Cesium.Cartesian3.subtract(offsetPosition, basePosition, new Cesium.Cartesian3())

        points.push(Cesium.Cartesian3.add(basePosition, relativePosition, new Cesium.Cartesian3()))
      }

      const entity = viewer.entities.add({
        polyline: new Cesium.PolylineGraphics({
          positions: points,
          material: getCesiumColorByName(color).withAlpha(alpha),
          width: lineWidth // 网格线宽度
        }),
        show: true // 默认显示网格线
      })

      gridEntities.push(entity) // 保存实体引用
    }

    // 绘制经线网格
    for (let lon = -180; lon <= 180; lon += lonStep) {
      const points = []
      for (let lat = -90; lat <= 90; lat += 1) {
        points.push(Cesium.Cartesian3.fromDegrees(lon, lat))
      }

      const entity = viewer.entities.add({
        polyline: new Cesium.PolylineGraphics({
          positions: points,
          material: getCesiumColorByName(color).withAlpha(alpha),
          width: lineWidth
        }),
        show: true
      })

      gridEntities.push(entity) // 保存实体引用
    }
  }

  return gridEntities
}

// 控制网格线显隐
export const toggleGridVisibility = (gridEntities: GridEntities, isVisible: boolean) => {
  gridEntities.forEach(entity => {
    entity.show = isVisible // 动态修改网格线的可见性
  })
}

// 修改网格线宽度
export const setGridLineWidth = (gridEntities: GridEntities, width: number) => {
  gridEntities.forEach(entity => {
    if (entity.polyline) {
      entity.polyline.width = new Cesium.ConstantProperty(width)
    }
  })
}

// 动态修改网格线间隔
export const updateGridSpacing = (viewer: Cesium.Viewer, gridEntities: GridEntities, newOpt: GridPaintOption) => {
  return paintGrid(viewer, gridEntities, newOpt)
}
