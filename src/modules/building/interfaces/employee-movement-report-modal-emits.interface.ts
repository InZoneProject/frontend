import { Events } from '@/enums/events.enum'

export interface EmployeeMovementReportModalEmits {
    (event: Events.UPDATE_MODEL_VALUE, value: string): void
    (event: Events.SUBMIT): void
    (event: Events.CANCEL): void
}
