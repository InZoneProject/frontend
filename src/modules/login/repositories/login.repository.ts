import { BaseRepository } from '@/api/base.repository'
import { UserRole } from '@/enums/user-role.enum'
import type { AuthResponse } from '@/interfaces/auth-response.interface'

class LoginRepository extends BaseRepository {
    constructor() {
        super('/auth')
    }

    login(email: string, password: string, role: UserRole) {
        const endpoint = `/${role}/login`
        return this.post<AuthResponse>(endpoint, { email, password })
    }
}

export const loginRepository = new LoginRepository()