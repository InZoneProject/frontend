<script setup lang="ts">
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import BuildingInfoPanel from '@/modules/building/components/BuildingInfoPanel/BuildingInfoPanel.vue'
import BuildingMap from '@/modules/building/components/BuildingMap/BuildingMap.vue'
import BuildingSidebar from '@/modules/building/components/BuildingViewSidebar/BuildingSidebar.vue'
import ZoneCreateModal from '@/modules/building/components/ZoneCreateModal/ZoneCreateModal.vue'
import BuildingUpsertModal from '@/components/BuildingUpsertModal/BuildingUpsertModal.vue'
import FloorUpsertModal from '@/modules/building/components/FloorUpsertModal/FloorUpsertModal.vue'
import DoorReaderModal from '@/modules/building/components/DoorReaderModal/DoorReaderModal.vue'
import ReaderUpsertModal from '@/modules/building/components/ReaderUpsertModal/ReaderUpsertModal.vue'
import ZoneAccessRulesModal from '@/modules/building/components/ZoneAccessRulesModal/ZoneAccessRulesModal.vue'
import EmployeeMovementReportModal from '@/modules/building/components/EmployeeMovementReportModal/EmployeeMovementReportModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal.vue'
import OrganizationMemberInfo from '@/components/OrganizationMemberInfo/OrganizationMemberInfo.vue'
import OrganizationMemberPositions from '@/components/OrganizationMemberPositions/OrganizationMemberPositions.vue'
import PositionUpsertModal from '@/components/PositionUpsertModal/PositionUpsertModal.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useBuildingView } from '@/modules/building/composables/useBuildingView'
import './BuildingView.css'

