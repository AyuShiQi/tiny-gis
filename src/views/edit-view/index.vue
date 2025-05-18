<template>
  <div class="content">
    <!-- 加载mask -->
    <div class="loading-mask" v-show="loading || !baseViewer">
      <vi-loading type="diamond" color="purple" />
    </div>
    <!-- 头部 -->
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
    <!-- 漫游控件部分 -->
    <!-- 漫游控件左 -->
    <vi-row v-show="isRoaming" gap="8px" justify="flex-start" class="left-box">
      <vi-button
        color="purple"
        mutate
        @click="
          () => {
            isRoaming = false
            roamer?.stop()
          }
        "
        >退出漫游</vi-button
      >
      <vi-button
        v-show="isFlying"
        color="purple"
        mutate
        @click="
          () => {
            roamer?.stop()
          }
        "
        >暂停漫游</vi-button
      >
      <vi-button
        v-show="!isFlying"
        color="purple"
        mutate
        @click="
          () => {
            roamer?.start()
          }
        "
        >继续漫游</vi-button
      >
    </vi-row>
    <!-- 漫游控件右 -->
    <div v-show="isRoaming" class="right-box">
      <form-item style="--vi-form-label-width: 6em" label="飞行高度(米)">
        <vi-num-input v-model="flyingHeight" :min="10" :max="Math.max((target?.radius ?? 10) * 2, 10)" :unit="10" type="button" />
      </form-item>
    </div>
    <!-- 漫游控件底部 -->
    <div v-show="isRoaming" class="bottom-box">目标飞行点: {{ flyingTargetView }}</div>
    <!-- Cesium框 -->
    <div id="cesiumContainer"></div>
    <!-- 左抽屉 -->
    <vi-drawer class="gis-drawer left-drawer" v-model="leftOpen" direction="left" v-show="!isRoaming">
      <div class="title">
        <div>项目操作</div>
        <vi-button mutate color="purple" @click="handleSave">保存</vi-button>
      </div>
      <div class="btns">
        <vi-button color="purple" @click="() => rebackOrigin(1)">回到原点</vi-button>
        <vi-button
          color="purple"
          @click="
            () => {
              if (target && roamer) {
                isRoaming = true
                roamer.start()
              }
            }
          "
          >场景漫游</vi-button
        >
      </div>
      <div class="global-data">
        <form-item label="坐标原点">
          <vi-input disabled :modelValue="target?.coordinates[0]" type="button">
            <template #prefix> 经度 </template>
          </vi-input>
          <vi-input disabled :modelValue="target?.coordinates[1]" type="button">
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
          <!-- <form-item label="网格颜色" type="inline">
            <vi-color-select v-model="gridColor" />
          </form-item> -->
        </vi-row>
        <!-- <form-item label="网格大小">
          <vi-select type="button" v-model="gridCellSize">
            <vi-option v-for="i in gridCellOption" :key="i" :value="i">
              <template #suf> 米 </template>
              {{ i }}
            </vi-option>
          </vi-select>
        </form-item> -->
        <vi-row justify="flex-start" gap="16px">
          <form-item style="--vi-form-label-width: 5em" label="显示天空盒" type="inline">
            <vi-switch v-model="showSkybox" />
          </form-item>
          <form-item label="天空颜色" type="inline" v-show="!showSkybox">
            <vi-color-select v-model="skyColor" />
          </form-item>
          <form-item style="--vi-form-label-width: 3em" label="天空盒" type="inline" v-show="showSkybox">
            <vi-select style="--vi-select-width: 80px" type="button" v-model="skyboxName">
              <vi-option v-for="v in skyBoxOpts" :value="v" :key="v">{{ v }}</vi-option>
            </vi-select>
          </form-item>
        </vi-row>
        <!-- <form-item style="--vi-form-label-width: 5em" label="显示大气层">
          <vi-switch v-model="showSkyAtmosphere" />
        </form-item> -->
        <form-item label="地表颜色" v-show="!target?.layers">
          <vi-color-select v-model="layersColor" />
        </form-item>
      </div>
      <!-- 模型模板 -->
      <div class="title">模型模板</div>
      <vi-scroll class="module-scroll">
        <div class="module-item" v-for="(m, i) in modulesStore.defaultModulesList" :key="m.id">
          <span>{{ m.name }}.{{ m.type }}</span>
          <vi-button
            size="small"
            type="plain"
            color="dark"
            @click="
              () => {
                handleUseModule(m.id)
              }
            "
            >使用</vi-button
          >
        </div>
      </vi-scroll>
    </vi-drawer>
    <!-- 右抽屉 -->
    <vi-drawer class="gis-drawer right-drawer" v-model="rightOpen" v-show="!isRoaming">
      <div class="title">当前模型列表</div>
      <!-- 模型数组区域 -->
      <vi-scroll class="total" color="purple">
        <div
          class="model-item"
          :class="[model.id === targetModel?.jsonData.id ? 'model-item-picked' : '']"
          v-for="(model, index) in curModelJSONArr"
          :key="model.id"
          @click="
            () => {
              if (model) {
                modelControl?.goToTargetModel({
                  id: model.id
                })
              }
            }
          "
        >
          {{ index + 1 }}：{{ model.name }}
          <span class="small-id">({{ model.id }})</span>
        </div>
      </vi-scroll>
      <!-- 目标模型区 -->
      <div class="form" v-show="targetModel">
        <div class="line">
          <div class="title">目标模型</div>
          <vi-button
            mutate
            color="blue"
            @click="
              () => {
                if (targetModel) {
                  modelControl?.goToTargetModel({
                    id: targetModel.jsonData.id
                  })
                }
              }
            "
            >定位模型</vi-button
          >
        </div>
        <form-item label="ID">{{ targetModel?.jsonData.id }}</form-item>
        <form-item label="模型名称">
          <vi-input
            type="button"
            v-model="modelFormData.title"
            @change="
              () => {
                if (targetModel) {
                  const oldText = targetModel.jsonData.label.text
                  if (modelFormData.title && modelFormData.title !== oldText) {
                    modelControl?.changeLabelText({
                      text: modelFormData.title,
                      id: targetModel.jsonData.id
                    })
                  } else {
                    modelFormData.title = oldText
                  }
                }
              }
            "
            placeholder="请输入模型名称"
          />
        </form-item>
        <form-item label="展示模型">
          <vi-switch
            v-model="modelFormData.show"
            @change="
              () => {
                if (targetModel) {
                  modelControl?.setVisible({
                    visible: modelFormData.show,
                    id: targetModel.jsonData.id
                  })
                }
              }
            "
          />
        </form-item>
        <form-item label="模型坐标">
          <vi-input
            class="ipt-c"
            v-model="modelFormData.lon"
            type="button"
            @change="
              () => {
                if (targetModel) {
                  const oldLon = targetModel.jsonData.basePosition[0].toString()
                  // 检验经度合规性
                  const lonRight = lonRules.rule.test(modelFormData.lon)
                  if (modelFormData && lonRight && modelFormData.lon !== oldLon) {
                    const newBasePosition = [...targetModel.jsonData.basePosition]
                    newBasePosition[0] = Number(modelFormData.lon)

                    modelControl?.changePosition({
                      newBasePosition,
                      id: targetModel.jsonData.id
                    })
                  } else {
                    modelFormData.lon = oldLon
                  }
                }
              }
            "
          >
            <template #prefix> 经度 </template>
          </vi-input>
          <vi-input
            class="ipt-c"
            v-model="modelFormData.lat"
            type="button"
            @change="
              () => {
                if (targetModel) {
                  const oldLat = targetModel.jsonData.basePosition[1].toString()
                  // 检验经度合规性
                  const latRight = latRules.rule.test(modelFormData.lat)
                  if (modelFormData && latRight && modelFormData.lat !== oldLat) {
                    const newBasePosition = [...targetModel.jsonData.basePosition]
                    newBasePosition[1] = Number(modelFormData.lat)

                    modelControl?.changePosition({
                      newBasePosition,
                      id: targetModel.jsonData.id
                    })
                  } else {
                    modelFormData.lon = oldLat
                  }
                }
              }
            "
          >
            <template #prefix> 纬度 </template>
          </vi-input>
          <vi-input
            class="ipt-c"
            v-model="modelFormData.height"
            type="button"
            @change="
              () => {
                if (targetModel) {
                  const oldheight = targetModel.jsonData.basePosition[2].toString()
                  // 检验经度合规性
                  const heightRight = heightRules.rule.test(modelFormData.height)
                  if (modelFormData && heightRight && modelFormData.height !== oldheight) {
                    const newBasePosition = [...targetModel.jsonData.basePosition]
                    newBasePosition[2] = Number(modelFormData.height)

                    modelControl?.changePosition({
                      newBasePosition,
                      id: targetModel.jsonData.id
                    })
                  } else {
                    modelFormData.height = oldheight
                  }
                }
              }
            "
          >
            <template #prefix> 高度 </template>
            <template #suffix> 米 </template>
          </vi-input>
        </form-item>
        <form-item label="展示标签">
          <vi-switch
            v-model="modelFormData.showLabel"
            @change="
              () => {
                if (targetModel) {
                  modelControl?.changeLabelShow({
                    visible: modelFormData.showLabel,
                    id: targetModel.jsonData.id
                  })
                }
              }
            "
          />
        </form-item>
        <form-item label="标签坐标">
          <vi-input
            class="ipt-c"
            v-model="modelFormData.labelLon"
            type="button"
            @change="
              () => {
                if (targetModel) {
                  const oldLon = targetModel.jsonData.label.position[0].toString()
                  // 检验经度合规性
                  const lonRight = heightRules.rule.test(modelFormData.labelLon)
                  if (modelFormData && lonRight && modelFormData.labelLon !== oldLon) {
                    const newPosition = [...targetModel.jsonData.label.position]
                    newPosition[0] = Number(modelFormData.labelLon)

                    modelControl?.changeLabelPosition({
                      newPosition,
                      id: targetModel.jsonData.id
                    })
                  } else {
                    modelFormData.labelLon = oldLon
                  }
                }
              }
            "
          >
            <template #prefix> 经度偏移 </template>
            <template #suffix> 米 </template>
          </vi-input>
          <vi-input
            class="ipt-c"
            v-model="modelFormData.labelLat"
            type="button"
            @change="
              () => {
                if (targetModel) {
                  const oldLat = targetModel.jsonData.label.position[1].toString()
                  // 检验经度合规性
                  const latRight = heightRules.rule.test(modelFormData.labelLat)
                  if (modelFormData && latRight && modelFormData.labelLat !== oldLat) {
                    const newPosition = [...targetModel.jsonData.label.position]
                    newPosition[1] = Number(modelFormData.labelLat)

                    modelControl?.changeLabelPosition({
                      newPosition,
                      id: targetModel.jsonData.id
                    })
                  } else {
                    modelFormData.labelLat = oldLat
                  }
                }
              }
            "
          >
            <template #prefix> 纬度偏移 </template>
            <template #suffix> 米 </template>
          </vi-input>
          <vi-input
            class="ipt-c"
            v-model="modelFormData.labelHeight"
            type="button"
            @change="
              () => {
                if (targetModel) {
                  const oldHeight = targetModel.jsonData.label.position[2].toString()
                  // 检验经度合规性
                  const heightRight = heightRules.rule.test(modelFormData.labelHeight)
                  if (modelFormData && heightRight && modelFormData.labelHeight !== oldHeight) {
                    const newPosition = [...targetModel.jsonData.label.position]
                    newPosition[2] = Number(modelFormData.labelHeight)

                    modelControl?.changeLabelPosition({
                      newPosition,
                      id: targetModel.jsonData.id
                    })
                  } else {
                    modelFormData.labelHeight = oldHeight
                  }
                }
              }
            "
          >
            <template #prefix> 高度偏移 </template>
            <template #suffix> 米 </template>
          </vi-input>
        </form-item>
        <vi-button
          color="red"
          @click="
            () => {
              if (targetModel) {
                modelControl?.removeModel({
                  id: targetModel.jsonData.id
                })
                targetModel = undefined
              }
            }
          "
          >移除模型</vi-button
        >
      </div>
    </vi-drawer>
  </div>
  <!-- 设置对话框 -->
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
      <div class="desc">{{ stringDateToStringFormat(target?.createTime) }}</div>
    </div>
    <vi-divider />
    <div class="line">
      <div class="title">更新时间</div>
      <div class="desc">{{ stringDateToStringFormat(target?.updateTime) }}</div>
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
  <!-- 删除对话框 -->
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
import * as THREE from 'three'
import gsap from 'gsap'
import DeleteDialog from '@/components/delete-dialog/index.vue'
import FormItem from '@/components/form-item/index.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { Message } from 'viog-ui'
import { getProjDetail, updateProj } from '@/network/project'
import { Module, Project } from '@/interface/project'
import { stringDateToStringFormat } from '@/utils/date'
import { initModelRegistry, ModelRegistryEntry } from '@/global/module-three'
import { initGrid, paintCircle, paintGrid, toggleGridVisibility, setGridColor, setCircleColor, drawGrid } from '@/global/grid-three'
import { initProjectViewer, setSkyBoxVisible, setSkyBoxColor, setSkyBox, ThreeViwer } from '@/global/project-three'
import { RandomSceneRoamer } from '@/global/camera-three'
import { useModuleStore } from '@/store/modules'
import { ViToast } from 'viog-ui'
import { parseStandardModuleJSON } from '@/global/json'
import { lonRules, latRules, heightRules } from '@/rules'
import { gridCellOption, skyBoxOpts } from '@/global/project'

