<template>
  <div :class="['json-textarea', isFullscreen ? 'json-full' : '']">
    <!-- 顶部操作栏 -->
    <div class="top">
      <vi-button type="transparent" size="small" @click="formatJson" :disabled="!isValidJson">格式化</vi-button>
      <vi-button type="transparent" size="small" color="purple" @click="toggleFullscreen">
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </vi-button>
    </div>

    <!-- 输入框 -->
    <textarea v-model="localValue" @input="onInput" placeholder="请输入模型json对象"></textarea>

    <!-- 错误提示 -->
    <p v-if="error" class="attention">格式错误：{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { formTargetStateRef } from '@/hooks/form-target-state'
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  name: string
  modelValue: string
  rows?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localValue = ref(props.modelValue)
const error = ref('')
const isFullscreen = ref(false)

formTargetStateRef(props.name, localValue)

const isValidJson = computed(() => {
  try {
    const val = JSON.parse(localValue.value)
    return typeof val === 'object' && !Array.isArray(val) && val !== null
  } catch {
    return false
  }
})

const onInput = () => {
  try {
    const val = JSON.parse(localValue.value)
    if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
      error.value = ''
    } else {
      error.value = '必须是一个 JSON 对象（不能是数组、null、字符串等）'
    }
  } catch (e: any) {
    error.value = 'JSON 格式错误'
  } finally {
    emit('update:modelValue', localValue.value)
  }
}

const formatJson = () => {
  try {
    const parsed = JSON.parse(localValue.value)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      error.value = '只能格式化 JSON 对象类型'
      return
    }
    localValue.value = JSON.stringify(parsed, null, 2)
    error.value = ''
    emit('update:modelValue', localValue.value)
  } catch (e: any) {
    error.value = '格式化失败：JSON 格式错误'
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

watch(
  () => props.modelValue,
  newVal => {
    localValue.value = newVal
  }
)
</script>

<style src="./index.less" scoped />
