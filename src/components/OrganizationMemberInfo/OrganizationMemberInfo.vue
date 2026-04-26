<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import { useOrganizationMemberInfo } from '@/composables/useOrganizationMemberInfo'
import { Events } from '@/enums/events.enum'
import type { OrganizationMemberInfoEmits } from '@/interfaces/organization-member-info-emits.interface'
import type { OrganizationMemberInfoProperties } from '@/interfaces/organization-member-info-properties.interface'
import './OrganizationMemberInfo.css'

const properties = defineProps<OrganizationMemberInfoProperties>()
const emit = defineEmits<OrganizationMemberInfoEmits>()

const {
    isEmptyState,
    isVisible,
    canViewPositions,
    formattedCreatedAt,
    memberRoleLabel
} = useOrganizationMemberInfo(properties)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isVisible" class="modal-overlay" @click="emit(Events.CLOSE)">
      <div class="modal-card organization-member-info-modal" role="dialog" aria-modal="true" @click.stop>
        <button type="button" class="organization-member-info-close" @click="emit(Events.CLOSE)">✕</button>

        <section class="organization-member-info">
          <div v-if="properties.loading" class="organization-member-info-loader"></div>

          <p v-else-if="isEmptyState" class="organization-member-info-empty">
            {{ properties.translations.empty }}
          </p>

          <div v-else-if="properties.member" class="organization-member-info-content">
            <div class="organization-member-info-head">
              <div class="organization-member-avatar-wrapper">
                <img
                    v-if="properties.member.photo"
                    :src="properties.member.photo"
                    :alt="properties.member.full_name"
                    class="organization-member-avatar-image"
                >
                <div v-else class="organization-member-avatar-fallback">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              <div class="organization-member-main-text">
                <h3 class="organization-member-full-name">{{ properties.member.full_name }}</h3>
                <span class="organization-member-role">{{ memberRoleLabel }}</span>
              </div>
            </div>

            <div class="organization-member-info-grid">
              <div class="organization-member-info-item">
                <p class="organization-member-info-item-label">{{ properties.translations.email }}</p>
                <p class="organization-member-info-item-value">{{ properties.member.email || '—' }}</p>
              </div>

              <div class="organization-member-info-item">
                <p class="organization-member-info-item-label">{{ properties.translations.phone }}</p>
                <p class="organization-member-info-item-value">{{ properties.member.phone || '—' }}</p>
              </div>

              <div class="organization-member-info-item organization-member-info-item--wide">
                <p class="organization-member-info-item-label">{{ properties.translations.createdAt }}</p>
                <p class="organization-member-info-item-value">{{ formattedCreatedAt }}</p>
              </div>
            </div>

            <BaseButton
                v-if="canViewPositions"
                type="button"
                variant="primary"
                :loading="false"
                :disabled="false"
                class="organization-member-view-positions-button"
                @click="emit(Events.VIEW_POSITIONS)"
            >
              {{ properties.translations.viewPositions }}
            </BaseButton>
          </div>
        </section>
      </div>
    </div>
  </Transition>
</template>
