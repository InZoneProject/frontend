export interface TagAdminEmployeeItem {
    id: number
    full_name: string
    email: string
    phone: string | null
    photo: string | null
    has_assigned_tag: boolean
    created_at: string
}
