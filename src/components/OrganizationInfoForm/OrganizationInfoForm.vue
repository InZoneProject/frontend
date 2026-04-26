<script setup lang="ts">
import EditButton from '@/components/EditButton/EditButton.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import { useOrganizationInfoForm } from '@/composables/useOrganizationInfoForm'
import type { OrganizationInfoFormProperties } from '@/interfaces/organization-info-form-properties.interface'
import type { OrganizationInfoFormEmits } from '@/interfaces/organization-info-form-emits.interface'
import './OrganizationInfoForm.css'

const properties = defineProps<OrganizationInfoFormProperties>()
const emit = defineEmits<OrganizationInfoFormEmits>()

const {
  descriptionText,
  isDescriptionEmpty,
  editEvent,
  deleteEvent
} = useOrganizationInfoForm(properties)
</script>

<template>
  <div class="organization-info-form">
    <div class="organization-info-form-head">
      <div class="organization-info-form-title-wrap">
        <p class="organization-info-form-label">{{ properties.nameLabel }}</p>
        <h2 class="organization-info-form-value organization-info-form-title">{{ properties.titleValue }}</h2>
      </div>
    </div>

    <div class="organization-info-form-row">
      <p class="organization-info-form-label">{{ properties.descriptionLabel }}</p>
      <p
        class="organization-info-form-value organization-info-form-description"
        :class="{ 'is-empty': isDescriptionEmpty }"
      >
        {{ descriptionText }}
      </p>
    </div>

    <div class="organization-info-form-footer">
      <div class="organization-info-form-row">
        <p class="organization-info-form-label">{{ properties.createdAtLabel }}</p>
        <p class="organization-info-form-date">{{ properties.createdAtValue }}</p>
      </div>
      <div class="organization-info-form-actions">
        <EditButton @click="emit(editEvent)" />
        <DeleteButton @click="emit(deleteEvent)" />
      </div>
    </div>
  </div>
</template>
