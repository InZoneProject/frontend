import { Events } from '@/enums/events.enum'

export interface BaseTabsEmits {
    (e: Events.UPDATE_ACTIVE_TAB, id: string): void
}