const { translations, currentLanguage } = useLanguageSwitcher()
const {
  building,
  formatDate,
  formattedCreatedAt,
  displayedFloors,
  zones,
  transitionValidationZones,
  transitionValidationDoors,
  visibleDeletableZoneIds,
  visibleDeletableDoorIds,
  deletableDoorIds,
  doors,
  currentBuildingEmployees,
  sidePanelTab,
  selectedFloorId,
  floorsSearch,
  buildingEmployeesSearch,
  floorsOffset,
  buildingEmployeesOffset,
  floorsLimit,
  buildingEmployeesLimit,
  floorsTotal,
  buildingEmployeesTotal,
  viewport,
  buildingMapMode,
  areSidebarTabsHidden,
  isFloorsCollapsed,
  isBuildingMapExpanded,
  isLoadingBuilding,
  buildingErrorMessage,
  isLoadingFloors,
  floorsErrorMessage,
  isLoadingBuildingEmployees,
  buildingEmployeesErrorMessage,
  isExpelModalOpen,
  isExpellingMember,
  expelMemberErrorMessage,
  employeeForMovementReport,
  movementReportDateValue,
  movementReportMinDate,
  movementReportMaxDate,
  isMovementReportModalOpen,
  isDownloadingMovementReport,
  movementReportErrorMessage,
  canDownloadMovementReport,
  isLoadingMap,
  mapErrorMessage,
  selectedMemberProfile,
  isMemberInfoModalOpen,
  isLoadingMemberProfile,
  memberInfoErrorMessage,
  isMemberPositionsModalOpen,
  isPositionsEditMode,
  isLoadingMemberPositions,
  isLoadingAvailablePositions,
  memberPositionsErrorMessage,
  assignedMemberPositions,
  availableMemberPositions,
  assignedPositionsSearchValue,
  availablePositionsSearchValue,
  memberPositionsLimit,
  isPositionUpsertModalOpen,
  positionModalMode,
  positionRoleValue,
  positionDescriptionValue,
  isPositionSubmitting,
  positionFormErrorMessage,
  canSubmitPositionForm,
  isDeletePositionModalOpen,
  isDeletingPosition,
  deletePositionErrorMessage,
  assignedPositionsOffset,
  assignedPositionsTotal,
  availablePositionsOffset,
  availablePositionsTotal,
  isBuildingModalOpen,
  buildingTitleValue,
  buildingAddressValue,
  isBuildingSubmitting,
  buildingFormErrorMessage,
  canSubmitBuilding,
  isFloorModalOpen,
  floorModalMode,
  floorNameValue,
  isFloorSubmitting,
  floorFormErrorMessage,
  canSubmitFloor,
  isZoneCreateModalOpen,
  zoneTitleValue,
  zoneIsTransitionBetweenFloors,
  zoneCanCreateTransition,
  zoneHideTypeTabs,
  zoneCreateErrorMessage,
  isZoneSubmitting,
  isEditingZone,
  accessRulesZoneId,
  accessRulesZoneTitle,
  canSubmitZone,
  draggedFloorId,
  isDeleteBuildingModalOpen,
  deleteBuildingErrorMessage,
  floorToDeleteId,
  isDeletingFloor,
  deleteFloorErrorMessage,
  zoneToDeleteId,
  isDeletingZone,
  doorToDelete,
  isDeletingDoor,
  readerDoorId,
  selectedDoorReader,
  availableReaders,
  readersSearch,
  readersOffset,
  readersLimit,
  readersTotal,
  isLoadingReaders,
  readerErrorMessage,
  generatedReaderToken,
  isReaderModalOpen,
  readerModalMode,
  readerNameValue,
  isReaderSubmitting,
  readerToDelete,
  isDeletingReader,
  readerToRegenerate,
  isRegeneratingReaderToken,
  readerTokenCopySuccessMessage,
  canSubmitReader,
  expelModalMessage,
  openEditBuildingModal,
  closeBuildingModal,
  submitBuilding,
  openCreateFloorModal,
  openEditFloorModal,
  closeFloorModal,
  submitFloor,
  startFloorDrag,
  moveFloorDrag,
  finishFloorDrag,
  cancelFloorDrag,
  openDeleteFloorModal,
  closeDeleteFloorModal,
  confirmDeleteFloor,
  openDeleteBuildingModal,
  closeDeleteBuildingModal,
  confirmDeleteBuilding,
  updateViewport,
  updateBuildingMapMode,
  selectSidePanelTab,
  openBuildingEmployeeInfo,
  openEmployeeLocationInfo,
  openEmployeeMovementReport,
  closeEmployeeMovementReport,
  downloadEmployeeMovementReport,
  openExpelModal,
  closeExpelModal,
  confirmExpelMember,
  closeMemberInfoModal,
  closeMemberPositionsModal,
  viewMemberPositions,
  backToMemberInfo,
  startEditMemberPositions,
  finishEditMemberPositions,
  openCreatePositionModal,
  openEditPositionModal,
  closePositionUpsertModal,
  submitPosition,
  openDeletePositionModal,
  closeDeletePositionModal,
  confirmDeletePosition,
  assignPositionToMember,
  unassignPositionFromMember,
  getRoleLabel,
  toggleFloorsCollapsed,
  commitZoneGeometry,
  shiftZone,
  updateZoneTitle,
  updateZonePhoto,
  openZoneAccessRulesModal,
  closeZoneAccessRulesModal,
  addZone,
  closeZoneCreateModal,
  submitZone,
  openDeleteZoneModal,
  closeDeleteZoneModal,
  confirmDeleteZone,
  addDoor,
  openDeleteDoorModal,
  closeDeleteDoorModal,
  confirmDeleteDoor,
  openDoorReaderModal,
  closeDoorReaderModal,
  assignReaderToDoor,
  unassignReaderFromDoor,
  openRegenerateReaderTokenModal,
  closeRegenerateReaderTokenModal,
  confirmRegenerateReaderToken,
  openDeleteReaderModal,
  closeDeleteReaderModal,
  confirmDeleteReader,
  openCreateReaderModal,
  openEditReaderModal,
  closeReaderModal,
  submitReader,
  copyGeneratedReaderToken
} = useBuildingView()
</script>

