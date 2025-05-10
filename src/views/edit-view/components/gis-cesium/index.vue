<template>
  <div id="cesiumContainer"></div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import * as Cesium from 'cesium'
import { renderRelativeModel } from '@/global/module'
import { workStation } from '@/global/moduleJson'
import { initGrid } from '@/global/grid'

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5M2I1Nzk5Ni0wNDY0LTRlNzMtYjBmNC1jNWQ4NTc2ZmU5MWMiLCJpZCI6Mjg3NzEyLCJpYXQiOjE3NDI5NTQ1NTB9.PHCh3Myp8BruSMmhDg3qPs3RA5bTfFBFMR8_hGrjZEs'

const emit = defineEmits<{
  (e: 'viewerExistChange', isExist: boolean): void
}>()

const baseViewer = ref<Cesium.Viewer>()

const viewerIsExist = computed(() => {
  return !!baseViewer.value
})

watch(viewerIsExist, () => {
  emit('viewerExistChange', viewerIsExist.value)
})

onMounted(() => {
  const viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false, // 时间轴控件
    animation: false, // 动画控件
    geocoder: false, // 搜索按钮
    homeButton: false, // 主页按钮
    sceneModePicker: false, // 模式选择按钮
    baseLayerPicker: false, // 选择图层按钮
    navigationHelpButton: false, // 帮助手册按钮
    fullscreenButton: false, // 全屏按钮
    imageryProvider: undefined,         // 不加载影像图层
    skyBox: new Cesium.SkyBox({
      sources: {
        positiveX: '/src/assets/skybox/漫天彩云_LF.jpg',
        negativeX: '/src/assets/skybox/漫天彩云_RT.jpg',
        positiveY: '/src/assets/skybox/漫天彩云_DN.jpg',
        negativeY: '/src/assets/skybox/漫天彩云_UP.jpg',
        positiveZ: '/src/assets/skybox/漫天彩云_FR.jpg',
        negativeZ: '/src/assets/skybox/漫天彩云_BK.jpg',
      }
    }),
  terrainProvider: new Cesium.EllipsoidTerrainProvider(), // 使用默认椭球，不加载地形
  })
  baseViewer.value = viewer

  // 手动移除默认图层（Cesium 会自动加一个 Bing Maps 图层）
  viewer.imageryLayers.removeAll() // 强制清空所有影像图层
  // 设置纯背景（如白色）
  viewer.scene.globe.baseColor = Cesium.Color.WHITE;
  viewer.scene.skyAtmosphere.show = false;

  initGrid(viewer, {
    type: 'grid',
    baseOrigin: [0, 0],
    gridSize: 5,
    lineCnt: 10
  })

  // ====== 坐标转化 ======
  // #region 
  // 笛卡尔坐标系
  // 经纬度坐标转笛卡尔坐标
  const cartesian = Cesium.Cartesian3.fromDegrees(110, 20, 30) // 经度 纬度 高度

  // 笛卡尔坐标转弧度坐标
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian)

  // 弧度坐标转角度坐标
  let lon = 180 / Math.PI * cartographic.longitude
  let lat = 180 / Math.PI * cartographic.latitude
  let height = cartographic.height
  // ====== 坐标转化 ======
  // #endregion

  // ====== 相机视角 ======
  // #region
  const position = Cesium.Cartesian3.fromDegrees(0, 0, 10)
  // 相机直接跳转
  viewer.camera.setView({
    // 相机所处的位置
    destination: position,
    // 相机角度
    orientation: { // 默认(0, -90, 0)
      // 头两边摆
      heading: Cesium.Math.toRadians(0),
      // 头左右摆
      pitch: Cesium.Math.toRadians(270),
      // 头上下摇
      roll: Cesium.Math.toRadians(0)
    }
  })

  // const house = viewer.scene.primitives.add(
  //   new Cesium.Primitive({
  //     geometryInstances: [
  //       // 房屋主体（立方体）
  //       new Cesium.GeometryInstance({
  //         geometry: Cesium.BoxGeometry.fromDimensions({
  //           dimensions: new Cesium.Cartesian3(200.0, 200.0, 10.0), // 长宽高（米）
  //           vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
  //         }),
  //         modelMatrix: Cesium.Matrix4.multiplyByTranslation(
  //           Cesium.Transforms.eastNorthUpToFixedFrame(
  //             Cesium.Cartesian3.fromDegrees(0, 0) // 经纬度坐标
  //           ),
  //           new Cesium.Cartesian3(0.0, 0.0, 500.0), // 抬高一半高度以便落地
  //           new Cesium.Matrix4()
  //         ),
  //         attributes: {
  //           color: Cesium.ColorGeometryInstanceAttribute.fromColor(
  //             Cesium.Color.BEIGE.withAlpha(1.0) // 可改为其他颜色，如 RED、BLUE、GREEN
  //           )
  //         }
  //       })
  //     ],
  //     appearance: new Cesium.PerInstanceColorAppearance({
  //       closed: true
  //     })
  //   }
  // ));
  renderRelativeModel(workStation, viewer);
})
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
