<script setup lang="ts">
import EditButton from '@/components/EditButton/EditButton.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { Events } from '@/enums/events.enum'
import type { BuildingInfoPanelEmits } from '@/modules/building/interfaces/building-info-panel-emits.interface'
import type { BuildingInfoPanelProperties } from '@/modules/building/interfaces/building-info-panel-properties.interface'
import './BuildingInfoPanel.css'

const properties = defineProps<BuildingInfoPanelProperties>()
const emit = defineEmits<BuildingInfoPanelEmits>()
const { translations } = useLanguageSwitcher()
</script>

<template>
  <section class="building-info-panel">
    <div class="building-info-main">
      <p class="building-info-label">{{ translations.organizationAdmin.buildingPage.info.label }}</p>
      <h1 class="building-info-title">{{ properties.building.title }}</h1>
      <p class="building-info-address">{{ properties.building.address || translations.organizationAdmin.buildingPage.info.emptyAddress }}</p>
    </div>

    <div class="building-info-meta">
      <div>
        <p class="building-info-label">{{ translations.organizationAdmin.buildingPage.info.createdAt }}</p>
        <p class="building-info-date">{{ properties.createdAtValue }}</p>
      </div>
      <div class="building-info-actions">
        <EditButton @click="emit(Events.EDIT)" />
        <DeleteButton @click="emit(Events.DELETE)" />
      </div>
    </div>
  </section>
</template>
