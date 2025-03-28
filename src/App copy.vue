<script setup lang="ts">
import { onMounted } from 'vue'
import * as Cesium from 'cesium'

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5M2I1Nzk5Ni0wNDY0LTRlNzMtYjBmNC1jNWQ4NTc2ZmU5MWMiLCJpZCI6Mjg3NzEyLCJpYXQiOjE3NDI5NTQ1NTB9.PHCh3Myp8BruSMmhDg3qPs3RA5bTfFBFMR8_hGrjZEs'

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
    skyBox: new Cesium.SkyBox({
      sources: {
        positiveX: 'src/assets/skybox/漫天彩云_LF.jpg',
        negativeX: 'src/assets/skybox/漫天彩云_RT.jpg',
        positiveY: 'src/assets/skybox/漫天彩云_DN.jpg',
        negativeY: 'src/assets/skybox/漫天彩云_UP.jpg',
        positiveZ: 'src/assets/skybox/漫天彩云_FR.jpg',
        negativeZ: 'src/assets/skybox/漫天彩云_BK.jpg',
      }
    }),
    // imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
    //   url: "http://t0.tianditu.gov.cn/ter_w/wmts?tk=c3e1d19d89b8c55fe0a7ca065d68f1a4&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0",
    //   layer: "tdtBasicLayer",
    //   style: "default",
    //   format: "image/jpeg",
    //   tileMatrixSetID: "GoogleMapsCompatible"
    // })
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
  const position = Cesium.Cartesian3.fromDegrees(110, 20, 20000)
  // 相机直接跳转
  viewer.camera.setView({
    // 相机所处的位置
    destination: position,
    // 相机角度
    orientation: { // 默认(0, -90, 0)
      // 头两边摆
      heading: Cesium.Math.toRadians(0),
      // 头左右摆
      pitch: Cesium.Math.toRadians(-30),
      // 头上下摇
      roll: Cesium.Math.toRadians(0)
    }
  })

  // viewer.camera.moveForward(10) // 相机向前移动

  // 延迟飞行跳转
  // viewer.camera.flyTo({
  //   // 飞行延迟时间
  //   duration: 1,
  //   // 飞行挑战位置
  //   destination: position
  // })

  // 视角固定在点位上{
  // viewer.camera.lookAt(position, new Cesium.HeadingPitchRange(
  //   Cesium.Math.toRadians(0),
  //   Cesium.Math.toRadians(-90),
  //   20000
  // ))
  // #endregion

  // ====== 创建实体 ======
  // #region
  // 点实体对象
  // const point = viewer.entities.add({
  //   id: 'point',
  //   position: Cesium.Cartesian3.fromDegrees(121, 300, 20000),
  //   point: {
  //     pixelSize: 20, // 点像素大小
  //     color: Cesium.Color.BLUE, // 颜色
  //   }
  // }) 
  // #endregion
})
</script>

<template>
  <div id="cesiumContainer"></div>
</template>

<style scoped>
#cesiumContainer {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}
</style>
