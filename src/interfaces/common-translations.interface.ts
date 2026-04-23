export interface CommonTranslations {
    title: string;
    forgotPassword: string;
    userNameLabel: string;
    userNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    roles: {
        'organization-admin': string;
        'tag-admin': string;
    };
    rolesDescription: {
        'organization-admin': string;
        'tag-admin': string;
        'global-admin': string;
    };
    errors: {
        invalidEmail: string;
        shortPassword: string;
        unauthorized: string;
        invalidToken: string;
        emailConflict: string;
        passwordMismatch: string;
        passwordSameAsCurrent: string;
        unexpected: string;
    };
}
