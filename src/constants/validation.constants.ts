export const VALIDATION = {
    EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    NUMERIC_ONLY: /[^0-9]/g,
    PHONE_ALLOWED: /[^0-9+]/g,
    PHONE_PATTERN: /^\+?[0-9]{10,15}$/,
    MINIMUM_PASSWORD_LENGTH: 6,
    VERIFICATION_CODE_LENGTH: 6
} as const
