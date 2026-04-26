<script setup lang="ts">
import { useProfileIconButton } from '@/composables/useProfileIconButton'
import type { ProfileIconButtonEmits } from '@/interfaces/profile-icon-button-emits.interface'
import './ProfileIconButton.css'

const emit = defineEmits<ProfileIconButtonEmits>()
const { handleClick } = useProfileIconButton(emit)
</script>

<template>
  <button
      type="button"
      class="profile-icon-button"
      @click="handleClick"
  >
    <svg
        class="profile-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
      <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
          d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.314 0-6 2.015-6 4.5V20h12v-1.5c0-2.485-2.686-4.5-6-4.5z"
      />
    </svg>
  </button>
</template>
