import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

/** 生成缩略图 */
export async function renderToImage({
  jsonConfig,
  gltfUrl,
  width = 512,
  height = 512
}: {
  jsonConfig?: any
  gltfUrl?: File
  width?: number
  height?: number
}): Promise<string | undefined> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0xffffff, 0) // transparent background

  const scene = new THREE.Scene()

  // 默认灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(5, 10, 5)
  scene.add(dirLight)

  // 模型边界 box
  const boundingBox = new THREE.Box3()

  // Helper: 坐标轴
  // scene.add(new THREE.AxesHelper(1))

  // 添加 JSON 自定义模型
  if (jsonConfig?.objects) {
    jsonConfig.objects.forEach((obj: any) => {
      if (obj.type === 'box') {
        const geometry = new THREE.BoxGeometry(obj.dimensions[0], obj.dimensions[2], obj.dimensions[1])
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(...obj.color.slice(0, 3))
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(obj.position[0], obj.position[2], obj.position[1])
        scene.add(mesh)
        boundingBox.expandByObject(mesh)
      }
    })
  }

  // 自动设置相机
  const center = new THREE.Vector3()
  const size = new THREE.Vector3()
  boundingBox.getCenter(center)
  boundingBox.getSize(size)

  const maxDim = Math.max(size.x, size.y, size.z)
  const cameraDistance = maxDim * 2

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(center.x + cameraDistance, center.y + cameraDistance, center.z + cameraDistance)
  camera.lookAt(center)
  camera.updateProjectionMatrix()

  // 添加 GLTF 模型（如果提供）
  if (gltfUrl) {
    const arrayBuffer = await gltfUrl.arrayBuffer()
    try {
      await new Promise<void>((resolve, reject) => {
        new GLTFLoader().parse(
          arrayBuffer,
          '',
          gltf => {
            scene.add(gltf.scene)
            renderer.render(scene, camera)
            resolve()
          },
          error => {
            console.error(error)
            reject()
          }
        )
      })
    } catch {
      return undefined
    }
  }

  renderer.render(scene, camera)

  // 获取 Base64 PNG
  return renderer.domElement.toDataURL('image/png')
}

/** 随机文件名 */
export const generateRandomFilename = (ext = 'png', length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${result}.${ext}`
}

export const base64ToBlob = (base64: string) => {
  const byteString = atob(base64.split(',')[1])
  const mimeString = base64.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}
