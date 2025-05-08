<template>
  <vi-form  @submit="handleSubmit">
    <template v-slot="{ submit }">
      <vi-dialog
      title="新建项目"
      class="create-dialog"
      noUnsure
      :modelValue="props.modelValue"
      @update:modelValue="handleOpenChange"
      :toSure="() => false"
      :toShutdown="() => !createLoading">
        <div class="create-form">
          <vi-form-item label="标题" :rules="[{rule: '.', info: '请输入标题'}]" auto>
            <vi-input name="title" type="plain" v-model="formData.title" placeholder="请输入标题"/>
          </vi-form-item>
          <vi-form-item label="是否使用模型">
            <vi-radio-group name="needModules" v-model="formData.needModules" class="radio-group">
              <vi-radio :value="true">是</vi-radio>
              <vi-radio :value="false">否</vi-radio>
            </vi-radio-group>
          </vi-form-item>
          <vi-form-item label="使用模型编号" v-show="formData.needModules" :rules="[{rule: '.', info: '请选择一个模型'}]">
            <vi-select v-model="formData.modulesID" name="modulesID" type="plain" placeholder="请选择已有模型编号" once>
              <vi-option v-for="v in modeuleOptions" :key="v" :value="v">{{ v }}</vi-option>
            </vi-select>
          </vi-form-item>
        </div>
        <template #sure>
          <vi-button color="purple" @click="submit" :disabled="createLoading">
            {{
              createLoading ? '创建中' : '创建'
            }}
          </vi-button>
        </template>
      </vi-dialog>
    </template>
  </vi-form>
</template>

<script lang="ts" setup>
import { CreateForm } from '@/interface/create';
import { createProj } from '@/network/project';
import { reactive, ref } from 'vue';
import { ViMessage } from 'viog-ui';
import { CreateProjMode } from '@/interface/project';

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', op: boolean): void
  (e: 'createFinish', res: false): void
  (e: 'createFinish', res: true, id: string): void
}>()

const formData = reactive<CreateForm>({
  title: '',
  needModules: false,
  modulesID: ''
})

const createLoading = ref(false)
const modeuleOptions = ref<string[]>(['12345', '67890'])

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

  if (formMap.get('needModules') && !resMap.get('modulesID')) {
    feedBackMap.set('modulesID', '请选择一个模型')
    flag = true
  }

  getSubmitFeedback(feedBackMap)

  if (flag) return
  
  createLoading.value = true
  const res = await createProj({
    token: '',
    title: formData.title,
    mode: formData.needModules ? CreateProjMode.Template : CreateProjMode.Default,
    templateId: formData.modulesID
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
