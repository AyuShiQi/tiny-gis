import { Entity } from 'cesium'
import { CesiumColor } from '@/global/colorMap'

export type GridPaintOption =
  | {
      type: 'coordinates'
      baseOrigin: [number, number] // 描绘开始位置
      latStep: number // 纬度间距（度数，小于90）
      lonStep: number // 经度间距 （度数，小于180）
      color?: string // 线颜色
      alpha?: number // 线透明度
      lineWidth?: number // 线像素宽度
      defaultShow?: boolean
    }
  | {
      type: 'grid'
      unit?: 'coordinates' | 'meter'
      baseOrigin: [number, number] // 描绘开始位置
      color?: string // 线颜色
      alpha?: number // 线透明度
      lineWidth?: number // 线像素宽度
      /** 矩阵边长 */
      squareSize: number
      /** 小方格边长 */
      gridSize: number
      defaultShow?: boolean
    }

export type GridEntities = Entity[]
