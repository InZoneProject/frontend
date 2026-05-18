export interface ReaderUpsertModalProperties {
    isOpen: boolean
    mode: 'create' | 'edit'
    nameValue: string
    loading: boolean
    canSubmit: boolean
    translations: {
        createTitle: string
        editTitle: string
        nameLabel: string
        namePlaceholder: string
        createConfirm: string
        editConfirm: string
        cancel: string
    }
}
