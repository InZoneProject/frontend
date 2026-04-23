import type { GlobalAdminPanelTranslations } from '@/modules/global-admin/interfaces/global-admin-panel-translations.interface'

export interface InviteGeneratorProperties {
    translations: GlobalAdminPanelTranslations['inviteSection']
    inviteLink: string
    expiresAt: string
    loading: boolean
    initialLoading: boolean
}