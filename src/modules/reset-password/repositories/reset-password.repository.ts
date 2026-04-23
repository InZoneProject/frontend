import { BaseRepository } from '@/api/base.repository'

class ResetPasswordRepository extends BaseRepository {
    constructor() {
        super('/auth')
    }

    resetPassword(token: string, newPassword: string) {
        return this.put<void>('/reset-password', {
            token,
            new_password: newPassword
        })
    }
}

export const resetPasswordRepository = new ResetPasswordRepository()
