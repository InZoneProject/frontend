export interface OrganizationMemberItem {
    id: number
    full_name: string
    email: string
    photo: string | null
    role: 'organization_admin' | 'tag_admin' | 'employee'
    created_at: string
}
