<script setup lang="ts">
import NotificationListItem from '@/components/NotificationListItem/NotificationListItem.vue'
import { useNotificationsDropdownComponent } from '@/composables/useNotificationsDropdownComponent'
import type { NotificationsDropdownProperties } from '@/interfaces/notifications-dropdown-properties.interface'
import './NotificationsDropdown.css'

const properties = defineProps<NotificationsDropdownProperties>()
const emit = defineEmits<{ (event: 'load-more'): void }>()
const { handleScroll } = useNotificationsDropdownComponent(emit)
</script>

<template>
  <Transition name="notifications-dropdown-fade">
    <div v-if="properties.isOpen" class="notifications-dropdown">
      <div class="notifications-dropdown-header">
        <h3 class="notifications-dropdown-title">{{ properties.title }}</h3>
      </div>

      <div class="notifications-dropdown-content" @scroll="handleScroll">
        <div v-if="properties.isLoading && properties.notifications.length === 0" class="notifications-dropdown-state">...</div>
        <div v-else-if="properties.notifications.length === 0" class="notifications-dropdown-state">{{ properties.emptyLabel }}</div>
        <div v-else class="notifications-dropdown-list">
          <NotificationListItem
              v-for="notification in properties.notifications"
              :key="notification.notification_id"
              :notification="notification"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>
