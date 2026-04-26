import { Events } from '@/enums/events.enum'

export interface NotificationBellButtonEmits {
    (e: Events.TOGGLE): void
}
