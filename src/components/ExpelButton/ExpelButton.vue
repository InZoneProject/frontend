<script setup lang="ts">
import { Events } from '@/enums/events.enum'
import './ExpelButton.css'

defineEmits([Events.CLICK])
</script>

<template>
  <button class="expel-button" type="button" @click="$emit(Events.CLICK)">
    <svg class="expel-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M15.75 9V5.625c0-.621-.504-1.125-1.125-1.125h-9c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125h9c.621 0 1.125-.504 1.125-1.125V15" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M18 12H9m0 0 3-3m-3 3 3 3" />
    </svg>
  </button>
</template>

