<script setup lang="ts">
import type { ErrorMessageProperties } from '@/interfaces/error-message-properties.interface'
import './ErrorMessage.css'

defineProps<ErrorMessageProperties>()
</script>

<template>
  <div v-if="message" class="error-message-container">
    <div class="error-message-content">
      <svg class="error-message-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="error-message-text">
        {{ message }}
      </p>
    </div>
  </div>
</template>