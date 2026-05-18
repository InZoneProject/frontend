import { computed, ref, watch } from 'vue'
import { Events } from '@/enums/events.enum'
import { EMPLOYEE_MOVEMENT_REPORT_CALENDAR_CONSTANTS } from '@/modules/building/constants/employee-movement-report-calendar.constants'
import { employeeMovementReportDateService } from '@/modules/building/services/employee-movement-report-date.service'
import type { EmployeeMovementReportModalEmits } from '@/modules/building/interfaces/employee-movement-report-modal-emits.interface'
import type { EmployeeMovementReportModalProperties } from '@/modules/building/interfaces/employee-movement-report-modal-properties.interface'

export const useEmployeeMovementReportModal = (
    properties: EmployeeMovementReportModalProperties,
    emit: EmployeeMovementReportModalEmits
) => {
    const { toDate, toDateValue, toMonthValue } = employeeMovementReportDateService
    const selectedDate = computed(() => toDate(properties.dateValue))
    const visibleMonthValue = ref(toDateValue(new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1)))
    const visibleMonthDate = computed(() => toDate(visibleMonthValue.value))
    const minMonthValue = computed(() => properties.minDate ? toMonthValue(toDate(properties.minDate)) : '')
    const maxMonthValue = computed(() => properties.maxDate ? toMonthValue(toDate(properties.maxDate)) : '')
    const monthLabel = computed(() =>
        new Intl.DateTimeFormat(properties.locale, { month: 'long', year: 'numeric' }).format(visibleMonthDate.value)
    )
    const weekdayLabels = computed(() => employeeMovementReportDateService.getWeekdayLabels(
        properties.locale,
        EMPLOYEE_MOVEMENT_REPORT_CALENDAR_CONSTANTS.DAYS_IN_WEEK
    ))
    const calendarDays = computed(() => {
        const firstDay = visibleMonthDate.value
        const mondayOffset = (firstDay.getDay() + 6) % EMPLOYEE_MOVEMENT_REPORT_CALENDAR_CONSTANTS.DAYS_IN_WEEK
        const start = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() - mondayOffset)
        const min = properties.minDate ? toDate(properties.minDate) : null
        const max = properties.maxDate ? toDate(properties.maxDate) : null

        return Array.from({
            length: EMPLOYEE_MOVEMENT_REPORT_CALENDAR_CONSTANTS.DAYS_IN_WEEK *
                EMPLOYEE_MOVEMENT_REPORT_CALENDAR_CONSTANTS.VISIBLE_WEEKS
        }, (_, index) => {
            const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
            const value = toDateValue(date)
            const disabled = properties.loading ||
                (min !== null && date < min) ||
                (max !== null && date > max)

            return {
                value,
                label: String(date.getDate()),
                isSelected: value === properties.dateValue,
                isOutsideMonth: date.getMonth() !== firstDay.getMonth(),
                disabled
            }
        })
    })
    const title = computed(() => properties.translations.title.replace('{name}', properties.employeeName))
    const canShiftVisibleMonth = (months: number) => {
        const current = visibleMonthDate.value
        const nextMonth = toMonthValue(new Date(current.getFullYear(), current.getMonth() + months, 1))
        if (minMonthValue.value && nextMonth < minMonthValue.value) return false
        return !(maxMonthValue.value && nextMonth > maxMonthValue.value);

    }
    const canShiftPreviousMonth = computed(() => canShiftVisibleMonth(-1))
    const canShiftNextMonth = computed(() => canShiftVisibleMonth(1))
    const canShiftPreviousYear = computed(() => canShiftVisibleMonth(-12))
    const canShiftNextYear = computed(() => canShiftVisibleMonth(12))

    const shiftVisibleMonth = (months: number) => {
        if (!canShiftVisibleMonth(months)) return
        const current = visibleMonthDate.value
        visibleMonthValue.value = toDateValue(new Date(current.getFullYear(), current.getMonth() + months, 1))
    }

    const shiftVisibleYear = (years: number) => {
        shiftVisibleMonth(years * 12)
    }

    const selectDate = (value: string, disabled: boolean) => {
        if (disabled) return
        emit(Events.UPDATE_MODEL_VALUE, value)
    }

    watch(
        () => properties.dateValue,
        (value) => {
            const date = toDate(value)
            visibleMonthValue.value = toDateValue(new Date(date.getFullYear(), date.getMonth(), 1))
        }
    )

    return {
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
    }
}
