<script setup lang="ts">
import { useControlPanel } from '@/composables/useControlPanel'
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher.vue"
import ThemeSwitcher from '@/components/ThemeSwitcher/ThemeSwitcher.vue'
import NotificationBellButton from '@/components/NotificationBellButton/NotificationBellButton.vue'
import NotificationsDropdown from '@/components/NotificationsDropdown/NotificationsDropdown.vue'
import ProfileIconButton from '@/components/ProfileIconButton/ProfileIconButton.vue'
import ProfileForm from '@/components/ProfileForm/ProfileForm.vue'
import LogoutButton from '@/components/LogoutButton/LogoutButton.vue'
import type { ControlPanelProperties } from '@/interfaces/control-panel-properties.interface'
import './ControlPanel.css'

const properties = defineProps<ControlPanelProperties>()
const {
  currentLanguage,
  setLanguage,
  translations,
  isProfileModalOpen,
  openProfileModal,
  closeProfileModal,
  notificationsContainer,
  isNotificationsAvailable,
  unreadCount,
  notifications,
  isDropdownOpen,
  isLoadingNotifications,
  toggleDropdown
} = useControlPanel(properties)
</script>

<template>
  <div class="control-panel">
    <LanguageSwitcher
        :current-language="currentLanguage"
        @update:language="setLanguage"
    />
    <div class="v-divider"></div>
    <ThemeSwitcher />

    <template v-if="properties.showProfile">
      <div class="v-divider"></div>
      <ProfileIconButton @open="openProfileModal" />
    </template>

    <template v-if="isNotificationsAvailable">
      <div class="v-divider"></div>
      <div ref="notificationsContainer" class="notifications-control-wrapper">
        <NotificationBellButton
            :unread-count="unreadCount"
            :is-open="isDropdownOpen"
            @toggle="toggleDropdown"
        />

        <NotificationsDropdown
            :is-open="isDropdownOpen"
            :notifications="notifications"
            :is-loading="isLoadingNotifications"
            :title="translations.notifications.title"
            :empty-label="translations.notifications.empty"
        />
      </div>
    </template>

    <template v-if="properties.showLogout">
      <div class="v-divider"></div>
      <LogoutButton />
    </template>
  </div>

  <ProfileForm
      :is-open="isProfileModalOpen"
      :translations="translations.profile"
      @close="closeProfileModal"
  />
</template>
