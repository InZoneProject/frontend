<script setup lang="ts">
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { nextTick, ref, watch } from 'vue'
import type { BaseInputProperties } from '@/interfaces/base-input-properties.interface'
import type { BaseInputEmits } from '@/interfaces/base-input-emits.interface'
import { useBaseInput } from '@/composables/useBaseInput'
import './BaseInput.css'

const props = defineProps<BaseInputProperties>()
const emit = defineEmits<BaseInputEmits>()

const {
  inputType,
  isPasswordVisible,
  togglePasswordVisibility,
  handleInput
} = useBaseInput(props, emit)

const textareaReference = ref<HTMLTextAreaElement | null>(null)

const resizeTextarea = () => {
  if (!props.isExpandable || !textareaReference.value) return
  textareaReference.value.style.height = 'auto'
  textareaReference.value.style.height = `${textareaReference.value.scrollHeight}px`
}

const handleExpandableInput = (event: Event) => {
  handleInput(event)
  resizeTextarea()
}

watch(
    () => props.modelValue,
    () => {
      void nextTick(() => resizeTextarea())
    },
    { immediate: true }
)
</script>

<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="base-input-label">{{ label }}</label>
    <div class="base-input-container">
      <div v-if="$slots.prefix" class="base-input-prefix">
        <slot name="prefix"></slot>
      </div>

      <textarea
          v-if="isExpandable"
          ref="textareaReference"
          :value="modelValue"
          :maxlength="maxLength"
          :disabled="disabled"
          :placeholder="placeholder"
          @input="handleExpandableInput"
          class="base-input-field base-input-field--expandable"
          :class="{ 'has-prefix': $slots.prefix }"
          rows="3"
      />

      <input
          v-else
          :type="inputType"
          :value="modelValue"
          :maxlength="maxLength"
          :disabled="disabled"
          :placeholder="placeholder"
          @input="handleInput"
          class="base-input-field"
          :class="{ 'has-prefix': $slots.prefix }"
      />

      <div v-if="type === 'password' && !isExpandable && !disabled" class="base-input-icon" @click="togglePasswordVisibility">
        <component :is="isPasswordVisible ? EyeSlashIcon : EyeIcon" />
      </div>
    </div>
  </div>
</template>
