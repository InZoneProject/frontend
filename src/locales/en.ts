export const en = {
    common: {
        title: 'InZone',
        forgotPassword: 'Forgot password?',
        userNameLabel: 'User',
        userNamePlaceholder: 'Enter your name',
        emailLabel: 'Email Address',
        emailPlaceholder: 'Enter your email address',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        roles: {
            'organization-admin': 'Organization Admin',
            'tag-admin': 'Tag Admin'
        },
        rolesDescription: {
            'organization-admin': 'Create and manage your own organizations',
            'tag-admin': 'Assign and manage employee tags',
            'global-admin': 'Full system control'
        },
        errors: {
            invalidEmail: 'Invalid email format',
            shortPassword: 'Password must be at least 6 characters',
            unauthorized: 'Invalid email or password',
            invalidToken: 'Invalid or missing invitation token',
            emailConflict: 'This email is already in use',
            passwordMismatch: 'Passwords do not match',
            passwordSameAsCurrent: 'New password cannot match current password',
            unexpected: 'An unexpected error occurred'
        }
    },
    login: {
        submitRole: 'Login'
    },
    register: {
        submitRole: 'Registration'
    },
    globalAdmin: {
        inviteSection: {
            title: 'Invite Generation',
            activeTitle: 'Invite is Ready',
            description: 'Generate a unique registration link for new organization administrators. Please note that the link is temporary.',
            activeDescription: 'Copy the link and send it to the administrator. It will only be valid for the duration shown.',
            generateBtn: 'Generate Link',
            linkActive: 'Active link:',
            expiresIn: 'Expires in:',
            copyBtn: 'Copy',
            deleteBtn: 'Delete link'
        },
        tabs: {
            admins: 'Administrators',
            history: 'Invite History'
        },
        table: {
            searchPlaceholder: 'Search by email or name...',
            empty: 'No results found',
            loading: 'Loading data...',
            headers: {
                name: 'User',
                phone: 'Phone Number',
                email: 'Email Address',
                organization: 'Organization Count',
                createdAt: 'Created At',
                usedAt: 'Used At',
                usedBy: 'Used By',
                expiresAt: 'Expires At',
                validityPeriod: 'Validity Period',
                actions: 'Actions'
            }
        },
        modals: {
            deleteAdmin: {
                title: 'Delete Administrator',
                message: 'Are you sure you want to delete this administrator? This action is permanent and cannot be undone.',
                confirm: 'Delete',
                cancel: 'Cancel'
            }
        }
    },
    verification: {
        title: 'Verification',
        initialDescription: 'Click the button below to receive a 6-digit confirmation code to your email.',
        sentDescription: "We've sent a 6-digit confirmation code to your email address.",
        timerLabel: 'Expires in',
        sendBtn: 'Send code',
        sentBtn: 'Code sent',
        backBtn: 'Back to login',
        errors: {
            alreadySent: 'Verification code has already been sent. Please wait before requesting a new one.',
            invalidCode: 'Invalid verification code'
        }
    },
    forgotPassword: {
        initialDescription: 'Enter your account email and click the button to receive a password reset link.',
        sentDescription: 'We have sent a password reset link to your email address.',
        timerLabel: 'Try again in',
        sendBtn: 'Send link',
        sentBtn: 'Link sent',
        backBtn: 'Back to login',
        errors: {
            alreadySent: 'A password reset link is already active. Please wait until the timer ends.',
            notFound: 'No user found with this email',
            unexpected: 'An unexpected error occurred'
        }
    },
    resetPassword: {
        title: 'Reset Password',
        description: 'Create a new password for your account and confirm it below.',
        submitBtn: 'Change password',
        errors: {
            invalidToken: 'Invalid or expired password reset token',
            unexpected: 'An unexpected error occurred'
        }
    }
}
