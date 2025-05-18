import { ModuleJSON, ModuleObject } from '@/interface/module'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ThreeViwer } from './project-three'
import { gsap } from 'gsap'
import { getRelativePosition, latLngToMercator, parseToMercator } from './json'
import { Project } from '@/interface/project'

export interface ModuleLabel {
  position: number[]
  text: string
  font?: string
  color: string
  show: boolean
}

/** 高亮标签 */
export const highlightLabel = (label: THREE.Sprite) => {
  if (!label) return
  const originalColor = label.material.color.clone()

  label.material.color.set(0xffff66) // 亮黄色

  return {
    /** 恢复原始状态 */
    reset() {
      label.material.color.copy(originalColor)
    }
  }
}

/** 创建标签 */
const createLabel = (jsonData: ModuleJSON, basePosition: THREE.Vector3, scale: number): THREE.Sprite | null => {
  const labelData = jsonData.label
  if (!labelData || !labelData.show) return null

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  ctx.font = '14px Arial'
  const textWidth = ctx.measureText(labelData.text).width
  canvas.width = textWidth
  canvas.height = 15
  ctx.font = '14px Arial'
  ctx.fillStyle = '#fff'
  ctx.fillText(labelData.text, 0, 14)

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, color: new THREE.Color(labelData.color) })
  const sprite = new THREE.Sprite(material)

  sprite.scale.set(canvas.width * 0.1 * scale, canvas.height * 0.1 * scale, 1)

  const posOffset = new THREE.Vector3(...parseToMercator(labelData.position.map(v => v * scale)))
  sprite.position.copy(basePosition.clone().add(posOffset))
  sprite.visible = labelData.show

  return sprite
}

/** 添加 Primitive */
const addPrimitive = (scene: THREE.Scene, obj: ModuleObject, basePosition: THREE.Vector3, scale: number, show: boolean, id: number) => {
  if (obj.type === 'box') {
    const dims = [obj.dimensions[0], obj.dimensions[2], obj.dimensions[1]]
    const geometry = new THREE.BoxGeometry(dims[0] * scale, dims[1] * scale, dims[2] * scale)
    const c = obj.color || [1, 1, 1, 1]
    const color = new THREE.Color(c[0], c[1], c[2])

    const material = new THREE.MeshStandardMaterial({ color, transparent: c[3] < 1, opacity: c[3] })

    const position = new THREE.Vector3(...parseToMercator(obj.position.map(v => v * scale)))
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(basePosition.clone().add(position))
    mesh.visible = show
    mesh.userData = { id }

    scene.add(mesh)
    return mesh
  }
}

/** 加载 GLTF 模型 */
const loadModel = (
  loader: GLTFLoader,
  url: string,
  objPos: THREE.Vector3,
  scale: number,
  scene: THREE.Scene,
  id: number
): Promise<THREE.Object3D> => {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      gltf => {
        const root = gltf.scene
        root.scale.set(scale, scale, scale)
        root.position.copy(objPos)
        root.userData = { id }
        scene.add(root)
        resolve(root)
      },
      undefined,
      reject
    )
  })
}

/** 渲染模型（创建 Primitive、加载模型、创建标签） */
export const renderRelativeModel = async (target: Project, jsonData: ModuleJSON, scene: THREE.Scene) => {
  const scale = jsonData.scale ?? 1

  const basePosition = new THREE.Vector3(...getRelativePosition(target.coordinates, jsonData.basePosition))

  const primitives: THREE.Mesh[] = []
  const modelEntities: THREE.Object3D[] = []

  // 标签组
  const labelGroup = new THREE.Group()
  scene.add(labelGroup)

  const loader = new GLTFLoader()

  for (const obj of jsonData.objects) {
    if (obj.type === 'box') {
      const prim = addPrimitive(scene, obj, basePosition, scale, jsonData.show, jsonData.id)
      if (prim) primitives.push(prim)
    } else if (obj.type === 'model' && obj.url) {
      const model = await loadModel(loader, obj.url, basePosition, scale, scene, jsonData.id)
      modelEntities.push(model)
    }
  }

  const labelSprite = createLabel(jsonData, basePosition, scale)
  if (labelSprite) labelGroup.add(labelSprite)

  return {
    primitives,
    modelEntities,
    labelGroup,
    get getTotalLabel() {
      return labelSprite
    }
  }
}

