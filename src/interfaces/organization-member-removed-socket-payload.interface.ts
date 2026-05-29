import type { OrganizationMemberItem } from '@/modules/organization/interfaces/organization-member-item.interface'

export interface OrganizationMemberRemovedSocketPayload {
    organization_id: number
    member_id: number
    role: OrganizationMemberItem['role']
}
