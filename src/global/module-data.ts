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
}): Promise<string> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setClearColor(0xffffff, 0) // transparent background

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(2, 2, 2)
  camera.lookAt(0, 0, 0)

  const light = new THREE.AmbientLight(0xffffff, 1)
  scene.add(light)

  // Helper: 坐标轴
  // scene.add(new THREE.AxesHelper(1))

  // 添加 JSON 自定义模型
  if (jsonConfig?.objects) {
    jsonConfig.objects.forEach((obj: any) => {
      if (obj.type === 'box') {
        const geometry = new THREE.BoxGeometry(...obj.dimensions)
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(...obj.color.slice(0, 3))
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(...(obj.position as [number, number, number]))
        scene.add(mesh)
      }
    })
  }

  // 添加 GLTF 模型（如果提供）
  if (gltfUrl) {
    const arrayBuffer = await gltfUrl.arrayBuffer()
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
          resolve()
        }
      )
    })
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
