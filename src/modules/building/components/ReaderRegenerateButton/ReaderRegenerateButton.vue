<script setup lang="ts">
import { Events } from '@/enums/events.enum'
import type { ReaderRegenerateButtonEmits } from '@/modules/building/interfaces/reader-regenerate-button-emits.interface'
import './ReaderRegenerateButton.css'

defineEmits<ReaderRegenerateButtonEmits>()
</script>

<template>
  <button class="reader-regenerate-button" type="button" @click="$emit(Events.CLICK)">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 4v6h6M20 20v-6h-6M20 9a7 7 0 00-11.6-3.2L4 10m16 4-4.4 4.2A7 7 0 014 15" />
    </svg>
  </button>
</template>
