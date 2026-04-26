import type { OrganizationMemberProfile } from '@/interfaces/organization-member-profile.interface'
import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'

export interface OrganizationMemberInfoProperties {
    isOpen: boolean
    member: OrganizationMemberProfile | null
    loading: boolean
    roleLabelResolver: (role: OrganizationMemberProfile['role']) => string
    formatDate: (value: string) => string
    translations: OrganizationsTranslations['page']['memberInfo']
}
