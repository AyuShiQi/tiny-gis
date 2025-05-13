import { Project } from '@/interface/project'
import { Color, EllipsoidTerrainProvider, SkyBox, Viewer } from 'cesium'
import SkyboxMap from '@/assets/skybox/skybox.json'

export const skyBoxOpts = Object.keys(SkyboxMap)

export const initProjectViewer = (id: string, tar: Project) => {
  // 如果target获取到了
  const {
    layers,
    globalObj: { skyColor, skyboxName, showSkybox }
  } = tar

  // 根据target layers操控option
  const cesiumOpt: Viewer.ConstructorOptions = {
    timeline: false, // 时间轴控件
    animation: false, // 动画控件
    geocoder: false, // 搜索按钮
    homeButton: false, // 主页按钮
    sceneModePicker: false, // 模式选择按钮
    baseLayerPicker: false, // 选择图层按钮
    navigationHelpButton: false, // 帮助手册按钮
    fullscreenButton: false // 全屏按钮
  }

  if (showSkybox) {
    if (skyboxName) {
      cesiumOpt.skyBox = getSkyBox(skyboxName)
    }
  } else {
  }

  if (!layers) {
    cesiumOpt.imageryProvider = undefined // 不加载影像图层
    cesiumOpt.terrainProvider = new EllipsoidTerrainProvider() // 使用默认椭球，不加载地形
  }

  const viewer = new Viewer(id, cesiumOpt)

  if (!layers) {
    // 手动移除默认图层（Cesium 会自动加一个 Bing Maps 图层）
    viewer.imageryLayers.removeAll() // 强制清空所有影像图层
    // 设置纯背景（如白色）
    viewer.scene.globe.baseColor = Color.WHITE
    viewer.scene.skyAtmosphere.show = false
  }

  return viewer
}

const getSkyBox = (skyboxName: string) => {
  const sources = (SkyboxMap as any)[skyboxName ?? '默认']

  return sources === 'undefined'
    ? undefined
    : new SkyBox({
        sources
      })
}

/** 设置天空盒 */
export const setSkyBox = (viewer: Viewer, skyboxName: string) => {
  viewer.scene.skyBox = getSkyBox(skyboxName)
}

/** 设置天空颜色颜色 */
export const setSkyBoxColor = (viewer: Viewer, hex: string) => {
  viewer.scene.skyAtmosphere.show = false // 可选：关闭大气渲染
  viewer.scene.backgroundColor = Color.fromCssColorString(hex) // 设置纯背景色
}

/** 天空盒显隐 */
export const setSkyBoxVisible = (viewer: Viewer, visible: boolean, opt: { hex?: string; skyBoxName?: string }) => {
  const { hex = '#000', skyBoxName = '默认' } = opt
  viewer.scene.skyBox.show = visible
  if (visible) {
    setSkyBox(viewer, skyBoxName)
  } else {
    setSkyBoxColor(viewer, hex)
  }
}

/** 大气层显隐 */
export const setSkyAtmosphereVisible = (viewer: Viewer, visible: boolean) => {
  viewer.scene.skyAtmosphere.show = visible
}

/** 网格单位大小 */
export const gridCellOption = [10, 20, 50, 100, 200, 500, 1000]
