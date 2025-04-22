<template>
  <div id="cesiumContainer"></div>
</template>

<script lang="ts" setup>
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
})
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
