import { Events } from '@/enums/events.enum'

export interface OrganizationViewEmits {
    (e: Events.CLOSE): void
}
