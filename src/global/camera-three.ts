import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface CameraControlOption {
  maxDistance: number
  minHeight?: number
  maxHeight?: number
  originPosition: [number, number, number] // [x, y, z]三维坐标，单位米
}

export const addCameraControl = (camera: THREE.PerspectiveCamera, controls: OrbitControls, opt: CameraControlOption) => {
  const { maxDistance, minHeight = 0, maxHeight = Infinity, originPosition } = opt
  const center = new THREE.Vector3(...originPosition)

  controls.addEventListener('change', () => {
    // 限制相机最大距离(center到相机的距离)
    const camPos = camera.position.clone()
    const offset = camPos.sub(center)
    const distance = offset.length()

    let clamped = false

    if (distance > maxDistance) {
      offset.setLength(maxDistance)
      clamped = true
    }

    // 限制相机高度范围（Y轴）
    if (camera.position.y < minHeight) {
      camera.position.y = minHeight
      clamped = true
    }
    if (camera.position.y > maxHeight) {
      camera.position.y = maxHeight
      clamped = true
    }

    if (clamped) {
      camera.position.copy(center).add(offset)
      controls.update()
    }
  })
}

export class RandomSceneRoamer {
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private center: THREE.Vector3
  private radius: number
  private isUserInterrupt = false
  private isFlying = false
  private height = 100
  private startCb: () => void
  private endCb: () => void
  private updateFlyTarget: (pos: THREE.Vector3) => void
  private animationFrameId: number | null = null

  constructor(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    center: THREE.Vector3,
    radiusMeters: number,
    opt: {
      startCb: () => void
      endCb: () => void
      updateFlyTarget: (pos: THREE.Vector3) => void
    }
  ) {
    this.camera = camera
    this.controls = controls
    this.center = center
    this.radius = radiusMeters
    this.startCb = opt.startCb
    this.endCb = opt.endCb
    this.updateFlyTarget = opt.updateFlyTarget

    this.handleUserInterrupt = this.handleUserInterrupt.bind(this)

    window.addEventListener('keydown', this.handleUserInterrupt)
    window.addEventListener('mousedown', this.handleUserInterrupt)
  }

  private handleUserInterrupt() {
    if (!this.isFlying) return
    this.stop()
    this.isUserInterrupt = true
  }

  private getDistanceFromCenter(pos: THREE.Vector3) {
    return pos.distanceTo(this.center)
  }

  private getRandomDirection() {
    return Math.random() * 2 * Math.PI
  }

  private getNewPosition(current: THREE.Vector3, angleRad: number, distance: number) {
    // 在水平面（X,Z）移动，Y用this.height
    const x = current.x + distance * Math.cos(angleRad)
    const z = current.z + distance * Math.sin(angleRad)
    return new THREE.Vector3(x, this.height, z)
  }

  private moveOneStep = () => {
    if (this.isFlying || this.isUserInterrupt) return

    const current = this.camera.position.clone()
    const distance = this.getDistanceFromCenter(current)

    let angle = this.getRandomDirection()

    // 超出范围，朝向中心
    if (distance >= this.radius) {
      const dirToCenter = new THREE.Vector3()
        .subVectors(this.center, current)
        .setY(0) // 只在XZ平面方向
        .normalize()
      angle = Math.atan2(dirToCenter.z, dirToCenter.x)
    }

    const nextPos = this.getNewPosition(current, angle, 200) // 移动200米
    this.updateFlyTarget(nextPos)

    this.isFlying = true

    // 使用Tween或动画函数平滑移动相机
    const duration = 10000 // 10秒
    const start = performance.now()
    const startPos = this.camera.position.clone()

    const animate = (time: number) => {
      const elapsed = time - start
      const t = Math.min(elapsed / duration, 1)

      const lerpPos = startPos.clone().lerp(nextPos, t)
      this.camera.position.copy(lerpPos)
      this.controls.target.copy(this.center)
      this.controls.update()

      // 使相机朝向移动方向
      const lookAtPos = nextPos.clone()
      lookAtPos.y = this.height // 保持高度
      this.camera.lookAt(lookAtPos)

      if (t < 1 && !this.isUserInterrupt) {
        this.animationFrameId = requestAnimationFrame(animate)
      } else {
        this.isFlying = false
        if (!this.isUserInterrupt) {
          setTimeout(this.moveOneStep, 100)
        } else {
          this.endCb()
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }

  setHeight(height: number) {
    this.height = height
  }

  start() {
    if (this.isFlying) return
    this.stop()
    this.startCb()
    this.isUserInterrupt = false
    this.moveOneStep()
  }

  stop() {
    if (!this.isFlying) return
    this.isUserInterrupt = true
    this.isFlying = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  destroy() {
    this.stop()
    window.removeEventListener('keydown', this.handleUserInterrupt)
    window.removeEventListener('mousedown', this.handleUserInterrupt)
  }
}
