import { ModuleJSON } from '@/interface/module'
import { Math as CesiumMath } from 'cesium'

/**
 * 将米转换为经纬度
 * @param latMeters
 * @param lonMeters
 * @param lat
 * @returns
 */
export const metersToDegrees = (latMeters: number, lonMeters: number, lat: number) => {
  const latDegree = latMeters / 111320 // 纬度每度的米数 (1度纬度大约是111320米)
  const lonDegree = lonMeters / (111320 * Math.cos(CesiumMath.toRadians(lat))) // 经度每度的米数

  return {
    latDegree,
    lonDegree
  }
}

/**
 * 根据中心点经纬度，按米单位偏移，返回新的经纬度坐标。
 * @param baseLat 基准纬度（度）
 * @param baseLon 基准经度（度）
 * @param offsetNorth 向北偏移距离（米，正值向北，负值向南）
 * @param offsetEast 向东偏移距离（米，正值向东，负值向西）
 * @returns 新位置的经纬度 { lat, lon }
 */
export const offsetPositionByMeters = (
  baseLat: number,
  baseLon: number,
  offsetNorth: number,
  offsetEast: number
): { latDegree: number; lonDegree: number } => {
  // 每度纬度大约是 111320 米
  const latDegreeOffset = offsetNorth / 111320

  // 每度经度在当前纬度的长度 = 111320 * cos(纬度)
  const lonDegreeOffset = offsetEast / (111320 * Math.cos(CesiumMath.toRadians(baseLat)))

  return {
    latDegree: baseLat + latDegreeOffset,
    lonDegree: baseLon + lonDegreeOffset
  }
}

export const getPositionbyUnit = (posiiton: [number, number, number], unit: ModuleJSON['unit']): [number, number, number] => {
  if (unit === 'meter') {
    const coorRes = metersToDegrees(posiiton[1], posiiton[0], 0)
    return [coorRes.lonDegree, coorRes.latDegree, posiiton[2]]
  }

  return [...posiiton]
}
