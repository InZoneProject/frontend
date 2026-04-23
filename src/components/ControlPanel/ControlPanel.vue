<script setup lang="ts">
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher.vue"
import ThemeSwitcher from '@/components/ThemeSwitcher/ThemeSwitcher.vue'
import LogoutButton from '@/components/LogoutButton/LogoutButton.vue'
import type { ControlPanelProperties } from '@/interfaces/control-panel-properties.interface'
import './ControlPanel.css'

const properties = defineProps<ControlPanelProperties>()

const { currentLanguage, setLanguage } = useLanguageSwitcher()
</script>

<template>
  <div class="control-panel">
    <LanguageSwitcher
        :current-language="currentLanguage"
        @update:language="setLanguage"
    />
    <div class="v-divider"></div>
    <ThemeSwitcher />

    <template v-if="properties.showLogout">
      <div class="v-divider"></div>
      <LogoutButton />
    </template>
  </div>
</template>