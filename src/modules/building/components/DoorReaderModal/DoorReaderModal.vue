<script setup lang="ts">
import DataTable from '@/components/DataTable/DataTable.vue'
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import CopyButton from '@/components/CopyButton/CopyButton.vue'
import SuccessMessage from '@/components/SuccessMessage/SuccessMessage.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import DeleteButton from '@/components/DeleteButton/DeleteButton.vue'
import EditButton from '@/components/EditButton/EditButton.vue'
import ReaderRegenerateButton from '@/modules/building/components/ReaderRegenerateButton/ReaderRegenerateButton.vue'
import { useDoorReaderModal } from '@/modules/building/composables/useDoorReaderModal'
import type { DoorReaderModalEmits } from '@/modules/building/interfaces/door-reader-modal-emits.interface'
import type { DoorReaderModalProperties } from '@/modules/building/interfaces/door-reader-modal-properties.interface'
import type { RfidReaderItem } from '@/modules/building/interfaces/rfid-reader-item.interface'
import { Events } from '@/enums/events.enum'
import './DoorReaderModal.css'

const properties = defineProps<DoorReaderModalProperties>()
const emit = defineEmits<DoorReaderModalEmits>()

const {
  isDragOverAssigned,
  isDragOverTable,
  onAssignedDragEnter,
  onAssignedDragLeave,
  onTableDragEnter,
  onTableDragLeave,
  onDropAssigned,
  onDropToTable
} = useDoorReaderModal(emit)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card door-reader-modal" role="dialog" aria-modal="true">
        <button type="button" class="door-reader-modal-close" @click="emit(Events.CLOSE)">✕</button>
        <div class="modal-header">
          <h3 class="modal-title">{{ properties.translations.title }}</h3>
        </div>

        <SuccessMessage :message="properties.copySuccessMessage" />
        <ErrorMessage :message="properties.errorMessage || ''" />

        <div v-if="properties.generatedToken" class="door-reader-token">
          <span>{{ properties.translations.tokenLabel }}</span>
          <div class="door-reader-token-capsule">
            <code>{{ properties.generatedToken }}</code>
            <CopyButton @click="emit(Events.COPY_TOKEN)" />
          </div>
        </div>

        <section
            class="door-reader-assigned"
            :class="{ 'is-drag-over': isDragOverAssigned }"
            @dragenter.prevent="onAssignedDragEnter"
            @dragover.prevent="onAssignedDragEnter"
            @dragleave="onAssignedDragLeave"
            @drop.prevent="onDropAssigned"
        >
          <p class="door-reader-section-title">{{ properties.translations.assignedTitle }}</p>
          <div v-if="properties.selectedReader" class="door-reader-assigned-table">
            <table class="main-table">
              <tbody>
              <tr
                  class="door-reader-row"
                  draggable="true"
                  @dragstart="$event.dataTransfer?.setData('application/x-assigned-reader', String(properties.selectedReader.rfid_reader_id))"
              >
                <td class="w-[34%]"><strong>{{ properties.selectedReader.name }}</strong></td>
                <td class="w-[24%]">
                  <span class="door-reader-muted">{{ properties.selectedReader.rfid_reader_id }}</span>
                </td>
                <td class="w-[22%]"><span class="door-reader-muted">{{ new Date(properties.selectedReader.created_at).toLocaleString() }}</span></td>
                <td class="w-[26%]">
                  <div class="door-reader-actions">
                    <EditButton @click="emit(Events.EDIT, properties.selectedReader)" />
                    <ReaderRegenerateButton @click="emit(Events.REGENERATE, properties.selectedReader)" />
                    <DeleteButton @click="emit(Events.DELETE, properties.selectedReader)" />
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="door-reader-empty">{{ properties.translations.emptyAssigned }}</div>
        </section>

        <div class="door-reader-table-toolbar">
          <div class="door-reader-intro-chip">
            <div class="door-reader-intro-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10v8H7z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4h6M12 16v4M8 20h8" />
              </svg>
            </div>
            <p>{{ properties.translations.hint }}</p>
          </div>
          <BaseButton type="button" variant="primary" :loading="false" :disabled="properties.loading" class="door-reader-add-button" @click="emit(Events.CREATE)">
            {{ properties.translations.add }}
          </BaseButton>
        </div>

        <div
            class="door-reader-table-dropzone"
            @dragenter.prevent="onTableDragEnter"
            @dragover.prevent="onTableDragEnter"
            @dragleave="onTableDragLeave"
            @drop.prevent="onDropToTable"
        >
          <DataTable
            :search-query="properties.search"
            :items="properties.readers"
            :offset="properties.offset"
            :limit="properties.limit"
            :total="properties.total"
            :loading="properties.loading"
            :placeholder="properties.translations.searchPlaceholder"
            empty-text="Нічого не знайдено"
            loading-text="Завантаження даних..."
            :interactive-rows="false"
            :is-drag-over="isDragOverTable"
            max-height="22rem"
            @update:search-query="emit(Events.UPDATE_SEARCH, $event)"
            @update:offset="emit(Events.UPDATE_OFFSET, $event)"
          >
          <template #header>
            <tr>
              <th class="w-[34%]">{{ properties.translations.name }}</th>
              <th class="w-[24%]">Reader ID</th>
              <th class="w-[22%]">{{ properties.translations.createdAt }}</th>
              <th class="w-[26%]">{{ properties.translations.actions }}</th>
            </tr>
          </template>
          <template #default="{ item }: { item: RfidReaderItem }">
            <tr
                class="door-reader-row"
                draggable="true"
                @dragstart="$event.dataTransfer?.setData('application/json', JSON.stringify(item))"
            >
              <td><strong>{{ item.name }}</strong></td>
              <td>
                <span class="door-reader-muted">{{ item.rfid_reader_id }}</span>
              </td>
              <td><span class="door-reader-muted">{{ new Date(item.created_at).toLocaleString() }}</span></td>
              <td>
                <div class="door-reader-actions">
                  <EditButton @click="emit(Events.EDIT, item)" />
                  <ReaderRegenerateButton @click="emit(Events.REGENERATE, item)" />
                  <DeleteButton @click="emit(Events.DELETE, item)" />
                </div>
              </td>
            </tr>
          </template>
          </DataTable>
        </div>
      </div>
    </div>
  </Transition>
</template>
