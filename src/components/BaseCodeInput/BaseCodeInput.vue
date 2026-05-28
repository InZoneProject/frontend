<script setup lang="ts">
import { VALIDATION } from '@/constants/validation.constants'
import type { BaseCodeInputProperties } from '@/interfaces/base-code-input-properties.interface'
import type { BaseCodeInputEmits } from '@/interfaces/base-code-input-emits.interface'
import { useBaseCodeInput } from '@/composables/useBaseCodeInput'
import './BaseCodeInput.css'

const properties = defineProps<BaseCodeInputProperties>()
const emit = defineEmits<BaseCodeInputEmits>()

const {
  digitValues,
  setInputReference,
  handleInput,
  handleKeyDown,
  handleFocus,
  handlePaste
} = useBaseCodeInput(properties, emit)
</script>

<template>
  <div class="code-input-container" @paste="handlePaste($event, 0)">
    <input
        v-for="index in VALIDATION.VERIFICATION_CODE_LENGTH"
        :key="index"
        :ref="(element) => setInputReference(element as HTMLInputElement, index - 1)"
        type="text"
        inputmode="numeric"
        maxlength="1"
        :disabled="disabled"
        class="code-digit-input"
        :value="digitValues[index - 1] || ''"
        @input="handleInput($event, index - 1)"
        @keydown="handleKeyDown($event, index - 1)"
        @focus="handleFocus"
        @paste="handlePaste($event, index - 1)"
    />
  </div>
</template>
