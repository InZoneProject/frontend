<script setup lang="ts">
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { Events } from '@/enums/events.enum'
import type { EmployeeMovementReportButtonEmits } from '@/modules/building/interfaces/employee-movement-report-button-emits.interface'
import './EmployeeMovementReportButton.css'

defineEmits<EmployeeMovementReportButtonEmits>()
</script>

<template>
  <button class="employee-movement-report-button" type="button" @click="$emit(Events.CLICK)">
    <ArrowDownTrayIcon />
  </button>
</template>
