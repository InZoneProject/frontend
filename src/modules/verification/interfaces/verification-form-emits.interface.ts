import { Events } from '@/enums/events.enum'

export interface VerificationFormEmits {
    (event: Events.SUBMIT, code: string): void;
    (event: Events.RESEND): void;
}