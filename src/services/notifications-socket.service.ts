import { io, type Socket } from 'socket.io-client'
import type { NotificationSocketPayload } from '@/interfaces/notification-socket-payload.interface'
import type { OrganizationMemberJoinedSocketPayload } from '@/interfaces/organization-member-joined-socket-payload.interface'
import type { OrganizationMemberRemovedSocketPayload } from '@/interfaces/organization-member-removed-socket-payload.interface'

class NotificationsSocketService {
    private static instance: NotificationsSocketService | null = null
    private notificationsSocket: Socket | null = null
    private activeToken = ''
    private notificationHandlers = new Set<(payload: NotificationSocketPayload) => void>()
    private organizationMemberJoinedHandlers = new Set<(payload: OrganizationMemberJoinedSocketPayload) => void>()
    private organizationMemberRemovedHandlers = new Set<(payload: OrganizationMemberRemovedSocketPayload) => void>()

    private constructor() {}

    static getInstance(): NotificationsSocketService {
        if (!NotificationsSocketService.instance) {
            NotificationsSocketService.instance = new NotificationsSocketService()
        }

        return NotificationsSocketService.instance
    }

    private resolveSocketBaseUrl(): string {
        const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '')
        const origin = new URL(apiBaseUrl).origin
        return `${origin}/notifications`
    }

    connect(token: string): void {
        if (!token) {
            return
        }

        if (this.notificationsSocket && this.activeToken === token) {
            return
        }

        this.disconnect()
        this.activeToken = token

        this.notificationsSocket = io(this.resolveSocketBaseUrl(), {
            transports: ['websocket', 'polling'],
            auth: {
                token: `Bearer ${token}`
            }
        })

        this.notificationsSocket.on('connect', () => {
            this.notificationsSocket?.emit('subscribe')
        })

        this.notificationsSocket.on('notification.received', (payload: NotificationSocketPayload) => {
            this.notificationHandlers.forEach((handler) => handler(payload))
        })

        this.notificationsSocket.on('organization.member_joined', (payload: OrganizationMemberJoinedSocketPayload) => {
            this.organizationMemberJoinedHandlers.forEach((handler) => handler(payload))
        })

        this.notificationsSocket.on('organization.member_removed', (payload: OrganizationMemberRemovedSocketPayload) => {
            this.organizationMemberRemovedHandlers.forEach((handler) => handler(payload))
        })
    }

    onNotificationReceived(handler: (payload: NotificationSocketPayload) => void): () => void {
        this.notificationHandlers.add(handler)
        return () => {
            this.notificationHandlers.delete(handler)
            this.disconnectIfIdle()
        }
    }

    onOrganizationMemberJoined(handler: (payload: OrganizationMemberJoinedSocketPayload) => void): () => void {
        this.organizationMemberJoinedHandlers.add(handler)
        return () => {
            this.organizationMemberJoinedHandlers.delete(handler)
            this.disconnectIfIdle()
        }
    }

    onOrganizationMemberRemoved(handler: (payload: OrganizationMemberRemovedSocketPayload) => void): () => void {
        this.organizationMemberRemovedHandlers.add(handler)
        return () => {
            this.organizationMemberRemovedHandlers.delete(handler)
            this.disconnectIfIdle()
        }
    }

    disconnect(): void {
        if (!this.notificationsSocket) {
            this.activeToken = ''
            this.notificationHandlers.clear()
            this.organizationMemberJoinedHandlers.clear()
            this.organizationMemberRemovedHandlers.clear()
            return
        }

        this.notificationsSocket.emit('unsubscribe')
        this.notificationsSocket.disconnect()
        this.notificationsSocket = null
        this.activeToken = ''
        this.notificationHandlers.clear()
        this.organizationMemberJoinedHandlers.clear()
        this.organizationMemberRemovedHandlers.clear()
    }

    private disconnectIfIdle(): void {
        if (
            this.notificationHandlers.size > 0 ||
            this.organizationMemberJoinedHandlers.size > 0 ||
            this.organizationMemberRemovedHandlers.size > 0
        ) {
            return
        }

        this.disconnect()
    }
}

export const notificationsSocketService = NotificationsSocketService.getInstance()
