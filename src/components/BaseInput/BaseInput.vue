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
  textareaReference,
  togglePasswordVisibility,
  handleInput,
  handleExpandableInput
} = useBaseInput(props, emit)
</script>

<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="base-input-label">
      {{ label }}
    </label>

    <div class="base-input-container">
      <div v-if="$slots.prefix" class="base-input-prefix">
        <slot name="prefix" />
      </div>

      <textarea
          v-if="isExpandable"
          ref="textareaReference"
          :value="modelValue"
          :maxlength="maxLength ?? undefined"
          :disabled="disabled"
          :placeholder="placeholder"
          class="base-input-field base-input-field--expandable"
          :class="{ 'has-prefix': $slots.prefix }"
          rows="3"
          @input="handleExpandableInput"
      />

      <input
          v-else-if="type !== 'select'"
          :type="inputType"
          :value="modelValue"
          :maxlength="maxLength ?? undefined"
          :min="type === 'number' ? (minValue ?? undefined) : undefined"
          :max="type === 'number' ? (maxValue ?? undefined) : undefined"
          :disabled="disabled"
          :placeholder="placeholder"
          class="base-input-field"
          :class="{ 'has-prefix': $slots.prefix }"
          @input="handleInput"
      />

      <select
          v-else
          :value="modelValue"
          :disabled="disabled"
          class="base-input-field base-input-field--select"
          :class="{ 'has-prefix': $slots.prefix }"
          @change="handleInput"
      >
        <option
            v-for="option in options || []"
            :key="option.value"
            :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <div
          v-if="type === 'select'"
          class="base-input-select-icon"
          aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path
              d="M6 8l4 4 4-4"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
          />
        </svg>
      </div>

      <button
          v-if="type === 'password' && !isExpandable && !disabled"
          type="button"
          class="base-input-icon"
          @click="togglePasswordVisibility"
      >
        <component :is="isPasswordVisible ? EyeSlashIcon : EyeIcon" />
      </button>
    </div>
  </div>
</template>