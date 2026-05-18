import { Events } from '@/enums/events.enum'

export interface ReaderRegenerateButtonEmits {
    (event: Events.CLICK): void
}
