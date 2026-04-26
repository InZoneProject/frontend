<script setup lang="ts">
import { Events } from '@/enums/events.enum'
import './EditButton.css'

defineEmits([Events.CLICK])
</script>

<template>
  <button class="edit-button" type="button" @click="$emit(Events.CLICK)">
    <svg class="edit-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-6" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.4 3.6a2.1 2.1 0 113 3L12 16l-4 1 1-4 9.4-9.4z" />
    </svg>
  </button>
</template>
