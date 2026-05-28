<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useJoinOrganizationForm } from '@/modules/join/composables/useJoinOrganizationForm'
import type { JoinOrganizationFormProperties } from '@/modules/join/interfaces/join-organization-form-properties.interface'
import './JoinOrganizationForm.css'

const properties = defineProps<JoinOrganizationFormProperties>()

const {
  isConsentChecked,
  isConsentGiven,
  isLoading,
  isSubmitting,
  isSuccess,
  canSubmit,
  infoMessage,
  errorMessage,
  handleFormSubmit
} = useJoinOrganizationForm(
    () => properties.translations
)
</script>

<template>
  <form class="join-form" @submit.prevent="handleFormSubmit">
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

    <div v-if="isSuccess" class="join-success-message">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>{{ properties.translations.success }}</span>
    </div>

    <ErrorMessage :message="errorMessage" />

    <label
        v-if="!infoMessage && !isSuccess"
        class="join-consent"
        :class="{ 'is-disabled': isConsentGiven || isLoading || isSubmitting }"
    >
      <input
          v-model="isConsentChecked"
          type="checkbox"
          :disabled="isConsentGiven || isLoading || isSubmitting"
      />
      <span>{{ properties.translations.consent }}</span>
    </label>

    <BaseButton
        v-if="!infoMessage && !isSuccess"
        type="submit"
        variant="primary"
        :disabled="!canSubmit"
        :loading="isSubmitting"
    >
      {{ properties.translations.confirm }}
    </BaseButton>
  </form>
</template>