/** 删除模型 */
export const removeMyModel = (scene: THREE.Scene, extra: Awaited<ReturnType<typeof renderRelativeModel>>) => {
  extra.primitives.forEach(p => scene.remove(p))
  extra.modelEntities.forEach(m => scene.remove(m))
  scene.remove(extra.labelGroup)
}

/** 改变模型位置 */
export const changeMyModelPosition = (
  originTarget: number[],
  target: { jsonData: ModuleJSON; extra: Awaited<ReturnType<typeof renderRelativeModel>> },
  newBasePosition: number[]
) => {
  const basePosVec = new THREE.Vector3(...getRelativePosition(originTarget, newBasePosition))
  const scale = target.jsonData.scale ?? 1
  target.extra.primitives.forEach((prim, idx) => {
    const obj = target.jsonData.objects[idx]
    prim.position.copy(basePosVec.clone().add(new THREE.Vector3(...parseToMercator(obj.position.map(v => v * scale)))))
  })
  target.extra.modelEntities.forEach((model, idx) => {
    const obj = target.jsonData.objects[idx]
    model.position.copy(basePosVec.clone().add(new THREE.Vector3(...parseToMercator(obj.position.map(v => v * scale)))))
  })

  const labelSprite = target.extra.getTotalLabel
  if (labelSprite && target.jsonData.label) {
    labelSprite.position.copy(basePosVec.clone().add(new THREE.Vector3(...parseToMercator(target.jsonData.label.position.map(v => v * scale)))))
  }

  target.jsonData.basePosition = newBasePosition as [number, number, number]
}

/** 设置模型显示隐藏 */
export const setMyModelVisible = (target: { extra: Awaited<ReturnType<typeof renderRelativeModel>> }, visible: boolean) => {
  target.extra.primitives.forEach(p => (p.visible = visible))
  target.extra.modelEntities.forEach(m => (m.visible = visible))
}

/** 设置标签显示隐藏 */
const setMyLabelVisible = (target: { extra: Awaited<ReturnType<typeof renderRelativeModel>> }, visible: boolean) => {
  const labelSprite = target.extra.getTotalLabel
  if (labelSprite) labelSprite.visible = visible
}

export type ModelRegistryEntry = { jsonData: ModuleJSON; extra: Awaited<ReturnType<typeof renderRelativeModel>> }

