import { EllipsoidTerrainProvider, SkyBox, Viewer } from 'cesium'

export const initProjectViewer = (id: string, opt: any) => {
  const viewer = new Viewer('cesiumContainer', {
    timeline: false, // 时间轴控件
    animation: false, // 动画控件
    geocoder: false, // 搜索按钮
    homeButton: false, // 主页按钮
    sceneModePicker: false, // 模式选择按钮
    baseLayerPicker: false, // 选择图层按钮
    navigationHelpButton: false, // 帮助手册按钮
    fullscreenButton: false, // 全屏按钮
    imageryProvider: undefined, // 不加载影像图层
    skyBox: new SkyBox({
      sources: {
        positiveX: '/src/assets/skybox/漫天彩云_LF.jpg',
        negativeX: '/src/assets/skybox/漫天彩云_RT.jpg',
        positiveY: '/src/assets/skybox/漫天彩云_DN.jpg',
        negativeY: '/src/assets/skybox/漫天彩云_UP.jpg',
        positiveZ: '/src/assets/skybox/漫天彩云_FR.jpg',
        negativeZ: '/src/assets/skybox/漫天彩云_BK.jpg'
      }
    }),
    terrainProvider: new EllipsoidTerrainProvider() // 使用默认椭球，不加载地形
  })
  return
}
