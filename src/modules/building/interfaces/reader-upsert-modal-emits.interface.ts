import { Events } from '@/enums/events.enum'

export interface ReaderUpsertModalEmits {
    (event: Events.UPDATE_NAME_VALUE, value: string): void
    (event: Events.SUBMIT): void
    (event: Events.CANCEL): void
}
