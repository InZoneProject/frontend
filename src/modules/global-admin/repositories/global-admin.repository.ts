import { BaseRepository } from '@/api/base.repository'
import type { InviteResponse } from '@/interfaces/invite-response.interface'
import type { OrganizationAdmin } from '@/interfaces/organization-admin.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { InviteHistory } from '../interfaces/invite-history.interface'

class GlobalAdminRepository extends BaseRepository {
    constructor() {
        super('/global-admin')
    }

    getInviteStatus() {
        return this.get<InviteResponse | null>('/invites/status')
    }

    generateInvite() {
        return this.post<InviteResponse>('/invites')
    }

    getOrganizationAdmins(params: { search: string; offset: number; limit: number }) {
        return this.get<PaginatedResponse<OrganizationAdmin>>('/organization-admins', { params })
    }

    getInviteHistory(params: { search: string; offset: number; limit: number }) {
        return this.get<PaginatedResponse<InviteHistory>>('/invites/history', { params })
    }

    deleteOrganizationAdmin(id: number) {
        return this.delete<void>(`/organization-admins/${id}`)
    }
}

export const globalAdminRepository = new GlobalAdminRepository()