const route = useRoute()

const rightOpen = ref(true)
const leftOpen = ref(true)
const settingOpen = ref(false)
const deleteOpen = ref(false)
const loading = ref(true)

const targetId = ref<string>()
const target = ref<Project | null>(null)

// Three相关
const baseViewer = ref<ThreeViwer>()
/** 储存网格实体 */
const gridEntities = ref(initGrid())
/** 储存展示范围 */
const distanceCircle = ref<THREE.Mesh>()
/** 模型控制 */
const modelControl = ref<ReturnType<typeof initModelRegistry>>()
const targetModel = ref<ModelRegistryEntry>()
const curModelJSONArr = reactive<{ id: number; name: string }[]>([])
/** 漫游控件 */
const roamer = ref<RandomSceneRoamer>()
/** 正在漫游状态 */
const isRoaming = ref(false)
/** 正在漫游飞行中 */
const isFlying = ref(false)
/** 飞行目标 */
const flyingTarget = ref<THREE.Vector3>()
const flyingHeight = ref<number>(100)
/** 模型列表 */
const modulesStore = useModuleStore()

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

const oldGridSize = ref(0)
const modelFormData = reactive({
  title: '',
  lat: '',
  lon: '',
  height: '',
  labelLat: '',
  labelLon: '',
  labelHeight: '',
  show: true,
  showLabel: true
})

