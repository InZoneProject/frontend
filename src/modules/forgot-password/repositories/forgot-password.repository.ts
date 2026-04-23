import { BaseRepository } from '@/api/base.repository'
import { UserRole } from '@/enums/user-role.enum'

class ForgotPasswordRepository extends BaseRepository {
    constructor() {
        super('/auth')
    }

    requestPasswordReset(role: UserRole, email: string) {
        const endpoint = role === UserRole.TAG_ADMIN
            ? '/tag-admin/password-reset-request'
            : '/organization-admin/password-reset-request'

        return this.post<void>(endpoint, { email })
    }
}

export const forgotPasswordRepository = new ForgotPasswordRepository()
