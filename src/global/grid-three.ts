import * as THREE from 'three'
import { GridPaintOption } from '@/interface/grid'
import { GridEntities } from '@/interface/grid-three'
import { ThreeViwer } from './project-three'
import { latLngToMercator } from './json'

// three网格线实体数组
export const initGrid = (): GridEntities => {
  return [] as GridEntities
}

// 移除并释放网格线
export const removeGrid = (scene: THREE.Scene, gridEntities: GridEntities) => {
  gridEntities.forEach(line => {
    scene.remove(line)
    line.geometry.dispose()
    if (Array.isArray(line.material)) {
      line.material.forEach(m => m.dispose())
    } else if (line.material) {
      line.material.dispose()
    }
  })
  gridEntities.length = 0
}

/**
 * 画正方形网格（平面坐标系）
 * @param scene Three.js 场景
 * @param gridEntities 存储网格线对象的数组
 * @param centerX 中心点X（经度）
 * @param centerY 中心点Y（纬度）
 * @param totalSide 总边长（米）
 * @param cellSize 网格单元大小（米）
 * @param opt 颜色宽度等参数
 */
const drawSquareGrid = (
  scene: THREE.Scene,
  gridEntities: GridEntities,
  centerX: number,
  centerY: number,
  totalSide: number,
  cellSize: number,
  opt: {
    color: THREE.Color
    width: number
  }
): void => {
  // 这里假设地球是平面投影，直接米转为单位，简化处理
  const halfSide = totalSide / 2
  const lineCnt = Math.floor(totalSide / cellSize)

  const startX = centerX - halfSide
  const startY = centerY - halfSide

  const material = new THREE.LineBasicMaterial({ color: opt.color, linewidth: opt.width })

  // 横线
  for (let i = 0; i <= lineCnt; i++) {
    const y = startY + i * cellSize
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(startX, y, 0), new THREE.Vector3(startX + totalSide, y, 0)])
    const line = new THREE.Line(geometry, material)
    scene.add(line)
    gridEntities.push(line)
  }

  // 纵线
  for (let i = 0; i <= lineCnt; i++) {
    const x = startX + i * cellSize
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, startY, 0), new THREE.Vector3(x, startY + totalSide, 0)])
    const line = new THREE.Line(geometry, material)
    scene.add(line)
    gridEntities.push(line)
  }
}

export const paintGrid = (scene: THREE.Scene, gridEntities: GridEntities, opt: GridPaintOption): GridEntities => {
  removeGrid(scene, gridEntities)

  const { type, baseOrigin, color = '#000', lineWidth = 1, defaultShow = false } = opt

  // 将颜色字符串转为 THREE.Color
  const threeColor = new THREE.Color(color)
  threeColor.convertSRGBToLinear() // 确保颜色空间正确

  if (type === 'grid') {
    const { gridSize, squareSize } = opt
    drawSquareGrid(scene, gridEntities, baseOrigin[0], baseOrigin[1], squareSize, gridSize, {
      color: threeColor,
      width: lineWidth
    })
  } else if (type === 'coordinates') {
    const { latStep, lonStep } = opt
    // 绘制经纬线等价的线条，自行转换为平面坐标
    if (!Number.isInteger(latStep) || !Number.isInteger(lonStep) || lonStep >= 180 || latStep >= 90) {
      console.log('经纬线渲染错误')
      return gridEntities
    }

    const material = new THREE.LineBasicMaterial({ color: threeColor, linewidth: lineWidth })

    // 横线 (纬线)
    for (let lat = -90; lat <= 90; lat += latStep) {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-180, lat, 0), new THREE.Vector3(180, lat, 0)])
      const line = new THREE.Line(geometry, material)
      scene.add(line)
      gridEntities.push(line)
    }

    // 纵线 (经线)
    for (let lon = -180; lon <= 180; lon += lonStep) {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(lon, -90, 0), new THREE.Vector3(lon, 90, 0)])
      const line = new THREE.Line(geometry, material)
      scene.add(line)
      gridEntities.push(line)
    }
  }

  // 控制网格线显示与否
  gridEntities.forEach(line => {
    line.visible = defaultShow
  })

  return gridEntities
}

/** 画地表 */
export const drawGrid = (scene: THREE.Scene) => {
  const grid = new THREE.GridHelper(10000, 1000, 0x444444, 0x888888) // size, divisions
  grid.rotation.x = 0 // 默认就是贴地面的 XZ 平面
  scene.add(grid)

  return grid
}

// 画圆范围
export const paintCircle = (viewer: ThreeViwer, center: [number, number], radius: number, hex = '#000') => {
  const color = new THREE.Color(hex)
  const geometry = new THREE.CircleGeometry(radius, 64)

  const material = new THREE.MeshBasicMaterial({
    color: color,
    opacity: 0.6,
    transparent: true
  })
  const circle = new THREE.Mesh(geometry, material)
  circle.rotation.x = -Math.PI / 2

  const position = latLngToMercator(center)
  circle.position.set(...position)
  circle.rotation.x = -Math.PI / 2

  viewer.scene.add(circle)
  return circle
}

// 修改圆颜色
export const setCircleColor = (circle: THREE.Mesh, hex: string) => {
  if (circle.material) {
    const color = new THREE.Color(hex)
    ;(circle.material as THREE.MeshBasicMaterial).color = color
    ;(circle.material as THREE.MeshBasicMaterial).opacity = 0.1
    ;(circle.material as THREE.MeshBasicMaterial).transparent = true
  }
}

// 显隐控制
export const toggleGridVisibility = (gridEntities: GridEntities, isVisible: boolean) => {
  gridEntities.forEach(line => {
    line.visible = isVisible
  })
}

// 修改网格颜色
export const setGridColor = (gridEntities: GridEntities, hex: string) => {
  const color = new THREE.Color(hex)
  gridEntities.forEach(line => {
    if (Array.isArray(line.material)) {
      ;(line.material as THREE.MeshBasicMaterial[]).forEach(mat => (mat.color = color))
    } else if (line.material) {
      ;(line.material as THREE.MeshBasicMaterial).color = color
    }
  })
}

// 修改网格线宽度
export const setGridLineWidth = (gridEntities: GridEntities, width: number) => {
  gridEntities.forEach(line => {
    if (line.material) {
      if (Array.isArray(line.material)) {
        ;(line.material as THREE.LineBasicMaterial[]).forEach(mat => (mat.linewidth = width))
      } else {
        ;(line.material as THREE.LineBasicMaterial).linewidth = width
      }
    }
  })
}

// 动态修改网格间距，直接调用paintGrid重新绘制
export const updateGridSpacing = (scene: THREE.Scene, gridEntities: GridEntities, newOpt: GridPaintOption) => {
  return paintGrid(scene, gridEntities, newOpt)
}
