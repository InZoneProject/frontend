<script setup lang="ts">
import type { BuildingMapBlockedPreviewProperties } from '@/modules/building/interfaces/building-map-blocked-preview-properties.interface'
import { useBuildingMapBlockedPreview } from '@/modules/building/composables/useBuildingMapBlockedPreview'
import './BuildingMapBlockedPreview.css'

const properties = defineProps<BuildingMapBlockedPreviewProperties>()
const { zoneStyle, doorStyle } = useBuildingMapBlockedPreview(properties)
</script>

<template>
  <div class="building-map-blocked-preview">
    <p class="building-map-blocked-preview__title">{{ properties.preview.floor.floor_name }}</p>
    <div class="building-map-blocked-preview__map">
      <div
          v-for="zone in properties.preview.zones"
          :key="zone.zone_id"
          class="building-map-blocked-preview__zone"
          :class="{ 'is-transition': zone.is_transition_between_floors }"
          :style="zoneStyle(zone)"
      />
      <div
          v-for="door in properties.preview.doors"
          :key="door.door_id"
          class="building-map-blocked-preview__door"
          :class="{ 'is-highlighted': (properties.preview.highlightedDoorIds || [properties.preview.highlightedDoorId]).includes(door.door_id) }"
          :style="doorStyle(door)"
      />
    </div>
    <p class="building-map-blocked-preview__message">{{ properties.preview.message }}</p>
  </div>
</template>
