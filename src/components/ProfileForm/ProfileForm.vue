<script setup lang="ts">
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import SuccessMessage from '@/components/SuccessMessage/SuccessMessage.vue'
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal.vue'
import { useProfileForm } from '@/composables/useProfileForm'
import { LENGTH } from '@/constants/length.constants'
import { IMAGE_UPLOAD_CONSTANTS } from '@/constants/image-upload.constants'
import { Events } from '@/enums/events.enum'
import type { ProfileFormProperties } from '@/interfaces/profile-form-properties.interface'
import type { ProfileFormEmits } from '@/interfaces/profile-form-emits.interface'
import './ProfileForm.css'

const properties = defineProps<ProfileFormProperties>()
const emit = defineEmits([Events.CLOSE]) as ProfileFormEmits

const {
  fileInputReference,
  triggerPhotoUpload,
  handleEmailValueUpdate,
  handlePhotoLoadingError,
  nameValue,
  emailValue,
  phoneValue,
  photoUrl,
  errorMessage,
  successMessage,
  phoneErrorMessage,
  isLoadingProfile,
  isSaving,
  isUploadingPhoto,
  isDeleting,
  isDeleteModalOpen,
  canSave,
  isFormDisabled,
  handlePhotoSelected,
  handleSave,
  handleClose,
  openDeleteModal,
  closeDeleteModal,
  handleDeleteAccount
} = useProfileForm(properties, emit)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="profile-modal-overlay">
      <div class="profile-modal-card" role="dialog" aria-modal="true">
        <div v-if="errorMessage" class="profile-modal-error">
          <ErrorMessage :message="errorMessage" />
        </div>

        <div class="profile-photo-section">
          <button
              type="button"
              class="profile-photo-button"
              :disabled="isFormDisabled"
              @click="triggerPhotoUpload"
          >
            <img
                v-if="photoUrl"
                :src="photoUrl"
                alt="Profile photo"
                class="profile-photo-image"
                @error="handlePhotoLoadingError"
            />
            <svg v-else class="profile-photo-fallback" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.314 0-6 2.015-6 4.5V20h12v-1.5c0-2.485-2.686-4.5-6-4.5z" />
            </svg>
          </button>

          <div class="profile-photo-caption">
            <p class="profile-photo-hint">{{ properties.translations.photoHint }}</p>
          </div>

          <input
              ref="fileInputReference"
              type="file"
              :accept="IMAGE_UPLOAD_CONSTANTS.ACCEPT"
              class="profile-photo-input"
              :disabled="isFormDisabled"
              @change="handlePhotoSelected"
          />
        </div>

        <div class="profile-fields">
          <div v-if="successMessage" class="profile-form-success">
            <SuccessMessage :message="successMessage" />
          </div>

          <div v-if="phoneErrorMessage !== ''" class="profile-phone-error">
            <ErrorMessage :message="phoneErrorMessage" />
          </div>

          <BaseInput
              v-model="nameValue"
              :label="properties.translations.nameLabel"
              type="text"
              :placeholder="properties.translations.namePlaceholder"
              :max-length="LENGTH.MAX_NAME_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="isFormDisabled"
          />

          <BaseInput
              :model-value="emailValue"
              :label="properties.translations.emailLabel"
              type="email"
              placeholder=""
              :max-length="LENGTH.MAX_EMAIL_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="true"
              @update:model-value="handleEmailValueUpdate"
          />

          <BaseInput
              v-model="phoneValue"
              :label="properties.translations.phoneLabel"
              type="tel"
              :placeholder="properties.translations.phonePlaceholder"
              :max-length="LENGTH.MAX_PHONE_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="isFormDisabled"
          />
        </div>

        <div class="profile-modal-actions">
          <BaseButton
              type="button"
              variant="primary"
              :loading="isSaving"
              :disabled="!canSave"
              @click="handleSave"
          >
            {{ properties.translations.save }}
          </BaseButton>

          <BaseButton
              type="button"
              variant="danger"
              :loading="isDeleting"
              :disabled="isDeleting || isLoadingProfile || isSaving || isUploadingPhoto"
              @click="openDeleteModal"
          >
            {{ properties.translations.deleteAccount }}
          </BaseButton>

          <BaseButton
              type="button"
              variant="secondary"
              :loading="false"
              :disabled="isSaving || isUploadingPhoto || isDeleting"
              @click="handleClose"
          >
            {{ properties.translations.cancel }}
          </BaseButton>
        </div>

        <div v-if="isLoadingProfile" class="profile-loading-overlay">
          <div class="profile-loading-spinner"></div>
        </div>
      </div>
    </div>
  </Transition>

  <ConfirmationModal
      :is-open="isDeleteModalOpen"
      :loading="isDeleting"
      :title="properties.translations.deleteConfirmTitle"
      :message="properties.translations.deleteConfirmMessage"
      :confirm-label="properties.translations.deleteConfirm"
      :cancel-label="properties.translations.deleteCancel"
      @confirm="handleDeleteAccount"
      @cancel="closeDeleteModal"
  />
</template>
