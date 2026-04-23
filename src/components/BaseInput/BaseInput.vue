<script setup lang="ts">
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
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
</script>

<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="base-input-label">{{ label }}</label>
    <div class="base-input-container">
      <div v-if="$slots.prefix" class="base-input-prefix">
        <slot name="prefix"></slot>
      </div>

      <input
          :type="inputType"
          :value="modelValue"
          :maxlength="maxLength"
          :placeholder="placeholder"
          @input="handleInput"
          class="base-input-field"
          :class="{ 'has-prefix': $slots.prefix }"
      />

      <div v-if="type === 'password'" class="base-input-icon" @click="togglePasswordVisibility">
        <component :is="isPasswordVisible ? EyeSlashIcon : EyeIcon" />
      </div>
    </div>
  </div>
</template>