import { CameraControlOption } from '@/interface/camera'
import { Math as CesiumMath, Viewer, Cartesian3, Cartographic, EllipsoidGeodesic, Ellipsoid } from 'cesium'
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

/** 漫游 */
export class RandomSceneRoamer {
  private viewer: Viewer
  private center: Cartographic
  private radius: number
  private isUserInterrupt = false
  private isFlying = false
  private height = 100
  private startCb: () => void
  private endCb: () => void
  private updateFlyTarget: (t: Cartographic) => void

  constructor(
    viewer: Viewer,
    centerLon: number,
    centerLat: number,
    radiusMeters: number,
    opt: { startCb: () => void; endCb: () => void; updateFlyTarget: (t: Cartographic) => void }
  ) {
    this.viewer = viewer
    this.center = Cartographic.fromDegrees(centerLon, centerLat)
    this.radius = radiusMeters
    this.startCb = opt.startCb
    this.endCb = opt.endCb
    this.updateFlyTarget = opt.updateFlyTarget

    // 用户打断
    document.addEventListener('keydown', this.handleUserInterrupt)
    document.addEventListener('mousedown', this.handleUserInterrupt)
  }

  private handleUserInterrupt = () => {
    if (!this.isFlying) return
    // console.log('正在打断')
    this.stop()
    this.isUserInterrupt = true
  }

  private getDistanceFromCenter(pos: Cartographic): number {
    const geo = new EllipsoidGeodesic(this.center, pos)
    return geo.surfaceDistance
  }

  private getRandomDirection(): number {
    return CesiumMath.toRadians(Math.random() * 360)
  }

  private getNewPosition(current: Cartographic, angleRad: number, distance: number): Cartographic {
    const endLat = current.latitude + (distance / 6378137) * Math.cos(angleRad)
    const endLon = current.longitude + ((distance / 6378137) * Math.sin(angleRad)) / Math.cos(current.latitude)

    return new Cartographic(endLon, endLat, this.height) // 100米高
  }

  private moveOneStep = () => {
    if (this.isFlying || this.isUserInterrupt) return

    const current = this.viewer.camera.positionCartographic
    const distance = this.getDistanceFromCenter(current)

    let angle = this.getRandomDirection()

    // 如果超过边界，则朝向中心
    if (distance >= this.radius) {
      const toCenter = new EllipsoidGeodesic(current, this.center)
      angle = toCenter.startHeading
    }

    const nextPos = this.getNewPosition(current, angle, 200) // 每步移动200米
    this.updateFlyTarget(nextPos)
    const dest = Cartesian3.fromRadians(nextPos.longitude, nextPos.latitude, nextPos.height)

    this.isFlying = true
    this.viewer.camera.flyTo({
      destination: dest,
      duration: 10,
      orientation: {
        heading: angle,
        pitch: -CesiumMath.toRadians(45),
        roll: 0
      },
      complete: () => {
        // console.log('完成一次飞行')
        // 飞行完成后的逻辑
        this.isFlying = false
        if (!this.isUserInterrupt) {
          this.scheduleNextStep()
        }
      },
      cancel: () => {
        // console.log('打断了')
        // 如果飞行被打断
        this.isFlying = false
        this.endCb()
      }
    })
  }

  private scheduleNextStep() {
    setTimeout(this.moveOneStep, 100)
  }

  setHeight(height: number) {
    if (this.height !== height) {
      this.height = height
    }
  }

  start() {
    if (this.isFlying) return
    this.stop()
    this.startCb()
    this.isUserInterrupt = false
    this.scheduleNextStep()
  }

  stop() {
    if (!this.isFlying) return
    this.isUserInterrupt = true
    this.isFlying = false
    this.viewer?.camera.cancelFlight()
  }

  destroy() {
    this.stop()
    document.removeEventListener('keydown', this.handleUserInterrupt)
    document.removeEventListener('mousedown', this.handleUserInterrupt)
  }
}
