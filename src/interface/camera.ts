export type CameraControlOption = 
{
  unit?: 'coordinates' | 'meter'
  originPosition: [number, number] // [经度， 纬度] or [x，y]
  maxDistance: number, // 最大水平距离，m
  minHeight?: number // 最低高度，m
  maxHeight?: number // 最高高度，m
}