<script setup lang="ts">
import InZoneIconLight from '@/assets/in-zone-icon-light.svg'
import InZoneIconDark from '@/assets/in-zone-icon-dark.svg'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseTabs from '@/components/BaseTabs/BaseTabs.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useRegisterForm } from '@/modules/register/composables/useRegisterForm'
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'
import { LENGTH } from '@/constants/length.constants'
import { UserRole } from '@/enums/user-role.enum'
import type { RegisterFormEmits } from "@/modules/register/interfaces/register-form-emits.interface";
import './RegisterForm.css'
import {RegisterFormProperties} from "@/modules/register/interfaces/register-form-properties.interface";

const props = defineProps<RegisterFormProperties>()
const emit = defineEmits<RegisterFormEmits>()

const { isDark } = useThemeSwitcher()

const {
  nameValue,
  emailValue,
  passwordValue,
  confirmPasswordValue,
  activeRole,
  roleTabs,
  errorMessage,
  canSubmit,
  isSubmitting,
  handleFormSubmit,
  handleRoleChange
} = useRegisterForm(
    () => props.commonTranslations,
    props.initialRole,
    emit
)
</script>

<template>
  <form @submit.prevent="handleFormSubmit" novalidate class="register-form-container">
    <div class="register-header">
      <img :src="isDark ? InZoneIconDark : InZoneIconLight" alt="InZone" class="register-logo-img" />
      <h2 class="register-title">{{ commonTranslations.title }}</h2>

      <div v-if="errorMessage" class="register-error-wrapper">
        <ErrorMessage :message="errorMessage" />
      </div>

      <BaseTabs
          :activeTab="activeRole"
          @update:activeTab="(id: string) => handleRoleChange(id as UserRole)"
          :tabs="roleTabs"
      />

      <div class="role-description-block">
        <p class="role-description-text">
          {{ commonTranslations.rolesDescription[activeRole] }}
        </p>
      </div>
    </div>

    <div class="register-form-fields">
      <BaseInput
          v-model="nameValue"
          :label="commonTranslations.userNameLabel"
          type="text"
          :placeholder="commonTranslations.userNamePlaceholder"
          :max-length="LENGTH.MAX_NAME_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />

      <BaseInput
          v-model="emailValue"
          :label="commonTranslations.emailLabel"
          type="email"
          :placeholder="commonTranslations.emailPlaceholder"
          :max-length="LENGTH.MAX_EMAIL_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />

      <BaseInput
          v-model="passwordValue"
          :label="commonTranslations.passwordLabel"
          type="password"
          :placeholder="commonTranslations.passwordPlaceholder"
          :max-length="LENGTH.MAX_PASSWORD_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />

      <BaseInput
          v-model="confirmPasswordValue"
          :label="commonTranslations.passwordLabel"
          type="password"
          :placeholder="commonTranslations.passwordPlaceholder"
          :max-length="LENGTH.MAX_PASSWORD_LENGTH"
          :is-expandable="false"
          :disabled="isSubmitting"
      />
    </div>

    <div class="register-form-actions">
      <BaseButton
          type="submit"
          :disabled="isSubmitting || !canSubmit"
          :loading="isSubmitting"
          variant="primary"
      >
        {{ registerTranslations.submitRole }}
      </BaseButton>
    </div>
  </form>
</template>
