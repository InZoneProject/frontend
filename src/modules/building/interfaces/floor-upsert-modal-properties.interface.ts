import type { FloorUpsertModalTranslations } from '@/modules/building/interfaces/floor-upsert-modal-translations.interface'

export interface FloorUpsertModalProperties {
    isOpen: boolean
    mode: 'create' | 'edit'
    nameValue: string
    loading: boolean
    canSubmit: boolean
    translations: FloorUpsertModalTranslations
}
