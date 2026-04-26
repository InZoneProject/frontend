import { Events } from '@/enums/events.enum'

export interface InviteGeneratorEmits {
    (event: Events.GENERATE): void
    (event: Events.COPY_LINK): void
    (event: Events.CLEAR): void
    (event: Events.CLEAR_SUCCESS): void
}
