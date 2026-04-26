<script setup lang="ts">
import InZoneIconDark from '@/assets/in-zone-icon-dark.svg'
import InZoneIconLight from '@/assets/in-zone-icon-light.svg'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'
import { LENGTH } from '@/constants/length.constants'
import { useResetPasswordForm } from '@/modules/reset-password/composables/useResetPasswordForm'
import type { ResetPasswordFormProperties } from '@/modules/reset-password/interfaces/reset-password-form-properties.interface'
import './ResetPasswordForm.css'

const properties = defineProps<ResetPasswordFormProperties>()
const { isDark } = useThemeSwitcher()

const {
  passwordValue,
  confirmPasswordValue,
  isSubmitting,
  canSubmit,
  errorMessage,
  handleSubmit
} = useResetPasswordForm(
    () => properties.commonTranslations,
    () => properties.resetPasswordTranslations
)
</script>

<template>
  <form @submit.prevent="handleSubmit" novalidate class="reset-password-form-container">
    <div class="reset-password-header">
      <img
          :key="isDark ? 'dark' : 'light'"
          :src="isDark ? InZoneIconDark : InZoneIconLight"
          alt="InZone"
          class="reset-password-logo-img"
      />
      <h2 class="reset-password-title">{{ properties.commonTranslations.title }}</h2>

      <div v-if="errorMessage" class="reset-password-error-wrapper">
        <ErrorMessage :message="errorMessage" />
      </div>

      <div class="reset-password-info-block">
        <p class="reset-password-info-text">
          {{ properties.resetPasswordTranslations.description }}
        </p>
      </div>
    </div>

    <div class="reset-password-content">
      <BaseInput
          v-model="passwordValue"
          :label="properties.commonTranslations.passwordLabel"
          type="password"
          :placeholder="properties.commonTranslations.passwordPlaceholder"
          :max-length="LENGTH.MAX_PASSWORD_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />

      <BaseInput
          v-model="confirmPasswordValue"
          :label="properties.commonTranslations.passwordLabel"
          type="password"
          :placeholder="properties.commonTranslations.passwordPlaceholder"
          :max-length="LENGTH.MAX_PASSWORD_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />
    </div>

    <div class="reset-password-footer">
      <BaseButton
          type="submit"
          variant="primary"
          :disabled="isSubmitting || !canSubmit"
          :loading="isSubmitting"
      >
        {{ properties.resetPasswordTranslations.submitBtn }}
      </BaseButton>
    </div>
  </form>
</template>
