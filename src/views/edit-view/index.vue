<template>
  <div class="content">
    <div class="loading-mask" v-show="loading || !baseViewer">
      <vi-loading type="diamond" color="purple" />
    </div>
    <div class="header">
      <div
        class="back"
        @click="
          () => {
            router.back()
          }
        "
      >
        返回
      </div>
      <div class="title">{{ target?.title ?? '未命名' }}</div>
      <vi-icon
        type="shezhi"
        class="setting"
        @click="
          () => {
            settingOpen = true
          }
        "
      />
    </div>
    <div id="cesiumContainer"></div>
    <vi-drawer class="gis-drawer left-drawer" v-model="leftOpen" direction="left">
      <div class="title">
        <div>项目操作</div>
        <vi-button mutate color="purple">保存</vi-button>
      </div>
      <div class="btns">
        <vi-button color="purple" @click="() => rebackOrigin(1)">回到原点</vi-button>
        <vi-button color="purple">场景漫游</vi-button>
      </div>
      <div class="global-data">
        <form-item label="坐标原点">
          <vi-input disabled :modelValue="target?.coordinates[1]" type="button">
            <template #prefix> 经度 </template>
          </vi-input>
          <vi-input disabled :modelValue="target?.coordinates[0]" type="button">
            <template #prefix> 纬度 </template>
          </vi-input>
        </form-item>
        <form-item label="范围半径">
          <vi-input disabled :modelValue="target?.radius" type="button">
            <template #suffix> 米 </template>
          </vi-input>
        </form-item>
      </div>
      <div>
        <vi-row justify="flex-start" gap="16px">
          <form-item label="显示范围" type="inline">
            <vi-switch v-model="showDistance" />
          </form-item>
          <form-item label="范围颜色" type="inline">
            <vi-color-select v-model="distanceColor" />
          </form-item>
        </vi-row>
        <vi-row justify="flex-start" gap="16px">
          <form-item label="显示网格" type="inline">
            <vi-switch v-model="showGrid" />
          </form-item>
          <form-item label="网格颜色" type="inline">
            <vi-color-select v-model="gridColor" />
          </form-item>
        </vi-row>
        <form-item label="网格大小">
          <vi-select type="button" v-model="gridCellSize">
            <vi-option v-for="i in gridCellOption" :key="i" :value="i">
              <template #suf> 米 </template>
              {{ i }}
            </vi-option>
          </vi-select>
        </form-item>
        <!-- <vi-row justify="flex-start" gap="16px">
          <form-item style="--vi-form-label-width: 5em" label="显示天空盒" type="inline">
            <vi-switch v-model="showSkybox" />
          </form-item>
          <form-item label="天空颜色" type="inline" v-show="!showSkybox">
            <vi-color-select :modelValue="skyColor" />
          </form-item>
          <form-item label="天空盒" type="inline" v-show="showSkybox">
            <vi-select type="button" :modelValue="skyboxName">
              <vi-option v-for="v in skyBoxOpts" :value="v" :key="v">{{ v }}</vi-option>
            </vi-select>
          </form-item>
        </vi-row> -->
        <form-item style="--vi-form-label-width: 5em" label="显示大气层">
          <vi-switch :modelValue="showSkyAtmosphere" />
        </form-item>
        <form-item label="地表颜色" v-show="!target?.layers">
          <vi-color-select v-model="layersColor" />
        </form-item>
      </div>
    </vi-drawer>
    <vi-drawer class="gis-drawer" v-model="rightOpen"></vi-drawer>
  </div>
  <vi-dialog title="设置" v-model="settingOpen" class="setting-dialog" noUnsure>
    <div class="line">
      <div class="title">id</div>
      <div class="desc">{{ target?.id }}</div>
    </div>
    <div class="line">
      <div class="title">标题</div>
      <div class="desc">{{ target?.title }}</div>
    </div>
    <vi-divider />
    <div class="line">
      <div class="title">创建时间</div>
      <div class="desc">{{ unixToStringFormat(target?.createTime) }}</div>
    </div>
    <vi-divider />
    <div class="line">
      <div class="title">更新时间</div>
      <div class="desc">{{ unixToStringFormat(target?.updateTime) }}</div>
    </div>
    <vi-divider />
    <div class="line">
      <vi-button
        color="red"
        mutate
        @click="
          () => {
            deleteOpen = true
          }
        "
        >删除项目</vi-button
      >
    </div>
  </vi-dialog>
  <delete-dialog
    v-model="deleteOpen"
    :target="target"
    @deleteFinish="
      () => {
        router.replace('/home/project')
      }
    "
  />
