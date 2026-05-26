import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'

export interface PositionUpsertModalProperties {
    isOpen: boolean
    mode: 'create' | 'edit'
    roleValue: string
    descriptionValue: string
    loading: boolean
    canSubmit: boolean
    errorMessage?: string
    translations: OrganizationsTranslations['page']['modals']['positionForm']
}
