import * as THREE from 'three'
import RawSkyboxMap from '@/assets/skybox/skybox.json'
import { Project } from '@/interface/project'
import { drawGrid } from './grid-three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type RawSkyboxMap = Record<
  string,
  {
    positiveX: string
    negativeX: string
    positiveY: string
    negativeY: string
    positiveZ: string
    negativeZ: string
  }
>

type ConvertedSkyboxMap = Record<string, string[]>

function convertSkyboxMap(rawMap: RawSkyboxMap): ConvertedSkyboxMap {
  const result: ConvertedSkyboxMap = {}

  for (const key in rawMap) {
    const val = rawMap[key]
    result[key] = [val.positiveX, val.negativeX, val.negativeY, val.positiveY, val.positiveZ, val.negativeZ]
  }

  return result
}

export const SkyboxMap = convertSkyboxMap(RawSkyboxMap)

function disposeObject(obj: THREE.Object3D) {
  // 递归清理子对象
  obj.traverse(child => {
    if ((child as any).geometry) {
      ;(child as any).geometry.dispose()
    }

    if ((child as any).material) {
      const material = (child as any).material
      if (Array.isArray(material)) {
        material.forEach(mat => mat.dispose())
      } else {
        material.dispose()
      }
    }

    if ((child as any).texture) {
      ;(child as any).texture.dispose()
    }
  })
}

export type ThreeViwer = {
  domElement: HTMLElement
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  grid: THREE.GridHelper
  controls: OrbitControls
  setLayerColor: (hex: string) => void
  /** 销毁并关闭动画 */
  destory: () => void
}

/** 地板 */
const drawLayer = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(10000, 10000) // 非常大的地面
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff, // 纯白色
    side: THREE.DoubleSide
  })
  const plane = new THREE.Mesh(geometry, material)

  // 旋转到 XZ 平面上作为地面
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -1 // 贴地面

  scene.add(plane)
  return plane
}

/** 初始化viewer */
export const initProjectViewer = (container: HTMLElement, tar: Project): ThreeViwer => {
  const {
    globalObj: { skyColor, skyboxName, showSkybox, layersColor, showGrid }
  } = tar

  // 创建场景
  const scene = new THREE.Scene()

  const grid = drawGrid(scene)
  grid.visible = showGrid
  // 创建地板
  const layer = drawLayer(scene)
  // 创建相机
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(0, 20, 50)

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  // 画地面
  if (layersColor) layer.material.color.set(layersColor.slice(0, 7))
  // 控制背景色和天空盒
  // 设置纯色背景
  scene.background = new THREE.Color(skyColor || '#ffffff')

  // 添加天空盒（默认或指定）
  if (showSkybox) {
    setSkyBox({ scene } as ThreeViwer, skyboxName || '默认')
  }

  // 添加光源（基本光）
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // 地板光
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(10, 20, 10)
  scene.add(light)

  const controls = new OrbitControls(camera, renderer.domElement)

  // 设置鼠标操作
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN, // 左键旋转
    MIDDLE: THREE.MOUSE.ROTATE, // 中键缩放
    RIGHT: THREE.MOUSE.DOLLY // 右键平移
  }

  controls.enablePan = true
  controls.panSpeed = 1.0

  let animationId: number | null = null
  // 简单动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()

  return {
    scene,
    camera,
    renderer,
    grid,
    controls,
    domElement: renderer.domElement,
    setLayerColor(hex: string) {
      const material = layer.material as THREE.MeshBasicMaterial
      material.color.set(hex.slice(0, 7))
    },
    destory() {
      if (animationId) cancelAnimationFrame(animationId)

      renderer.domElement?.remove()
      // 销毁renderder
      renderer.dispose()
      renderer.forceContextLoss?.()
      renderer.domElement = null as any

      // 销毁scence
      disposeObject(scene)
    }
  }
}

/** 获取天空盒纹理 */
const getSkyBox = (name: string) => {
  const loader = new THREE.CubeTextureLoader()
  const urls = SkyboxMap[name as any] || SkyboxMap['默认']

  return loader.load(urls)
}

/** 设置天空盒 */
export const setSkyBox = (viewer: ThreeViwer, skyboxName: string) => {
  const cubeTexture = getSkyBox(skyboxName)
  viewer.scene.background = cubeTexture
}

/** 设置天空颜色(背景色啦) */
export const setSkyBoxColor = (viewer: ThreeViwer, hex: string) => {
  const currentBg = viewer.scene.background

  // 如果当前背景是 CubeTexture（天空盒），释放资源
  if (currentBg && currentBg instanceof THREE.CubeTexture) {
    currentBg.dispose()
  }

  viewer.scene.background = new THREE.Color(hex)
}

// 天空盒显隐
export const setSkyBoxVisible = (viewer: ThreeViwer, visible: boolean, opt: { hex?: string; skyboxName?: string }) => {
  const { hex = '#000000', skyboxName = '默认' } = opt

  if (visible) {
    setSkyBox(viewer, skyboxName)
  } else {
    setSkyBoxColor(viewer, hex.slice(0, 7))
  }
}
