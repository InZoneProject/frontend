<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import { useOrganizationUpsertModal } from '@/composables/useOrganizationUpsertModal'
import { LENGTH } from '@/constants/length.constants'
import type { OrganizationUpsertModalProperties } from '@/interfaces/organization-upsert-modal-properties.interface'
import type { OrganizationUpsertModalEmits } from '@/interfaces/organization-upsert-modal-emits.interface'
import './OrganizationUpsertModal.css'

const properties = defineProps<OrganizationUpsertModalProperties>()
defineEmits<OrganizationUpsertModalEmits>()

const {
  modalTitle,
  confirmLabel,
  updateNameEvent,
  updateDescriptionEvent,
  submitEvent,
  cancelEvent
} = useOrganizationUpsertModal(properties)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card modal-card-organization-upsert" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="organization-upsert-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6" />
            </svg>
          </div>
          <h3 class="modal-title">{{ modalTitle }}</h3>
        </div>

        <div class="organization-upsert-fields">
          <BaseInput
              :model-value="properties.nameValue"
              @update:model-value="$emit(updateNameEvent, $event)"
              :label="properties.translations.nameLabel"
              type="text"
              :placeholder="properties.translations.namePlaceholder"
              :max-length="LENGTH.MAX_ORGANIZATION_TITLE_LENGTH"
              :is-expandable="false"
              :disabled="properties.loading"
          />

          <BaseInput
              :model-value="properties.descriptionValue"
              @update:model-value="$emit(updateDescriptionEvent, $event)"
              :label="properties.translations.descriptionLabel"
              type="text"
              :placeholder="properties.translations.descriptionPlaceholder"
              :max-length="LENGTH.MAX_DESCRIPTION_LENGTH"
              :is-expandable="true"
              :disabled="properties.loading"
          />
        </div>

        <div class="modal-actions">
          <BaseButton
              type="button"
              variant="secondary"
              :loading="false"
              :disabled="properties.loading"
              @click="$emit(cancelEvent)"
          >
            {{ properties.translations.cancel }}
          </BaseButton>

          <BaseButton
              type="button"
              variant="primary"
              :loading="properties.loading"
              :disabled="properties.loading || !properties.canSubmit"
              @click="$emit(submitEvent)"
          >
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
