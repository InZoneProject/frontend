import type { AuthResponse } from '@/interfaces/auth-response.interface'
import {Events} from "@/enums/events.enum";

export interface LoginFormEmits {
    (event: Events.SUBMIT, payload: AuthResponse): void
}