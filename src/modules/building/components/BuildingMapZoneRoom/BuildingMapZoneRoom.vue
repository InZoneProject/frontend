<script setup lang="ts">
import type { BuildingMapZoneRoomEmits } from '@/modules/building/interfaces/building-map-zone-room-emits.interface'
import type { BuildingMapZoneRoomProperties } from '@/modules/building/interfaces/building-map-zone-room-properties.interface'
import { useBuildingMapZoneRoom } from '@/modules/building/composables/useBuildingMapZoneRoom'
import { BuildingMapResizeEdge } from '@/modules/building/enums/building-map-resize-edge.enum'
import { Events } from '@/enums/events.enum'
import './BuildingMapZoneRoom.css'

const properties = defineProps<BuildingMapZoneRoomProperties>()
const emit = defineEmits<BuildingMapZoneRoomEmits>()

const {
  startMove,
  startResize,
  setResizeHover,
  isActiveResize,
  isResizing,
  setZoneHover,
  isResizeControlsVisible,
  visibleEmployeeLocations,
  hiddenEmployeeLocationsCount,
  employeeGridStyle
} = useBuildingMapZoneRoom(properties, emit)

</script>

<template>
  <div
      class="building-map-zone"
      :class="{
      'is-transition': properties.zone.is_transition_between_floors,
      'is-preview': properties.isPreview,
      'is-foreign-floor': !properties.isCurrentFloor,
      'is-view-mode': properties.isViewMode,
      'is-resizing': isResizing
    }"
      :style="properties.zoneStyle"
      @mouseenter="setZoneHover(true)"
      @mouseleave="setZoneHover(false)"
      @mousedown="!properties.isInteractionDisabled && startMove($event)"
  >
    <img v-if="properties.photoUrl" class="building-map-zone-photo" :src="properties.photoUrl" alt="" draggable="false" />
    <div
        v-if="properties.isViewMode && properties.employeeLocations.length > 0"
        class="building-map-zone-employees"
        :style="employeeGridStyle"
    >
  <span
      v-for="employee in visibleEmployeeLocations"
      :key="employee.employee_id"
      class="building-map-zone-employee"
      :title="employee.full_name"
      @mousedown.stop
      @click.stop="emit(Events.OPEN_EMPLOYEE_INFO, employee)"
  >
    <img v-if="employee.photo" :src="employee.photo" alt="" draggable="false" />
    <span v-else>{{ employee.full_name.trim().charAt(0) || employee.email.trim().charAt(0) }}</span>
  </span>

      <span
          v-if="properties.isViewMode && hiddenEmployeeLocationsCount > 0"
          class="building-map-zone-employee is-overflow"
          :title="`${hiddenEmployeeLocationsCount}`"
      >
    +{{ hiddenEmployeeLocationsCount }}
  </span>
    </div>
    <template v-if="isResizeControlsVisible && !properties.isInteractionDisabled && properties.canResize">
      <button class="building-map-resize is-left" :class="{ 'is-active': isActiveResize(BuildingMapResizeEdge.LEFT) }" type="button" @mouseenter="setResizeHover(true)" @mouseleave="setResizeHover(false)" @mousedown="startResize($event, BuildingMapResizeEdge.LEFT)" />
      <button class="building-map-resize is-right" :class="{ 'is-active': isActiveResize(BuildingMapResizeEdge.RIGHT) }" type="button" @mouseenter="setResizeHover(true)" @mouseleave="setResizeHover(false)" @mousedown="startResize($event, BuildingMapResizeEdge.RIGHT)" />
      <button class="building-map-resize is-top" :class="{ 'is-active': isActiveResize(BuildingMapResizeEdge.TOP) }" type="button" @mouseenter="setResizeHover(true)" @mouseleave="setResizeHover(false)" @mousedown="startResize($event, BuildingMapResizeEdge.TOP)" />
      <button class="building-map-resize is-bottom" :class="{ 'is-active': isActiveResize(BuildingMapResizeEdge.BOTTOM) }" type="button" @mouseenter="setResizeHover(true)" @mouseleave="setResizeHover(false)" @mousedown="startResize($event, BuildingMapResizeEdge.BOTTOM)" />
      <button class="building-map-resize is-top-left" :class="{ 'is-active': isActiveResize(BuildingMapResizeEdge.TOP_LEFT) }" type="button" @mouseenter="setResizeHover(true)" @mouseleave="setResizeHover(false)" @mousedown="startResize($event, BuildingMapResizeEdge.TOP_LEFT)" />
      <button class="building-map-resize is-top-right" :class="{ 'is-active': isActiveResize(BuildingMapResizeEdge.TOP_RIGHT) }" type="button" @mouseenter="setResizeHover(true)" @mouseleave="setResizeHover(false)" @mousedown="startResize($event, BuildingMapResizeEdge.TOP_RIGHT)" />
      <button class="building-map-resize is-bottom-left" :class="{ 'is-active': isActiveResize(BuildingMapResizeEdge.BOTTOM_LEFT) }" type="button" @mouseenter="setResizeHover(true)" @mouseleave="setResizeHover(false)" @mousedown="startResize($event, BuildingMapResizeEdge.BOTTOM_LEFT)" />
      <button class="building-map-resize is-bottom-right" :class="{ 'is-active': isActiveResize(BuildingMapResizeEdge.BOTTOM_RIGHT) }" type="button" @mouseenter="setResizeHover(true)" @mouseleave="setResizeHover(false)" @mousedown="startResize($event, BuildingMapResizeEdge.BOTTOM_RIGHT)" />
    </template>
  </div>
</template>
