import { Events } from '@/enums/events.enum'

export interface OrganizationMemberInfoEmits {
    (event: Events.CLOSE): void
    (event: Events.VIEW_POSITIONS): void
}
