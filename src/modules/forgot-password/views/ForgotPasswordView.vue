<script setup lang="ts">
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import ForgotPasswordForm from '@/modules/forgot-password/components/ForgotPasswordForm/ForgotPasswordForm.vue'
import './ForgotPasswordView.css'

const { translations } = useLanguageSwitcher()
</script>

<template>
  <div class="forgot-password-page">
    <ControlPanel :show-logout="false" />

    <div class="forgot-password-card">
      <ForgotPasswordForm
          :translations="translations.forgotPassword"
          :common-translations="translations.common"
      />
    </div>
  </div>
</template>
