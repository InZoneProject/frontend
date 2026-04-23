import type { CommonTranslations } from '@/interfaces/common-translations.interface'
import type { VerificationTranslations } from './verification-translations.interface'

export interface VerificationFormProperties {
    translations: VerificationTranslations;
    commonTranslations: CommonTranslations;
}