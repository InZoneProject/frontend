import type { EmployeeViolationZone } from '@/modules/building/interfaces/employee-violation-zone.interface'

export interface EmployeeViolationItem {
    notification_id: number
    title: string
    message: string
    created_at: string
    zone: EmployeeViolationZone
}
