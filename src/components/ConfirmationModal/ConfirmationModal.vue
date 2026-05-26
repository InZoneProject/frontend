<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { Events } from '@/enums/events.enum'
import type { ConfirmationModalProperties } from '@/interfaces/confirmation-modal-properties.interface'
import type { ConfirmationModalEmits } from '@/interfaces/confirmation-modal-emits.interface'
import './ConfirmationModal.css'

defineProps<ConfirmationModalProperties>()
defineEmits<ConfirmationModalEmits>()
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit(Events.CANCEL)">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-brand-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>

        <p class="modal-message">{{ message }}</p>
        <ErrorMessage :message="errorMessage || ''" />

        <div class="modal-actions">
          <BaseButton
              type="button"
              variant="secondary"
              :loading="false"
              :disabled="loading"
              @click="$emit(Events.CANCEL)"
          >
            {{ cancelLabel }}
          </BaseButton>

          <BaseButton
              type="button"
              variant="primary"
              :loading="loading"
              :disabled="loading"
              @click="$emit(Events.CONFIRM)"
          >
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
