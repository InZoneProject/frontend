import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'

export interface OrganizationUpsertModalProperties {
    isOpen: boolean
    mode: 'create' | 'edit'
    nameValue: string
    descriptionValue: string
    loading: boolean
    canSubmit: boolean
    translations: OrganizationsTranslations['modals']['organizationForm']
}
