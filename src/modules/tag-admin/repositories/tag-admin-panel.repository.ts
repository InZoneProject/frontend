import { BaseRepository } from '@/api/base.repository'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { OrganizationInfo } from '@/modules/organization/interfaces/organization-info.interface'
import type { TagAdminEmployeeItem } from '@/modules/tag-admin/interfaces/tag-admin-employee-item.interface'
import type { Profile } from '@/interfaces/profile.interface'
import type { UpdateProfileInfo } from '@/interfaces/update-profile-info.interface'
import type { UpdateProfilePhotoResponse } from '@/interfaces/update-profile-photo-response.interface'
import type { OrganizationMemberProfile } from '@/interfaces/organization-member-profile.interface'
import type { RfidTagItem } from '@/modules/tag-admin/interfaces/rfid-tag-item.interface'

class TagAdminPanelRepository extends BaseRepository {
    constructor() {
        super('/tag-admin')
    }

    getProfile() {
        return this.get<Profile>('/profile')
    }

    updateProfileInfo(payload: UpdateProfileInfo) {
        return this.patch<UpdateProfileInfo>('/profile/info', payload)
    }

    updateProfilePhoto(formData: FormData) {
        return this.patch<UpdateProfilePhotoResponse>('/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }

    deleteProfile() {
        return this.delete<void>('/profile')
    }

    getEmployees(params: OrganizationListParams) {
        return this.get<PaginatedResponse<TagAdminEmployeeItem>>('/employees', { params })
    }

    getOrganizationInfo() {
        return this.get<OrganizationInfo>('/organization')
    }

    getEmployeeProfile(organizationId: number, employeeId: number) {
        return this.axiosInstance.get<OrganizationMemberProfile>(
            `${import.meta.env.VITE_API_BASE_URL}/organizations/${organizationId}/members/${employeeId}/employee`
        )
    }

    getAssignedTag(employeeId: number) {
        return this.get<RfidTagItem | null>(`/employees/${employeeId}/tag`)
    }

    getAvailableTags(employeeId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<RfidTagItem>>(`/employees/${employeeId}/available-tags`, { params })
    }

    assignTag(employeeId: number, rfidTagId: number) {
        return this.post<void>('/tag-assignments', {
            employee_id: employeeId,
            rfid_tag_id: rfidTagId
        })
    }

    unassignTag(employeeId: number) {
        return this.delete<void>(`/employees/${employeeId}/tag`)
    }
}

export const tagAdminPanelRepository = new TagAdminPanelRepository()
