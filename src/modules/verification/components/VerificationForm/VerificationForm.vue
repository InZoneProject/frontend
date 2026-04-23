<script setup lang="ts">
import InZoneIconDark from '@/assets/in-zone-icon-dark.svg'
import InZoneIconLight from '@/assets/in-zone-icon-light.svg'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseTimer from '@/components/BaseTimer/BaseTimer.vue'
import BaseCodeInput from '@/components/BaseCodeInput/BaseCodeInput.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'
import { useVerificationForm } from '../../composables/useVerificationForm'
import type { VerificationFormProperties } from '../../interfaces/verification-form-properties.interface'
import type { VerificationFormEmits } from '../../interfaces/verification-form-emits.interface'
import './VerificationForm.css'

const properties = defineProps<VerificationFormProperties>()
const emit = defineEmits<VerificationFormEmits>()

const { isDark } = useThemeSwitcher()
const {
  codeValue,
  isCodeSent,
  isTimerActive,
  expiresAt,
  isSubmitting,
  isInitialLoading,
  errorCode,
  actionButtonText,
  currentErrorMessage,
  infoDescriptionText,
  onTimerFinish,
  handleSendCode
} = useVerificationForm(emit, () => properties.translations)
</script>

<template>
  <div class="verification-form-container" :class="{ 'is-loading': isInitialLoading }">
    <template v-if="!isInitialLoading">
      <div class="verification-header">
        <img
            :key="isDark ? 'dark' : 'light'"
            :src="isDark ? InZoneIconDark : InZoneIconLight"
            alt="InZone"
            class="verification-logo-img"
        />
        <h2 class="verification-title">{{ properties.commonTranslations.title }}</h2>

        <div class="verification-error-area">
          <ErrorMessage :message="currentErrorMessage" />
        </div>

        <div class="verification-info-block">
          <p class="verification-info-text">
            {{ infoDescriptionText }}
          </p>
        </div>

        <div class="verification-status-area">
          <BaseTimer
              v-if="isTimerActive && expiresAt !== ''"
              :value="expiresAt"
              :label="properties.translations.timerLabel"
              @finish="onTimerFinish"
          />
        </div>
      </div>

      <div class="verification-content">
        <BaseCodeInput
            v-model="codeValue"
            :disabled="!isCodeSent"
            :class="{ 'input-error': errorCode === 'invalidCode' }"
        />
      </div>

      <div class="verification-footer">
        <BaseButton
            type="button"
            variant="primary"
            :disabled="isTimerActive || isSubmitting"
            :loading="isSubmitting"
            @click="handleSendCode"
        >
          {{ actionButtonText }}
        </BaseButton>
      </div>
    </template>

    <div v-else class="verification-skeleton-loader">
      <div class="skeleton-logo"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-block"></div>
      <div class="skeleton-input"></div>
      <div class="skeleton-button"></div>
    </div>
  </div>
</template>
