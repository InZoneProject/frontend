import { BaseRepository } from '@/api/base.repository'
import type { NotificationItem } from '@/interfaces/notification.interface'
import type { NotificationsUnreadCount } from '@/interfaces/notifications-unread-count.interface'

class NotificationsRepository extends BaseRepository {
    constructor() {
        super('/notifications')
    }

    getAdminUnreadCount() {
        return this.get<NotificationsUnreadCount>('/admin/unread-count')
    }

    getAdminNotifications(params: { offset: number; limit: number }) {
        return this.get<NotificationItem[]>('/admin', { params })
    }

    markAllAsReadByAdmin() {
        return this.patch<void>('/admin/mark-all-read')
    }
}

export const notificationsRepository = new NotificationsRepository()
