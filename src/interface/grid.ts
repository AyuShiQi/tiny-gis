import { Entity } from "cesium"
import { CesiumColor } from "@/global/colorMap"

export type GridPaintOption = 
{
  type: 'coordinates'
  baseOrigin: [number, number] // 描绘开始位置
  latStep: number // 纬度间距（度数，小于90）
  lonStep: number // 经度间距 （度数，小于180）
  color?: CesiumColor, // 线颜色
  alpha?: number // 线透明度
  lineWidth?: number // 线像素宽度
} | {
  type: 'grid'
  baseOrigin: [number, number] // 描绘开始位置
  color?: CesiumColor, // 线颜色
  alpha?: number // 线透明度
  lineWidth?: number // 线像素宽度
  lineCnt: number // 渲染线根数
  gridSize: number
}

export type GridEntities = Entity[]