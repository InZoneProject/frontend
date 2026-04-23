<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useLogoutButton } from '@/composables/useLogoutButton'
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher.vue"
import ThemeSwitcher from '@/components/ThemeSwitcher/ThemeSwitcher.vue'
import LogoutButton from '@/components/LogoutButton/LogoutButton.vue'
import './GlobalNavigation.css'

const route = useRoute()
const { currentLanguage, setLanguage } = useLanguageSwitcher()
const { handleLogout } = useLogoutButton()

const isAuthPage = computed(() => ['Login', 'GlobalAdminLogin'].includes(route.name as string))
</script>

<template>
  <nav class="global-navigation-floating">
    <LanguageSwitcher
        :current-language="currentLanguage"
        @update:language="setLanguage"
    />

    <div class="v-divider"></div>
    <ThemeSwitcher />

    <template v-if="!isAuthPage">
      <div class="v-divider"></div>
      <LogoutButton @logout="handleLogout" />
    </template>
  </nav>
</template>