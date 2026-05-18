<script setup lang="ts">
import { Events } from '@/enums/events.enum'
import DoorReaderButton from '@/modules/building/components/DoorReaderButton/DoorReaderButton.vue'
import type { BuildingMapDoorEmits } from '@/modules/building/interfaces/building-map-door-emits.interface'
import type { BuildingMapDoorProperties } from '@/modules/building/interfaces/building-map-door-properties.interface'
import { useBuildingMapDoor } from '@/modules/building/composables/useBuildingMapDoor'
import './BuildingMapDoor.css'

const properties = defineProps<BuildingMapDoorProperties>()
const emit = defineEmits<BuildingMapDoorEmits>()

const { doorClasses } = useBuildingMapDoor(properties)
</script>

<template>
  <div
      class="building-map-door"
      :class="doorClasses()"
      :style="properties.door.style"
  >
    <DoorReaderButton
        v-if="properties.isCurrentFloor && properties.areActionsVisible"
        class="building-map-door-reader-action"
        :has-reader="properties.door.rfid_reader_id !== null"
        @click="emit(Events.OPEN_DOOR_READER)"
    />
    <button
        v-if="properties.isCurrentFloor && properties.areActionsVisible && properties.canDelete"
        class="building-map-door-delete"
        type="button"
        @mousedown.stop
        @click.stop="emit(Events.DELETE_DOOR)"
    >
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
    <span
        v-if="properties.isCurrentFloor"
        class="building-map-door-reader"
        :class="{ 'has-reader': properties.door.rfid_reader_id !== null }"
    />
  </div>
</template>
