export interface OrganizationsTranslations {
    actions: {
        createOrganization: string
        createOrganizationHint: string
    }
    table: {
        searchPlaceholder: string
        empty: string
        loading: string
        headers: {
            title: string
            description: string
            createdAt: string
            actions: string
        }
    }
    modals: {
        organizationForm: {
            createTitle: string
            editTitle: string
            nameLabel: string
            namePlaceholder: string
            descriptionLabel: string
            descriptionPlaceholder: string
            createConfirm: string
            editConfirm: string
            cancel: string
        }
        deleteOrganization: {
            title: string
            message: string
            confirm: string
            cancel: string
        }
    }
    page: {
        backToList: string
        infoTitle: string
        infoDescriptionFallback: string
        listsTitle: string
        tabs: {
            employeesInvite: string
            tagAdminInvite: string
            buildings: string
            members: string
            tags: string
        }
        inviteSection: {
            title: string
            activeTitle: string
            description: string
            activeDescription: string
            generateBtn: string
            linkActive: string
            expiresIn: string
            copyBtn: string
            copySuccess: string
            deleteBtn: string
        }
        infoForm: {
            nameLabel: string
            descriptionLabel: string
            createdAtLabel: string
            editButton: string
            deleteButton: string
        }
        table: {
            searchPlaceholder: string
            membersSearchPlaceholder: string
            addBuilding: string
            addBuildingHint: string
            addTag: string
            addTagHint: string
            headers: {
                name: string
                user: string
                role: string
                email: string
                phone: string
                createdAt: string
                address: string
                tagUid: string
                actions: string
            }
            roleLabels: {
                organizationAdmin: string
                tagAdmin: string
                employee: string
            }
            showUid: string
            hideUid: string
            hiddenUid: string
        }
        memberInfo: {
            title: string
            empty: string
            email: string
            phone: string
            createdAt: string
            viewPositions: string
        }
        memberPositions: {
            backToInfo: string
            editPositions: string
            finish: string
            addPosition: string
            assignedTitle: string
            availableTitle: string
            assignedSearchPlaceholder: string
            availableSearchPlaceholder: string
            emptyAssigned: string
            emptyAvailable: string
        }
        modals: {
            expelMember: {
                title: string
                messageEmployee: string
                messageTagAdmin: string
                confirm: string
                cancel: string
            }
            buildingForm: {
                createTitle: string
                editTitle: string
                nameLabel: string
                namePlaceholder: string
                addressLabel: string
                addressPlaceholder: string
                createConfirm: string
                editConfirm: string
                cancel: string
            }
            deleteBuilding: {
                title: string
                message: string
                confirm: string
                cancel: string
            }
            tagForm: {
                createTitle: string
                editTitle: string
                nameLabel: string
                namePlaceholder: string
                tagUidLabel: string
                tagUidPlaceholder: string
                createConfirm: string
                editConfirm: string
                cancel: string
            }
            deleteTag: {
                title: string
                message: string
                confirm: string
                cancel: string
            }
            positionForm: {
                createTitle: string
                editTitle: string
                roleLabel: string
                rolePlaceholder: string
                descriptionLabel: string
                descriptionPlaceholder: string
                createConfirm: string
                editConfirm: string
                cancel: string
            }
            deletePosition: {
                title: string
                message: string
                confirm: string
                cancel: string
            }
        }
    }
    buildingPage: {
        floors: {
            collapse: string
            expand: string
            expandHint: string
            add: string
            searchPlaceholder: string
            headers: {
                position: string
                name: string
                actions: string
            }
        }
        info: {
            label: string
            emptyAddress: string
            createdAt: string
        }
        floorForm: {
            createTitle: string
            editTitle: string
            nameLabel: string
            namePlaceholder: string
            createConfirm: string
            editConfirm: string
            cancel: string
        }
        zone: {
            defaultTitle: string
        }
        deleteBuilding: {
            title: string
            message: string
            confirm: string
            cancel: string
        }
        deleteFloor: {
            title: string
            message: string
            confirm: string
            cancel: string
        }
        deleteZone: {
            title: string
            message: string
            confirm: string
            cancel: string
        }
    }
}
