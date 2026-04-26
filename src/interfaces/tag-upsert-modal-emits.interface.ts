import { Events } from '@/enums/events.enum'

export interface TagUpsertModalEmits {
    (event: Events.UPDATE_NAME_VALUE, value: string): void
    (event: Events.UPDATE_TAG_UID_VALUE, value: string): void
    (event: Events.SUBMIT): void
    (event: Events.CANCEL): void
}
