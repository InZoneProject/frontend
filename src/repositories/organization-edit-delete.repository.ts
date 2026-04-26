import { BaseRepository } from '@/api/base.repository'
import type { OrganizationInfo } from '@/modules/organization/interfaces/organization-info.interface'

class OrganizationEditDeleteRepository extends BaseRepository {
    constructor() {
        super('/organizations')
    }

    getOrganizationInfo(id: number) {
        return this.get<OrganizationInfo>(`/${id}/info`)
    }

    updateOrganization(
        id: number,
        payload: {
            title: string
            description: string | null
        },
    ) {
        return this.put<OrganizationInfo>(`/${id}`, payload)
    }

    deleteOrganization(id: number) {
        return this.delete<void>(`/${id}`)
    }
}

export const organizationEditDeleteRepository = new OrganizationEditDeleteRepository()
