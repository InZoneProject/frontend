import { BaseRepository } from '@/api/base.repository'
import type { OrganizationMemberItem } from '@/modules/organization/interfaces/organization-member-item.interface'
import type { OrganizationMemberProfile } from '@/interfaces/organization-member-profile.interface'

class ParticipantsControlRepository extends BaseRepository {
    constructor() {
        super('/organizations')
    }

    getMemberProfile(organizationId: number, memberId: number, role: OrganizationMemberItem['role']) {
        return this.get<OrganizationMemberProfile>(`/${organizationId}/members/${memberId}/${role}`)
    }

    removeEmployee(organizationId: number, employeeId: number) {
        return this.delete<void>(`/${organizationId}/employees/${employeeId}`)
    }
}

export const participantsControlRepository = new ParticipantsControlRepository()
