import { Events } from '@/enums/events.enum'

export interface InviteGeneratorEmits {
    (event: Events.GENERATE): void
    (event: Events.COPY): void
    (event: Events.CLEAR): void
}