import { BaseRepository } from '@/api/base.repository'
import type { InviteResponse } from '@/interfaces/invite-response.interface'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import type { OrganizationMemberProfile } from '@/interfaces/organization-member-profile.interface'
import type { OrganizationBuildingItem } from '@/modules/organization/interfaces/organization-building-item.interface'
import type { OrganizationMemberItem } from '@/modules/organization/interfaces/organization-member-item.interface'
import type { OrganizationRfidTagItem } from '@/modules/organization/interfaces/organization-rfid-tag-item.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'

class OrganizationRepository extends BaseRepository {
    constructor() {
        super('/organizations')
    }

    getTagAdminInviteStatus(organizationId: number) {
        return this.get<InviteResponse | null>(`/${organizationId}/tag-admin-invite-status`)
    }

    getEmployeeInviteStatus(organizationId: number) {
        return this.get<InviteResponse | null>(`/${organizationId}/employee-invite-status`)
    }

    generateTagAdminInvite(organizationId: number) {
        return this.post<InviteResponse>(`/${organizationId}/tag-admin-invite`)
    }

    generateEmployeeInvite(organizationId: number) {
        return this.post<InviteResponse>(`/${organizationId}/employee-invite`)
    }

    removeTagAdmin(organizationId: number, tagAdminId: number) {
        return this.delete<void>(`/${organizationId}/tag-admins/${tagAdminId}`)
    }

    removeEmployee(organizationId: number, employeeId: number) {
        return this.delete<void>(`/${organizationId}/employees/${employeeId}`)
    }

    getBuildings(organizationId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<OrganizationBuildingItem>>(`/${organizationId}/buildings`, { params })
    }

    getMembers(organizationId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<OrganizationMemberItem>>(`/${organizationId}/members`, { params })
    }

    getMemberProfile(organizationId: number, memberId: number, role: OrganizationMemberItem['role']) {
        return this.get<OrganizationMemberProfile>(`/${organizationId}/members/${memberId}/${role}`)
    }

    getRfidTags(organizationId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<OrganizationRfidTagItem>>(`/${organizationId}/rfid-tags`, { params })
    }

    createBuilding(payload: { organization_id: number; title: string; address: string | null }) {
        return this.axiosInstance.post(`${import.meta.env.VITE_API_BASE_URL}/buildings`, payload)
    }

    updateBuilding(buildingId: number, payload: { title: string; address: string | null }) {
        return this.axiosInstance.patch(`${import.meta.env.VITE_API_BASE_URL}/buildings/${buildingId}`, payload)
    }

    deleteBuilding(buildingId: number) {
        return this.axiosInstance.delete<void>(`${import.meta.env.VITE_API_BASE_URL}/buildings/${buildingId}`)
    }

    createRfidTag(payload: { organization_id: number; tag_uid: number; name: string }) {
        return this.axiosInstance.post(`${import.meta.env.VITE_API_BASE_URL}/rfid/tags`, payload)
    }

    updateRfidTag(tagId: number, payload: { name: string }) {
        return this.axiosInstance.patch(`${import.meta.env.VITE_API_BASE_URL}/rfid/tags/${tagId}`, payload)
    }

    deleteRfidTag(tagId: number) {
        return this.axiosInstance.delete<void>(`${import.meta.env.VITE_API_BASE_URL}/rfid/tags/${tagId}`)
    }
}

export const organizationRepository = new OrganizationRepository()
