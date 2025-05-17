<template>
  <vi-form @submit="handleSubmit">
    <template v-slot="{ submit }">
      <vi-dialog
        title="新建项目"
        class="create-dialog"
        noUnsure
        :modelValue="props.modelValue"
        @update:modelValue="handleOpenChange"
        :toSure="() => false"
        :toShutdown="() => !createLoading"
      >
        <div class="create-form">
          <vi-form-item label="标题" :rules="titleRules">
            <vi-input name="title" type="plain" v-model="formData.title" placeholder="请输入标题" />
          </vi-form-item>
          <vi-form-item label="坐标原点" :rules="coordinatesRules">
            <div class="coord-content">
              <vi-input class="ipt" name="coordinates" v-model="formData.coordinates[0]">
                <template v-slot:prefix> 经 </template>
              </vi-input>
              <vi-input class="ipt" name="coordinates" v-model="formData.coordinates[1]">
                <template v-slot:prefix> 纬 </template>
              </vi-input>
            </div>
          </vi-form-item>
          <vi-form-item label="场景范围半径" :rules="radiusRules" auto>
            <vi-input name="radius" v-model="formData.radius">
              <template v-slot:suffix> 米 </template>
            </vi-input>
          </vi-form-item>
          <!-- <vi-form-item label="使用默认场景" :rules:="needModulesRules">
            <vi-radio-group name="needModules" v-model="formData.needModules" class="radio-group">
              <vi-radio :value="CreateProjMode.Template">是</vi-radio>
              <vi-radio :value="CreateProjMode.Default">否</vi-radio>
            </vi-radio-group>
          </vi-form-item>
          <vi-form-item label="使用场景" v-show="formData.needModules" :rules="modulesIDRules">
            <vi-select v-model="formData.modulesID" name="modulesID" type="plain" placeholder="请选择场景" once>
              <vi-option v-for="v in projectStore.defaultModulesList" :key="v.id" :value="v.id">{{ v.name }}</vi-option>
            </vi-select>
          </vi-form-item> -->
          <vi-form-item label="开启地球图层">
            <vi-switch v-model="formData.layers" name="layers"></vi-switch>
          </vi-form-item>
        </div>
        <template #sure>
          <vi-button color="purple" @click="submit" :disabled="createLoading">
            {{ createLoading ? '创建中' : '创建' }}
          </vi-button>
        </template>
      </vi-dialog>
    </template>
  </vi-form>
</template>

<script lang="ts" setup>
import { titleRules, coordinatesRules, radiusRules, needModulesRules, modulesIDRules, lonRules, latRules } from '@/rules'
import { CreateForm } from '@/interface/create'
import { createProj } from '@/network/project'
import { reactive, ref } from 'vue'
import { ViMessage } from 'viog-ui'
import { CreateProjMode } from '@/interface/project'
import { useProjectStore } from '@/store/project'

const projectStore = useProjectStore()
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', op: boolean): void
  (e: 'createFinish', res: false): void
  (e: 'createFinish', res: true, id: string): void
}>()

const formData = reactive<CreateForm>({
  title: '',
  needModules: CreateProjMode.Default,
  modulesID: '',
  coordinates: [0, 0],
  radius: 100,
  layers: false
})

const createLoading = ref(false)

const handleOpenChange = (o: boolean) => {
  emit('update:modelValue', o)
}

const handleSubmit = async (formMap: Map<string, string>, mapRes: boolean, { resMap, getSubmitFeedback }: any) => {
  // 先判断内容
  let flag = false
  const feedBackMap = new Map()
  if (!resMap.get('title')) {
    feedBackMap.set('title', '请输入标题')
    flag = true
  }

  if (!resMap.get('radius')) {
    feedBackMap.set('radius', '请检查半径输入')
    flag = true
  }
  // 检查经纬度
  const lonRight = lonRules.rule.test(String(formData.coordinates[0]))
  const latRight = latRules.rule.test(String(formData.coordinates[1]))
  if (!latRight || !latRight) flag = true
  if (!lonRight && !latRight) {
    feedBackMap.set('coordinates', '经纬度不合规')
  } else if (!latRight) {
    feedBackMap.set('coordinates', '纬度不合规')
  } else if (!lonRight) {
    feedBackMap.set('coordinates', '经度不合规')
  }

  if (!resMap.get('radius')) {
    feedBackMap.set('radius', '请检查半径输入')
    flag = true
  }

  if (!needModulesRules[0].rule.test(String(formMap.get('needModules')))) {
    feedBackMap.set('needModules', '请选择是否使用场景')
    flag = true
  }

  if (formMap.get('needModules') && !resMap.get('modulesID')) {
    feedBackMap.set('modulesID', '请选择一个模型')
    flag = true
  }

  getSubmitFeedback(feedBackMap)

  if (flag) return

  createLoading.value = true
  const res = await createProj({
    title: formData.title,
    mode: formData.needModules,
    templateId: formData.modulesID,
    coordinates: formData.coordinates,
    radius: formData.radius,
    layers: formData.layers
  })

  createLoading.value = false
  if (res?.code === 200) {
    ViMessage.append('创建成功', 2000)
    emit('update:modelValue', false)
    emit('createFinish', true, res.data.id)
  } else {
    ViMessage.append('创建失败，请重试', 2000)
    emit('createFinish', false)
  }
}
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
