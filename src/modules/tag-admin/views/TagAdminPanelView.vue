<script setup lang="ts">
import { computed, type Ref } from 'vue'
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import DataTable from '@/components/DataTable/DataTable.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import OrganizationInfoForm from '@/components/OrganizationInfoForm/OrganizationInfoForm.vue'
import OrganizationMemberInfo from '@/components/OrganizationMemberInfo/OrganizationMemberInfo.vue'
import EmployeeTagModal from '@/modules/tag-admin/components/EmployeeTagModal/EmployeeTagModal.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useTagAdminPanelView } from '@/modules/tag-admin/composables/useTagAdminPanelView'
import type { TagAdminEmployeeItem } from '@/modules/tag-admin/interfaces/tag-admin-employee-item.interface'
import type { TagAdminPanelTranslations } from '@/modules/tag-admin/interfaces/tag-admin-panel-translations.interface'
import './TagAdminPanelView.css'

const { translations } = useLanguageSwitcher()
const tagAdminPanelTranslations = computed(() => translations.value.tagAdminPanel) as Ref<TagAdminPanelTranslations>

const {
  organizationInfo,
  employees,
  searchQuery,
  tableOffset,
  tableLimit,
  tableTotal,
  isLoadingInfo,
  isLoadingTable,
  isLoadingMemberInfo,
  isMemberInfoOpen,
  selectedMemberProfile,
  selectedMemberErrorMessage,
  isTagModalOpen,
  selectedTag,
  availableTags,
  tagSearchQuery,
  tagOffset,
  tagLimit,
  tagTotal,
  isLoadingTags,
  tagModalErrorMessage,
  errorMessage,
  formattedOrganizationCreatedAt,
  employeeTagActionLabel,
  formatDate,
  tagStatusLabel,
  openEmployeeInfo,
  closeEmployeeInfo,
  openTagModal,
  closeTagModal,
  assignTag,
  unassignTag
} = useTagAdminPanelView(tagAdminPanelTranslations)

const getEmployeeRoleLabel = () => tagAdminPanelTranslations.value.table.employeeRole
</script>

<template>
  <div class="tag-admin-page">
    <ControlPanel :show-logout="true" :show-notifications="false" :show-profile="true" />

    <main class="tag-admin-panel-content">
      <section class="tag-admin-panel-card">
        <OrganizationInfoForm
            :title-value="organizationInfo.title"
            :description-value="organizationInfo.description || ''"
            :created-at-value="formattedOrganizationCreatedAt"
            fallback-description="—"
            :name-label="tagAdminPanelTranslations.organization.nameLabel"
            :description-label="tagAdminPanelTranslations.organization.descriptionLabel"
            :created-at-label="tagAdminPanelTranslations.organization.createdAtLabel"
            :show-actions="false"
        />
        <div v-if="isLoadingInfo" class="tag-admin-loading-line"></div>
      </section>

      <section class="tag-admin-panel-card tag-admin-panel-card-grow">
        <div class="tag-admin-table-head">
          <ErrorMessage :message="errorMessage" />
        </div>

        <DataTable
            v-model:search-query="searchQuery"
            :items="employees"
            :offset="tableOffset"
            :limit="tableLimit"
            :total="tableTotal"
            :loading="isLoadingTable"
            :placeholder="tagAdminPanelTranslations.table.searchPlaceholder"
            :empty-text="tagAdminPanelTranslations.table.empty"
            :loading-text="tagAdminPanelTranslations.table.loading"
            :interactive-rows="true"
            :is-drag-over="false"
            max-height="34rem"
            @update:offset="tableOffset = $event"
        >
          <template #header>
            <tr>
              <th class="w-[34%]">{{ tagAdminPanelTranslations.table.headers.user }}</th>
              <th class="w-[22%]">{{ tagAdminPanelTranslations.table.headers.tagStatus }}</th>
              <th class="w-[20%]">{{ tagAdminPanelTranslations.table.headers.phone }}</th>
              <th class="w-[24%]">{{ tagAdminPanelTranslations.table.headers.createdAt }}</th>
            </tr>
          </template>

          <template #default="{ item }: { item: TagAdminEmployeeItem }">
            <tr @click="openEmployeeInfo(item)">
              <td>
                <div class="td-name">
                  <div class="user-avatar-wrapper">
                    <img v-if="item.photo" :src="item.photo" :alt="item.full_name" class="user-avatar-img">
                    <div v-else class="default-avatar-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>
                  <div class="user-info-text">
                    <span class="user-name">{{ item.full_name }}</span>
                    <span class="user-email">{{ item.email || '—' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span
                    class="tag-admin-status-badge"
                    :class="{ 'is-assigned': item.has_assigned_tag, 'is-missing': !item.has_assigned_tag }"
                >
                  {{ tagStatusLabel(item) }}
                </span>
              </td>
              <td>
                <span class="td-phone" :class="{ 'is-empty': !item.phone }">{{ item.phone || '—' }}</span>
              </td>
              <td>
                <span class="td-date">{{ formatDate(item.created_at) }}</span>
              </td>
            </tr>
          </template>
        </DataTable>
      </section>
    </main>

    <OrganizationMemberInfo
        :is-open="isMemberInfoOpen"
        :member="selectedMemberProfile"
        :loading="isLoadingMemberInfo"
        :error-message="selectedMemberErrorMessage"
        :role-label-resolver="getEmployeeRoleLabel"
        :format-date="formatDate"
        :translations="tagAdminPanelTranslations.memberInfo"
        :show-view-positions="false"
        :primary-action-label="employeeTagActionLabel"
        @close="closeEmployeeInfo"
        @assign="openTagModal"
        @view-positions="() => undefined"
    />

    <EmployeeTagModal
        :is-open="isTagModalOpen"
        :selected-tag="selectedTag"
        :tags="availableTags"
        :search="tagSearchQuery"
        :offset="tagOffset"
        :limit="tagLimit"
        :total="tagTotal"
        :loading="isLoadingTags"
        :error-message="tagModalErrorMessage"
        :translations="tagAdminPanelTranslations.tagModal"
        @close="closeTagModal"
        @update:search="tagSearchQuery = $event"
        @update:offset="tagOffset = $event"
        @assign="assignTag"
        @unassign="unassignTag"
    />
  </div>
</template>
