<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { LENGTH } from '@/constants/length.constants'
import { useReaderUpsertModal } from '@/modules/building/composables/useReaderUpsertModal'
import type { ReaderUpsertModalEmits } from '@/modules/building/interfaces/reader-upsert-modal-emits.interface'
import type { ReaderUpsertModalProperties } from '@/modules/building/interfaces/reader-upsert-modal-properties.interface'
import './ReaderUpsertModal.css'

const properties = defineProps<ReaderUpsertModalProperties>()
defineEmits<ReaderUpsertModalEmits>()

const { modalTitle, confirmLabel, updateNameValueEvent, submitEvent, cancelEvent } = useReaderUpsertModal(properties)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card reader-upsert-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="reader-upsert-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10v8H7z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4h6M12 16v4M8 20h8" />
            </svg>
          </div>
          <h3 class="modal-title">{{ modalTitle }}</h3>
        </div>

        <BaseInput
            :model-value="properties.nameValue"
            :label="properties.translations.nameLabel"
            type="text"
            :placeholder="properties.translations.namePlaceholder"
            :max-length="LENGTH.MAX_NAME_LENGTH"
              :min-value="null"
              :max-value="null"
            :is-expandable="false"
            :disabled="properties.loading"
            @update:model-value="$emit(updateNameValueEvent, $event)"
        />
        <ErrorMessage :message="properties.errorMessage || ''" />

        <div class="modal-actions">
          <BaseButton type="button" variant="secondary" :loading="false" :disabled="properties.loading" @click="$emit(cancelEvent)">
            {{ properties.translations.cancel }}
          </BaseButton>
          <BaseButton type="button" variant="primary" :loading="properties.loading" :disabled="properties.loading || !properties.canSubmit" @click="$emit(submitEvent)">
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
