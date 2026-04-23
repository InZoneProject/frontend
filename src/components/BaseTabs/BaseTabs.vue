<script setup lang="ts">
import { Events } from '@/enums/events.enum'
import type { BaseTabsProperties } from '@/interfaces/base-tabs-properties.interface'
import type { BaseTabsEmits } from '@/interfaces/base-tabs-emits.interface'
import './BaseTabs.css'

defineProps<BaseTabsProperties>()

defineEmits<BaseTabsEmits>()
</script>

<template>
  <div class="base-tabs">
    <button
        type="button"
        v-for="tab in tabs"
        :key="tab.id"
        class="base-tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="$emit(Events.UPDATE_ACTIVE_TAB, tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>