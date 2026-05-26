export interface TagAdminPanelTranslations {
    organization: {
        title: string
        descriptionFallback: string
        nameLabel: string
        descriptionLabel: string
        createdAtLabel: string
    }
    table: {
        title: string
        searchPlaceholder: string
        empty: string
        loading: string
        headers: {
            user: string
            tagStatus: string
            phone: string
            createdAt: string
        }
        tagAssigned: string
        tagMissing: string
        employeeRole: string
    }
    memberInfo: {
        title: string
        empty: string
        email: string
        phone: string
        createdAt: string
        viewPositions: string
        assignTag: string
        unassignTag: string
    }
    tagModal: {
        title: string
        assignedTitle: string
        emptyAssigned: string
        searchPlaceholder: string
        emptyAvailable: string
        loading: string
        name: string
        tagUid: string
        createdAt: string
    }
    errors: {
        server: string
    }
}
