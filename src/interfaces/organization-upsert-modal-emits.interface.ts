import { Events } from '@/enums/events.enum'

export interface OrganizationUpsertModalEmits {
    (e: Events.UPDATE_NAME_VALUE, value: string): void
    (e: Events.UPDATE_DESCRIPTION_VALUE, value: string): void
    (e: Events.SUBMIT): void
    (e: Events.CANCEL): void
}