watch(targetModel, () => {
  if (targetModel.value) {
    const { jsonData } = targetModel.value
    modelFormData.title = jsonData.label.text
    modelFormData.show = jsonData.show
    modelFormData.showLabel = jsonData.label.show
    modelFormData.lon = jsonData.basePosition[0].toString()
    modelFormData.lat = jsonData.basePosition[1].toString()
    modelFormData.height = jsonData.basePosition[2].toString()
    modelFormData.labelLon = jsonData.label.position[0].toString()
    modelFormData.labelLat = jsonData.label.position[1].toString()
    modelFormData.labelHeight = jsonData.label.position[2].toString()
  }
})

/** 飞往的目标点 */
const flyingTargetView = computed(() => {
  if (!flyingTarget.value) return '无'
  const { x, y, z } = flyingTarget.value
  return `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`
})

/** 更新网格宽度 */
// const updateGrid = (newSize: number) => {
//   if (baseViewer.value && target.value) {
//     paintGrid(baseViewer.value, gridEntities.value, {
//       type: 'grid',
//       unit: 'coordinates',
//       baseOrigin: target.value.coordinates,
//       squareSize: 2 * target.value.radius,
//       gridSize: newSize,
//       defaultShow: showGrid.value,
//       color: gridColor.value
//     })
//   }
// }

