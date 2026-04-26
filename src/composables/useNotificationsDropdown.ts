import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { notificationsRepository } from '@/repositories/notifications.repository'
import { notificationsSocketService } from '@/services/notifications-socket.service'
import { useAuthStore } from '@/stores/auth.store'
import type { NotificationItem } from '@/interfaces/notification.interface'
import type { NotificationSocketPayload } from '@/interfaces/notification-socket-payload.interface'

export function useNotificationsDropdown(show: Ref<boolean>) {
    const authStore = useAuthStore()

    const notificationsContainer = ref<HTMLElement | null>(null)
    const unreadCount = ref(0)
    const notifications = ref<NotificationItem[]>([])
    const isDropdownOpen = ref(false)
    const isLoadingNotifications = ref(false)
    const isMarkingAsRead = ref(false)

    const hasUnread = computed(() => unreadCount.value > 0)

    const isNotificationsAvailable = computed(() =>
        show.value && !!authStore.orgToken && authStore.isVerified
    )

    const mapSocketPayloadToNotification = (
        payload: NotificationSocketPayload
    ): NotificationItem => {
        return {
            notification_id: payload.notification_id,
            title: payload.title,
            message: payload.message,
            is_read: payload.is_read,
            created_at: new Date(payload.created_at).toISOString(),
            employee_id: null
        }
    }

    const mergeIncomingNotification = (item: NotificationItem): void => {
        const existingIndex = notifications.value.findIndex(
            (notification) => notification.notification_id === item.notification_id
        )

        if (existingIndex >= 0) {
            notifications.value[existingIndex] = item
            return
        }

        notifications.value = [item, ...notifications.value]
    }

    const fetchUnreadCount = async (): Promise<void> => {
        const response = await notificationsRepository.getAdminUnreadCount()
        unreadCount.value = response.data.unread_count
    }

    const fetchNotifications = async (): Promise<void> => {
        isLoadingNotifications.value = true

        try {
            const response = await notificationsRepository.getAdminNotifications({
                offset: 0,
                limit: 20
            })
            notifications.value = response.data.map((item) => ({
                ...item,
                employee_id: item.employee_id ?? null
            }))
        } finally {
            isLoadingNotifications.value = false
        }
    }

    const markAllAsRead = async (): Promise<void> => {
        isMarkingAsRead.value = true

        try {
            await notificationsRepository.markAllAsReadByAdmin()
            unreadCount.value = 0
            notifications.value = notifications.value.map((item) => ({
                ...item,
                is_read: true
            }))
        } finally {
            isMarkingAsRead.value = false
        }
    }

    const markAllAsReadIfNeeded = async (): Promise<void> => {
        if (!hasUnread.value || isMarkingAsRead.value) {
            return
        }

        await markAllAsRead()
    }

    const handleIncomingNotification = (payload: NotificationSocketPayload): void => {
        const mappedItem = mapSocketPayloadToNotification(payload)

        if (isDropdownOpen.value) {
            mergeIncomingNotification({
                ...mappedItem,
                is_read: true
            })
            unreadCount.value = 0
            void markAllAsReadIfNeeded()
            return
        }

        mergeIncomingNotification(mappedItem)
        unreadCount.value += 1
    }

    const ensureSocketConnection = (token: string): void => {
        if (!token) {
            return
        }

        notificationsSocketService.connect(token, handleIncomingNotification)
    }

    const disconnectSocket = (): void => {
        notificationsSocketService.disconnect()
    }

    const openDropdown = async (): Promise<void> => {
        isDropdownOpen.value = true
        await fetchNotifications()

        if (hasUnread.value) {
            await markAllAsRead()
        }
    }

    const closeDropdown = (): void => {
        isDropdownOpen.value = false
    }

    const toggleDropdown = async (): Promise<void> => {
        if (isDropdownOpen.value) {
            closeDropdown()
            return
        }

        await openDropdown()
    }

    const handleDocumentMouseDown = (event: MouseEvent): void => {
        if (!notificationsContainer.value) {
            return
        }

        const targetNode = event.target as Node
        if (!notificationsContainer.value.contains(targetNode)) {
            closeDropdown()
        }
    }

    const refreshNotificationsAvailability = async (): Promise<void> => {
        if (!isNotificationsAvailable.value) {
            closeDropdown()
            disconnectSocket()
            return
        }

        await fetchUnreadCount()
        ensureSocketConnection(authStore.orgToken || '')
    }

    watch(isNotificationsAvailable, () => {
        void refreshNotificationsAvailability()
    }, { immediate: true })

    onMounted(() => {
        document.addEventListener('mousedown', handleDocumentMouseDown)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('mousedown', handleDocumentMouseDown)
        disconnectSocket()
    })

    return {
        notificationsContainer,
        isNotificationsAvailable,
        unreadCount,
        notifications,
        isDropdownOpen,
        isLoadingNotifications,
        toggleDropdown
    }
}
