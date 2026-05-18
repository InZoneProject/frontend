<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import DataTable from '@/components/DataTable/DataTable.vue'
import EditButton from '@/components/EditButton/EditButton.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal.vue'
import RulePositionsButton from '@/modules/building/components/RulePositionsButton/RulePositionsButton.vue'
import { useZoneAccessRulesModal } from '@/modules/building/composables/useZoneAccessRulesModal'
import { LENGTH } from '@/constants/length.constants'
import { Events } from '@/enums/events.enum'
import { ZONE_ACCESS_RULES_CONSTANTS } from '@/modules/building/constants/zone-access-rules.constants'
import { ZoneAccessRuleType } from '@/modules/building/enums/zone-access-rule-type.enum'
import type { ZoneAccessRulesModalProperties } from '@/modules/building/interfaces/zone-access-rules-modal-properties.interface'
import type { ZoneAccessRulesModalEmits } from '@/modules/building/interfaces/zone-access-rules-modal-emits.interface'
import './ZoneAccessRulesModal.css'

const properties = defineProps<ZoneAccessRulesModalProperties>()
const emit = defineEmits([Events.CLOSE]) as ZoneAccessRulesModalEmits

const {
    limit,
    isVisible,
    isEditMode,
    isPositionsMode,
    assignedSearch,
    availableSearch,
    assignedOffset,
    availableOffset,
    assignedTotal,
    availableTotal,
    loadingAssigned,
    loadingAvailable,
    dragOverAssigned,
    dragOverAvailable,
    ruleToDetach,
    ruleToDelete,
    positionToDelete,
    isConfirmLoading,
    ruleFormOpen,
    ruleTitle,
    ruleAccessType,
    ruleMaxDuration,
    positionFormOpen,
    positionRole,
    positionDescription,
    canSubmitRule,
    canSubmitPosition,
    currentAssigned,
    currentAvailable,
    modalTitle,
    editButtonLabel,
    assignedTitle,
    availableTitle,
    ruleFormTitle,
    positionFormTitle,
    closeEvent,
    translations,
    accessTypeOptions,
    getItemId,
    getItemTitle,
    getItemDescription,
    formatCreatedAt,
    startEdit,
    finishEdit,
    close,
    openItemPositions,
    backToRules,
    onDragStart,
    onDragOver,
    clearDragState,
    onDrop,
    editItem,
    deleteItem,
    confirmDetachRule,
    openCreateRule,
    submitRule,
    confirmDeleteRule,
    openCreatePosition,
    submitPosition,
    confirmDeletePosition
} = useZoneAccessRulesModal(properties, emit)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isVisible" class="modal-overlay" @click="emit(closeEvent)">
      <div
          class="modal-card zone-access-rules-modal"
          :class="{ 'is-edit-mode': isEditMode }"
          role="dialog"
          aria-modal="true"
          @click.stop
      >
        <div class="zone-access-rules-heading">
          <h3 class="zone-access-rules-title">{{ modalTitle }}</h3>
        </div>

        <div class="zone-access-rules-actions-bar">
          <BaseButton
              v-if="isPositionsMode && !isEditMode"
              type="button"
              variant="secondary"
              :loading="false"
              :disabled="false"
              @click="backToRules"
          >
            {{ translations.backToEditRules }}
          </BaseButton>

          <BaseButton
              v-if="!isEditMode && !isPositionsMode"
              type="button"
              variant="secondary"
              :loading="false"
              :disabled="false"
              @click="close"
          >
            {{ translations.close }}
          </BaseButton>

          <BaseButton
              v-if="!isEditMode"
              type="button"
              variant="primary"
              :loading="false"
              :disabled="loadingAssigned"
              @click="startEdit"
          >
            {{ editButtonLabel }}
          </BaseButton>

          <BaseButton
              v-if="isEditMode"
              type="button"
              variant="secondary"
              :loading="false"
              :disabled="false"
              @click="finishEdit"
          >
            {{ translations.finish }}
          </BaseButton>

          <BaseButton
              v-if="isEditMode && !isPositionsMode"
              type="button"
              variant="primary"
              :loading="false"
              :disabled="false"
              @click="openCreateRule"
          >
            {{ translations.addRule }}
          </BaseButton>

          <BaseButton
              v-if="isEditMode && isPositionsMode"
              type="button"
              variant="primary"
              :loading="false"
              :disabled="false"
              @click="openCreatePosition"
          >
            {{ translations.addPosition }}
          </BaseButton>
        </div>

        <div class="zone-access-rules-grid" :class="{ 'is-edit-mode': isEditMode }">
          <section class="zone-access-rules-column">
            <h3 class="zone-access-rules-column-title">{{ assignedTitle }}</h3>
            <div
                class="zone-access-rules-drop-zone"
                :class="{ 'is-drag-over': dragOverAssigned }"
                @dragover="onDragOver($event, 'assigned')"
                @dragleave="clearDragState"
                @drop="onDrop($event, 'assigned')"
            >
              <DataTable
                  :items="currentAssigned"
                  :search-query="assignedSearch"
                  @update:search-query="assignedSearch = $event"
                  :offset="assignedOffset"
                  :limit="limit"
                  :total="assignedTotal"
                  @update:offset="assignedOffset = $event"
                  :loading="loadingAssigned"
                  :placeholder="translations.assignedSearch"
                  :empty-text="translations.empty"
                  :loading-text="translations.loading"
                  :interactive-rows="isEditMode"
                  :is-drag-over="dragOverAssigned"
                  max-height="28rem"
              >
                <template #header>
                  <tr v-if="isEditMode">
                    <th class="w-[28%]">{{ isPositionsMode ? translations.role : translations.rule }}</th>
                    <th class="w-[32%]">{{ isPositionsMode ? translations.description : translations.accessType }}</th>
                    <th class="w-[20%]">{{ translations.createdAt }}</th>
                    <th class="w-[20%]">{{ translations.actions }}</th>
                  </tr>
                  <tr v-else>
                    <th class="w-[34%]">{{ isPositionsMode ? translations.role : translations.rule }}</th>
                    <th class="w-[38%]">{{ isPositionsMode ? translations.description : translations.accessType }}</th>
                    <th class="w-[28%]">{{ translations.createdAt }}</th>
                  </tr>
                </template>

                <template #default="{ item }">
                  <tr
                      class="zone-access-rules-row"
                      :draggable="isEditMode"
                      @dragstart="onDragStart($event, getItemId(item), 'assigned')"
                  >
                    <td>
                      <span class="zone-access-rules-item-title">{{ getItemTitle(item) }}</span>
                    </td>
                    <td>
                      <span class="zone-access-rules-item-description">{{ getItemDescription(item) }}</span>
                    </td>
                    <td>
                      <span class="zone-access-rules-item-date">{{ formatCreatedAt(item.created_at) }}</span>
                    </td>
                    <td v-if="isEditMode" @click.stop>
                      <div class="zone-access-rules-item-actions">
                        <RulePositionsButton
                            v-if="!isPositionsMode"
                            class="zone-access-rules-position-button"
                            @click="openItemPositions(item)"
                        />
                        <EditButton v-if="isEditMode" @click="editItem(item)" />
                        <DeleteButton v-if="isEditMode" @click="deleteItem(item)" />
                      </div>
                    </td>
                  </tr>
                </template>
              </DataTable>
            </div>
          </section>

          <section v-if="isEditMode" class="zone-access-rules-column">
            <h3 class="zone-access-rules-column-title">{{ availableTitle }}</h3>
            <div
                class="zone-access-rules-drop-zone"
                :class="{ 'is-drag-over': dragOverAvailable }"
                @dragover="onDragOver($event, 'available')"
                @dragleave="clearDragState"
                @drop="onDrop($event, 'available')"
            >
              <DataTable
                  :items="currentAvailable"
                  :search-query="availableSearch"
                  @update:search-query="availableSearch = $event"
                  :offset="availableOffset"
                  :limit="limit"
                  :total="availableTotal"
                  @update:offset="availableOffset = $event"
                  :loading="loadingAvailable"
                  :placeholder="translations.availableSearch"
                  :empty-text="translations.empty"
                  :loading-text="translations.loading"
                  :interactive-rows="true"
                  :is-drag-over="dragOverAvailable"
                  max-height="28rem"
              >
                <template #header>
                  <tr>
                    <th class="w-[28%]">{{ isPositionsMode ? translations.role : translations.rule }}</th>
                    <th class="w-[32%]">{{ isPositionsMode ? translations.description : translations.accessType }}</th>
                    <th class="w-[20%]">{{ translations.createdAt }}</th>
                    <th class="w-[20%]">{{ translations.actions }}</th>
                  </tr>
                </template>

                <template #default="{ item }">
                  <tr
                      class="zone-access-rules-row"
                      draggable="true"
                      @dragstart="onDragStart($event, getItemId(item), 'available')"
                  >
                    <td>
                      <span class="zone-access-rules-item-title">{{ getItemTitle(item) }}</span>
                    </td>
                    <td>
                      <span class="zone-access-rules-item-description">{{ getItemDescription(item) }}</span>
                    </td>
                    <td>
                      <span class="zone-access-rules-item-date">{{ formatCreatedAt(item.created_at) }}</span>
                    </td>
                    <td @click.stop>
                      <div class="zone-access-rules-item-actions">
                        <EditButton @click="editItem(item)" />
                        <DeleteButton @click="deleteItem(item)" />
                      </div>
                    </td>
                  </tr>
                </template>
              </DataTable>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Transition>

  <ConfirmationModal
      :is-open="ruleToDetach !== null"
      :loading="isConfirmLoading"
      :title="translations.detachConfirmTitle"
      :message="translations.detachConfirmMessage"
      :confirm-label="translations.detachConfirm"
      :cancel-label="translations.cancel"
      @confirm="confirmDetachRule"
      @cancel="ruleToDetach = null"
  />

  <ConfirmationModal
      :is-open="ruleToDelete !== null"
      :loading="isConfirmLoading"
      :title="translations.deleteRuleTitle"
      :message="translations.deleteRuleMessage"
      :confirm-label="translations.delete"
      :cancel-label="translations.cancel"
      @confirm="confirmDeleteRule"
      @cancel="ruleToDelete = null"
  />

  <ConfirmationModal
      :is-open="positionToDelete !== null"
      :loading="isConfirmLoading"
      :title="translations.deletePositionTitle"
      :message="translations.deletePositionMessage"
      :confirm-label="translations.delete"
      :cancel-label="translations.cancel"
      @confirm="confirmDeletePosition"
      @cancel="positionToDelete = null"
  />

  <Transition name="modal-fade">
    <div v-if="ruleFormOpen" class="modal-overlay" @click.self="ruleFormOpen = false">
      <div class="modal-card zone-access-rules-upsert-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="zone-access-rules-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16v10H4z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <h3 class="modal-title">{{ ruleFormTitle }}</h3>
        </div>

        <div class="zone-access-rules-form-fields">
          <BaseInput
              v-model="ruleTitle"
              :label="translations.ruleTitle"
              type="text"
              :placeholder="translations.ruleTitle"
              :max-length="LENGTH.MAX_NAME_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="false"
          />

          <BaseInput
              v-model="ruleAccessType"
              :label="translations.accessType"
              type="select"
              :placeholder="translations.accessType"
              :max-length="LENGTH.MAX_NAME_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="false"
              :options="accessTypeOptions"
          />

          <BaseInput
              v-if="ruleAccessType === ZoneAccessRuleType.TIME_LIMITED"
              v-model="ruleMaxDuration"
              :label="translations.maxDuration"
              type="number"
              :placeholder="translations.maxDuration"
              :max-length="String(ZONE_ACCESS_RULES_CONSTANTS.ACCESS_RULE_DURATION_MAX).length"
              :min-value="ZONE_ACCESS_RULES_CONSTANTS.ACCESS_RULE_DURATION_MIN"
              :max-value="ZONE_ACCESS_RULES_CONSTANTS.ACCESS_RULE_DURATION_MAX"
              :is-expandable="false"
              :disabled="false"
          />
        </div>

        <div class="modal-actions">
          <BaseButton type="button" variant="secondary" :loading="false" :disabled="false" @click="ruleFormOpen = false">
            {{ translations.cancel }}
          </BaseButton>
          <BaseButton type="button" variant="primary" :loading="false" :disabled="!canSubmitRule" @click="submitRule">
            {{ translations.save }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="modal-fade">
    <div v-if="positionFormOpen" class="modal-overlay" @click.self="positionFormOpen = false">
      <div class="modal-card zone-access-rules-upsert-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="zone-access-rules-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16v10H4z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <h3 class="modal-title">{{ positionFormTitle }}</h3>
        </div>

        <div class="zone-access-rules-form-fields">
          <BaseInput
              v-model="positionRole"
              :label="translations.role"
              type="text"
              :placeholder="translations.role"
              :max-length="LENGTH.MAX_NAME_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="false"
              :disabled="false"
          />

          <BaseInput
              v-model="positionDescription"
              :label="translations.description"
              type="text"
              :placeholder="translations.description"
              :max-length="LENGTH.MAX_DESCRIPTION_LENGTH"
              :min-value="null"
              :max-value="null"
              :is-expandable="true"
              :disabled="false"
          />
        </div>

        <div class="modal-actions">
          <BaseButton type="button" variant="secondary" :loading="false" :disabled="false" @click="positionFormOpen = false">
            {{ translations.cancel }}
          </BaseButton>
          <BaseButton type="button" variant="primary" :loading="false" :disabled="!canSubmitPosition" @click="submitPosition">
            {{ translations.save }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
