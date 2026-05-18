import type { RfidReaderItem } from '@/modules/building/interfaces/rfid-reader-item.interface'

export interface DoorReaderModalProperties {
    isOpen: boolean
    selectedReader: RfidReaderItem | null
    readers: RfidReaderItem[]
    search: string
    offset: number
    limit: number
    total: number
    loading: boolean
    generatedToken: string
    copySuccessMessage: string
    translations: {
        title: string
        assignedTitle: string
        emptyAssigned: string
        searchPlaceholder: string
        name: string
        createdAt: string
        actions: string
        tokenLabel: string
        copySuccess: string
        add: string
        hint: string
    }
}
