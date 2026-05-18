<script setup lang="ts">
import { Events } from '@/enums/events.enum'
import type { DoorReaderButtonProperties } from '@/modules/building/interfaces/door-reader-button-properties.interface'
import './DoorReaderButton.css'

defineProps<DoorReaderButtonProperties>()
defineEmits([Events.CLICK])
</script>

<template>
  <button
      class="door-reader-button"
      type="button"
      @mousedown.stop
      @click.stop="$emit(Events.CLICK)"
  >
    <svg class="door-reader-button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M7 8h10v8H7z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 4h6M12 16v4M8 20h8" />
    </svg>
  </button>
</template>
