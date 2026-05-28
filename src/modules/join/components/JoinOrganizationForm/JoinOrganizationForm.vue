<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useJoinOrganizationForm } from '@/modules/join/composables/useJoinOrganizationForm'
import type { JoinOrganizationFormProperties } from '@/modules/join/interfaces/join-organization-form-properties.interface'
import './JoinOrganizationForm.css'

const properties = defineProps<JoinOrganizationFormProperties>()

const {
  canSubmit,
  infoMessage,
  errorMessage,
  handleOpenApplication
} = useJoinOrganizationForm(
    () => properties.translations
)
</script>

<template>
  <div class="join-form">
    <div class="join-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6" />
      </svg>
    </div>

    <h1 class="join-title">{{ properties.translations.title }}</h1>
    <p class="join-description">{{ properties.translations.description }}</p>

    <div v-if="infoMessage" class="join-info-message">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ infoMessage }}</span>
    </div>

    <ErrorMessage :message="errorMessage" />

    <BaseButton
        type="button"
        variant="primary"
        :disabled="!canSubmit"
        :loading="false"
        @click="handleOpenApplication"
    >
      {{ properties.translations.openInApp }}
    </BaseButton>
  </div>
</template>
