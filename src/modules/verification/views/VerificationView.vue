<script setup lang="ts">
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import './VerificationView.css'
import VerificationForm from "@/modules/verification/components/VerificationForm/VerificationForm.vue";

const { translations } = useLanguageSwitcher()
</script>

<template>
  <div class="verification-page">
    <ControlPanel :show-logout="true" />

    <div class="verification-card">
      <VerificationForm
          :translations="translations.verification"
          :common-translations="translations.common"
      />
    </div>
  </div>
</template>