<template>
  <div class="building-page">
    <ControlPanel :show-logout="true" :show-notifications="true" :show-profile="true" />

    <div class="building-layout-grid" :class="{ 'is-floors-collapsed': isFloorsCollapsed, 'is-map-expanded': isBuildingMapExpanded }">
      <BuildingSidebar
          :translations="translations.organizationAdmin.buildingPage"
          :displayed-floors="displayedFloors"
          :current-building-employees="currentBuildingEmployees"
          :side-panel-tab="sidePanelTab"
          :selected-floor-id="selectedFloorId"
          :floors-search="floorsSearch"
          :building-employees-search="buildingEmployeesSearch"
          :floors-offset="floorsOffset"
          :building-employees-offset="buildingEmployeesOffset"
          :floors-limit="floorsLimit"
          :building-employees-limit="buildingEmployeesLimit"
          :floors-total="floorsTotal"
          :building-employees-total="buildingEmployeesTotal"
          :is-floors-collapsed="isFloorsCollapsed"
          :is-loading-floors="isLoadingFloors"
          :is-loading-building-employees="isLoadingBuildingEmployees"
          :floors-error-message="floorsErrorMessage"
          :building-employees-error-message="buildingEmployeesErrorMessage"
          :is-employees-hidden="areSidebarTabsHidden"
          :dragged-floor-id="draggedFloorId"
          @update:floors-search="floorsSearch = $event"
          @update:building-employees-search="buildingEmployeesSearch = $event"
          @update:floors-offset="floorsOffset = $event"
          @update:building-employees-offset="buildingEmployeesOffset = $event"
          @update:selected-floor-id="selectedFloorId = $event"
          @select-side-panel-tab="selectSidePanelTab"
          @toggle-floors-collapsed="toggleFloorsCollapsed"
          @open-create-floor-modal="openCreateFloorModal"
          @open-edit-floor-modal="openEditFloorModal"
          @open-delete-floor-modal="openDeleteFloorModal"
          @start-floor-drag="startFloorDrag"
          @move-floor-drag="moveFloorDrag"
          @finish-floor-drag="finishFloorDrag"
          @cancel-floor-drag="cancelFloorDrag"
          @open-building-employee-info="openBuildingEmployeeInfo"
          @open-employee-movement-report="openEmployeeMovementReport"
          @open-expel-modal="openExpelModal"
      />

      <section class="building-info-column">
        <BuildingInfoPanel
            :building="building"
            :created-at-value="formattedCreatedAt"
            @edit="openEditBuildingModal"
            @delete="openDeleteBuildingModal"
        />
        <div v-if="isLoadingBuilding" class="building-loading-line" />
        <ErrorMessage :message="buildingErrorMessage" />
      </section>

      <BuildingMap
          :key="`${building.building_id}:${selectedFloorId}`"
          :zones="zones"
          :transition-validation-zones="transitionValidationZones"
          :transition-validation-doors="transitionValidationDoors"
          :deletable-zone-ids="visibleDeletableZoneIds"
          :deletable-door-ids="visibleDeletableDoorIds"
          :doors="doors"
          :viewport="viewport"
          :building-id="building.building_id"
          :current-floor-id="selectedFloorId"
          :mode="buildingMapMode"
          :loading="isLoadingMap"
          :new-zone-title="translations.organizationAdmin.buildingPage.zone.defaultTitle"
          :is-editing-zone="isEditingZone"
          :is-zone-create-modal-open="isZoneCreateModalOpen"
          :editing-zone-label="translations.organizationAdmin.buildingPage.zone.editingTitle"
          :blocked-zone-collision-message="translations.organizationAdmin.buildingPage.preview.blockedZoneCollision"
          :blocked-door-between-message="translations.organizationAdmin.buildingPage.preview.blockedDoorBetween"
          :blocked-entrance-door-message="translations.organizationAdmin.buildingPage.preview.blockedEntranceDoor"
          @update:viewport="updateViewport"
          @update:mode="updateBuildingMapMode"
          @commit-zone-geometry="commitZoneGeometry"
          @shift-zone="shiftZone"
          @update-zone-title="updateZoneTitle"
          @update-zone-photo="updateZonePhoto"
          @open-zone-access-rules="openZoneAccessRulesModal"
          @add-zone="addZone"
          @delete-zone="openDeleteZoneModal"
          @add-door="addDoor"
          @delete-door="openDeleteDoorModal"
          @open-door-reader="openDoorReaderModal"
          @open-employee-info="openEmployeeLocationInfo"
      />
      <div class="building-map-error">
        <ErrorMessage :message="mapErrorMessage" />
      </div>
    </div>

    <BuildingUpsertModal
        :is-open="isBuildingModalOpen"
        mode="edit"
        :title-value="buildingTitleValue"
        :address-value="buildingAddressValue"
        :loading="isBuildingSubmitting"
        :can-submit="canSubmitBuilding"
        :error-message="buildingFormErrorMessage"
        :translations="translations.organizationAdmin.page.modals.buildingForm"
        @update:title-value="buildingTitleValue = $event"
        @update:address-value="buildingAddressValue = $event"
        @submit="submitBuilding"
        @cancel="closeBuildingModal"
    />

    <FloorUpsertModal
        :is-open="isFloorModalOpen"
        :mode="floorModalMode"
        :name-value="floorNameValue"
        :loading="isFloorSubmitting"
        :can-submit="canSubmitFloor"
        :error-message="floorFormErrorMessage"
        :translations="translations.organizationAdmin.buildingPage.floorForm"
        @update:name-value="floorNameValue = $event"
        @submit="submitFloor"
        @cancel="closeFloorModal"
    />

    <ZoneCreateModal
        :is-open="isZoneCreateModalOpen"
        :title-value="zoneTitleValue"
        :is-transition-between-floors="zoneIsTransitionBetweenFloors"
        :can-create-transition="zoneCanCreateTransition"
        :hide-type-tabs="zoneHideTypeTabs"
        :error-message="zoneCreateErrorMessage"
        :loading="isZoneSubmitting"
        :can-submit="canSubmitZone"
        @update:title-value="zoneTitleValue = $event"
        @update:is-transition-between-floors="zoneIsTransitionBetweenFloors = $event"
        @submit="submitZone"
        @cancel="closeZoneCreateModal"
    />

    <ConfirmationModal
        :is-open="isDeleteBuildingModalOpen"
        :loading="false"
        :error-message="deleteBuildingErrorMessage"
        :title="translations.organizationAdmin.buildingPage.deleteBuilding.title"
        :message="translations.organizationAdmin.buildingPage.deleteBuilding.message"
        :confirm-label="translations.organizationAdmin.buildingPage.deleteBuilding.confirm"
        :cancel-label="translations.organizationAdmin.buildingPage.deleteBuilding.cancel"
        @confirm="confirmDeleteBuilding"
        @cancel="closeDeleteBuildingModal"
    />

    <ConfirmationModal
        :is-open="floorToDeleteId > 0"
        :loading="isDeletingFloor"
        :error-message="deleteFloorErrorMessage"
        :title="translations.organizationAdmin.buildingPage.deleteFloor.title"
        :message="translations.organizationAdmin.buildingPage.deleteFloor.message"
        :confirm-label="translations.organizationAdmin.buildingPage.deleteFloor.confirm"
        :cancel-label="translations.organizationAdmin.buildingPage.deleteFloor.cancel"
        @confirm="confirmDeleteFloor"
        @cancel="closeDeleteFloorModal"
    />

    <ConfirmationModal
        :is-open="zoneToDeleteId > 0"
        :loading="isDeletingZone"
        :title="translations.organizationAdmin.buildingPage.deleteZone.title"
        :message="translations.organizationAdmin.buildingPage.deleteZone.message"
        :confirm-label="translations.organizationAdmin.buildingPage.deleteZone.confirm"
        :cancel-label="translations.organizationAdmin.buildingPage.deleteZone.cancel"
        @confirm="confirmDeleteZone"
        @cancel="closeDeleteZoneModal"
    />

    <ConfirmationModal
        :is-open="doorToDelete !== null"
        :loading="isDeletingDoor"
        :title="translations.organizationAdmin.buildingPage.deleteDoor.title"
        :message="translations.organizationAdmin.buildingPage.deleteDoor.message"
        :confirm-label="translations.organizationAdmin.buildingPage.deleteDoor.confirm"
        :cancel-label="translations.organizationAdmin.buildingPage.deleteDoor.cancel"
        @confirm="confirmDeleteDoor"
        @cancel="closeDeleteDoorModal"
    />

    <DoorReaderModal
        :is-open="readerDoorId > 0"
        :selected-reader="selectedDoorReader"
        :readers="availableReaders"
        :search="readersSearch"
        :offset="readersOffset"
        :limit="readersLimit"
        :total="readersTotal"
        :loading="isLoadingReaders"
        :error-message="readerErrorMessage"
        :generated-token="generatedReaderToken"
        :copy-success-message="readerTokenCopySuccessMessage"
        :translations="translations.organizationAdmin.buildingPage.doorReader"
        @update:search="readersSearch = $event"
        @update:offset="readersOffset = $event"
        @assign="assignReaderToDoor"
        @unassign="unassignReaderFromDoor"
        @edit="openEditReaderModal"
        @regenerate="openRegenerateReaderTokenModal"
        @delete="openDeleteReaderModal"
        @copy-token="copyGeneratedReaderToken"
        @create="openCreateReaderModal"
        @close="closeDoorReaderModal"
    />

    <ZoneAccessRulesModal
        :is-open="accessRulesZoneId > 0"
        :zone-id="accessRulesZoneId"
        :zone-title="accessRulesZoneTitle"
        :organization-id="building.organization_id"
        :format-date="formatDate"
        :translations="translations.organizationAdmin.buildingPage.zoneAccessRules"
        @close="closeZoneAccessRulesModal"
    />

    <OrganizationMemberInfo
        :is-open="isMemberInfoModalOpen"
        :member="selectedMemberProfile"
        :loading="isLoadingMemberProfile"
        :error-message="memberInfoErrorMessage"
        :role-label-resolver="getRoleLabel"
        :format-date="formatDate"
        :translations="translations.organizationAdmin.page.memberInfo"
        @close="closeMemberInfoModal"
        @view-positions="viewMemberPositions"
    />

    <OrganizationMemberPositions
        :is-open="isMemberPositionsModalOpen"
        :is-edit-mode="isPositionsEditMode"
        :loading-assigned="isLoadingMemberPositions"
        :loading-available="isLoadingAvailablePositions"
        :error-message="memberPositionsErrorMessage"
        :assigned-positions="assignedMemberPositions"
        :available-positions="availableMemberPositions"
        :assigned-search-value="assignedPositionsSearchValue"
        :available-search-value="availablePositionsSearchValue"
        :assigned-offset="assignedPositionsOffset"
        :available-offset="availablePositionsOffset"
        :limit="memberPositionsLimit"
        :assigned-total="assignedPositionsTotal"
        :available-total="availablePositionsTotal"
        :format-date="formatDate"
        :translations="translations.organizationAdmin.page.memberPositions"
        @close="closeMemberPositionsModal"
        @back-to-info="backToMemberInfo"
        @start-edit="startEditMemberPositions"
        @finish-edit="finishEditMemberPositions"
        @add-position="openCreatePositionModal"
        @edit="openEditPositionModal"
        @delete="openDeletePositionModal"
        @assign="assignPositionToMember"
        @unassign="unassignPositionFromMember"
        @update:assigned-search-value="assignedPositionsSearchValue = $event"
        @update:available-search-value="availablePositionsSearchValue = $event"
        @update:assigned-offset="assignedPositionsOffset = $event"
        @update:available-offset="availablePositionsOffset = $event"
    />

    <PositionUpsertModal
        :is-open="isPositionUpsertModalOpen"
        :mode="positionModalMode"
        :role-value="positionRoleValue"
        :description-value="positionDescriptionValue"
        :loading="isPositionSubmitting"
        :can-submit="canSubmitPositionForm"
        :error-message="positionFormErrorMessage"
        :translations="translations.organizationAdmin.page.modals.positionForm"
        @update:name-value="positionRoleValue = $event"
        @update:description-value="positionDescriptionValue = $event"
        @submit="submitPosition"
        @cancel="closePositionUpsertModal"
    />

    <ConfirmationModal
        :is-open="isDeletePositionModalOpen"
        :loading="isDeletingPosition"
        :error-message="deletePositionErrorMessage"
        :title="translations.organizationAdmin.page.modals.deletePosition.title"
        :message="translations.organizationAdmin.page.modals.deletePosition.message"
        :confirm-label="translations.organizationAdmin.page.modals.deletePosition.confirm"
        :cancel-label="translations.organizationAdmin.page.modals.deletePosition.cancel"
        @confirm="confirmDeletePosition"
        @cancel="closeDeletePositionModal"
    />

    <ConfirmationModal
        :is-open="isExpelModalOpen"
        :loading="isExpellingMember"
        :error-message="expelMemberErrorMessage"
        :title="translations.organizationAdmin.page.modals.expelMember.title"
        :message="expelModalMessage"
        :confirm-label="translations.organizationAdmin.page.modals.expelMember.confirm"
        :cancel-label="translations.organizationAdmin.page.modals.expelMember.cancel"
        @confirm="confirmExpelMember"
        @cancel="closeExpelModal"
    />

    <EmployeeMovementReportModal
        :is-open="isMovementReportModalOpen"
        :date-value="movementReportDateValue"
        :min-date="movementReportMinDate"
        :max-date="movementReportMaxDate"
        :loading="isDownloadingMovementReport"
        :can-submit="canDownloadMovementReport"
        :error-message="movementReportErrorMessage"
        :employee-name="employeeForMovementReport?.full_name || employeeForMovementReport?.email || ''"
        :locale="currentLanguage === 'en' ? 'en-US' : 'uk-UA'"
        :translations="translations.organizationAdmin.buildingPage.employeeMovementReport"
        @update:model-value="movementReportDateValue = $event"
        @submit="downloadEmployeeMovementReport"
        @cancel="closeEmployeeMovementReport"
    />

    <ConfirmationModal
        :is-open="readerToRegenerate !== null"
        :loading="isRegeneratingReaderToken"
        :error-message="readerErrorMessage"
        :title="translations.organizationAdmin.buildingPage.doorReader.regenerateTitle"
        :message="translations.organizationAdmin.buildingPage.doorReader.regenerateMessage"
        :confirm-label="translations.organizationAdmin.buildingPage.doorReader.regenerateConfirm"
        :cancel-label="translations.organizationAdmin.buildingPage.doorReader.regenerateCancel"
        @confirm="confirmRegenerateReaderToken"
        @cancel="closeRegenerateReaderTokenModal"
    />

    <ConfirmationModal
        :is-open="readerToDelete !== null"
        :loading="isDeletingReader"
        :error-message="readerErrorMessage"
        :title="translations.organizationAdmin.buildingPage.deleteDoor.title"
        :message="translations.organizationAdmin.buildingPage.deleteDoor.message"
        :confirm-label="translations.organizationAdmin.buildingPage.deleteDoor.confirm"
        :cancel-label="translations.organizationAdmin.buildingPage.deleteDoor.cancel"
        @confirm="confirmDeleteReader"
        @cancel="closeDeleteReaderModal"
    />

    <ReaderUpsertModal
        :is-open="isReaderModalOpen"
        :mode="readerModalMode"
        :name-value="readerNameValue"
        :loading="isReaderSubmitting"
        :can-submit="canSubmitReader"
        :error-message="readerErrorMessage"
        :translations="translations.organizationAdmin.buildingPage.readerForm"
        @update:name-value="readerNameValue = $event"
        @submit="submitReader"
        @cancel="closeReaderModal"
    />
  </div>
</template>
