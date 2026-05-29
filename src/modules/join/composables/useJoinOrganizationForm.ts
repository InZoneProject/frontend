import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { JOIN_ORGANIZATION } from '@/modules/join/constants/join-organization.constants'
import type { JoinOrganizationTranslations } from '@/modules/join/interfaces/join-organization-translations.interface'

export function useJoinOrganizationForm(
    getJoinOrganizationTranslations: () => JoinOrganizationTranslations
) {
    const route = useRoute()

    const inviteToken = computed(() => {
        const value = route.query.token
        return typeof value === 'string' ? value : ''
    })

    const canSubmit = computed(() => inviteToken.value.length > 0)

    const applicationLink = computed(() => {
        if (!inviteToken.value) return JOIN_ORGANIZATION.DEEP_LINK_SCHEME
        return `${JOIN_ORGANIZATION.DEEP_LINK_SCHEME}?token=${encodeURIComponent(inviteToken.value)}`
    })

    const visibleErrorMessage = computed(() => {
        if (!inviteToken.value) return getJoinOrganizationTranslations().missingToken
        return ''
    })

    const handleOpenApplication = () => {
        if (!inviteToken.value) return
        window.location.href = applicationLink.value
    }

    return {
        canSubmit,
        errorMessage: visibleErrorMessage,
        handleOpenApplication
    }
}
