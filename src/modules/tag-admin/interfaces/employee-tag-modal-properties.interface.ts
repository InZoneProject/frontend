import type { RfidTagItem } from '@/modules/tag-admin/interfaces/rfid-tag-item.interface'
import type { TagAdminPanelTranslations } from '@/modules/tag-admin/interfaces/tag-admin-panel-translations.interface'

export interface EmployeeTagModalProperties {
    isOpen: boolean
    selectedTag: RfidTagItem | null
    tags: RfidTagItem[]
    search: string
    offset: number
    limit: number
    total: number
    loading: boolean
    errorMessage: string
    translations: TagAdminPanelTranslations['tagModal']
}
