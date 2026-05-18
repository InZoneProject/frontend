import { BaseRepository } from '@/api/base.repository'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { OrganizationPositionItem } from '@/modules/organization/interfaces/organization-position-item.interface'

class PositionsRepository extends BaseRepository {
    constructor() {
        super('/organizations')
    }

    createPosition(payload: { organization_id: number; role: string; description?: string | null }) {
        return this.post<OrganizationPositionItem>('/positions', payload)
    }

    updatePosition(positionId: number, payload: { role: string; description?: string | null }) {
        return this.patch<OrganizationPositionItem>(`/positions/${positionId}`, payload)
    }

    deletePosition(positionId: number) {
        return this.delete<void>(`/positions/${positionId}`)
    }

    getMemberPositions(organizationId: number, memberId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<OrganizationPositionItem>>(`/${organizationId}/members/${memberId}/positions`, { params })
    }

    getUnassignedEmployeePositions(organizationId: number, employeeId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<OrganizationPositionItem>>(
            `/${organizationId}/employees/${employeeId}/unassigned-positions`,
            { params }
        )
    }

    assignPosition(employeeId: number, positionId: number) {
        return this.post<void>(`/employees/${employeeId}/positions/${positionId}`)
    }

    unassignPosition(employeeId: number, positionId: number) {
        return this.delete<void>(`/employees/${employeeId}/positions/${positionId}`)
    }
}

export const positionsRepository = new PositionsRepository()
