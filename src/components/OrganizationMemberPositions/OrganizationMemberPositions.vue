<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import DataTable from '@/components/DataTable/DataTable.vue'
import EditButton from '@/components/EditButton/EditButton.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { useOrganizationMemberPositions } from '@/composables/useOrganizationMemberPositions'
import type { OrganizationMemberPositionsProperties } from '@/interfaces/organization-member-positions-properties.interface'
import type { OrganizationMemberPositionsEmits } from '@/interfaces/organization-member-positions-emits.interface'
import './OrganizationMemberPositions.css'

const properties = defineProps<OrganizationMemberPositionsProperties>()
const emit = defineEmits<OrganizationMemberPositionsEmits>()

const {
    isVisible,
    showAssignedLoader,
    showAvailableLoader,
    dragOverAssigned,
    dragOverAvailable,
    closeEvent,
    backToInfoEvent,
    startEditEvent,
    finishEditEvent,
    addPositionEvent,
    editEvent,
    deleteEvent,
    assignEvent,
    unassignEvent,
    updateAssignedSearchEvent,
    updateAvailableSearchEvent,
    updateAssignedOffsetEvent,
    updateAvailableOffsetEvent,
    onDragStart,
    onDragOver,
    clearDragState,
    onDrop,
    formatPositionCreatedAt
} = useOrganizationMemberPositions(properties)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isVisible" class="modal-overlay" @click="emit(closeEvent)">
      <div
          class="modal-card organization-member-positions-modal"
          :class="{ 'is-edit-mode': properties.isEditMode }"
          role="dialog"
          aria-modal="true"
          @click.stop
      >
        <div class="organization-member-positions-actions">
          <BaseButton
              v-if="!properties.isEditMode"
              type="button"
              variant="secondary"
              :loading="false"
              :disabled="false"
              @click="emit(backToInfoEvent)"
          >
            {{ properties.translations.backToInfo }}
          </BaseButton>

          <BaseButton
              v-if="!properties.isEditMode"
              type="button"
              variant="primary"
              :loading="false"
              :disabled="properties.loadingAssigned"
              @click="emit(startEditEvent)"
          >
            {{ properties.translations.editPositions }}
          </BaseButton>

          <BaseButton
              v-if="properties.isEditMode"
              type="button"
              variant="secondary"
              :loading="false"
              :disabled="false"
              @click="emit(finishEditEvent)"
          >
            {{ properties.translations.finish }}
          </BaseButton>

          <BaseButton
              v-if="properties.isEditMode"
              type="button"
              variant="primary"
              :loading="false"
              :disabled="false"
              @click="emit(addPositionEvent)"
          >
            {{ properties.translations.addPosition }}
          </BaseButton>
        </div>

        <ErrorMessage :message="properties.errorMessage || ''" />

        <div class="organization-member-positions-grid" :class="{ 'is-edit-mode': properties.isEditMode }">
          <section class="organization-member-positions-column">
            <h3 class="organization-member-positions-column-title">{{ properties.translations.assignedTitle }}</h3>
            <div
                class="organization-member-positions-drop-zone"
                :class="{ 'is-drag-over': dragOverAssigned }"
                @dragover="onDragOver($event, 'assigned')"
                @dragleave="clearDragState"
                @drop="onDrop($event, 'assigned', (positionId) => emit(assignEvent, positionId), (positionId) => emit(unassignEvent, positionId))"
            >
              <DataTable
                  :items="properties.assignedPositions"
                  :search-query="properties.assignedSearchValue"
                  @update:search-query="emit(updateAssignedSearchEvent, $event)"
                  :offset="properties.assignedOffset"
                  :limit="properties.limit"
                  :total="properties.assignedTotal"
                  @update:offset="emit(updateAssignedOffsetEvent, $event)"
                  :loading="showAssignedLoader"
                  :placeholder="properties.translations.assignedSearchPlaceholder"
                  empty-text="Нічого не знайдено"
                  loading-text="Завантаження даних..."
                  :interactive-rows="properties.isEditMode"
                  :is-drag-over="dragOverAssigned"
                  max-height="28rem"
              >
                <template #header>
                  <tr v-if="properties.isEditMode">
                    <th class="w-[24%]">Роль</th>
                    <th class="w-[40%]">Опис</th>
                    <th class="w-[22%]">Створено</th>
                    <th class="w-[14%]">Дії</th>
                  </tr>
                  <tr v-else>
                    <th class="w-[28%]">Роль</th>
                    <th class="w-[46%]">Опис</th>
                    <th class="w-[26%]">Створено</th>
                  </tr>
                </template>

                <template #default="{ item: position }">
                  <tr
                      class="organization-member-positions-row"
                      :draggable="properties.isEditMode"
                      @dragstart="onDragStart($event, position.position_id, 'assigned')"
                  >
                    <td>
                      <span class="organization-member-positions-item-title">{{ position.role }}</span>
                    </td>
                    <td>
                      <span class="organization-member-positions-item-description">{{ position.description || '—' }}</span>
                    </td>
                    <td>
                      <span class="organization-member-positions-item-date">{{ formatPositionCreatedAt(position.created_at) }}</span>
                    </td>
                    <td v-if="properties.isEditMode" @click.stop>
                      <div class="organization-member-positions-item-actions">
                        <EditButton @click="emit(editEvent, position.position_id)" />
                        <DeleteButton @click="emit(deleteEvent, position.position_id)" />
                      </div>
                    </td>
                  </tr>
                </template>
              </DataTable>
            </div>
          </section>

          <section v-if="properties.isEditMode" class="organization-member-positions-column">
            <h3 class="organization-member-positions-column-title">{{ properties.translations.availableTitle }}</h3>
            <div
                class="organization-member-positions-drop-zone"
                :class="{ 'is-drag-over': dragOverAvailable }"
                @dragover="onDragOver($event, 'available')"
                @dragleave="clearDragState"
                @drop="onDrop($event, 'available', (positionId) => emit(assignEvent, positionId), (positionId) => emit(unassignEvent, positionId))"
            >
              <DataTable
                  :items="properties.availablePositions"
                  :search-query="properties.availableSearchValue"
                  @update:search-query="emit(updateAvailableSearchEvent, $event)"
                  :offset="properties.availableOffset"
                  :limit="properties.limit"
                  :total="properties.availableTotal"
                  @update:offset="emit(updateAvailableOffsetEvent, $event)"
                  :loading="showAvailableLoader"
                  :placeholder="properties.translations.availableSearchPlaceholder"
                  empty-text="Нічого не знайдено"
                  loading-text="Завантаження даних..."
                  :interactive-rows="true"
                  :is-drag-over="dragOverAvailable"
                  max-height="28rem"
              >
                <template #header>
                  <tr>
                    <th class="w-[24%]">Роль</th>
                    <th class="w-[40%]">Опис</th>
                    <th class="w-[22%]">Створено</th>
                    <th class="w-[14%]">Дії</th>
                  </tr>
                </template>

                <template #default="{ item: position }">
                  <tr
                      class="organization-member-positions-row"
                      draggable="true"
                      @dragstart="onDragStart($event, position.position_id, 'available')"
                  >
                    <td>
                      <span class="organization-member-positions-item-title">{{ position.role }}</span>
                    </td>
                    <td>
                      <span class="organization-member-positions-item-description">{{ position.description || '—' }}</span>
                    </td>
                    <td>
                      <span class="organization-member-positions-item-date">{{ formatPositionCreatedAt(position.created_at) }}</span>
                    </td>
                    <td @click.stop>
                      <div class="organization-member-positions-item-actions">
                        <EditButton @click="emit(editEvent, position.position_id)" />
                        <DeleteButton @click="emit(deleteEvent, position.position_id)" />
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
</template>
