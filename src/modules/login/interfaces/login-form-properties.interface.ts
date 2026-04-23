import type { UserRole } from '@/enums/user-role.enum'
import type { LoginTranslations } from './login-translations.interface'
import type { CommonTranslations } from '@/interfaces/common-translations.interface'

export interface LoginFormProperties {
    loginTranslations: LoginTranslations
    commonTranslations: CommonTranslations
    initialRole: UserRole
}