/** 更新下一个目标漫游点 */
const updateRoameTarget = (t: THREE.Vector3) => {
  flyingTarget.value = t
}

// TODO
/** 设置地球表面颜色 */
const setLayersColor = (hex: string) => {
  if (baseViewer.value) {
    baseViewer.value.setLayerColor(hex)
  }
}

watch(showDistance, newValue => {
  if (baseViewer.value && distanceCircle.value) {
    distanceCircle.value.visible = newValue
  }
})

watch(flyingHeight, newValue => {
  if (roamer.value) {
    roamer.value.setHeight(newValue)
  }
})

watch(showGrid, newValue => {
  if (baseViewer.value && gridEntities.value) {
    baseViewer.value.grid.visible = newValue
  }
})

// watch(gridCellSize, newValue => {
//   if (oldGridSize.value !== newValue) {
//     oldGridSize.value = newValue
//     // updateGrid(newValue)
//   }
// })

// watch(gridColor, newVal => {
//   if (baseViewer.value && gridEntities.value) {
//     setGridColor(gridEntities.value, newVal)
//   }
// })

watch(layersColor, newVal => {
  if (baseViewer.value) {
    setLayersColor(newVal)
  }
})

watch(distanceColor, newVal => {
  if (baseViewer.value && distanceCircle.value) {
    setCircleColor(distanceCircle.value, newVal)
  }
})

