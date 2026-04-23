import type { CommonTranslations } from '@/interfaces/common-translations.interface'
import type { ForgotPasswordTranslations } from './forgot-password-translations.interface'

export interface ForgotPasswordFormProperties {
    translations: ForgotPasswordTranslations;
    commonTranslations: CommonTranslations;
}
