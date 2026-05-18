<script setup lang="ts">
import { Events } from '@/enums/events.enum'
import './RulePositionsButton.css'

defineEmits([Events.CLICK])
</script>

<template>
  <button class="rule-positions-button" type="button" @click="$emit(Events.CLICK)">
    <svg class="rule-positions-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16v10H4z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  </button>
</template>
