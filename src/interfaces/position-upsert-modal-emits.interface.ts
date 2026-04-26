import { Events } from '@/enums/events.enum'

export interface PositionUpsertModalEmits {
    (event: Events.UPDATE_NAME_VALUE, value: string): void
    (event: Events.UPDATE_DESCRIPTION_VALUE, value: string): void
    (event: Events.SUBMIT): void
    (event: Events.CANCEL): void
}
