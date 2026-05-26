<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseTabs from '@/components/BaseTabs/BaseTabs.vue'
import DataTable from '@/components/DataTable/DataTable.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import EditButton from '@/components/EditButton/EditButton.vue'
import ExpelButton from '@/components/ExpelButton/ExpelButton.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import EmployeeMovementReportButton from '@/modules/building/components/EmployeeMovementReportButton/EmployeeMovementReportButton.vue'
import { useBuildingSidebar } from '@/modules/building/composables/useBuildingSidebar'
import type { BuildingViewSidebarEmits } from '@/modules/building/interfaces/building-view-sidebar-emits.interface'
import type { BuildingViewSidebarProperties } from '@/modules/building/interfaces/building-view-sidebar-properties.interface'
import type { CurrentBuildingEmployee } from '@/modules/building/interfaces/current-building-employee.interface'
import type { FloorItem } from '@/modules/building/interfaces/floor-item.interface'
import './BuildingSidebar.css'

const properties = defineProps<BuildingViewSidebarProperties>()
const emit = defineEmits<BuildingViewSidebarEmits>()

const {
  sidePanelTabs,
  toolbarClasses,
  getFloorRowClasses,
  selectSidePanelTab,
  selectFloor,
  updateFloorsSearch,
  updateBuildingEmployeesSearch,
  updateFloorsOffset,
  updateBuildingEmployeesOffset,
  toggleFloorsCollapsed,
  openCreateFloorModal,
  openEditFloorModal,
  openDeleteFloorModal,
  startFloorDrag,
  moveFloorDrag,
  finishFloorDrag,
  cancelFloorDrag,
  openBuildingEmployeeInfo,
  openEmployeeMovementReport,
  openExpelModal
} = useBuildingSidebar(properties, emit)
</script>

<template>
  <aside class="building-floors-panel">
    <div
        class="building-floors-toolbar"
        :class="toolbarClasses"
    >
      <BaseButton
          class="building-floors-collapse-button"
          type="button"
          variant="secondary"
          :loading="false"
          :disabled="false"
          @click="toggleFloorsCollapsed"
      >
        {{ isFloorsCollapsed ? translations.floors.expand : translations.floors.collapse }}
      </BaseButton>

      <BaseButton
          class="building-floors-add-button"
          type="button"
          variant="primary"
          :loading="false"
          :disabled="isFloorsCollapsed || (!properties.isEmployeesHidden && sidePanelTab === 'employees')"
          @click="openCreateFloorModal"
      >
        {{ translations.floors.add }}
      </BaseButton>
    </div>
    <p class="building-floors-collapsed-note">{{ translations.floors.expandHint }}</p>

    <div class="building-floors-content">
      <BaseTabs
          v-if="!properties.isEmployeesHidden"
          :tabs="sidePanelTabs"
          :active-tab="sidePanelTab"
          @update:active-tab="selectSidePanelTab"
      />

      <template v-if="properties.isEmployeesHidden || sidePanelTab === 'floors'">
        <DataTable
            :search-query="floorsSearch"
            :items="displayedFloors"
            :offset="floorsOffset"
            :limit="floorsLimit"
            :total="floorsTotal"
            :loading="isLoadingFloors"
            :placeholder="translations.floors.searchPlaceholder"
            :empty-text="translations.floors.empty"
            :loading-text="translations.floors.loading"
            :interactive-rows="true"
            :is-drag-over="false"
            max-height="100%"
            @update:search-query="updateFloorsSearch"
            @update:offset="updateFloorsOffset"
        >
          <template #header>
            <tr>
              <th class="w-[26%]">{{ translations.floors.headers.position }}</th>
              <th class="w-[42%]">{{ translations.floors.headers.name }}</th>
              <th class="w-[32%]">{{ translations.floors.headers.actions }}</th>
            </tr>
          </template>
          <template #default="{ item }: { item: FloorItem }">
            <tr
                class="building-floor-row"
                :class="getFloorRowClasses(item)"
                draggable="true"
                @click="selectFloor(item.floor_id)"
                @dragstart="startFloorDrag(item, $event)"
                @dragenter.prevent="moveFloorDrag(item)"
                @dragover.prevent
                @drop.prevent="finishFloorDrag"
                @dragend="cancelFloorDrag"
            >
              <td>
                <span class="building-floor-number">{{ item.floor_number }}</span>
              </td>
              <td>
                <strong class="building-floor-name">{{ item.floor_name }}</strong>
              </td>
              <td @click.stop>
                <div class="building-floor-actions">
                  <EditButton @click="openEditFloorModal(item)" />
                  <DeleteButton v-if="item.can_delete" @click="openDeleteFloorModal(item.floor_id)" />
                </div>
              </td>
            </tr>
          </template>
        </DataTable>
        <ErrorMessage :message="properties.floorsErrorMessage || ''" />
      </template>

      <template v-else>
        <DataTable
            :search-query="buildingEmployeesSearch"
            :items="currentBuildingEmployees"
            :offset="buildingEmployeesOffset"
            :limit="buildingEmployeesLimit"
            :total="buildingEmployeesTotal"
            :loading="isLoadingBuildingEmployees"
            :placeholder="translations.employees.searchPlaceholder"
            :empty-text="translations.employees.empty"
            :loading-text="translations.employees.loading"
            :interactive-rows="true"
            :is-drag-over="false"
            max-height="100%"
            @update:search-query="updateBuildingEmployeesSearch"
            @update:offset="updateBuildingEmployeesOffset"
        >
          <template #header>
            <tr>
              <th class="w-[76%]">{{ translations.employees.headers.user }}</th>
              <th class="w-[24%] building-employee-actions-header">{{ translations.employees.headers.actions }}</th>
            </tr>
          </template>
          <template #default="{ item }: { item: CurrentBuildingEmployee }">
            <tr class="building-employee-row" @click="openBuildingEmployeeInfo(item)">
              <td>
                <div class="building-employee-cell">
                  <img v-if="item.photo" :src="item.photo" :alt="item.full_name || item.email" class="building-employee-avatar" />
                  <span v-else class="building-employee-avatar is-empty">{{ (item.full_name || item.email || '?').charAt(0) }}</span>
                  <span class="building-employee-text">
                    <span class="building-employee-name">{{ item.full_name || item.email }}</span>
                    <span class="building-employee-email">{{ item.email || '—' }}</span>
                  </span>
                </div>
              </td>
              <td class="building-employee-actions-cell" @click.stop>
                <div class="building-employee-actions">
                  <EmployeeMovementReportButton @click="openEmployeeMovementReport(item)" />
                  <ExpelButton @click="openExpelModal(item)" />
                </div>
              </td>
            </tr>
          </template>
        </DataTable>
        <ErrorMessage :message="properties.buildingEmployeesErrorMessage || ''" />
      </template>
    </div>
  </aside>
</template>