</template>

<script lang="ts" setup>
import * as Cesium from 'cesium'
import DeleteDialog from '@/components/delete-dialog/index.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { Message } from 'viog-ui'
import { getProjDetail } from '@/network/project'
import { Project } from '@/interface/project'
import { unixToStringFormat } from '@/utils/date'
import { initModelRegistry } from '@/global/module'
import { workStation } from '@/global/moduleJson'
import FormItem from '@/components/form-item'
import { initGrid, paintCircle, paintGrid, toggleGridVisibility, setGridColor, setCircleColor } from '@/global/grid'
import { initProjectViewer, gridCellOption, setSkyBoxVisible, setSkyBoxColor, setSkyAtmosphereVisible, setSkyBox, skyBoxOpts } from '@/global/project'

Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5M2I1Nzk5Ni0wNDY0LTRlNzMtYjBmNC1jNWQ4NTc2ZmU5MWMiLCJpZCI6Mjg3NzEyLCJpYXQiOjE3NDI5NTQ1NTB9.PHCh3Myp8BruSMmhDg3qPs3RA5bTfFBFMR8_hGrjZEs'

const route = useRoute()

const rightOpen = ref(true)
const leftOpen = ref(false)
const settingOpen = ref(false)
const deleteOpen = ref(false)
const loading = ref(true)

const targetId = ref<string>()
const target = ref<Project | null>(null)

// Cesium相关
const baseViewer = ref<Cesium.Viewer>()
/** 储存网格实体 */
const gridEntities = ref(initGrid())
/** 储存展示范围 */
const distanceCircle = ref<Cesium.Entity>()
/** 模型控制 */
const modelControl = ref<ReturnType<typeof initModelRegistry>>()

// 表单储存数据
const showDistance = ref(false)
const showGrid = ref(false)
const gridCellSize = ref(10)
const layersColor = ref('#fff')
const distanceColor = ref('#000')
const gridColor = ref('#ffff00')
const showSkybox = ref(false)
const skyboxName = ref('默认')
const skyColor = ref('#000')
const showSkyAtmosphere = ref(false)

/** 更新网格宽度 */
const updateGrid = (newSize: number) => {
  if (baseViewer.value && target.value) {
    paintGrid(baseViewer.value, gridEntities.value, {
      type: 'grid',
      unit: 'coordinates',
      baseOrigin: target.value.coordinates,
      squareSize: 2 * target.value.radius,
      gridSize: newSize,
      defaultShow: showGrid.value
    })
  }
}

/** 设置地球表面颜色 */
const setLayersColor = (hex: string) => {
  console.log('1')
  if (baseViewer.value) {
    baseViewer.value.scene.globe.baseColor = Cesium.Color.fromCssColorString(hex)
  }
}

watch(showDistance, () => {
  if (distanceCircle.value) {
    distanceCircle.value.show = showDistance.value
  }
})

watch(showGrid, () => {
  if (gridEntities.value) {
    toggleGridVisibility(gridEntities.value, showGrid.value)
  }
})

watch(gridCellSize, () => {
  updateGrid(gridCellSize.value)
})

watch(layersColor, () => {
  setLayersColor(layersColor.value)
})

watch(distanceColor, () => {
  if (distanceCircle.value) {
    setCircleColor(distanceCircle.value, distanceColor.value)
  }
})

watch(gridColor, () => {
  if (gridEntities.value) {
    setGridColor(gridEntities.value, gridColor.value)
  }
})

