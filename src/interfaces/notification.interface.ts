export interface NotificationItem {
    notification_id: number
    title: string
    message: string
    is_read: boolean
    created_at: string
    employee_id: number | null
}
