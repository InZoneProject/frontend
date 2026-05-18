<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import { useBuildingUpsertModal } from '@/composables/useBuildingUpsertModal'
import { LENGTH } from '@/constants/length.constants'
import type { BuildingUpsertModalProperties } from '@/interfaces/building-upsert-modal-properties.interface'
import type { BuildingUpsertModalEmits } from '@/interfaces/building-upsert-modal-emits.interface'
import './BuildingUpsertModal.css'

const properties = defineProps<BuildingUpsertModalProperties>()
defineEmits<BuildingUpsertModalEmits>()

const {
    modalTitle,
    confirmLabel,
    updateTitleEvent,
    updateAddressEvent,
    submitEvent,
    cancelEvent
} = useBuildingUpsertModal(properties)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card modal-card-building-upsert" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="organization-upsert-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M4 21V8.5A1.5 1.5 0 0 1 5.5 7H10v14M10 3h8.5A1.5 1.5 0 0 1 20 4.5V21M14 7h2m-2 4h2m-2 4h2" />
            </svg>
          </div>
          <h3 class="modal-title">{{ modalTitle }}</h3>
        </div>

        <div class="building-upsert-fields">
          <BaseInput
              :model-value="properties.titleValue"
              @update:model-value="$emit(updateTitleEvent, $event)"
              :label="properties.translations.nameLabel"
              type="text"
              :placeholder="properties.translations.namePlaceholder"
              :max-length="LENGTH.MAX_BUILDING_TITLE_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="properties.loading"
          />

          <BaseInput
              :model-value="properties.addressValue"
              @update:model-value="$emit(updateAddressEvent, $event)"
              :label="properties.translations.addressLabel"
              type="text"
              :placeholder="properties.translations.addressPlaceholder"
              :max-length="LENGTH.MAX_ADDRESS_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
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
