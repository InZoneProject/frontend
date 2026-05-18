import { Events } from '@/enums/events.enum'
import type { RfidReaderItem } from '@/modules/building/interfaces/rfid-reader-item.interface'

export interface DoorReaderModalEmits {
    (event: Events.UPDATE_SEARCH, value: string): void
    (event: Events.UPDATE_OFFSET, value: number): void
    (event: Events.ASSIGN, reader: RfidReaderItem): void
    (event: Events.UNASSIGN): void
    (event: Events.EDIT, reader: RfidReaderItem): void
    (event: Events.REGENERATE, reader: RfidReaderItem): void
    (event: Events.DELETE, reader: RfidReaderItem): void
    (event: Events.COPY_TOKEN): void
    (event: Events.CREATE): void
    (event: Events.CLOSE): void
}
