import type { NotificationItem } from '@/interfaces/notification.interface'

export interface NotificationsDropdownProperties {
    isOpen: boolean
    notifications: NotificationItem[]
    isLoading: boolean
    title: string
    emptyLabel: string
}
