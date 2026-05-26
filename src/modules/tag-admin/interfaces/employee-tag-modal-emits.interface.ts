import { Events } from '@/enums/events.enum'
import type { RfidTagItem } from '@/modules/tag-admin/interfaces/rfid-tag-item.interface'

export interface EmployeeTagModalEmits {
    (event: Events.CLOSE): void
    (event: Events.UPDATE_SEARCH, value: string): void
    (event: Events.UPDATE_OFFSET, value: number): void
    (event: Events.ASSIGN, value: RfidTagItem): void
    (event: Events.UNASSIGN): void
}
