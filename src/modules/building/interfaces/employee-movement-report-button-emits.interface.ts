import { Events } from '@/enums/events.enum'

export interface EmployeeMovementReportButtonEmits {
    (event: Events.CLICK): void
}
