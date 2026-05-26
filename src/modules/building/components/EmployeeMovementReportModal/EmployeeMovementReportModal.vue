<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.vue'
import { Events } from '@/enums/events.enum'
import { useEmployeeMovementReportModal } from '@/modules/building/composables/useEmployeeMovementReportModal'
import type { EmployeeMovementReportModalEmits } from '@/modules/building/interfaces/employee-movement-report-modal-emits.interface'
import type { EmployeeMovementReportModalProperties } from '@/modules/building/interfaces/employee-movement-report-modal-properties.interface'
import './EmployeeMovementReportModal.css'

const properties = defineProps<EmployeeMovementReportModalProperties>()
const emit = defineEmits<EmployeeMovementReportModalEmits>()

const {
  title,
  monthLabel,
  weekdayLabels,
  calendarDays,
  canShiftPreviousMonth,
  canShiftNextMonth,
  canShiftPreviousYear,
  canShiftNextYear,
  shiftVisibleMonth,
  shiftVisibleYear,
  selectDate
} = useEmployeeMovementReportModal(properties, emit)
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="properties.isOpen" class="modal-overlay">
      <div class="modal-card employee-movement-report-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="employee-movement-report-modal-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
            </svg>
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>

        <div class="employee-movement-report-calendar">
          <div class="employee-movement-report-calendar-title">
            <span>{{ properties.translations.dateLabel }}</span>
            <div class="employee-movement-report-calendar-navigation">
              <button type="button" :disabled="properties.loading || !canShiftPreviousYear" @click="shiftVisibleYear(-1)">«</button>
              <button type="button" :disabled="properties.loading || !canShiftPreviousMonth" @click="shiftVisibleMonth(-1)">‹</button>
              <strong>{{ monthLabel }}</strong>
              <button type="button" :disabled="properties.loading || !canShiftNextMonth" @click="shiftVisibleMonth(1)">›</button>
              <button type="button" :disabled="properties.loading || !canShiftNextYear" @click="shiftVisibleYear(1)">»</button>
            </div>
          </div>

          <div class="employee-movement-report-weekdays">
            <span v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</span>
          </div>

          <div class="employee-movement-report-days">
            <button
                v-for="day in calendarDays"
                :key="day.value"
                type="button"
                class="employee-movement-report-day"
                :class="{ 'is-selected': day.isSelected, 'is-outside': day.isOutsideMonth }"
                :disabled="day.disabled"
                @click="selectDate(day.value, day.disabled)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>
        <ErrorMessage :message="properties.errorMessage || ''" />

        <div class="modal-actions">
          <BaseButton type="button" variant="secondary" :loading="false" :disabled="properties.loading" @click="emit(Events.CANCEL)">
            {{ properties.translations.cancel }}
          </BaseButton>
          <BaseButton type="button" variant="primary" :loading="properties.loading" :disabled="properties.loading || !properties.canSubmit" @click="emit(Events.SUBMIT)">
            {{ properties.translations.download }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
