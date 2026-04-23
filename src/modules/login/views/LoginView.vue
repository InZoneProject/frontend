<script setup lang="ts">
import LoginForm from '../components/LoginForm/LoginForm.vue'
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import './LoginView.css'

const { translations } = useLanguageSwitcher()
</script>

<template>
  <div class="login-page">
    <ControlPanel :show-logout="false" />

    <div class="login-card">
      <LoginForm
          :login-translations="translations.login"
          :common-translations="translations.common"
      />
    </div>
  </div>
</template>