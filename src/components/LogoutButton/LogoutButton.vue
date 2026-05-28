<script setup lang="ts">
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal.vue'
import { useLogoutButton } from '@/composables/useLogoutButton'
import './LogoutButton.css'

const {
  commonTranslations,
  isConfirmOpen,
  openConfirm,
  closeConfirm,
  confirmLogout
} = useLogoutButton()
</script>

<template>
  <button
      class="logout-switcher"
      type="button"
      @click="openConfirm"
  >
    <svg
        class="logout-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
      <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  </button>

  <ConfirmationModal
      :is-open="isConfirmOpen"
      :loading="false"
      :title="commonTranslations.logoutConfirmTitle"
      :message="commonTranslations.logoutConfirmMessage"
      :confirm-label="commonTranslations.logoutConfirm"
      :cancel-label="commonTranslations.logoutCancel"
      @confirm="confirmLogout"
      @cancel="closeConfirm"
  />
</template>
