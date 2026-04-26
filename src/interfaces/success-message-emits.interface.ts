import { Events } from '@/enums/events.enum'

export interface SuccessMessageEmits {
    (event: Events.CLEAR): void
}
