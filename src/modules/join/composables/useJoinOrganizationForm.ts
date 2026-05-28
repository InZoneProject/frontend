import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { joinOrganizationRepository } from '@/modules/join/repositories/join-organization.repository'
import { useAuthStore } from '@/stores/auth.store'
import type { JoinOrganizationTranslations } from '@/modules/join/interfaces/join-organization-translations.interface'

export function useJoinOrganizationForm(
    getJoinOrganizationTranslations: () => JoinOrganizationTranslations
) {
    const route = useRoute()
    const authStore = useAuthStore()
    const isConsentChecked = ref(false)
    const isConsentGiven = ref(false)
    const isLoading = ref(false)
    const isSubmitting = ref(false)
    const isSuccess = ref(false)
    const errorMessage = ref('')

    const inviteToken = computed(() => {
        const value = route.query.token
        return typeof value === 'string' ? value : ''
    })

    const canSubmit = computed(() =>
        inviteToken.value.length > 0 &&
        !!authStore.employeeToken &&
        !isLoading.value &&
        !isSubmitting.value &&
        !isSuccess.value &&
        (isConsentGiven.value || isConsentChecked.value)
    )

    const infoMessage = computed(() => {
        if (inviteToken.value && !authStore.employeeToken) {
            return getJoinOrganizationTranslations().androidRequired
        }

        return ''
    })

    const visibleErrorMessage = computed(() => {
        if (errorMessage.value) return errorMessage.value
        if (!inviteToken.value) return getJoinOrganizationTranslations().missingToken
        return ''
    })

    const handleFormSubmit = async () => {
        if (!canSubmit.value) return

        isSubmitting.value = true
        errorMessage.value = ''

        try {
            await joinOrganizationRepository.joinOrganization({
                token: inviteToken.value,
                consent_given: true
            })
            isConsentGiven.value = true
            isSuccess.value = true
        } catch {
            errorMessage.value = getJoinOrganizationTranslations().joinFailed
        } finally {
            isSubmitting.value = false
        }
    }

    const loadConsentStatus = async () => {
        if (!inviteToken.value || !authStore.employeeToken) {
            return
        }

        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await joinOrganizationRepository.getConsentStatus()
            isConsentGiven.value = response.data.consent_given
            isConsentChecked.value = response.data.consent_given
            isLoading.value = false

            if (response.data.consent_given) {
                await handleFormSubmit()
            }
        } catch {
            errorMessage.value = getJoinOrganizationTranslations().loadFailed
        } finally {
            isLoading.value = false
        }
    }

    onMounted(() => {
        void loadConsentStatus()
    })

    return {
        isConsentChecked,
        isConsentGiven,
        isLoading,
        isSubmitting,
        isSuccess,
        canSubmit,
        infoMessage,
        errorMessage: visibleErrorMessage,
        handleFormSubmit
    }
}
