import { BaseRepository } from '@/api/base.repository'
import type { JoinOrganizationRequest } from '@/modules/join/interfaces/join-organization-request.interface'
import type { JoinOrganizationResponse } from '@/modules/join/interfaces/join-organization-response.interface'
import type { OrganizationConsentStatus } from '@/modules/join/interfaces/organization-consent-status.interface'

class JoinOrganizationRepository extends BaseRepository {
    constructor() {
        super('/employees')
    }

    getConsentStatus() {
        return this.get<OrganizationConsentStatus>('/consent-status')
    }

    joinOrganization(payload: JoinOrganizationRequest) {
        return this.post<JoinOrganizationResponse>('/join', payload)
    }
}

export const joinOrganizationRepository = new JoinOrganizationRepository()
