import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'

export interface TagUpsertModalProperties {
    isOpen: boolean
    mode: 'create' | 'edit'
    nameValue: string
    tagUidValue: string
    loading: boolean
    canSubmit: boolean
    translations: OrganizationsTranslations['page']['modals']['tagForm']
}
