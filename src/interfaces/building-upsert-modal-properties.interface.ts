import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'

export interface BuildingUpsertModalProperties {
    isOpen: boolean
    mode: 'create' | 'edit'
    titleValue: string
    addressValue: string
    loading: boolean
    canSubmit: boolean
    translations: OrganizationsTranslations['page']['modals']['buildingForm']
}
