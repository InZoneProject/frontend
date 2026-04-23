import { Events } from '@/enums/events.enum'

export interface BaseCodeInputEmits {
    (e: Events.UPDATE_MODEL_VALUE, value: string): void
}