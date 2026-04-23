export const VALIDATION = {
    EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    NUMERIC_ONLY: /[^0-9]/g,
    MINIMUM_PASSWORD_LENGTH: 6,
    VERIFICATION_CODE_LENGTH: 6
} as const