watch(showSkybox, newVal => {
  if (baseViewer.value && skyColor.value) {
    setSkyBoxVisible(baseViewer.value, newVal, {
      hex: skyColor.value,
      skyboxName: skyboxName.value
    })
  }
})

watch(skyboxName, newVal => {
  if (baseViewer.value) {
    setSkyBox(baseViewer.value, newVal)
  }
})

watch(skyColor, newVal => {
  if (baseViewer.value && target.value) {
    setSkyBoxColor(baseViewer.value, newVal)
  }
})

// watch(showSkyAtmosphere, newVal => {
//   if (baseViewer.value) {
//     setSkyAtmosphereVisible(baseViewer.value.scene, newVal)
//   }
// })

/** 回到原点，相机默认视角转至原点高radius * 2处 */
const rebackOrigin = (duration: number = 2) => {
  if (target.value && baseViewer.value) {
    const { coordinates, radius } = target.value

    const destination = [coordinates[0], coordinates[1], radius * 2]

    const camera = baseViewer.value.camera

    gsap.to(camera.position, {
      duration,
      x: destination[1],
      y: destination[0],
      z: destination[2],
      onUpdate: () => {
        camera.lookAt(new THREE.Vector3(0, 0, 0)) // 你可以改成看向你想看的点
      }
    })
  }
}

/** 设置当前目标模型 */
const setTargetModel = (m: ModelRegistryEntry) => {
  targetModel.value = m
}

