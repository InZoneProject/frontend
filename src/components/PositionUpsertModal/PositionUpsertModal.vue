<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import { usePositionUpsertModal } from '@/composables/usePositionUpsertModal'
import { LENGTH } from '@/constants/length.constants'
import type { PositionUpsertModalProperties } from '@/interfaces/position-upsert-modal-properties.interface'
import type { PositionUpsertModalEmits } from '@/interfaces/position-upsert-modal-emits.interface'
import './PositionUpsertModal.css'

const properties = defineProps<PositionUpsertModalProperties>()
defineEmits<PositionUpsertModalEmits>()

const {
    modalTitle,
    confirmLabel,
    updateRoleEvent,
    updateDescriptionEvent,
    submitEvent,
    cancelEvent
} = usePositionUpsertModal(properties)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card modal-card-position-upsert" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="position-upsert-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16v10H4z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <h3 class="modal-title">{{ modalTitle }}</h3>
        </div>

        <div class="position-upsert-fields">
          <BaseInput
              :model-value="properties.roleValue"
              @update:model-value="$emit(updateRoleEvent, $event)"
              :label="properties.translations.roleLabel"
              type="text"
              :placeholder="properties.translations.rolePlaceholder"
              :max-length="LENGTH.MAX_NAME_LENGTH"
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