watch(showSkybox, () => {
  if (baseViewer.value) {
    setSkyBoxVisible(baseViewer.value, showSkybox.value, {
      hex: skyColor.value,
      skyBoxName: skyboxName.value
    })
  }
})

watch(skyboxName, () => {
  if (baseViewer.value) {
    setSkyBox(baseViewer.value, skyboxName.value)
  }
})

watch(skyColor, () => {
  if (gridEntities.value && target.value && baseViewer.value) {
    setSkyBoxColor(baseViewer.value, skyColor.value)
  }
})

watch(showSkyAtmosphere, () => {
  if (baseViewer.value) {
    setSkyAtmosphereVisible(baseViewer.value, showSkyAtmosphere.value)
  }
})

/** 回到原点，相机默认视角转至原点高radius * 2处 */
const rebackOrigin = (duration: number = 2) => {
  if (target.value && baseViewer.value) {
    const { coordinates, radius } = target.value
    const position = Cesium.Cartesian3.fromDegrees(...coordinates, radius * 2)
    // 相机直接跳转
    baseViewer.value.camera.flyTo({
      duration,
      // 相机所处的位置
      destination: position,
      // 相机角度
      orientation: {
        // 默认(0, -90, 0)
        // 头两边摆
        heading: Cesium.Math.toRadians(0),
        // 头左右摆
        pitch: Cesium.Math.toRadians(-90),
        // 头上下摇
        roll: Cesium.Math.toRadians(0)
      }
    })
  }
}

const initViewer = (tar: Project) => {
  // 如果target获取到了
  if (tar) {
    const { globalObj, coordinates, radius } = tar
    // 赋值
    showDistance.value = globalObj.showDistance
    showGrid.value = globalObj.showGrid
    gridCellSize.value = globalObj.gridCellSize
    layersColor.value = globalObj.layersColor
    distanceColor.value = globalObj.distanceColor
    gridColor.value = globalObj.gridColor
    showSkybox.value = globalObj.showSkybox
    skyboxName.value = globalObj.skyboxName
    skyColor.value = globalObj.skyColor
    showSkyAtmosphere.value = globalObj.showSkyAtmosphere
    // 生成viewer
    const viewer = initProjectViewer('cesiumContainer', tar)
    baseViewer.value = viewer

    const mC = initModelRegistry(viewer)
    // modelControl.registerModel(workStation)
    // modelControl.addClickControl(viewer)

    const curEntities = paintGrid(viewer, gridEntities.value, {
      type: 'grid',
      unit: 'coordinates',
      baseOrigin: coordinates,
      squareSize: 2 * radius,
      gridSize: globalObj.gridCellSize ?? 10,
      color: globalObj.gridColor
    })
    const dc = paintCircle(viewer, coordinates, radius, globalObj.distanceColor)
    dc.show = !!globalObj.showDistance

    if (gridEntities.value) toggleGridVisibility(curEntities, !!globalObj.showGrid)

    distanceCircle.value = dc
    gridEntities.value = curEntities
    modelControl.value = mC
    const position = Cesium.Cartesian3.fromDegrees(...coordinates, radius * 2)
    // 相机直接跳转
    viewer.camera.flyTo({
      duration: 2,
      // 相机所处的位置
      destination: position,
      // 相机角度
      orientation: {
        // 默认(0, -90, 0)
        // 头两边摆
        heading: Cesium.Math.toRadians(0),
        // 头左右摆
        pitch: Cesium.Math.toRadians(-90),
        // 头上下摇
        roll: Cesium.Math.toRadians(0)
      }
    })
  }
}

const queryDetail = async (id: string) => {
  loading.value = true
  const res = await getProjDetail({
    token: '',
    id
  })

  target.value = res.data

  initViewer(res.data)

  loading.value = false
}

onMounted(() => {
  const { id } = route.params

  if (!id) {
    Message.append('项目不存在！', 2000)
    router.back()
  }

  targetId.value = id as string
  queryDetail(id as string)
})
</script>

<style lang="less" src="./global.less"></style>
<style scoped lang="less" src="./index.less"></style>
