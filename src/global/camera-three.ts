import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { gsap } from 'gsap'

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

const getRnadom = (x: number) => {
  return Math.floor(Math.random() * (2 * x + 1)) - x
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
  private currentTween?: gsap.core.Tween

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

  private getNewPosition(current: THREE.Vector3, angleRad: number, distance: number) {
    // 在水平面（X,Z）移动，Y用this.height
    const x = current.x + distance * Math.cos(angleRad)
    const z = current.z + distance * Math.sin(angleRad)
    return new THREE.Vector3(x, this.height, z)
  }

  private moveOneStep = () => {
    if (this.isFlying || this.isUserInterrupt) return

    this.isFlying = true
    this.controls.enableRotate = false // 禁止旋转
    const current = this.camera.position.clone()
    const distance = this.getDistanceFromCenter(current)

    let angle = 0

    if (distance >= this.radius) {
      const dirToCenter = new THREE.Vector3().subVectors(this.center, current).setY(0).normalize()
      angle = Math.atan2(dirToCenter.z, dirToCenter.x)
    }

    const currentPos = this.camera.position.clone()
    const nextPos = this.getNewPosition(currentPos, angle, Math.floor(this.height / 2))
    nextPos.y = this.height // 固定高度

    this.updateFlyTarget(nextPos)
    let randomX = getRnadom(100)
    let randomY = getRnadom(this.height)
    const randomZ = getRnadom(100)

    this.currentTween = gsap.to(this.camera.position, {
      x: nextPos.x,
      y: nextPos.y,
      z: nextPos.z,
      duration: 10,
      ease: 'power2.inOut',
      onUpdate: () => {
        // 计算相机应该看的点，让视角保持45度俯视角度
        const lookAtPos = new THREE.Vector3(this.camera.position.x + randomX, randomY, this.camera.position.z + randomZ)
        this.camera.lookAt(lookAtPos)
      },
      onComplete: () => {
        this.isFlying = false
        if (!this.isUserInterrupt) {
          setTimeout(this.moveOneStep, 100)
        } else {
          this.controls.enableRotate = true // 恢复旋转
          this.endCb()
        }
      }
    })
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
    this.endCb()
    this.isUserInterrupt = true
    this.isFlying = false
    this.currentTween?.kill()
  }

  destroy() {
    this.stop()
    window.removeEventListener('keydown', this.handleUserInterrupt)
    window.removeEventListener('mousedown', this.handleUserInterrupt)
  }
}
