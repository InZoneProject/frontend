<script setup lang="ts">
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import ResetPasswordForm from '@/modules/reset-password/components/ResetPasswordForm/ResetPasswordForm.vue'
import './ResetPasswordView.css'

const { translations } = useLanguageSwitcher()
</script>

<template>
  <div class="reset-password-page">
    <ControlPanel :show-logout="false" />

    <div class="reset-password-card">
      <ResetPasswordForm
          :common-translations="translations.common"
          :reset-password-translations="translations.resetPassword"
      />
    </div>
  </div>
</template>
