import { io, type Socket } from 'socket.io-client'
import type { NotificationSocketPayload } from '@/interfaces/notification-socket-payload.interface'

class NotificationsSocketService {
    private static instance: NotificationsSocketService | null = null
    private notificationsSocket: Socket | null = null
    private activeToken = ''
    private notificationHandler: ((payload: NotificationSocketPayload) => void) | null = null

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

    connect(token: string, handler: (payload: NotificationSocketPayload) => void): void {
        if (!token) {
            return
        }

        this.notificationHandler = handler

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
            this.notificationHandler?.(payload)
        })
    }

    disconnect(): void {
        if (!this.notificationsSocket) {
            this.activeToken = ''
            this.notificationHandler = null
            return
        }

        this.notificationsSocket.emit('unsubscribe')
        this.notificationsSocket.disconnect()
        this.notificationsSocket = null
        this.activeToken = ''
        this.notificationHandler = null
    }
}

export const notificationsSocketService = NotificationsSocketService.getInstance()
