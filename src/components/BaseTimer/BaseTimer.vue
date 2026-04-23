<script setup lang="ts">
import { useBaseTimer } from '@/composables/useBaseTimer'
import { Events } from '@/enums/events.enum'
import type { BaseTimerProperties } from '@/interfaces/base-timer-properties.interface'
import type { BaseTimerEmits } from '@/interfaces/base-timer-emits.interface'
import './BaseTimer.css'

const properties = defineProps<BaseTimerProperties>()
const emit = defineEmits<BaseTimerEmits>()

const { timeLeft } = useBaseTimer(
    () => properties.value,
    () => emit(Events.FINISH)
)
</script>

<template>
  <div class="base-timer">
    <svg class="timer-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div class="timer-texts">
      <span class="timer-label">{{ properties.label }}</span>
      <span class="timer-value">{{ timeLeft }}</span>
    </div>
    <span class="timer-spacer" aria-hidden="true"></span>
  </div>
</template>
