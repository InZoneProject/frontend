import type { AuthResponse } from '@/interfaces/auth-response.interface'

export interface VerifyEmailResponse extends AuthResponse {
    is_verified: boolean
}
