<script setup lang="ts">
import { computed, type Ref } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import BaseTabs from '@/components/BaseTabs/BaseTabs.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import DataTable from '@/components/DataTable/DataTable.vue'
import InviteGenerator from '@/components/InviteGenerator/InviteGenerator.vue'
import OrganizationUpsertModal from '@/components/OrganizationUpsertModal/OrganizationUpsertModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal.vue'
import OrganizationInfoForm from '@/components/OrganizationInfoForm/OrganizationInfoForm.vue'
import ExpelButton from '@/components/ExpelButton/ExpelButton.vue'
import EditButton from '@/components/EditButton/EditButton.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import BuildingUpsertModal from '@/components/BuildingUpsertModal/BuildingUpsertModal.vue'
import TagUpsertModal from '@/components/TagUpsertModal/TagUpsertModal.vue'
import OrganizationMemberInfo from '@/components/OrganizationMemberInfo/OrganizationMemberInfo.vue'
import OrganizationMemberPositions from '@/components/OrganizationMemberPositions/OrganizationMemberPositions.vue'
import PositionUpsertModal from '@/components/PositionUpsertModal/PositionUpsertModal.vue'
import { Events } from '@/enums/events.enum'
import { useOrganizationView } from '@/modules/organization/composables/useOrganizationView'
import type { OrganizationBuildingItem } from '@/modules/organization/interfaces/organization-building-item.interface'
import type { OrganizationMemberItem } from '@/modules/organization/interfaces/organization-member-item.interface'
import type { OrganizationRfidTagItem } from '@/modules/organization/interfaces/organization-rfid-tag-item.interface'
import type { OrganizationViewProperties } from '@/modules/organization/interfaces/organization-view-properties.interface'
import type { OrganizationViewEmits } from '@/modules/organization/interfaces/organization-view-emits.interface'
import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'
import './OrganizationView.css'

const properties = defineProps<OrganizationViewProperties>()
const emit = defineEmits<OrganizationViewEmits>()

const sectionTranslations = computed(() => properties.translations) as Ref<OrganizationsTranslations>

const {
  organizationInfo,
  isLoadingInfo,
  isLoadingInviteStatus,
  isGeneratingInvite,
  isLoadingTable,
  activeInviteTab,
  activeListTab,
  searchQuery,
  inviteTabs,
  listTabs,
  currentListPlaceholder,
  activeInviteLink,
  activeInviteExpiresAt,
  activeInviteCopySuccessMessage,
  tableItems,
  tableOffset,
  tableLimit,
  tableTotal,
  formattedCreatedAt,
  formatDate,
  isEditModalOpen,
  isDeleteModalOpen,
  isSubmittingEdit,
  isDeleting,
  isBuildingModalOpen,
  buildingModalMode,
  buildingTitleValue,
  buildingAddressValue,
  isBuildingSubmitting,
  canSubmitBuildingForm,
  isDeleteBuildingModalOpen,
  isDeletingBuilding,
  isTagModalOpen,
  tagModalMode,
  tagNameValue,
  tagUidValue,
  isTagSubmitting,
  canSubmitTagForm,
  isDeleteTagModalOpen,
  isDeletingTag,
  isExpelModalOpen,
  isExpellingMember,
  isMemberInfoModalOpen,
  selectedMemberProfile,
  isLoadingMemberProfile,
  isMemberPositionsModalOpen,
  isPositionsEditMode,
  isLoadingMemberPositions,
  isLoadingAvailablePositions,
  assignedMemberPositions,
  availableMemberPositions,
  assignedPositionsSearchValue,
  availablePositionsSearchValue,
  memberPositionsLimit,
  assignedPositionsOffset,
  assignedPositionsTotal,
  availablePositionsOffset,
  availablePositionsTotal,
  isPositionUpsertModalOpen,
  positionModalMode,
  positionRoleValue,
  positionDescriptionValue,
  isPositionSubmitting,
  canSubmitPositionForm,
  isDeletePositionModalOpen,
  isDeletingPosition,
  editNameValue,
  editDescriptionValue,
  expelModalMessage,
  canSubmitOrganizationForm,
  openEditModal,
  closeEditModal,
  submitOrganizationEdit,
  openDeleteModal,
  closeDeleteModal,
  openCreateBuildingModal,
  openEditBuildingModal,
  openBuildingPage,
  closeBuildingModal,
  submitBuilding,
  openDeleteBuildingModal,
  closeDeleteBuildingModal,
  confirmDeleteBuilding,
  openCreateTagModal,
  openEditTagModal,
  closeTagModal,
  submitTag,
  openDeleteTagModal,
  closeDeleteTagModal,
  confirmDeleteTag,
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
  selectMember,
  confirmDelete,
  generateInvite,
  copyActiveInvite,
  clearActiveInvite,
  clearActiveInviteCopySuccessMessage,
  toggleTagUidVisibility,
  isTagUidVisible,
  getRoleLabel
} = useOrganizationView({
  organizationId: properties.organizationId,
  translations: sectionTranslations,
  onDeleted: () => emit(Events.CLOSE)
})
</script>