/** 初始化viewer */
const initViewer = async (tar: Project) => {
  // 如果target获取到了
  if (tar) {
    // console.log('init viewer')
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
    const viewer = initProjectViewer(document.getElementById('cesiumContainer')!, tar)
    baseViewer.value = viewer

    // 初始化模型数组
    const mC = initModelRegistry(viewer, tar, curModelJSONArr, setTargetModel)

    // 初始化modelArr
    if (tar.modelsArr) {
      tar.modelsArr.forEach(async jsonData => {
        await mC.registerModel(jsonData)
        // 渲染节流
        await new Promise(res => setTimeout(res, 500))
      })
    }

    modelControl.value = mC

    // 初始化范围
    const dc = paintCircle(viewer, radius, globalObj.distanceColor)
    dc.visible = globalObj.showDistance
    distanceCircle.value = dc

    // 初始化天空
    setSkyBoxVisible(viewer, globalObj.showSkybox, {
      hex: globalObj.skyColor,
      skyboxName: globalObj.skyboxName
    })

    // 初始化网格
    // const curEntities = paintGrid(viewer, gridEntities.value, {
    //   type: 'grid',
    //   unit: 'coordinates',
    //   baseOrigin: coordinates,
    //   squareSize: 2 * radius,
    //   gridSize: globalObj.gridCellSize ?? 10,
    //   color: globalObj.gridColor
    // })
    // if (curEntities) toggleGridVisibility(curEntities, !!globalObj.showGrid)
    // gridEntities.value = curEntities

    // 初始跳转镜头
    // viewer.camera.flyTo({
    //   duration: 2,
    //   destination: Cesium.Cartesian3.fromDegrees(...coordinates, radius * 2)
    // })

    // 初始化设置漫游控件
    const rm = new RandomSceneRoamer(viewer.camera, viewer.controls, new THREE.Vector3(...coordinates), radius, {
      startCb: () => {
        isFlying.value = true
      },
      endCb: () => {
        isFlying.value = false
        flyingTarget.value = undefined
      },
      updateFlyTarget: updateRoameTarget
    })
    roamer.value = rm
  }
}

/** 查询项目细节 */
const queryDetail = async (id: string) => {
  loading.value = true
  try {
    const res = await getProjDetail({
      id
    })

    if (res.data) {
      const { id, updateTime, createTime, title, url, coordinates, radius, layers } = res.data
      target.value = {
        id,
        updateTime,
        createTime,
        title,
        url,
        coordinates,
        radius,
        layers
      } as unknown as Project

      await initViewer(res.data)

      loading.value = false
    }
  } catch (e) {
    console.log(e)
  }
}

/** 向项目添加模型 */
const handleUseModule = async (id: number) => {
  try {
    let curAdd: Module | null | undefined

    if (!modulesStore.moduleMap.has(id)) {
      loading.value = true
      curAdd = await modulesStore.getModuleDetails(id)
    } else {
      curAdd = modulesStore.moduleMap.get(id)
    }

    if (curAdd) {
      const entity = parseStandardModuleJSON(target.value?.coordinates!, curAdd)
      modelControl.value!.registerModel(entity)
    }
  } catch (e) {
    console.log(e)
    ViToast.open('出现未知错误，模型加载失败！')
  } finally {
    loading.value = false
  }
}

/** 保存项目 */
const handleSave = () => {
  const image = baseViewer.value?.renderer.domElement.toDataURL('image/png')
  console.log(image)

  if (target.value?.id) {
    updateProj({
      id: target.value.id,
      img: image,
      globalObj: {
        showDistance: showDistance.value,
        showGrid: showGrid.value,
        gridCellSize: gridCellSize.value,
        layersColor: layersColor.value,
        distanceColor: distanceColor.value,
        gridColor: gridColor.value,
        showSkybox: showSkybox.value,
        skyboxName: skyboxName.value,
        skyColor: skyColor.value,
        showSkyAtmosphere: showSkyAtmosphere.value
      },
      modelsArr: modelControl.value?.modelRegistry.map(item => item.jsonData) ?? []
    })
      .then(() => {
        ViToast.open('保存成功')
      })
      .catch(e => {
        console.log(e)
        ViToast.open('保存失败，请稍后重试')
      })
  }
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

onBeforeUnmount(() => {
  if (baseViewer.value) {
    baseViewer.value.destory()
    baseViewer.value = undefined
  }

  if (roamer.value) {
    roamer.value.destroy()
  }
})
</script>

<style lang="less" src="./global.less"></style>
<style scoped lang="less" src="./index.less"></style>
