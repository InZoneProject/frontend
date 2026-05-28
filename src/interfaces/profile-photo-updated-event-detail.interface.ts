import type { OrganizationMemberItem } from '@/modules/organization/interfaces/organization-member-item.interface'

export interface ProfilePhotoUpdatedEventDetail {
    email: string
    role: OrganizationMemberItem['role']
    photo: string | null
}
