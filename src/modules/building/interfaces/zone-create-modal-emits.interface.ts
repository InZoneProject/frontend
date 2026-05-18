import { Events } from '@/enums/events.enum'

export interface ZoneCreateModalEmits {
    (event: Events.UPDATE_TITLE_VALUE, value: string): void
    (event: Events.UPDATE_IS_TRANSITION_BETWEEN_FLOORS, value: boolean): void
    (event: Events.SUBMIT): void
    (event: Events.CANCEL): void
}
