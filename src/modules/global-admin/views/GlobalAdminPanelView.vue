<script setup lang="ts">
import { computed, type Ref } from 'vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useGlobalAdminPanelView } from '@/modules/global-admin/composables/useGlobalAdminPanelView'
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import BaseTabs from '@/components/BaseTabs/BaseTabs.vue'
import DataTable from "@/components/DataTable/DataTable.vue"
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal.vue'
import InviteGenerator from '@/components/InviteGenerator/InviteGenerator.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import type { OrganizationAdmin } from '@/interfaces/organization-admin.interface'
import type { InviteHistory } from '../interfaces/invite-history.interface'
import type { GlobalAdminPanelTranslations } from '../interfaces/global-admin-panel-translations.interface'
import './GlobalAdminPanelView.css'

const { translations } = useLanguageSwitcher()

const globalAdminTranslations = computed(() => translations.value.globalAdmin) as Ref<GlobalAdminPanelTranslations>

const {
  activeTab,
  searchQuery,
  isDeleteModalOpen,
  inviteLink,
  expiresAt,
  isGenerating,
  isInitialLoading,
  tabs,
  tableItems,
  currentPlaceholder,
  isLoadingData,
  isDeleting,
  formatDate,
  formatRange,
  generateLink,
  copyToClipboard,
  openDeleteModal,
  confirmDelete,
  closeDeleteModal
} = useGlobalAdminPanelView(globalAdminTranslations)
</script>

<template>
  <div class="admin-page">
    <ControlPanel :show-logout="true" />

    <div class="admin-view-content">
      <InviteGenerator
          :translations="globalAdminTranslations.inviteSection"
          :invite-link="inviteLink || ''"
          :expires-at="expiresAt || ''"
          :loading="isGenerating"
          :initial-loading="isInitialLoading"
          @generate="generateLink"
          @copy="copyToClipboard"
          @clear="inviteLink = null; expiresAt = null"
      />

      <div class="content-card">
        <BaseTabs
            :tabs="tabs"
            :active-tab="activeTab"
            @update:active-tab="activeTab = ($event as 'admins' | 'history')"
        />

        <div class="tab-content">
          <DataTable
              v-model:search-query="searchQuery"
              :items="tableItems"
              :loading="isLoadingData"
              :placeholder="currentPlaceholder"
          >
            <template #header>
              <tr v-if="activeTab === 'admins'">
                <th class="w-[22%]">{{ globalAdminTranslations.table.headers.name }}</th>
                <th class="w-[20%]">{{ globalAdminTranslations.table.headers.phone }}</th>
                <th class="w-[22%]">{{ globalAdminTranslations.table.headers.organization }}</th>
                <th class="w-[19%]">{{ globalAdminTranslations.table.headers.createdAt }}</th>
                <th class="w-[17%]">{{ globalAdminTranslations.table.headers.actions }}</th>
              </tr>
              <tr v-else>
                <th class="w-[30%]">{{ globalAdminTranslations.table.headers.usedBy }}</th>
                <th class="w-[25%]">{{ globalAdminTranslations.table.headers.usedAt }}</th>
                <th class="w-[45%]">{{ globalAdminTranslations.table.headers.validityPeriod }}</th>
              </tr>
            </template>

            <template #default="{ item }: { item: OrganizationAdmin | InviteHistory }">
              <tr v-if="activeTab === 'admins'">
                <td>
                  <div class="td-name">
                    <div class="user-avatar-wrapper">
                      <img v-if="'photo' in item && item.photo" :src="item.photo" :alt="item.full_name" class="user-avatar-img" />
                      <div v-else class="default-avatar-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>
                    <div class="user-info-text">
                      <span class="user-name">{{ item.full_name }}</span>
                      <span class="user-email">{{ item.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="td-phone" :class="{ 'is-empty': 'phone' in item && !item.phone }">
                    {{ 'phone' in item ? (item.phone || '—') : '' }}
                  </span>
                </td>
                <td>
                  <span class="org-badge" v-if="'organizations_count' in item">
                    {{ item.organizations_count }}
                  </span>
                </td>
                <td>
                  <span class="td-date">{{ formatDate(item.created_at) }}</span>
                </td>
                <td>
                  <div class="td-actions" v-if="'organization_admin_id' in item">
                    <DeleteButton @click="openDeleteModal(item.organization_admin_id)" />
                  </div>
                </td>
              </tr>

              <tr v-else>
                <td>
                  <div class="td-name">
                    <div class="user-avatar-wrapper">
                      <img v-if="'photo' in item && item.photo" :src="item.photo" :alt="item.full_name" class="user-avatar-img" />
                      <div v-else class="default-avatar-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>
                    <div class="user-info-text">
                      <span class="user-name">{{ item.full_name }}</span>
                      <span class="user-email">{{ item.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="td-date">
                    {{ 'used_at' in item ? formatDate(item.used_at) : '' }}
                  </span>
                </td>
                <td>
                  <span class="td-date">
                    {{ ('expires_at' in item && 'created_at' in item) ? formatRange(item.created_at, item.expires_at) : '' }}
                  </span>
                </td>
              </tr>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <ConfirmationModal
        :is-open="isDeleteModalOpen"
        :loading="isDeleting"
        :title="globalAdminTranslations.modals.deleteAdmin.title"
        :message="globalAdminTranslations.modals.deleteAdmin.message"
        :confirm-label="globalAdminTranslations.modals.deleteAdmin.confirm"
        :cancel-label="globalAdminTranslations.modals.deleteAdmin.cancel"
        @confirm="confirmDelete"
        @cancel="closeDeleteModal"
    />
  </div>
</template>