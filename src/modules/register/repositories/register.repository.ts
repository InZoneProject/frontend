import { BaseRepository } from '@/api/base.repository'
import { UserRole } from '@/enums/user-role.enum'
import type { AuthResponse } from '@/interfaces/auth-response.interface'
import type { RegisterRequest } from '../interfaces/register-request.interface'

class RegisterRepository extends BaseRepository {
    constructor() {
        super('/auth')
    }

    register(role: UserRole, data: RegisterRequest) {
        const endpoint = role === UserRole.TAG_ADMIN
            ? '/tag-admin/register'
            : '/organization-admin/register'

        return this.post<AuthResponse>(endpoint, data)
    }
}

export const registerRepository = new RegisterRepository()