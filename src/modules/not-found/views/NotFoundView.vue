<script setup lang="ts">
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import { useAuthStore } from '@/stores/auth.store'
import './NotFoundView.css'

const authStore = useAuthStore()
</script>

<template>
  <main class="not-found-page">
    <ControlPanel
        :show-logout="authStore.isAuthenticated"
        :show-notifications="authStore.isOrgAdminAuth && authStore.isVerified"
        :show-profile="authStore.isOrgAdminAuth && authStore.isVerified"
    />

    <section class="not-found-card">
      <p class="not-found-label">404</p>
      <h1 class="not-found-title">Сторінку не знайдено</h1>
      <p class="not-found-text">Перевірте адресу або поверніться до доступної сторінки в панелі керування.</p>
    </section>
  </main>
</template>
