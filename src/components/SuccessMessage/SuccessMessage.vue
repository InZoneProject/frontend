<script setup lang="ts">
import { toRef } from 'vue'
import { useSuccessMessage } from '@/composables/useSuccessMessage'
import { Events } from '@/enums/events.enum'
import type { SuccessMessageEmits } from '@/interfaces/success-message-emits.interface'
import type { SuccessMessageProperties } from '@/interfaces/success-message-properties.interface'
import './SuccessMessage.css'

const properties = defineProps<SuccessMessageProperties>()
const emit = defineEmits<SuccessMessageEmits>()

const { visibleMessage } = useSuccessMessage(toRef(properties, 'message'), () => emit(Events.CLEAR))
</script>

<template>
  <div v-if="visibleMessage" class="success-message-container">
    <div class="success-message-content">
      <svg class="success-message-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <p class="success-message-text">
        {{ visibleMessage }}
      </p>
    </div>
  </div>
</template>
