<script setup lang="ts">
import InZoneIconDark from '@/assets/in-zone-icon-dark.svg'
import InZoneIconLight from '@/assets/in-zone-icon-light.svg'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import BaseTabs from '@/components/BaseTabs/BaseTabs.vue'
import BaseTimer from '@/components/BaseTimer/BaseTimer.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'
import { LENGTH } from '@/constants/length.constants'
import { UserRole } from '@/enums/user-role.enum'
import { useForgotPasswordForm } from '@/modules/forgot-password/composables/useForgotPasswordForm'
import type { ForgotPasswordFormProperties } from '@/modules/forgot-password/interfaces/forgot-password-form-properties.interface'
import type { ForgotPasswordFormEmits } from '@/modules/forgot-password/interfaces/forgot-password-form-emits.interface'
import './ForgotPasswordForm.css'

const properties = defineProps<ForgotPasswordFormProperties>()
const emit = defineEmits<ForgotPasswordFormEmits>()

const { isDark } = useThemeSwitcher()

const {
  emailValue,
  isSubmitting,
  isTimerActive,
  expiresAt,
  activeRole,
  roleTabs,
  actionButtonText,
  canSubmit,
  descriptionText,
  errorMessage,
  onTimerFinish,
  handleRoleChange,
  handleBackToLogin,
  handleSendResetLink
} = useForgotPasswordForm(
    () => properties.commonTranslations,
    () => properties.translations,
    emit
)
</script>

<template>
  <form @submit.prevent="handleSendResetLink" novalidate class="forgot-password-form-container">
    <div class="forgot-password-header">
      <img
          :key="isDark ? 'dark' : 'light'"
          :src="isDark ? InZoneIconDark : InZoneIconLight"
          alt="InZone"
          class="forgot-password-logo-img"
      />
      <h2 class="forgot-password-title">{{ properties.commonTranslations.title }}</h2>

      <div v-if="errorMessage" class="forgot-password-error-wrapper">
        <ErrorMessage :message="errorMessage" />
      </div>

      <BaseTabs
          class="forgot-password-role-tabs"
          :activeTab="activeRole"
          @update:activeTab="(id: string) => handleRoleChange(id as UserRole)"
          :tabs="roleTabs"
      />

      <div class="forgot-password-status-area">
        <BaseTimer
            v-if="isTimerActive && expiresAt !== ''"
            :value="expiresAt"
            :label="properties.translations.timerLabel"
            @finish="onTimerFinish"
        />
      </div>

      <div class="forgot-password-info-block">
        <p class="forgot-password-info-text">
          {{ descriptionText }}
        </p>
      </div>
    </div>

    <div class="forgot-password-content">
      <BaseInput
          v-model="emailValue"
          :label="properties.commonTranslations.emailLabel"
          type="email"
          :placeholder="properties.commonTranslations.emailPlaceholder"
          :max-length="LENGTH.MAX_EMAIL_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />
    </div>

    <div class="forgot-password-footer">
      <BaseButton
          type="submit"
          variant="primary"
          :disabled="isTimerActive || isSubmitting || !canSubmit"
          :loading="isSubmitting"
      >
        {{ actionButtonText }}
      </BaseButton>

      <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          :loading="false"
          @click="handleBackToLogin"
      >
        {{ properties.translations.backBtn }}
      </BaseButton>
    </div>
  </form>
</template>
