<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import BaseTabs from '@/components/BaseTabs/BaseTabs.vue'
import { LENGTH } from '@/constants/length.constants'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useZoneCreateModal } from '@/modules/building/composables/useZoneCreateModal'
import type { ZoneCreateModalEmits } from '@/modules/building/interfaces/zone-create-modal-emits.interface'
import type { ZoneCreateModalProperties } from '@/modules/building/interfaces/zone-create-modal-properties.interface'
import './ZoneCreateModal.css'

const properties = defineProps<ZoneCreateModalProperties>()
const emit = defineEmits<ZoneCreateModalEmits>()
const { translations } = useLanguageSwitcher()
const {
  activeZoneTypeTab,
  zoneTypeTabs,
  setZoneTypeTab,
  updateTitleValueEvent,
  submitEvent,
  cancelEvent
} = useZoneCreateModal(properties, emit)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card modal-card-zone-create" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="zone-create-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7.5A2.5 2.5 0 017.5 5h9A2.5 2.5 0 0119 7.5v9a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 015 16.5v-9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6M12 9v6" />
            </svg>
          </div>
          <h3 class="modal-title">{{ translations.organizationAdmin.buildingPage.zoneForm.title }}</h3>
        </div>

        <div class="zone-create-fields">
          <BaseInput
              :model-value="properties.titleValue"
              @update:model-value="emit(updateTitleValueEvent, $event)"
              :label="translations.organizationAdmin.buildingPage.zoneForm.nameLabel"
              type="text"
              :placeholder="translations.organizationAdmin.buildingPage.zoneForm.namePlaceholder"
              :max-length="LENGTH.MAX_NAME_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="properties.loading"
          />

          <BaseTabs
              v-if="!properties.hideTypeTabs"
              class="zone-create-type"
              :tabs="zoneTypeTabs"
              :active-tab="activeZoneTypeTab"
              @update:active-tab="setZoneTypeTab"
          />

          <p v-if="!properties.canCreateTransition && !properties.hideTypeTabs" class="zone-create-note">
            {{ translations.organizationAdmin.buildingPage.zoneForm.regularOnly }}
          </p>
          <p v-if="properties.errorMessage" class="zone-create-error">
            {{ properties.errorMessage }}
          </p>
        </div>

        <div class="modal-actions">
          <BaseButton type="button" variant="secondary" :loading="false" :disabled="properties.loading" @click="emit(cancelEvent)">
            {{ translations.organizationAdmin.buildingPage.zoneForm.cancel }}
          </BaseButton>
          <BaseButton type="button" variant="primary" :loading="properties.loading" :disabled="properties.loading || !properties.canSubmit" @click="emit(submitEvent)">
            {{ translations.organizationAdmin.buildingPage.zoneForm.confirm }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
