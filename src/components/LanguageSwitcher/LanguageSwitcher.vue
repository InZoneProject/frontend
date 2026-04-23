<script setup lang="ts">
import type { LanguageSwitcherProperties } from '@/interfaces/language-switcher-properties.interface'
import type { LanguageSwitcherEmits } from '@/interfaces/language-switcher-emits.interface'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import './LanguageSwitcher.css'

defineProps<LanguageSwitcherProperties>()
defineEmits<LanguageSwitcherEmits>()

const { currentLanguage, toggleLanguage } = useLanguageSwitcher()
</script>

<template>
  <div class="language-switcher" @click="toggleLanguage">
    <svg
        class="language-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
      <circle cx="12" cy="12" r="9" stroke-width="1.5" />
      <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 3v18M3 12h18M9 3.3a9 9 0 010 17.4M15 3.3a9 9 0 000 17.4"
      />
    </svg>
    <span class="language-text">{{ currentLanguage.toUpperCase() }}</span>
  </div>
</template>