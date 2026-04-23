<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'
import '@/styles/main.css'

const { initializeTheme } = useThemeSwitcher()

onMounted(() => {
  initializeTheme()
})
</script>

<template>
  <div class="app-background">
    <div class="global-network-overlay"></div>
  </div>

  <RouterView />
</template>