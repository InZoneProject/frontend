import { Events } from '@/enums/events.enum'

export interface ConfirmationModalEmits {
    (e: Events.CONFIRM): void
    (e: Events.CANCEL): void
}