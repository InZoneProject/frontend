<script setup lang="ts">
import { useDateFormatter } from '@/composables/useDateFormatter'
import type { NotificationListItemProperties } from '@/interfaces/notification-list-item-properties.interface'
import './NotificationListItem.css'

const properties = defineProps<NotificationListItemProperties>()
const { formatDate } = useDateFormatter()
</script>

<template>
  <div class="notification-list-item" :class="{ 'is-unread': !properties.notification.is_read }">
    <div class="notification-list-item-header">
      <h4 class="notification-list-item-title">{{ properties.notification.title }}</h4>
      <span class="notification-list-item-date">{{ formatDate(properties.notification.created_at) }}</span>
    </div>
    <p class="notification-list-item-message">{{ properties.notification.message }}</p>
  </div>
</template>
