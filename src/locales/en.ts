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
            invalidPhone: 'Invalid phone number format',
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
            copySuccess: 'Link copied successfully',
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
    organizationAdmin: {
        actions: {
            createOrganization: 'Create organization',
            createOrganizationHint: 'Create a new organization and manage it from this list.'
        },
        table: {
            searchPlaceholder: 'Search organizations...',
            headers: {
                title: 'Name',
                description: 'Description',
                createdAt: 'Created At',
                actions: 'Actions'
            }
        },
        modals: {
            organizationForm: {
                createTitle: 'Create Organization',
                editTitle: 'Edit Organization',
                nameLabel: 'Organization name',
                namePlaceholder: 'Enter organization name',
                descriptionLabel: 'Description',
                descriptionPlaceholder: 'Enter organization description',
                createConfirm: 'Create',
                editConfirm: 'Save',
                cancel: 'Cancel'
            },
            deleteOrganization: {
                title: 'Delete Organization',
                message: 'Are you sure you want to delete this organization? This action is permanent and cannot be undone.',
                confirm: 'Delete',
                cancel: 'Cancel'
            }
        },
        page: {
            backToList: 'Back to organizations',
            infoTitle: 'Organization information',
            infoDescriptionFallback: 'No description',
            listsTitle: 'Organization data',
            tabs: {
                employeesInvite: 'Employee invite',
                tagAdminInvite: 'Tag admin invite',
                buildings: 'Buildings',
                members: 'Members',
                tags: 'RFID tags'
            },
            inviteSection: {
                title: 'Invite generation',
                activeTitle: 'Invite is ready',
                description: 'Generate and share invitation links for this organization.',
                activeDescription: 'Copy the link and send it to a user. It is valid for a limited time.',
                generateBtn: 'Generate link',
                linkActive: 'Active link:',
                expiresIn: 'Expires in:',
                copyBtn: 'Copy',
                copySuccess: 'Link copied successfully',
                deleteBtn: 'Delete link'
            },
            infoForm: {
                nameLabel: 'Organization name',
                descriptionLabel: 'Description',
                createdAtLabel: 'Created at',
                editButton: 'Edit',
                deleteButton: 'Delete'
            },
            table: {
                searchPlaceholder: 'Search buildings or tags...',
                membersSearchPlaceholder: 'Search members...',
                addBuilding: 'Add building',
                addBuildingHint: 'Create new buildings and manage them in the list below.',
                addTag: 'Add tag',
                addTagHint: 'Create RFID tags and edit their names in the table below.',
                headers: {
                    name: 'Name',
                    role: 'Role',
                    email: 'Email',
                    createdAt: 'Created At',
                    address: 'Address',
                    tagUid: 'Tag UID',
                    actions: 'Actions'
                },
                roleLabels: {
                    organizationAdmin: 'Organization Admin',
                    tagAdmin: 'Tag Admin',
                    employee: 'Employee'
                },
                showUid: 'Show',
                hideUid: 'Hide',
                hiddenUid: 'Hidden'
            },
            memberInfo: {
                title: 'Member information',
                empty: 'Select a member in the table to view details.',
                email: 'Email',
                phone: 'Phone',
                createdAt: 'Created at',
                viewPositions: 'View positions'
            },
            memberPositions: {
                backToInfo: 'Back to personal info',
                editPositions: 'Edit positions',
                finish: 'Finish',
                addPosition: 'Add position',
                assignedTitle: 'Assigned positions',
                availableTitle: 'Available positions',
                assignedSearchPlaceholder: 'Search assigned positions...',
                availableSearchPlaceholder: 'Search available positions...',
                emptyAssigned: 'This employee has no assigned positions yet.',
                emptyAvailable: 'No available positions to assign.'
            },
            modals: {
                expelMember: {
                    title: 'Expel member',
                    messageEmployee: 'Are you sure you want to expel employee',
                    messageTagAdmin: 'Are you sure you want to expel tag admin',
                    confirm: 'Expel',
                    cancel: 'Cancel'
                },
                buildingForm: {
                    createTitle: 'Create building',
                    editTitle: 'Edit building',
                    nameLabel: 'Building name',
                    namePlaceholder: 'Enter building name',
                    addressLabel: 'Address',
                    addressPlaceholder: 'Enter address',
                    createConfirm: 'Create',
                    editConfirm: 'Save',
                    cancel: 'Cancel'
                },
                deleteBuilding: {
                    title: 'Delete building',
                    message: 'Are you sure you want to delete this building? This action is permanent and cannot be undone.',
                    confirm: 'Delete',
                    cancel: 'Cancel'
                },
                tagForm: {
                    createTitle: 'Create RFID tag',
                    editTitle: 'Edit RFID tag',
                    nameLabel: 'Tag name',
                    namePlaceholder: 'Enter tag name',
                    tagUidLabel: 'Tag UID',
                    tagUidPlaceholder: 'Enter tag UID',
                    createConfirm: 'Create',
                    editConfirm: 'Save',
                    cancel: 'Cancel'
                },
                deleteTag: {
                    title: 'Delete RFID tag',
                    message: 'Are you sure you want to delete this RFID tag? This action is permanent and cannot be undone.',
                    confirm: 'Delete',
                    cancel: 'Cancel'
                },
                positionForm: {
                    createTitle: 'Create position',
                    editTitle: 'Edit position',
                    roleLabel: 'Position name',
                    rolePlaceholder: 'Enter position name',
                    descriptionLabel: 'Description',
                    descriptionPlaceholder: 'Enter position description',
                    createConfirm: 'Create',
                    editConfirm: 'Save',
                    cancel: 'Cancel'
                },
                deletePosition: {
                    title: 'Delete position',
                    message: 'Are you sure you want to delete this position? This action is permanent and cannot be undone.',
                    confirm: 'Delete',
                    cancel: 'Cancel'
                }
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
    },
    notifications: {
        title: 'Notifications',
        markAllRead: 'Mark all read',
        empty: 'No notifications yet'
    },
    profile: {
        photoHint: 'Profile photo',
        nameLabel: 'Name',
        namePlaceholder: 'Enter your name',
        emailLabel: 'Email address',
        phoneLabel: 'Phone number',
        phonePlaceholder: 'Enter your phone number',
        save: 'Save',
        cancel: 'Cancel',
        deleteAccount: 'Delete account',
        deleteConfirmTitle: 'Delete Account',
        deleteConfirmMessage: 'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
        deleteConfirm: 'Delete',
        deleteCancel: 'Cancel',
        errors: {
            invalidPhone: 'Invalid phone number format',
            loadFailed: 'Failed to load profile data',
            saveFailed: 'Failed to save profile changes',
            uploadFailed: 'Failed to upload photo',
            deleteFailed: 'Failed to delete account'
        },
        success: {
            saved: 'Profile updated successfully'
        }
    }
}
