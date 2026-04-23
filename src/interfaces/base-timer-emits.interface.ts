import { Events } from '@/enums/events.enum'

export interface BaseTimerEmits {
    (event: Events.FINISH): void
}