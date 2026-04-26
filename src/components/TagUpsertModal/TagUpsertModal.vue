<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import { useTagUpsertModal } from '@/composables/useTagUpsertModal'
import { LENGTH } from '@/constants/length.constants'
import type { TagUpsertModalProperties } from '@/interfaces/tag-upsert-modal-properties.interface'
import type { TagUpsertModalEmits } from '@/interfaces/tag-upsert-modal-emits.interface'
import './TagUpsertModal.css'

const properties = defineProps<TagUpsertModalProperties>()
defineEmits<TagUpsertModalEmits>()

const {
    modalTitle,
    confirmLabel,
    updateNameEvent,
    updateTagUidEvent,
    submitEvent,
    cancelEvent
} = useTagUpsertModal(properties)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card modal-card-tag-upsert" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="tag-upsert-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13l-7 7-9-9V4h7l9 9z" />
              <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h3 class="modal-title">{{ modalTitle }}</h3>
        </div>

        <div class="tag-upsert-fields">
          <BaseInput
              :model-value="properties.nameValue"
              @update:model-value="$emit(updateNameEvent, $event)"
              :label="properties.translations.nameLabel"
              type="text"
              :placeholder="properties.translations.namePlaceholder"
              :max-length="LENGTH.MAX_NAME_LENGTH"
              :is-expandable="false"
              :disabled="properties.loading"
          />

          <BaseInput
              v-if="properties.mode === 'create'"
              :model-value="properties.tagUidValue"
              @update:model-value="$emit(updateTagUidEvent, $event)"
              :label="properties.translations.tagUidLabel"
              type="text"
              :placeholder="properties.translations.tagUidPlaceholder"
              :max-length="LENGTH.MAX_NAME_LENGTH"
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
