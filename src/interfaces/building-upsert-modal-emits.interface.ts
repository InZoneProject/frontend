import { Events } from '@/enums/events.enum'

export interface BuildingUpsertModalEmits {
    (event: Events.UPDATE_TITLE_VALUE, value: string): void
    (event: Events.UPDATE_ADDRESS_VALUE, value: string): void
    (event: Events.SUBMIT): void
    (event: Events.CANCEL): void
}
