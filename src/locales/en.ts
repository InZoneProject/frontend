export const en = {
    common: {
        title: 'InZone',
        forgotPassword: 'Forgot password?',
        logoutConfirmTitle: 'Log out',
        logoutConfirmMessage: 'Are you sure you want to log out?',
        logoutConfirm: 'Log out',
        logoutCancel: 'Cancel',
        userNameLabel: 'User',
        userNamePlaceholder: 'Enter your name',
        emailLabel: 'Email Address',
        emailPlaceholder: 'Enter your email address',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        roles: {
            'organization-admin': 'Organization Admin',
            'tag-admin': 'Tag Admin',
            employee: 'Employee'
        },
        rolesDescription: {
            'organization-admin': 'Create and manage your own organizations',
            'tag-admin': 'Assign and manage employee tags',
            'global-admin': 'Full system control',
            employee: 'Join organizations as an employee'
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
    joinOrganization: {
        title: 'Join organization',
        description: 'This invitation is intended for an employee in the InZone Android app. When the app opens the link, you can confirm consent and join the organization.',
        consent: 'I agree that InZone may process my data and use tracking within organizations I join.',
        confirm: 'Join',
        success: 'Consent has been granted. The organization was added to your account. You can return to the Android app.',
        missingToken: 'The invitation link is invalid or missing a token.',
        androidRequired: 'Open this invitation on your phone through the InZone Android app. The app will provide the employee token and securely join you to the organization.',
        loadFailed: 'Failed to check consent status.',
        joinFailed: 'Failed to join organization.'
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
    tagAdminPanel: {
        organization: {
            title: 'Organization',
            descriptionFallback: 'No description',
            nameLabel: 'Organization name',
            descriptionLabel: 'Description',
            createdAtLabel: 'Created at'
        },
        table: {
            title: 'Employees',
            searchPlaceholder: 'Search employees...',
            empty: 'No employees found',
            loading: 'Loading employees...',
            headers: {
                user: 'User',
                tagStatus: 'Assigned tag',
                phone: 'Phone',
                createdAt: 'Created At'
            },
            tagAssigned: 'Tag assigned',
            tagMissing: 'No tag assigned',
            employeeRole: 'Employee'
        },
        memberInfo: {
            title: 'Employee information',
            empty: 'Select an employee in the table to view details.',
            email: 'Email',
            phone: 'Phone',
            createdAt: 'Created at',
            viewPositions: 'View positions',
            assignTag: 'Assign tag',
            unassignTag: 'Unassign tag'
        },
        tagModal: {
            title: 'Employee RFID tag',
            assignedTitle: 'Assigned tag',
            emptyAssigned: 'Drag a tag here',
            searchPlaceholder: 'Search tags...',
            emptyAvailable: 'No available tags found',
            loading: 'Loading tags...',
            name: 'Name',
            tagUid: 'Tag UID',
            createdAt: 'Created'
        },
        errors: {
            server: 'A server problem occurred. Please try again in a moment.'
        }
    },
    organizationAdmin: {
        actions: {
            createOrganization: 'Create organization',
            createOrganizationHint: 'Create a new organization and manage it from this list.'
        },
        table: {
            searchPlaceholder: 'Search organizations...',
            empty: 'Nothing found',
            loading: 'Loading data...',
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
                    user: 'User',
                    role: 'Role',
                    email: 'Email',
                    phone: 'Phone',
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
        },
        buildingPage: {
            floors: {
                title: 'Floors',
                collapse: 'Collapse',
                expand: 'Expand',
                expandHint: 'Expand to work with floors',
                add: 'Add floor',
                searchPlaceholder: 'Search floors...',
                empty: 'Nothing found',
                loading: 'Loading data...',
                headers: {
                    position: 'Position',
                    name: 'Name',
                    actions: 'Actions'
                }
            },
            employees: {
                title: 'Employees',
                searchPlaceholder: 'Search employees...',
                empty: 'There are no employees on this floor right now',
                loading: 'Loading data...',
                headers: {
                    user: 'User',
                    actions: 'Actions'
                }
            },
            employeeMovementReport: {
                title: 'Daily movement report for employee {name}',
                dateLabel: 'Report date',
                download: 'Download',
                cancel: 'Cancel',
                generatedAt: 'Generated at',
                building: 'Building',
                employee: 'Employee',
                phone: 'Phone',
                date: 'Date',
                movements: 'Movements',
                violations: 'Violations',
                uniqueFloors: 'Floors',
                uniqueZones: 'Zones',
                firstScan: 'First scan',
                lastScan: 'Last scan',
                noMovements: 'There are no movements for this date.',
                noViolations: 'There are no violations for this date.',
                movementTable: 'Movement events',
                zoneScanCount: 'Scans by zone',
                zoneDwellTime: 'Time by zone',
                otherZones: 'Other zones',
                minutesShort: 'min',
                violationsTable: 'Violations',
                hourlyActivity: 'Hourly activity',
                scanId: 'Scan',
                time: 'Time',
                door: 'Door',
                floor: 'Floor',
                fromZone: 'From',
                toZone: 'To',
                outside: 'Outside zones',
                moreMovements: '{count} more movements',
                titleColumn: 'Title',
                message: 'Message',
                zone: 'Zone'
            },
            info: {
                label: 'Building',
                emptyAddress: 'No address specified',
                createdAt: 'Created'
            },
            floorForm: {
                createTitle: 'Add floor',
                editTitle: 'Edit floor',
                nameLabel: 'Floor name',
                namePlaceholder: 'Enter floor name',
                createConfirm: 'Add',
                editConfirm: 'Save',
                cancel: 'Cancel'
            },
            zone: {
                defaultTitle: 'New zone',
                editingTitle: 'Room name editing mode'
            },
            preview: {
                blockedZoneCollision: 'Zones "{first}" and "{second}" are colliding',
                blockedDoorBetween: 'Not enough door space between "{first}" and "{second}"',
                blockedEntranceDoor: 'Not enough space for entrance doors in "{zone}"'
            },
            map: {
                syncError: 'Could not sync the map with the server. Check the connection and try again.'
            },
            serverError: 'A server problem occurred. Please try again in a moment.',
            zoneForm: {
                title: 'Create zone',
                nameLabel: 'Zone name',
                namePlaceholder: 'Enter zone name',
                regular: 'Regular',
                transition: 'Between floors',
                regularOnly: 'Only a regular zone can be created here.',
                defaultError: 'Could not create a zone in this place.',
                overlapError: 'Zones are colliding. Choose free space or increase the gap.',
                noIntersectionError: 'The new zone must touch another zone.',
                doorSpaceError: 'There is not enough space for doors between zones.',
                confirm: 'Create',
                cancel: 'Cancel'
            },
            deleteBuilding: {
                title: 'Delete building',
                message: 'Deleting the building will remove all of its floors, zones, and doors.',
                confirm: 'Delete',
                cancel: 'Cancel'
            },
            deleteFloor: {
                title: 'Delete floor',
                message: 'The floor will be deleted together with its zones.',
                confirm: 'Delete',
                cancel: 'Cancel'
            },
            deleteZone: {
                title: 'Delete zone',
                message: 'The zone will be deleted together with its doors.',
                confirm: 'Delete',
                cancel: 'Cancel'
            },
            deleteDoor: {
                title: 'Delete door',
                message: 'The door will be deleted.',
                confirm: 'Delete',
                cancel: 'Cancel'
            },
            doorReader: {
                title: 'Door reader',
                assignedTitle: 'Assigned reader',
                emptyAssigned: 'Drag a reader here',
                searchPlaceholder: 'Search readers...',
                hint: 'Create readers or drag an available reader into the assigned area.',
                add: 'Add reader',
                name: 'Name',
                createdAt: 'Created',
                actions: 'Actions',
                tokenLabel: 'New token',
                copySuccess: 'Token copied',
                editNamePrompt: 'Reader name',
                regenerateTitle: 'Regenerate token',
                regenerateMessage: 'The current reader token will stop working after regeneration.',
                regenerateConfirm: 'Regenerate',
                regenerateCancel: 'Cancel'
            },
            readerForm: {
                createTitle: 'Add reader',
                editTitle: 'Edit reader',
                nameLabel: 'Reader name',
                namePlaceholder: 'Enter reader name',
                createConfirm: 'Add',
                editConfirm: 'Save',
                cancel: 'Cancel'
            },
            zoneAccessRules: {
                rulesTitle: 'Zone access rules',
                positionsTitle: 'Rule positions',
                edit: 'Edit rules',
                editPositions: 'Edit positions',
                zoneInTitle: ' in zone',
                close: 'Close',
                finish: 'Finish',
                addRule: 'Add rule',
                addPosition: 'Add position',
                assigned: 'Assigned',
                available: 'Available',
                assignedSearch: 'Search assigned...',
                availableSearch: 'Search available...',
                empty: 'Nothing found',
                loading: 'Loading data...',
                rule: 'Rule',
                role: 'Role',
                createdAt: 'Created',
                actions: 'Actions',
                backToEditRules: 'Back to edit rules',
                detachConfirmTitle: 'Unassign rule',
                detachConfirmMessage: 'This rule has assigned positions. Unassigning it from the zone will also remove those position assignments.',
                detachConfirm: 'Unassign',
                deleteRuleTitle: 'Delete rule',
                deleteRuleMessage: 'This rule will be deleted.',
                deletePositionTitle: 'Delete position',
                deletePositionMessage: 'This position will be deleted.',
                delete: 'Delete',
                cancel: 'Cancel',
                save: 'Save',
                createRule: 'Create rule',
                editRule: 'Edit rule',
                ruleTitle: 'Title',
                accessType: 'Access type',
                accessTypeForbidden: 'Forbidden',
                accessTypeTimeLimited: 'Time-limited',
                maxDuration: 'Max duration',
                createPosition: 'Create position',
                editPosition: 'Edit position',
                description: 'Description'
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
