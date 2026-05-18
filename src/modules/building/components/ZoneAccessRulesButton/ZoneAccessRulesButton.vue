<script setup lang="ts">
import { Events } from '@/enums/events.enum'
import './ZoneAccessRulesButton.css'

defineEmits([Events.CLICK])
</script>

<template>
  <button class="zone-access-rules-button" type="button" @click="$emit(Events.CLICK)">
    <svg class="zone-access-rules-button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M10.3 3.5h3.4l.7 2.2a6.9 6.9 0 0 1 1.5.9l2.2-.6 1.7 2.9-1.6 1.6c.1.5.2 1 .2 1.5s-.1 1-.2 1.5l1.6 1.6-1.7 2.9-2.2-.6a6.9 6.9 0 0 1-1.5.9l-.7 2.2h-3.4l-.7-2.2a6.9 6.9 0 0 1-1.5-.9l-2.2.6-1.7-2.9 1.6-1.6a6.1 6.1 0 0 1 0-3l-1.6-1.6 1.7-2.9 2.2.6a6.9 6.9 0 0 1 1.5-.9z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
    </svg>
  </button>
</template>
