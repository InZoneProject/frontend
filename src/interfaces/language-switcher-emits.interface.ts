import { Events } from '@/enums/events.enum'

export interface LanguageSwitcherEmits {
    (e: Events.UPDATE_LANGUAGE, language: string): void
}