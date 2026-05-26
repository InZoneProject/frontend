<script setup lang="ts">
import DataTable from '@/components/DataTable/DataTable.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { Events } from '@/enums/events.enum'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useEmployeeTagModal } from '@/modules/tag-admin/composables/useEmployeeTagModal'
import type { EmployeeTagModalEmits } from '@/modules/tag-admin/interfaces/employee-tag-modal-emits.interface'
import type { EmployeeTagModalProperties } from '@/modules/tag-admin/interfaces/employee-tag-modal-properties.interface'
import type { RfidTagItem } from '@/modules/tag-admin/interfaces/rfid-tag-item.interface'
import './EmployeeTagModal.css'

const properties = defineProps<EmployeeTagModalProperties>()
const emit = defineEmits<EmployeeTagModalEmits>()
const { formatDate } = useDateFormatter()

const {
  isDragOverAssigned,
  isDragOverTable,
  onAssignedDragEnter,
  onAssignedDragLeave,
  onTableDragEnter,
  onTableDragLeave,
  onDropAssigned,
  onDropToTable
} = useEmployeeTagModal(emit)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card employee-tag-modal" role="dialog" aria-modal="true">
        <button type="button" class="employee-tag-modal-close" @click="emit(Events.CLOSE)">✕</button>
        <div class="modal-header">
          <h3 class="modal-title">{{ properties.translations.title }}</h3>
        </div>

        <ErrorMessage :message="properties.errorMessage" />

        <section
            class="employee-tag-assigned"
            :class="{ 'is-drag-over': isDragOverAssigned }"
            @dragenter.prevent="onAssignedDragEnter"
            @dragover.prevent="onAssignedDragEnter"
            @dragleave="onAssignedDragLeave"
            @drop.prevent="onDropAssigned"
        >
          <p class="employee-tag-section-title">{{ properties.translations.assignedTitle }}</p>
          <div v-if="properties.selectedTag" class="employee-tag-assigned-table">
            <table class="main-table">
              <tbody>
              <tr
                  class="employee-tag-row"
                  draggable="true"
                  @dragstart="$event.dataTransfer?.setData('application/x-assigned-tag', String(properties.selectedTag.rfid_tag_id))"
              >
                <td class="w-[42%]"><strong>{{ properties.selectedTag.name }}</strong></td>
                <td class="w-[28%]"><span class="employee-tag-muted">{{ properties.selectedTag.tag_uid }}</span></td>
                <td class="w-[30%]"><span class="employee-tag-muted">{{ formatDate(properties.selectedTag.created_at) }}</span></td>
              </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="employee-tag-empty">{{ properties.translations.emptyAssigned }}</div>
        </section>

        <div
            class="employee-tag-table-dropzone"
            @dragenter.prevent="onTableDragEnter"
            @dragover.prevent="onTableDragEnter"
            @dragleave="onTableDragLeave"
            @drop.prevent="onDropToTable"
        >
          <DataTable
              :search-query="properties.search"
              :items="properties.tags"
              :offset="properties.offset"
              :limit="properties.limit"
              :total="properties.total"
              :loading="properties.loading"
              :placeholder="properties.translations.searchPlaceholder"
              :empty-text="properties.translations.emptyAvailable"
              :loading-text="properties.translations.loading"
              :interactive-rows="false"
              :is-drag-over="isDragOverTable"
              max-height="22rem"
              @update:search-query="emit(Events.UPDATE_SEARCH, $event)"
              @update:offset="emit(Events.UPDATE_OFFSET, $event)"
          >
            <template #header>
              <tr>
                <th class="w-[42%]">{{ properties.translations.name }}</th>
                <th class="w-[28%]">{{ properties.translations.tagUid }}</th>
                <th class="w-[30%]">{{ properties.translations.createdAt }}</th>
              </tr>
            </template>

            <template #default="{ item }: { item: RfidTagItem }">
              <tr
                  class="employee-tag-row"
                  draggable="true"
                  @dragstart="$event.dataTransfer?.setData('application/json', JSON.stringify(item))"
              >
                <td><strong>{{ item.name }}</strong></td>
                <td><span class="employee-tag-muted">{{ item.tag_uid }}</span></td>
                <td><span class="employee-tag-muted">{{ formatDate(item.created_at) }}</span></td>
              </tr>
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </Transition>
</template>
