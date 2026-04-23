export interface GlobalAdminPanelTranslations {
    inviteSection: {
        title: string;
        activeTitle: string;
        description: string;
        activeDescription: string;
        generateBtn: string;
        linkActive: string;
        expiresIn: string;
        copyBtn: string;
        deleteBtn: string;
    };
    tabs: {
        admins: string;
        history: string;
    };
    table: {
        searchPlaceholder: string;
        empty: string;
        loading: string;
        headers: {
            name: string;
            phone: string;
            email: string;
            organization: string;
            createdAt: string;
            usedAt: string;
            usedBy: string;
            expiresAt: string;
            validityPeriod: string;
            actions: string;
        };
    };
    modals: {
        deleteAdmin: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
    };
}