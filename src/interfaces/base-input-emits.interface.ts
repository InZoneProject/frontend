import { Events } from '@/enums/events.enum'

export interface BaseInputEmits {
    (e: Events.UPDATE_MODEL_VALUE, value: string): void
}