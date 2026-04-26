import { Events } from '@/enums/events.enum'

export interface OrganizationInfoFormEmits {
    (e: Events.EDIT): void
    (e: Events.DELETE): void
}
