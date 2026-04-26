<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RegisterForm from '@/modules/register/components/RegisterForm/RegisterForm.vue'
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import { UserRole } from '@/enums/user-role.enum'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import './RegisterView.css'

const route = useRoute()
const { translations } = useLanguageSwitcher()

const initialRole = computed(() => {
  return route.path.includes('tag-admin')
      ? UserRole.TAG_ADMIN
      : UserRole.ORGANIZATION_ADMIN
})

const onRegisterSubmit = (payload: any) => {
  console.log('Payload:', payload)
}
</script>

<template>
  <div class="register-page">
    <ControlPanel :show-logout="false" :show-notifications="false" :show-profile="false" />

    <div class="register-card">
      <RegisterForm
          :common-translations="translations.common"
          :register-translations="translations.register"
          :initial-role="initialRole"
          @submit="onRegisterSubmit"
      />
    </div>
  </div>
</template>
