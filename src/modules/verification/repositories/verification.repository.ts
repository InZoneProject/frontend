import { BaseRepository } from '@/api/base.repository'
import type { VerificationStatusResponse } from '../interfaces/verification-status-response.interface'
import type { VerifyEmailResponse } from '../interfaces/verify-email-response.interface'

class VerificationRepository extends BaseRepository {
    constructor() {
        super('/auth')
    }

    getVerificationStatus() {
        return this.get<VerificationStatusResponse>('/verification-status')
    }

    resendCode() {
        return this.post<{ message: string }>('/resend-code')
    }

    verifyEmail(code: string) {
        return this.post<VerifyEmailResponse>('/verify-email', { code })
    }
}

export const verificationRepository = new VerificationRepository()
