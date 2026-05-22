<script setup lang="ts">
import type { BuildingMapEmits } from '@/modules/building/interfaces/building-map-emits.interface'
import type { BuildingMapProperties } from '@/modules/building/interfaces/building-map-properties.interface'
import { useBuildingMap } from '@/modules/building/composables/useBuildingMap'
import BuildingMapDoor from '@/modules/building/components/BuildingMapDoor/BuildingMapDoor.vue'
import BuildingMapBlockedPreview from '@/modules/building/components/BuildingMapBlockedPreview/BuildingMapBlockedPreview.vue'
import BuildingMapZoneRoom from '@/modules/building/components/BuildingMapZoneRoom/BuildingMapZoneRoom.vue'
import ZoneAccessRulesButton from '@/modules/building/components/ZoneAccessRulesButton/ZoneAccessRulesButton.vue'
import { Events } from '@/enums/events.enum'
import { IMAGE_UPLOAD_CONSTANTS } from '@/constants/image-upload.constants'
import { LENGTH } from '@/constants/length.constants'
import { EyeIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { BuildingMapMode } from '@/modules/building/enums/building-map-mode.enum'
import './BuildingMap.css'

const properties = defineProps<BuildingMapProperties>()
const emit = defineEmits<BuildingMapEmits>()

const {
  mapRef,
  gridRef,
  layerRef,
  mapStyle,
  previewZones,
  isResizingMap,
  isTransformingZone,
  isMapInteracting,
  isAddInteractionActive,
  areMapEditHelpersVisible,
  renderedZones,
  renderedDoors,
  activeScannedDoorIds,
  visibleEmployeesByZone,
  layerStyle,
  zoneStyle,
  zoneActionStyle,
  zoneTitleStyle,
  isZoneActionEligible,
  isZonePreviewed,
  getAddZoneHandles,
  getAddDoorHandles,
  setHoveredAddHandle,
  pressAddZoneHandle,
  clearHoveredAddHandle,
  clearMapHoverState,
  clearStaleAddHandleHover,
  setResizeHandleHover,
  setHoveredAddDoorHandle,
  pressAddDoorHandle,
  clearHoveredAddDoorHandle,
  isAddHandleHovered,
  addZoneFromHandle,
  addDoorFromHandle,
  startMove,
  startResize,
  editingZoneId,
  editingZoneTitle,
  zonePhotoUrl,
  startTitleEdit,
  setTitleInputRef,
  finishTitleEdit,
  cancelTitleEdit,
  handleMapMouseDown,
  uploadZonePhoto,
  handleDeleteZone,
  handleZonePhotoUpdate,
  handleDeleteDoor,
  handleOpenDoorReader,
  onWheel,
  zoomAtCenter,
  focusBuilding,
  setMode,
  blockedGeometryPreview
} = useBuildingMap(properties, emit)
</script>

<template>
  <section ref="mapRef" class="building-map" :class="{ 'is-resizing': isResizingMap, 'is-transforming-zone': isTransformingZone, 'is-view-mode': properties.mode === BuildingMapMode.VIEW }" :style="mapStyle" @mousedown="handleMapMouseDown" @mousemove="clearStaleAddHandleHover" @mouseleave="clearMapHoverState" @wheel="onWheel">
    <div v-if="editingZoneId > 0" class="building-map-edit-mode">
      {{ properties.editingZoneLabel }}
    </div>
    <div class="building-map-controls" @mousedown.stop>
      <button class="building-map-control-button" type="button" @click="zoomAtCenter(1)">+</button>
      <button class="building-map-control-button" type="button" @click="zoomAtCenter(-1)">-</button>
      <button class="building-map-control-button" type="button" @click="focusBuilding">⌖</button>
      <button
          class="building-map-control-button"
          type="button"
          @click="setMode(properties.mode === BuildingMapMode.VIEW ? BuildingMapMode.EDIT : BuildingMapMode.VIEW)"
      >
        <EyeIcon v-if="properties.mode === BuildingMapMode.EDIT" />
        <Cog6ToothIcon v-else />
      </button>
    </div>
    <div ref="gridRef" class="building-map-grid" />
    <div v-if="properties.loading" class="building-map-loader" aria-hidden="true" />
    <div ref="layerRef" class="building-map-layer" :style="layerStyle">
      <BuildingMapZoneRoom
          v-for="zone in renderedZones"
          :key="zone.zone_id"
          :zone="zone"
          :zone-style="zoneStyle(zone)"
          :is-preview="isZonePreviewed(zone.zone_id)"
          :is-current-floor="zone.floor_id === properties.currentFloorId || zone.is_transition_between_floors"
          :can-resize="properties.mode === BuildingMapMode.EDIT && (zone.floor_id === properties.currentFloorId || zone.is_transition_between_floors)"
          :can-delete="properties.deletableZoneIds.includes(zone.zone_id)"
          :employee-locations="visibleEmployeesByZone.get(zone.zone_id) || []"
          :photo-url="zonePhotoUrl(zone)"
          :is-view-mode="properties.mode === BuildingMapMode.VIEW"
          :is-interaction-disabled="properties.mode === BuildingMapMode.VIEW || properties.isEditingZone || editingZoneId > 0 || isAddInteractionActive"
          @start-move="startMove"
          @start-resize="startResize"
          @resize-hover="setResizeHandleHover"
          @delete-zone="handleDeleteZone"
          @update-zone-photo="handleZonePhotoUpdate"
          @open-employee-info="emit(Events.OPEN_EMPLOYEE_INFO, $event)"
      />
      <BuildingMapDoor
          v-for="door in renderedDoors"
          :key="door.door_id"
          :door="door"
          :is-current-floor="door.floor_id === properties.currentFloorId"
          :can-delete="door.door_id > 0 && properties.deletableDoorIds.includes(door.door_id)"
          :is-scan-active="activeScannedDoorIds.includes(door.door_id)"
          @delete-door="handleDeleteDoor(door.door_id, door.is_entrance)"
          @open-door-reader="handleOpenDoorReader(door.door_id)"
      />
      <div
          v-for="zone in renderedZones"
          :key="`actions:${zone.zone_id}`"
          class="building-map-zone-actions-overlay"
          :class="{ 'has-no-delete': !properties.deletableZoneIds.includes(zone.zone_id), 'is-action-eligible': isZoneActionEligible(zone) }"
          :style="zoneActionStyle(zone)"
          @mousedown.stop
          @click.stop
      >
        <label class="building-map-zone-action-button is-upload">
          <input type="file" :accept="IMAGE_UPLOAD_CONSTANTS.ACCEPT" @change="uploadZonePhoto(zone.zone_id, $event)" />
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16" />
          </svg>
        </label>
        <ZoneAccessRulesButton
            class="building-map-zone-action-button is-access-rules"
            @click="emit(Events.OPEN_ZONE_ACCESS_RULES, zone.zone_id)"
        />
        <button
            v-if="properties.deletableZoneIds.includes(zone.zone_id)"
            class="building-map-zone-action-button is-delete"
            type="button"
            @click="handleDeleteZone(zone.zone_id)"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <template v-if="areMapEditHelpersVisible">
        <button
            v-for="handle in getAddZoneHandles"
            :key="`probe:${handle.key}`"
            class="building-map-add-zone-probe"
            type="button"
            :style="handle.probeStyle"
            @mouseenter="setHoveredAddHandle(handle.key, $event)"
            @mousemove="setHoveredAddHandle(handle.key, $event)"
            @mouseleave="clearHoveredAddHandle"
            @blur="clearHoveredAddHandle"
            @mousedown.stop="pressAddZoneHandle(handle, $event)"
            @click.stop="addZoneFromHandle(handle, $event)"
        />
        <button
            v-for="handle in getAddZoneHandles"
            :key="handle.key"
            class="building-map-add-zone-handle"
            :class="[`is-${handle.side}`, `is-transition-${handle.transitionMode}`, { 'is-hovered': isAddHandleHovered(handle.key) }]"
            type="button"
            :style="handle.style"
            @mouseenter="setHoveredAddHandle(handle.key, $event)"
            @mousemove="setHoveredAddHandle(handle.key, $event)"
            @mouseleave="clearHoveredAddHandle"
            @blur="clearHoveredAddHandle"
            @mousedown.stop="pressAddZoneHandle(handle, $event)"
            @click.stop="addZoneFromHandle(handle, $event)"
        >
          <span
              v-for="segment in handle.transitionSegments"
              :key="`${handle.key}:${segment.start}:${segment.end}`"
              class="building-map-add-zone-transition-segment"
              :style="segment.style"
          />
        </button>
        <button
            v-for="handle in getAddDoorHandles"
            :key="handle.key"
            class="building-map-add-door-handle"
            :class="{ 'is-entrance': handle.payload.zone_from_id === null }"
            type="button"
            :style="handle.style"
            @mouseenter="setHoveredAddDoorHandle(handle.key)"
            @mouseleave="clearHoveredAddDoorHandle"
            @blur="clearHoveredAddDoorHandle"
            @mousedown.stop="pressAddDoorHandle(handle.key)"
            @click.stop="addDoorFromHandle(handle.payload)"
        >
          +
        </button>
      </template>
      <span
          v-for="zone in renderedZones"
          :key="`title:${zone.zone_id}`"
          class="building-map-zone-title-overlay"
          :class="{ 'is-foreign-floor': zone.floor_id !== properties.currentFloorId && !zone.is_transition_between_floors, 'is-view-mode': properties.mode === BuildingMapMode.VIEW }"
          :style="zoneTitleStyle(zone)"
          @dblclick.stop="properties.mode === BuildingMapMode.EDIT && (zone.floor_id === properties.currentFloorId || zone.is_transition_between_floors) ? startTitleEdit(zone.zone_id, zone.title) : undefined"
      >
        <input
            v-if="editingZoneId === zone.zone_id"
            :ref="setTitleInputRef"
            v-model="editingZoneTitle"
            class="building-map-zone-title-input"
            type="text"
            :maxlength="LENGTH.MAX_ZONE_TITLE_LENGTH"
            @mousedown.stop
            @click.stop
            @blur="finishTitleEdit"
            @keydown.enter.prevent="finishTitleEdit"
            @keydown.esc.prevent="cancelTitleEdit"
        />
        <template v-else>{{ zone.title }}</template>
      </span>
    </div>
    <BuildingMapBlockedPreview v-if="blockedGeometryPreview" :preview="blockedGeometryPreview" />
  </section>
</template>
