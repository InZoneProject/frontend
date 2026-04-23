import { Events } from '@/enums/events.enum'

export interface ForgotPasswordFormEmits {
    (event: Events.RESEND): void;
}
