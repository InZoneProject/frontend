<script setup lang="ts">
import { computed, type Ref } from 'vue'
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import DataTable from '@/components/DataTable/DataTable.vue'
import EditButton from '@/components/EditButton/EditButton.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal.vue'
import OrganizationUpsertModal from '@/components/OrganizationUpsertModal/OrganizationUpsertModal.vue'
import OrganizationView from '@/modules/organization/views/OrganizationView.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useOrganizationsView } from '@/modules/organizations/composables/useOrganizationsView'
import type { OrganizationItem } from '@/modules/organizations/interfaces/organization-item.interface'
import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'
import './OrganizationsView.css'

const { translations } = useLanguageSwitcher()

const organizationTranslations = computed(
    () => translations.value.organizationAdmin
) as Ref<OrganizationsTranslations>

const {
  searchQuery,
  organizations,
  isLoadingData,
  currentPlaceholder,
  isOrganizationFormModalOpen,
  organizationFormMode,
  organizationFormNameValue,
  organizationFormDescriptionValue,
  isOrganizationFormSubmitting,
  canSubmitOrganizationForm,
  isDeleteModalOpen,
  isDeleting,
  selectedOrganizationId,
  formatDate,
  openCreateModal,
  openEditModal,
  openOrganizationPage,
  closeOrganizationPage,
  closeOrganizationFormModal,
  submitOrganizationForm,
  openDeleteModal,
  closeDeleteModal,
  confirmDelete
} = useOrganizationsView(organizationTranslations)
</script>

<template>
  <div class="organizations-page">
    <ControlPanel :show-logout="true" :show-notifications="true" :show-profile="true" />

    <div class="organizations-view-content">
      <OrganizationView
          v-if="selectedOrganizationId > 0"
          :organization-id="selectedOrganizationId"
          :translations="organizationTranslations"
          @close="closeOrganizationPage"
      />

      <div v-else class="organizations-content-card">
        <div class="organizations-actions">
          <div class="organizations-intro-chip">
            <div class="organizations-intro-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6" />
              </svg>
            </div>
            <p class="organizations-actions-hint">
              {{ organizationTranslations.actions.createOrganizationHint }}
            </p>
          </div>
          <div class="organizations-create-button-wrapper">
            <BaseButton
                type="button"
                variant="primary"
                :loading="false"
                :disabled="isLoadingData"
                class="organizations-create-button"
                @click="openCreateModal"
            >
              {{ organizationTranslations.actions.createOrganization }}
            </BaseButton>
          </div>
        </div>

        <div class="organizations-table-area">
          <DataTable
              v-model:search-query="searchQuery"
              :items="organizations"
              :loading="isLoadingData"
              :placeholder="currentPlaceholder"
              :interactive-rows="true"
              max-height="43rem"
          >
            <template #header>
              <tr>
                <th class="w-[26%]">{{ organizationTranslations.table.headers.title }}</th>
                <th class="w-[39%]">{{ organizationTranslations.table.headers.description }}</th>
                <th class="w-[20%]">{{ organizationTranslations.table.headers.createdAt }}</th>
                <th class="w-[15%]">{{ organizationTranslations.table.headers.actions }}</th>
              </tr>
            </template>

            <template #default="{ item }: { item: OrganizationItem }">
              <tr class="org-row-clickable" @click="openOrganizationPage(item.organization_id)">
                <td>
                  <span class="org-title">{{ item.title }}</span>
                </td>
                <td>
                  <span class="org-description" :class="{ 'is-empty': !item.description }">
                    {{ item.description || '—' }}
                  </span>
                </td>
                <td>
                  <span class="org-date">{{ formatDate(item.created_at) }}</span>
                </td>
                <td @click.stop>
                  <div class="td-actions">
                    <EditButton @click="openEditModal(item)" />
                    <DeleteButton @click="openDeleteModal(item.organization_id)" />
                  </div>
                </td>
              </tr>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <OrganizationUpsertModal
        :is-open="isOrganizationFormModalOpen"
        :mode="organizationFormMode"
        :name-value="organizationFormNameValue"
        :description-value="organizationFormDescriptionValue"
        :loading="isOrganizationFormSubmitting"
        :can-submit="canSubmitOrganizationForm"
        :translations="organizationTranslations.modals.organizationForm"
        @update:name-value="organizationFormNameValue = $event"
        @update:description-value="organizationFormDescriptionValue = $event"
        @submit="submitOrganizationForm"
        @cancel="closeOrganizationFormModal"
    />

    <ConfirmationModal
        :is-open="isDeleteModalOpen"
        :loading="isDeleting"
        :title="organizationTranslations.modals.deleteOrganization.title"
        :message="organizationTranslations.modals.deleteOrganization.message"
        :confirm-label="organizationTranslations.modals.deleteOrganization.confirm"
        :cancel-label="organizationTranslations.modals.deleteOrganization.cancel"
        @confirm="confirmDelete"
        @cancel="closeDeleteModal"
    />
  </div>
</template>