/** 初始化模型管理系统 */
export const initModelRegistry = (
  viwer: ThreeViwer,
  target: Project,
  /** reactive数组，用来接收当前拥有的JSON数组 */
  reciveModuleJSONArr: { id: number; name: string }[],
  onFocusModule: (model: ModelRegistryEntry) => void
) => {
  const modelRegistry: { jsonData: ModuleJSON; extra: Awaited<ReturnType<typeof renderRelativeModel>> }[] = []
  const highlightLabels: ReturnType<typeof highlightLabel>[] = []

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  // 飞行到目标模型（平滑过渡）
  const goToTargetModel = (nopt: { id?: number }) => {
    if (nopt.id) {
      const t = findModelById(nopt.id)

      if (t && viwer) {
        onFocusModule(t)

        const base = getRelativePosition(target.coordinates, t.jsonData.basePosition)

        const camera = viwer.camera

        // 目标相机位置（从目标正上方 40m 观察）
        const targetPos = new THREE.Vector3(base[0], base[1] + 20, base[2])
        const lookAtPos = new THREE.Vector3(base[0], base[1], base[2])

        // 使用 gsap 平滑飞行
        gsap.to(camera.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 2,
          onUpdate: () => {
            camera.lookAt(lookAtPos)
            if (viwer.controls) {
              viwer.controls.target.copy(lookAtPos)
              viwer.controls.update()
            }
          }
        })

        // 高亮标签逻辑
        const targetLabel = t.extra.getTotalLabel
        if (highlightLabels.length) {
          highlightLabels.forEach(l => l?.reset())
          highlightLabels.length = 0
        }

        if (targetLabel) {
          highlightLabels.push(highlightLabel(targetLabel))
        }
      }
    }
  }

  /** 根据 id 找到模型 */
  const findModelById = (id: number) => modelRegistry.find(m => m.jsonData.id === id)

  // 点击事件，检测标签是否被点击，聚焦模型
  const onClick = (event: MouseEvent) => {
    const rect = viwer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, viwer.camera)

    for (const model of modelRegistry) {
      const label = model.extra.getTotalLabel
      if (!label) continue
      const intersects = raycaster.intersectObject(label)
      if (intersects.length > 0) {
        onFocusModule(model)
        goToTargetModel({ id: model.jsonData.id })
        break
      }
    }
  }

  viwer.domElement.addEventListener('click', onClick)

  /** 注册模型 */
  const registerModel = async (jsonData: ModuleJSON) => {
    if (jsonData.id === undefined) {
      jsonData.id = Math.floor(10000000 + Math.random() * 90000000)
    }
    const extra = await renderRelativeModel(target, jsonData, viwer.scene)
    modelRegistry.push({ jsonData, extra })
    reciveModuleJSONArr.push({
      id: jsonData.id,
      name: jsonData.label.text
    })
  }

  /** 移除模型 */
  const removeModel = (opt: { id?: number }) => {
    const { id } = opt

    const idx = modelRegistry.findIndex(m => m.jsonData.id === id)
    if (idx < 0) return
    removeMyModel(viwer.scene, modelRegistry[idx].extra)
    modelRegistry.splice(idx, 1)
    reciveModuleJSONArr.splice(idx, 1)
  }

  /** 设置模型显隐 */
  const setVisible = (opt: { visible: boolean; id?: number }) => {
    const { id, visible } = opt

    if (!id) return
    const model = findModelById(id)

    if (!model) return
    setMyModelVisible(model, visible)
  }

  /** 设置标签显隐 */
  const changeLabelShow = (opt: { visible: boolean; id?: number }) => {
    const { id, visible } = opt

    if (!id) return
    const model = findModelById(id)

    if (!model) return
    setMyLabelVisible(model, visible)
  }

  /** 移动模型 */
  const changePosition = (opt: { newBasePosition: number[]; index?: number; id?: number }) => {
    const { id, newBasePosition } = opt
    if (!id) return

    const model = findModelById(id)
    if (!model) return
    changeMyModelPosition(target.coordinates, model, newBasePosition)
  }

  /** 修改label内容 */
  const changeLabelText = (opt: { text: string; id?: number }) => {
    const { text, id } = opt

    const curIndex = modelRegistry.findIndex(m => m.jsonData.id === id)

    if (!id || curIndex < 0) return

    const target = findModelById(id)

    if (target) {
      const label = target.extra.getTotalLabel as THREE.Sprite
      if (label && label.material && label.material.map) {
        // 重新创建带文字的贴图
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        context.font = '14px Arial'
        const textWidth = context.measureText(text).width
        canvas.width = textWidth
        canvas.height = 15
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = '#fff'
        context.font = '14px Arial'
        context.fillText(text, 0, 14)

        const texture = new THREE.CanvasTexture(canvas)
        label.material.map.dispose() // 清理旧纹理
        label.material.map = texture
        label.material.needsUpdate = true
      }

      // 更新 json 和本地缓存
      target.jsonData.label.text = text
      reciveModuleJSONArr[curIndex].name = text
    }
  }

  /** 更改标签位置 */
  const changeLabelPosition = (opt: { newPosition: number[]; index?: number; id?: number }) => {
    const { id, newPosition } = opt

    if (!id) return

    const t = findModelById(id)
    if (!t) return

    if (target && t.extra.getTotalLabel) {
      const label = t.extra.getTotalLabel
      const { scale = 1, basePosition } = t.jsonData

      const rightBasePosition = getRelativePosition(target.coordinates, basePosition)
      // 更新 label 位置
      const posOffset = parseToMercator(newPosition.map(v => v * scale)).map((v, index) => rightBasePosition[index] + v) as [number, number, number]

      label.position.set(...posOffset)
      // 同步更新配置数据
      t.jsonData.label.position = newPosition as [number, number, number]
    }
  }

  return {
    registerModel,
    goToTargetModel,
    removeModel,
    setVisible,
    changeLabelShow,
    changePosition,
    changeLabelText,
    changeLabelPosition,
    modelRegistry
  }
}
