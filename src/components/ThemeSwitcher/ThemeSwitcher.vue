<script setup lang="ts">
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'
import './ThemeSwitcher.css'

const { isDark, toggleTheme } = useThemeSwitcher()
</script>

<template>
  <button @click="toggleTheme" class="theme-switcher">
    <svg
        v-if="isDark"
        class="theme-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
      <circle cx="12" cy="12" r="5" stroke-width="1.5" />
      <path
          stroke-linecap="round"
          stroke-width="1.5"
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
      />
    </svg>

    <svg
        v-else
        class="theme-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
      <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  </button>
</template>