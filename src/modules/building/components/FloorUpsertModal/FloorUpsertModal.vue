<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useFloorUpsertModal } from '@/modules/building/composables/useFloorUpsertModal'
import { LENGTH } from '@/constants/length.constants'
import type { FloorUpsertModalProperties } from '@/modules/building/interfaces/floor-upsert-modal-properties.interface'
import type { FloorUpsertModalEmits } from '@/modules/building/interfaces/floor-upsert-modal-emits.interface'
import './FloorUpsertModal.css'

const properties = defineProps<FloorUpsertModalProperties>()
defineEmits<FloorUpsertModalEmits>()

const {
  modalTitle,
  confirmLabel,
  updateNameEvent,
  submitEvent,
  cancelEvent
} = useFloorUpsertModal(properties)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card modal-card-floor-upsert" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="floor-upsert-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5h16M4 12h16M4 19h16" />
              <circle cx="8" cy="12" r="2" />
            </svg>
          </div>
          <h3 class="modal-title">{{ modalTitle }}</h3>
        </div>

        <div class="floor-upsert-fields">
          <BaseInput
              :model-value="properties.nameValue"
              @update:model-value="$emit(updateNameEvent, $event)"
              :label="properties.translations.nameLabel"
              type="text"
              :placeholder="properties.translations.namePlaceholder"
              :max-length="LENGTH.MAX_NAME_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="properties.loading"
          />
        </div>
        <ErrorMessage :message="properties.errorMessage || ''" />

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