<template>
  <div class="organization-page-content">
    <div class="organization-page-main-grid">
      <div class="organization-page-main-column">
        <section class="organization-page-block">
          <OrganizationInfoForm
              :title-value="organizationInfo.title"
              :description-value="organizationInfo.description || ''"
              :created-at-value="formattedCreatedAt"
              :fallback-description="properties.translations.page.infoDescriptionFallback"
              :name-label="properties.translations.page.infoForm.nameLabel"
              :description-label="properties.translations.page.infoForm.descriptionLabel"
              :created-at-label="properties.translations.page.infoForm.createdAtLabel"
              @edit="openEditModal"
              @delete="openDeleteModal"
          />

          <div v-if="isLoadingInfo" class="organization-loading-line"></div>
        </section>

        <section class="organization-page-block">
          <BaseTabs
              :tabs="inviteTabs"
              :active-tab="activeInviteTab"
              @update:active-tab="activeInviteTab = ($event as 'employeesInvite' | 'tagAdminInvite')"
          />

          <InviteGenerator
              :translations="properties.translations.page.inviteSection"
              :invite-link="activeInviteLink"
              :expires-at="activeInviteExpiresAt"
              :success-message="activeInviteCopySuccessMessage"
              :loading="isGeneratingInvite"
              :initial-loading="isLoadingInviteStatus"
              @generate="generateInvite"
              @copy-link="copyActiveInvite"
              @clear="clearActiveInvite"
              @clear-success="clearActiveInviteCopySuccessMessage"
          />
        </section>

        <section class="organization-page-block organization-page-block-grow">
          <BaseTabs
              :tabs="listTabs"
              :active-tab="activeListTab"
              @update:active-tab="activeListTab = ($event as 'buildings' | 'members' | 'tags')"
          />

          <div class="organization-page-table-area">
            <div v-if="activeListTab === 'buildings'" class="organization-page-table-toolbar">
              <div class="organization-page-building-intro-chip">
                <div class="organization-page-building-intro-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M4 21V8.5A1.5 1.5 0 0 1 5.5 7H10v14M10 3h8.5A1.5 1.5 0 0 1 20 4.5V21M14 7h2m-2 4h2m-2 4h2" />
                  </svg>
                </div>
                <p class="organization-page-building-intro-text">
                  {{ properties.translations.page.table.addBuildingHint }}
                </p>
              </div>

              <BaseButton
                  type="button"
                  variant="primary"
                  :loading="false"
                  :disabled="isLoadingTable"
                  class="organization-page-add-building-button"
                  @click="openCreateBuildingModal"
              >
                {{ properties.translations.page.table.addBuilding }}
              </BaseButton>
            </div>

            <div v-if="activeListTab === 'tags'" class="organization-page-table-toolbar">
              <div class="organization-page-building-intro-chip">
                <div class="organization-page-building-intro-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13l-7 7-9-9V4h7l9 9z" />
                    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <p class="organization-page-building-intro-text">
                  {{ properties.translations.page.table.addTagHint }}
                </p>
              </div>

              <BaseButton
                  type="button"
                  variant="primary"
                  :loading="false"
                  :disabled="isLoadingTable"
                  class="organization-page-add-building-button"
                  @click="openCreateTagModal"
              >
                {{ properties.translations.page.table.addTag }}
              </BaseButton>
            </div>

            <DataTable
                v-model:search-query="searchQuery"
                :items="tableItems"
                :offset="tableOffset"
                :limit="tableLimit"
                :total="tableTotal"
                @update:offset="tableOffset = $event"
                :loading="isLoadingTable"
                :placeholder="currentListPlaceholder"
                :empty-text="properties.translations.table.empty"
                :loading-text="properties.translations.table.loading"
                :interactive-rows="activeListTab === 'members'"
                :is-drag-over="false"
                max-height="34rem"
            >
              <template #header>
                <tr v-if="activeListTab === 'buildings'">
                  <th class="w-[38%]">{{ properties.translations.page.table.headers.name }}</th>
                  <th class="w-[26%]">{{ properties.translations.page.table.headers.address }}</th>
                  <th class="w-[22%]">{{ properties.translations.page.table.headers.createdAt }}</th>
                  <th class="w-[14%]">{{ properties.translations.page.table.headers.actions }}</th>
                </tr>

                <tr v-if="activeListTab === 'members'">
                  <th class="w-[30%]">{{ properties.translations.page.table.headers.user }}</th>
                  <th class="w-[20%]">{{ properties.translations.page.table.headers.role }}</th>
                  <th class="w-[20%]">{{ properties.translations.page.table.headers.phone }}</th>
                  <th class="w-[20%]">{{ properties.translations.page.table.headers.createdAt }}</th>
                  <th class="w-[10%]">{{ properties.translations.page.table.headers.actions }}</th>
                </tr>

                <tr v-if="activeListTab === 'tags'">
                  <th class="w-[34%]">{{ properties.translations.page.table.headers.name }}</th>
                  <th class="w-[30%]">{{ properties.translations.page.table.headers.tagUid }}</th>
                  <th class="w-[24%]">{{ properties.translations.page.table.headers.createdAt }}</th>
                  <th class="w-[12%]">{{ properties.translations.page.table.headers.actions }}</th>
                </tr>
              </template>

              <template #default="{ item }: { item: OrganizationBuildingItem | OrganizationMemberItem | OrganizationRfidTagItem }">
                <tr
                    v-if="activeListTab === 'buildings'"
                    class="organization-page-member-row"
                    @click="openBuildingPage((item as OrganizationBuildingItem))"
                >
                  <td>
                    <span class="organization-page-cell-title">{{ (item as OrganizationBuildingItem).title || '—' }}</span>
                  </td>
                  <td>
                    <span class="organization-page-cell-muted">{{ (item as OrganizationBuildingItem).address || '—' }}</span>
                  </td>
                  <td>
                    <span class="organization-page-cell-date">{{ formatDate((item as OrganizationBuildingItem).created_at) }}</span>
                  </td>
                  <td @click.stop>
                    <div class="td-actions">
                      <EditButton @click="openEditBuildingModal((item as OrganizationBuildingItem))" />
                      <DeleteButton @click="openDeleteBuildingModal((item as OrganizationBuildingItem).building_id)" />
                    </div>
                  </td>
                </tr>

                <tr
                    v-if="activeListTab === 'members'"
                    class="organization-page-member-row"
                    @click="selectMember((item as OrganizationMemberItem), $event)"
                >
                  <td>
                    <div class="td-name">
                      <div class="user-avatar-wrapper">
                        <img
                            v-if="(item as OrganizationMemberItem).photo"
                            :src="(item as OrganizationMemberItem).photo || ''"
                            :alt="(item as OrganizationMemberItem).full_name"
                            class="user-avatar-img"
                        >
                        <div v-else class="default-avatar-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      </div>
                      <div class="user-info-text">
                        <span class="user-name">{{ (item as OrganizationMemberItem).full_name }}</span>
                        <span class="user-email">{{ (item as OrganizationMemberItem).email || '—' }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="organization-page-role-badge">{{ getRoleLabel((item as OrganizationMemberItem).role) }}</span>
                  </td>
                  <td>
                    <span class="td-phone" :class="{ 'is-empty': !(item as OrganizationMemberItem).phone }">{{ (item as OrganizationMemberItem).phone || '—' }}</span>
                  </td>
                  <td>
                    <span class="td-date">{{ formatDate((item as OrganizationMemberItem).created_at) }}</span>
                  </td>
                  <td @click.stop>
                    <div
                        v-if="(item as OrganizationMemberItem).role !== 'organization_admin'"
                        class="td-actions"
                        @click.stop="openExpelModal((item as OrganizationMemberItem))"
                    >
                      <ExpelButton />
                    </div>
                  </td>
                </tr>

                <tr v-if="activeListTab === 'tags'">
                  <td>
                    <span class="organization-page-cell-title">{{ (item as OrganizationRfidTagItem).name }}</span>
                  </td>
                  <td>
                    <div class="organization-page-uid-cell">
                      <span class="organization-page-cell-muted">
                        {{ isTagUidVisible((item as OrganizationRfidTagItem).rfid_tag_id)
                          ? (item as OrganizationRfidTagItem).tag_uid
                          : String((item as OrganizationRfidTagItem).tag_uid).replace(/\d/g, '*') }}
                      </span>
                      <button
                          type="button"
                          class="organization-page-uid-toggle"
                          @click="toggleTagUidVisibility((item as OrganizationRfidTagItem).rfid_tag_id)"
                      >
                        <component
                            :is="isTagUidVisible((item as OrganizationRfidTagItem).rfid_tag_id) ? EyeSlashIcon : EyeIcon"
                            class="organization-page-uid-icon"
                        />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span class="organization-page-cell-date">{{ formatDate((item as OrganizationRfidTagItem).created_at) }}</span>
                  </td>
                  <td @click.stop>
                    <div class="td-actions">
                      <EditButton @click="openEditTagModal((item as OrganizationRfidTagItem))" />
                      <DeleteButton @click="openDeleteTagModal((item as OrganizationRfidTagItem).rfid_tag_id)" />
                    </div>
                  </td>
                </tr>
              </template>
            </DataTable>

          </div>
        </section>
      </div>
    </div>

    <OrganizationUpsertModal
        :is-open="isEditModalOpen"
        mode="edit"
        :name-value="editNameValue"
        :description-value="editDescriptionValue"
        :loading="isSubmittingEdit"
        :can-submit="canSubmitOrganizationForm"
        :translations="properties.translations.modals.organizationForm"
        @update:name-value="editNameValue = $event"
        @update:description-value="editDescriptionValue = $event"
        @submit="submitOrganizationEdit"
        @cancel="closeEditModal"
    />

    <ConfirmationModal
        :is-open="isDeleteModalOpen"
        :loading="isDeleting"
        :title="properties.translations.modals.deleteOrganization.title"
        :message="properties.translations.modals.deleteOrganization.message"
        :confirm-label="properties.translations.modals.deleteOrganization.confirm"
        :cancel-label="properties.translations.modals.deleteOrganization.cancel"
        @confirm="confirmDelete"
        @cancel="closeDeleteModal"
    />

    <ConfirmationModal
        :is-open="isDeleteBuildingModalOpen"
        :loading="isDeletingBuilding"
        :title="properties.translations.page.modals.deleteBuilding.title"
        :message="properties.translations.page.modals.deleteBuilding.message"
        :confirm-label="properties.translations.page.modals.deleteBuilding.confirm"
        :cancel-label="properties.translations.page.modals.deleteBuilding.cancel"
        @confirm="confirmDeleteBuilding"
        @cancel="closeDeleteBuildingModal"
    />

    <BuildingUpsertModal
        :is-open="isBuildingModalOpen"
        :mode="buildingModalMode"
        :title-value="buildingTitleValue"
        :address-value="buildingAddressValue"
        :loading="isBuildingSubmitting"
        :can-submit="canSubmitBuildingForm"
        :translations="properties.translations.page.modals.buildingForm"
        @update:title-value="buildingTitleValue = $event"
        @update:address-value="buildingAddressValue = $event"
        @submit="submitBuilding"
        @cancel="closeBuildingModal"
    />

    <TagUpsertModal
        :is-open="isTagModalOpen"
        :mode="tagModalMode"
        :name-value="tagNameValue"
        :tag-uid-value="tagUidValue"
        :loading="isTagSubmitting"
        :can-submit="canSubmitTagForm"
        :translations="properties.translations.page.modals.tagForm"
        @update:name-value="tagNameValue = $event"
        @update:tag-uid-value="tagUidValue = $event"
        @submit="submitTag"
        @cancel="closeTagModal"
    />

    <ConfirmationModal
        :is-open="isDeleteTagModalOpen"
        :loading="isDeletingTag"
        :title="properties.translations.page.modals.deleteTag.title"
        :message="properties.translations.page.modals.deleteTag.message"
        :confirm-label="properties.translations.page.modals.deleteTag.confirm"
        :cancel-label="properties.translations.page.modals.deleteTag.cancel"
        @confirm="confirmDeleteTag"
        @cancel="closeDeleteTagModal"
    />

    <OrganizationMemberInfo
        :is-open="isMemberInfoModalOpen"
        :member="selectedMemberProfile"
        :loading="isLoadingMemberProfile"
        :role-label-resolver="getRoleLabel"
        :format-date="formatDate"
        :translations="properties.translations.page.memberInfo"
        @close="closeMemberInfoModal"
        @view-positions="viewMemberPositions"
    />

    <OrganizationMemberPositions
        :is-open="isMemberPositionsModalOpen"
        :is-edit-mode="isPositionsEditMode"
        :loading-assigned="isLoadingMemberPositions"
        :loading-available="isLoadingAvailablePositions"
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
        :translations="properties.translations.page.memberPositions"
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
        :translations="properties.translations.page.modals.positionForm"
        @update:name-value="positionRoleValue = $event"
        @update:description-value="positionDescriptionValue = $event"
        @submit="submitPosition"
        @cancel="closePositionUpsertModal"
    />

    <ConfirmationModal
        :is-open="isDeletePositionModalOpen"
        :loading="isDeletingPosition"
        :title="properties.translations.page.modals.deletePosition.title"
        :message="properties.translations.page.modals.deletePosition.message"
        :confirm-label="properties.translations.page.modals.deletePosition.confirm"
        :cancel-label="properties.translations.page.modals.deletePosition.cancel"
        @confirm="confirmDeletePosition"
        @cancel="closeDeletePositionModal"
    />

    <ConfirmationModal
        :is-open="isExpelModalOpen"
        :loading="isExpellingMember"
        :title="properties.translations.page.modals.expelMember.title"
        :message="expelModalMessage"
        :confirm-label="properties.translations.page.modals.expelMember.confirm"
        :cancel-label="properties.translations.page.modals.expelMember.cancel"
        @confirm="confirmExpelMember"
        @cancel="closeExpelModal"
    />
  </div>
</template>
