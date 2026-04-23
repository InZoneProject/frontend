import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { DURATION } from '@/constants/duration.constants'
import { Events } from '@/enums/events.enum'
import { UserRole } from '@/enums/user-role.enum'
import { isValidEmailInputValue } from '@/composables/useBaseInput'
import { forgotPasswordRepository } from '@/modules/forgot-password/repositories/forgot-password.repository'
import type { ForgotPasswordFormEmits } from '@/modules/forgot-password/interfaces/forgot-password-form-emits.interface'
import type { CommonTranslations } from '@/interfaces/common-translations.interface'
import type { ForgotPasswordTranslations } from '@/modules/forgot-password/interfaces/forgot-password-translations.interface'

export function useForgotPasswordForm(
    getCommonTranslations: () => CommonTranslations,
    getTranslations: () => ForgotPasswordTranslations,
    emit: ForgotPasswordFormEmits
) {
    const route = useRoute()
    const router = useRouter()

    const organizationAdminState = ref({
        emailValue: '',
        isSubmitting: false,
        isTimerActive: false,
        isRequestSent: false,
        expiresAt: '',
        errorKey: ''
    })

    const tagAdminState = ref({
        emailValue: '',
        isSubmitting: false,
        isTimerActive: false,
        isRequestSent: false,
        expiresAt: '',
        errorKey: ''
    })

    const currentRole = ref<UserRole>(
        route.path.includes('tag-admin')
            ? UserRole.TAG_ADMIN
            : UserRole.ORGANIZATION_ADMIN
    )

    watch(
        () => route.path,
        (path) => {
            currentRole.value = path.includes('tag-admin')
                ? UserRole.TAG_ADMIN
                : UserRole.ORGANIZATION_ADMIN
        }
    )

    const activeRole = computed(() => currentRole.value)

    const getCurrentState = () =>
        activeRole.value === UserRole.TAG_ADMIN
            ? tagAdminState.value
            : organizationAdminState.value

    const emailValue = computed({
        get: () => getCurrentState().emailValue,
        set: (value: string) => {
            organizationAdminState.value.emailValue = value
            tagAdminState.value.emailValue = value
        }
    })

    const isSubmitting = computed(() => getCurrentState().isSubmitting)
    const isTimerActive = computed(() => getCurrentState().isTimerActive)
    const isRequestSent = computed(() => getCurrentState().isRequestSent)
    const expiresAt = computed(() => getCurrentState().expiresAt)

    const roleTabs = computed(() => [
        {
            id: UserRole.ORGANIZATION_ADMIN,
            label: getCommonTranslations().roles[UserRole.ORGANIZATION_ADMIN]
        },
        {
            id: UserRole.TAG_ADMIN,
            label: getCommonTranslations().roles[UserRole.TAG_ADMIN]
        }
    ])

    const actionButtonText = computed(() =>
        isTimerActive.value ? getTranslations().sentBtn : getTranslations().sendBtn
    )

    const canSubmit = computed(() => getCurrentState().emailValue.trim().length > 0)

    const descriptionText = computed(() =>
        isRequestSent.value ? getTranslations().sentDescription : getTranslations().initialDescription
    )

    const errorMessage = computed(() => {
        const state = getCurrentState()
        if (!state.errorKey) return ''

        const common = getCommonTranslations()
        const forgotPassword = getTranslations()

        switch (state.errorKey) {
            case 'invalidEmail':
                return common.errors.invalidEmail
            case 'notFound':
                return forgotPassword.errors.notFound
            default:
                return ''
        }
    })

    const onTimerFinish = () => {
        const state = getCurrentState()
        state.isTimerActive = false
        state.expiresAt = ''
        state.isRequestSent = false
    }

    const handleRoleChange = (newRole: UserRole) => {
        organizationAdminState.value.errorKey = ''
        tagAdminState.value.errorKey = ''
        currentRole.value = newRole
        const rolePath = newRole === UserRole.TAG_ADMIN ? 'tag-admin' : 'organization-admin'
        void router.push(`/forgot-password/${rolePath}`)
    }

    const handleBackToLogin = () => {
        void router.push(`/login/${activeRole.value}`)
    }

    const validateEmail = (): boolean => {
        const state = getCurrentState()
        if (!isValidEmailInputValue(state.emailValue)) {
            state.errorKey = 'invalidEmail'
            return false
        }

        return true
    }

    const handleSendResetLink = async () => {
        const state = getCurrentState()
        state.errorKey = ''

        if (!canSubmit.value || state.isTimerActive) {
            return
        }

        if (!validateEmail()) {
            return
        }

        state.isSubmitting = true

        try {
            await forgotPasswordRepository.requestPasswordReset(
                activeRole.value,
                state.emailValue.trim()
            )

            const now = new Date()
            const expirationDate = new Date(now.getTime() + 10 * DURATION.MS_IN_MINUTE)

            state.expiresAt = expirationDate.toISOString()
            state.isTimerActive = true
            state.isRequestSent = true

            emit(Events.RESEND)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                const responseData = error.response?.data
                const createdAtFromResponse =
                    typeof responseData?.created_at === 'string'
                        ? responseData.created_at
                        : null
                const expiresAtFromResponse =
                    typeof responseData?.expires_at === 'string'
                        ? responseData.expires_at
                        : null

                const isActiveLinkResponse = status === 400 && createdAtFromResponse && expiresAtFromResponse

                if (isActiveLinkResponse) {
                    state.isRequestSent = true
                    const createdAtMs = new Date(createdAtFromResponse).getTime()
                    const expiresAtMs = new Date(expiresAtFromResponse).getTime()
                    const nowMs = Date.now()

                    if (
                        Number.isFinite(createdAtMs) &&
                        Number.isFinite(expiresAtMs) &&
                        expiresAtMs > createdAtMs &&
                        expiresAtMs > nowMs
                    ) {
                        state.expiresAt = new Date(expiresAtMs).toISOString()
                        state.isTimerActive = true
                    }
                } else if (status === 404) {
                    state.errorKey = 'notFound'
                }
            }
        } finally {
            state.isSubmitting = false
        }
    }

    return {
        emailValue,
        isSubmitting,
        isTimerActive,
        expiresAt,
        activeRole,
        roleTabs,
        actionButtonText,
        canSubmit,
        descriptionText,
        errorMessage,
        onTimerFinish,
        handleRoleChange,
        handleBackToLogin,
        handleSendResetLink
    }
}
