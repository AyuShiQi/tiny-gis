import { GridEntities, GridPaintOption } from '@/interface/grid'
import * as Cesium from 'cesium'
import { getCesiumColorByName } from './colorMap'
import { metersToDegrees } from './distance'

// 初始化网格线
export const initGrid = () => {
  return [] as GridEntities
}

export const removeGrid = (viewer: Cesium.Viewer, gridEntities: GridEntities) => {
  gridEntities.forEach(entity => {
    viewer.entities.remove(entity)
  })
  gridEntities.length = 0 // 清空网格实体数组
}

/**
 * @param viewer Cesium Viewer 实例
 * @param centerLon 中心经度
 * @param centerLat 中心纬度
 * @param totalSide 总边长（米），整个正方形边长为 2x
 * @param cellSize 每个小方格的边长（米），为 y
 * @param options 可选参数
 */
const drawSquareGrid = (
  viewer: Cesium.Viewer,
  gridEntities: GridEntities,
  centerLon: number,
  centerLat: number,
  totalSide: number,
  cellSize: number,
  opt: {
    color: Cesium.Color
    width: number
  }
): void => {
  const earthRadius = 6378137.0

  const meterToDegreesLat = (m: number): number => (m / earthRadius) * (180 / Math.PI)

  const meterToDegreesLon = (m: number, lat: number): number => (m / (earthRadius * Math.cos(Cesium.Math.toRadians(lat)))) * (180 / Math.PI)

  const halfSide = totalSide / 2
  const lineCnt = Math.floor(totalSide / cellSize)
  const latStep = meterToDegreesLat(cellSize)
  const lonStep = meterToDegreesLon(cellSize, centerLat)

  const startLat = centerLat - meterToDegreesLat(halfSide)
  const startLon = centerLon - meterToDegreesLon(halfSide, centerLat)

  // 绘制横向网格线
  for (let i = 0; i <= lineCnt; i++) {
    const lat = startLat + i * latStep

    // 起点和终点，绘制纬度弧线
    const start = Cesium.Cartesian3.fromDegrees(startLon, lat)
    const end = Cesium.Cartesian3.fromDegrees(startLon + lonStep * lineCnt, lat)

    gridEntities.push(
      viewer.entities.add({
        polyline: {
          positions: [start, end],
          width: opt.width,
          material: opt.color,
          arcType: Cesium.ArcType.GEODESIC,
          granularity: Cesium.Math.toRadians(1.0) // 控制弧线平滑度
        }
      })
    )
  }

  // 绘制纵向网格线
  for (let i = 0; i <= lineCnt; i++) {
    const lon = startLon + i * lonStep

    // 只提供起点和终点，绘制经度弧线
    const start = Cesium.Cartesian3.fromDegrees(lon, startLat)
    const end = Cesium.Cartesian3.fromDegrees(lon, startLat + latStep * lineCnt)

    gridEntities.push(
      viewer.entities.add({
        polyline: {
          positions: [start, end],
          width: opt.width,
          material: opt.color,
          arcType: Cesium.ArcType.GEODESIC,
          granularity: Cesium.Math.toRadians(1.0)
        }
      })
    )
  }
}

export const paintGrid = (viewer: Cesium.Viewer, gridEntities: GridEntities, opt: GridPaintOption): GridEntities => {
  // 删除现有网格线
  removeGrid(viewer, gridEntities)

  // 设置网格的大小和间距
  const { type, baseOrigin, color = '#000', alpha = 1, lineWidth = 1, defaultShow = false } = opt

  // 经纬线起始坐标点
  const basePosition = Cesium.Cartesian3.fromDegrees(...baseOrigin)

  if (type === 'grid') {
    const { unit = 'meter', gridSize, squareSize } = opt
    const [startLongitude, startLatitude] = baseOrigin
    const [latStep, lonStep] =
      unit === 'meter'
        ? [metersToDegrees(gridSize, 0, startLatitude).latDegree, metersToDegrees(0, gridSize, startLatitude).lonDegree]
        : [startLatitude, startLongitude]

    // 开始绘制
    drawSquareGrid(viewer, gridEntities, lonStep, latStep, squareSize, gridSize, {
      color: Cesium.Color.fromCssColorString(color).withAlpha(alpha),
      width: lineWidth
    })
    /** 渲染经纬线 */
  } else if (type === 'coordinates') {
    const { latStep, lonStep } = opt
    if (!Number.isInteger(latStep) || !Number.isInteger(lonStep) || lonStep >= 180 || latStep >= 90) {
      console.log('经纬线渲染错误')
      return gridEntities
    }
    for (let lat = -90; lat <= 90; lat += latStep) {
      const start = Cesium.Cartesian3.fromDegrees(-180, lat)
      const end = Cesium.Cartesian3.fromDegrees(180, lat)

      const entity = viewer.entities.add({
        polyline: new Cesium.PolylineGraphics({
          positions: [start, end],
          material: Cesium.Color.fromCssColorString(color).withAlpha(alpha),
          width: lineWidth,
          arcType: Cesium.ArcType.GEODESIC,
          granularity: Cesium.Math.toRadians(1.0) // 控制插值精度，越小越平滑
        }),
        show: true
      })

      gridEntities.push(entity)
    }

    // 绘制经线网格
    for (let lon = -180; lon <= 180; lon += lonStep) {
      const start = Cesium.Cartesian3.fromDegrees(lon, -90)
      const end = Cesium.Cartesian3.fromDegrees(lon, 90)

      const entity = viewer.entities.add({
        polyline: new Cesium.PolylineGraphics({
          positions: [start, end],
          material: Cesium.Color.fromCssColorString(color).withAlpha(alpha),
          width: lineWidth,
          arcType: Cesium.ArcType.GEODESIC,
          granularity: Cesium.Math.toRadians(1.0)
        }),
        show: true
      })

      gridEntities.push(entity)
    }
  }

  toggleGridVisibility(gridEntities, defaultShow)
  return gridEntities
}

// 画范围
export const paintCircle = (viewer: Cesium.Viewer, center: [number, number], radius: number, hex = '#000') => {
  const curColor = Cesium.Color.fromCssColorString(hex)
  return viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(...center),
    ellipse: {
      semiMajorAxis: radius,
      semiMinorAxis: radius,
      height: 0, // 紧贴地面
      material: curColor.withAlpha(0.1), // 半透明黄色
      outline: true,
      outlineColor: curColor
    }
  })
}

// 修改范围颜色
export const setCircleColor = (entity: Cesium.Entity, hex: string) => {
  const curColor = new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(hex))
  const curFill = new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(hex).withAlpha(0.1))
  if (entity.ellipse) {
    entity.ellipse.material = curFill
    entity.ellipse.outlineColor = curColor
  }
}

// 控制网格线显隐
export const toggleGridVisibility = (gridEntities: GridEntities, isVisible: boolean) => {
  gridEntities.forEach(entity => {
    entity.show = isVisible // 动态修改网格线的可见性
  })
}

// 修改网格线颜色
export const setGridColor = (gridEntities: GridEntities, hex: string) => {
  const curColor = new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(hex))
  gridEntities.forEach(entity => {
    if (entity.polyline) {
      entity.polyline.material = curColor
    }
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
