import type { OrganizationMemberItem } from '@/modules/organization/interfaces/organization-member-item.interface'

export interface OrganizationMemberJoinedSocketPayload {
    organization_id: number
    member: OrganizationMemberItem
}
