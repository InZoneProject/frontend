<script setup lang="ts">
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
</script>

<template>
  <div class="min-h-screen bg-(--color-bg-main) p-8">
    <ControlPanel :show-logout="true" />

    <div class="flex flex-col items-center justify-center mt-32 text-center">
      <h1 class="text-5xl font-black uppercase tracking-tighter text-(--color-text-main) mb-4">
        Organization Dashboard
      </h1>
      <div class="w-24 h-1 bg-(--color-primary-main) mb-6"></div>
      <p class="text-lg font-medium text-(--color-text-main) opacity-40 max-w-lg">
        This section is currently under development. Here you will be able to manage your organizations and their settings.
      </p>
    </div>
  </div>
</template>