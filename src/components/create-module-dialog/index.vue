<template>
  <vi-form @submit="handleSubmit">
    <template v-slot="{ submit }">
      <vi-dialog
        title="新建模型"
        class="create-dialog"
        noUnsure
        :modelValue="props.modelValue"
        @update:modelValue="handleOpenChange"
        :toSure="() => false"
        :toShutdown="() => !createLoading"
      >
        <div class="create-form">
          <vi-form-item label="标题" :rules="titleRules" auto>
            <vi-input name="title" type="plain" v-model="formData.title" placeholder="请输入标题" />
          </vi-form-item>
          <vi-form-item label="模型类型" :rules="typeRules" auto>
            <vi-radio-group name="type" v-model="formData.type">
              <vi-radio value="json">json</vi-radio>
              <vi-radio value="gtlf">gtlf</vi-radio>
            </vi-radio-group>
          </vi-form-item>
          <vi-form-item label="JSON" v-show="formData.type === 'json'" :rules="jsonRules" auto>
            <json-input name="json" v-model="formData.detail" />
          </vi-form-item>
          <vi-form-item label="上传文件" v-show="formData.type === 'gtlf'">
            <vi-input name="file" v-show="false" />
            <vi-upload
              @change="
                (v: any) => {
                  if (v && v.length) {
                    formData.file = v[0]
                  }
                }
              "
              name="file"
              :maximum="1"
              replace
              accept=".gltf"
            >
              <vi-upload-choose>
                <vi-button color="purple">点击上传文件</vi-button>
              </vi-upload-choose>
              <vi-upload-list />
            </vi-upload>
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
import { titleRules, typeRules, jsonRules } from '@/rules'
import { reactive, ref } from 'vue'
import { ViMessage } from 'viog-ui'
import JsonInput from '@/components/json-iput/index.vue'
import { isValidJson } from '@/global/json'
import { createModule } from '@/network/module'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', op: boolean): void
  (e: 'createFinish', res: false): void
  (e: 'createFinish', res: true, id: string): void
}>()

const formData = reactive({
  title: '',
  type: '',
  detail: '',
  file: undefined
})

const createLoading = ref(false)

const handleOpenChange = (o: boolean) => {
  emit('update:modelValue', o)
}

const handleSubmit = async (formMap: Map<string, string>, mapRes: boolean, { resMap, getSubmitFeedback }: any) => {
  // 先判断内容
  let flag = false
  const feedBackMap = new Map()
  if (!formData.title) {
    feedBackMap.set('title', '请输入标题')
    flag = true
  }

  if (!formData.type) {
    feedBackMap.set('type', '请选择模型类型')
    flag = true
  } else if (formData.type === 'json' && (!formData.detail || !isValidJson(formData.detail))) {
    feedBackMap.set('json', '请输入有效的模型JSON')
    flag = true
  } else if (formData.type === 'gtlf' && !formData.file) {
    feedBackMap.set('file', '请上传模型文件')
    flag = true
  }
  getSubmitFeedback(feedBackMap)

  if (flag) return

  createLoading.value = true
  try {
    const res = await createModule({
      name: formData.title,
      detail: formData.type === 'json' ? formData.detail : undefined,
      file: formData.type === 'gtlf' ? formData.file : undefined
    })

    if (res?.code === 200) {
      ViMessage.append('创建成功', 2000)
      emit('update:modelValue', false)
      emit('createFinish', true, res.data.id)
    } else {
      ViMessage.append('创建失败，请重试', 2000)
      emit('createFinish', false)
    }
  } catch {
    ViMessage.append('创建失败，请重试', 2000)
    emit('createFinish', false)
  } finally {
    createLoading.value = false
  }
}
</script>

<style scoped lang="less" src="./index.less"></style>
<style lang="less" src="./global.less"></style>
