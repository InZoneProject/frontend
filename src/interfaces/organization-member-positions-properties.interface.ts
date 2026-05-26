import type { OrganizationPositionItem } from '@/modules/organization/interfaces/organization-position-item.interface'
import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'

export interface OrganizationMemberPositionsProperties {
    isOpen: boolean
    isEditMode: boolean
    loadingAssigned: boolean
    loadingAvailable: boolean
    errorMessage?: string
    assignedPositions: OrganizationPositionItem[]
    availablePositions: OrganizationPositionItem[]
    assignedSearchValue: string
    availableSearchValue: string
    assignedOffset: number
    availableOffset: number
    limit: number
    assignedTotal: number
    availableTotal: number
    formatDate: (value: string) => string
    translations: OrganizationsTranslations['page']['memberPositions']
}
