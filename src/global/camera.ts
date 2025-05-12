import { CameraControlOption } from '@/interface/camera'
import { Viewer, Cartesian3, Cartographic, Ellipsoid, EllipsoidGeodesic } from 'cesium'
import { metersToDegrees } from './distance'

/** 添加相机限制 */
export const addCameraControl = (viewer: Viewer, opt: CameraControlOption) => {
  const { unit = 'coordinates', maxDistance, originPosition, minHeight, maxHeight } = opt
  let center: Cartesian3
  if (unit === 'meter') {
    const res = metersToDegrees(originPosition[1], originPosition[0], 0)
    center = Cartesian3.fromDegrees(res.lonDegree, res.latDegree)
  } else {
    center = Cartesian3.fromDegrees(...originPosition)
  }

  const fn = () => {
    let needChange = false
    const camera = viewer.camera
    const position = camera.positionWC

    // 获取当前地理坐标
    const cartographic = Cartographic.fromCartesian(position)
    const centerCartographic = Cartographic.fromCartesian(center)

    // 计算两点之间的地表大圆距离
    const geodesic = new EllipsoidGeodesic(centerCartographic, cartographic)
    const surfaceDistance = geodesic.surfaceDistance // 单位：米

    // 复制原角度
    const heading = camera.heading
    const pitch = camera.pitch
    const roll = camera.roll

    let clampedCartographic = cartographic.clone()

    // 1. 限制水平距离
    if (surfaceDistance > maxDistance) {
      // 计算方向向量（地表投影方向）
      const direction = Cartesian3.normalize(
        Cartesian3.subtract(
          Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude),
          Cartesian3.fromRadians(centerCartographic.longitude, centerCartographic.latitude),
          new Cartesian3()
        ),
        new Cartesian3()
      )

      const limitedPosition = Cartesian3.add(
        Cartesian3.fromRadians(centerCartographic.longitude, centerCartographic.latitude),
        Cartesian3.multiplyByScalar(direction, maxDistance, new Cartesian3()),
        new Cartesian3()
      )

      clampedCartographic = Cartographic.fromCartesian(limitedPosition)
      clampedCartographic.height = cartographic.height // 保持原始高度不变
      needChange = true
    }

    let newPosition = Cartesian3.fromRadians(clampedCartographic.longitude, clampedCartographic.latitude, clampedCartographic.height)

    // 2. 限制高度
    if (minHeight || maxHeight) {
      const cartographic = Cartographic.fromCartesian(newPosition)
      const height = cartographic.height

      let clampedHeight = height
      if (minHeight && height < minHeight) {
        needChange = true
        clampedHeight = minHeight
      }
      if (maxHeight && height > maxHeight) {
        needChange = true
        clampedHeight = maxHeight
      }

      // 如果高度被修改，更新 newPosition.z
      if (clampedHeight !== height) {
        cartographic.height = clampedHeight
        newPosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
      }
    }

    // 应用修改后的位置
    if (needChange) {
      camera.setView({
        destination: newPosition,
        orientation: {
          heading,
          pitch,
          roll
        }
      })
    }
  }

  return viewer.camera.changed.addEventListener(fn)
}
