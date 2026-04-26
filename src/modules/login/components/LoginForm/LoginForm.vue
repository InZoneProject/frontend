<script setup lang="ts">
import InZoneIconLight from '@/assets/in-zone-icon-light.svg'
import InZoneIconDark from '@/assets/in-zone-icon-dark.svg'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseTabs from '@/components/BaseTabs/BaseTabs.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useLoginForm } from '@/modules/login/composables/useLoginForm'
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'
import { LENGTH } from '@/constants/length.constants'
import { UserRole } from '@/enums/user-role.enum'
import type { CommonTranslations } from "@/interfaces/common-translations.interface"
import type { LoginTranslations } from "@/modules/login/interfaces/login-translations.interface"
import type { LoginFormEmits } from '@/modules/login/interfaces/login-form-emits.interface'
import './LoginForm.css'

interface LoginFormProps {
  commonTranslations: CommonTranslations
  loginTranslations: LoginTranslations
}

const properties = defineProps<LoginFormProps>()
const emit = defineEmits<LoginFormEmits>()

const { isDark } = useThemeSwitcher()

const {
  emailValue,
  passwordValue,
  activeRole,
  isGlobalAdmin,
  roleTabs,
  errorMessage,
  canSubmit,
  isSubmitting,
  handleFormSubmit,
  handleRoleChange,
  handleForgotPasswordRedirect
} = useLoginForm(
    () => properties.commonTranslations,
    emit
)
</script>

<template>
  <form @submit.prevent="handleFormSubmit" novalidate class="login-form-container">
    <div class="login-header">
      <img :src="isDark ? InZoneIconDark : InZoneIconLight" alt="InZone" class="login-logo-img" />
      <h2 class="login-title">{{ properties.commonTranslations.title }}</h2>

      <div v-if="errorMessage" class="login-error-wrapper">
        <ErrorMessage :message="errorMessage" />
      </div>

      <BaseTabs
          v-if="!isGlobalAdmin"
          :activeTab="activeRole"
          @update:activeTab="(id: string) => handleRoleChange(id as UserRole)"
          :tabs="roleTabs"
      />

      <div class="role-description-block">
        <p class="role-description-text">
          {{ properties.commonTranslations.rolesDescription[activeRole] }}
        </p>
      </div>
    </div>

    <div class="login-form-fields">
      <BaseInput
          v-model="emailValue"
          :label="properties.commonTranslations.emailLabel"
          type="email"
          :placeholder="properties.commonTranslations.emailPlaceholder"
          :max-length="LENGTH.MAX_EMAIL_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />

      <BaseInput
          v-model="passwordValue"
          :label="properties.commonTranslations.passwordLabel"
          type="password"
          :placeholder="properties.commonTranslations.passwordPlaceholder"
          :max-length="LENGTH.MAX_PASSWORD_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />
    </div>

    <div class="login-form-actions">
      <BaseButton
          type="submit"
          :disabled="isSubmitting || !canSubmit"
          :loading="isSubmitting"
          variant="primary"
      >
        {{ properties.loginTranslations.submitRole }}
      </BaseButton>

      <BaseButton
          v-if="!isGlobalAdmin"
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          :loading="false"
          @click="handleForgotPasswordRedirect"
      >
        {{ properties.commonTranslations.forgotPassword }}
      </BaseButton>
    </div>
  </form>
</template>
