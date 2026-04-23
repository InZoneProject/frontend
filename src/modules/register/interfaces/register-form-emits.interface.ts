import { Events } from '@/enums/events.enum'
import type { AuthResponse } from '@/interfaces/auth-response.interface'

export interface RegisterFormEmits {
    (e: Events.SUBMIT, payload: AuthResponse): void
}