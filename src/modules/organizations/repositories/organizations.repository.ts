import { BaseRepository } from '@/api/base.repository'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { OrganizationItem } from '@/modules/organizations/interfaces/organization-item.interface'

class OrganizationsRepository extends BaseRepository {
    constructor() {
        super('/organizations')
    }

    getOrganizations(params: OrganizationListParams) {
        return this.get<PaginatedResponse<OrganizationItem>>('', { params })
    }

    createOrganization(payload: { title: string; description?: string }) {
        return this.post<OrganizationItem>('', payload)
    }

    updateOrganization(id: number, payload: { title: string; description: string | null }) {
        return this.put<OrganizationItem>(`/${id}`, payload)
    }

    deleteOrganization(id: number) {
        return this.delete<void>(`/${id}`)
    }
}

export const organizationsRepository = new OrganizationsRepository()
