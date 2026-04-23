import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { VALIDATION } from '@/constants/validation.constants'
import { resetPasswordRepository } from '@/modules/reset-password/repositories/reset-password.repository'
import type { CommonTranslations } from '@/interfaces/common-translations.interface'
import type { ResetPasswordTranslations } from '@/modules/reset-password/interfaces/reset-password-translations.interface'

export function useResetPasswordForm(
    getCommonTranslations: () => CommonTranslations,
    getResetPasswordTranslations: () => ResetPasswordTranslations
) {
    const route = useRoute()
    const router = useRouter()

    const passwordValue = ref('')
    const confirmPasswordValue = ref('')
    const isSubmitting = ref(false)
    const errorKey = ref('')
    const serverMessage = ref('')

    const resetToken = computed(() => {
        const token = route.query.token
        if (typeof token === 'string') return token
        if (Array.isArray(token)) return token[0] || ''
        return ''
    })

    const canSubmit = computed(() =>
        passwordValue.value.trim().length > 0 &&
        confirmPasswordValue.value.trim().length > 0
    )

    const errorMessage = computed(() => {
        if (!errorKey.value) return ''

        const common = getCommonTranslations()
        const resetPassword = getResetPasswordTranslations()

        switch (errorKey.value) {
            case 'shortPassword':
                return common.errors.shortPassword
            case 'passwordMismatch':
                return common.errors.passwordMismatch
            case 'samePassword':
                return common.errors.passwordSameAsCurrent
            case 'invalidToken':
                return resetPassword.errors.invalidToken
            case 'server':
                return serverMessage.value || resetPassword.errors.unexpected
            default:
                return resetPassword.errors.unexpected
        }
    })

    const validateForm = (): boolean => {
        if (!resetToken.value) {
            errorKey.value = 'invalidToken'
            return false
        }
        if (passwordValue.value.length < VALIDATION.MINIMUM_PASSWORD_LENGTH) {
            errorKey.value = 'shortPassword'
            return false
        }
        if (passwordValue.value !== confirmPasswordValue.value) {
            errorKey.value = 'passwordMismatch'
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        errorKey.value = ''
        serverMessage.value = ''

        if (!validateForm()) return

        isSubmitting.value = true
        try {
            await resetPasswordRepository.resetPassword(
                resetToken.value,
                passwordValue.value
            )
            void router.push('/login/organization-admin')
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                const message = error.response?.data?.message
                const normalizedMessage = Array.isArray(message) ? message[0] : (message || '')

                if (status === 400) {
                    if (normalizedMessage.includes('cannot match current password')) {
                        errorKey.value = 'samePassword'
                    } else {
                        errorKey.value = 'invalidToken'
                    }
                } else {
                    errorKey.value = 'server'
                    serverMessage.value = normalizedMessage
                }
            } else {
                errorKey.value = 'server'
            }
        } finally {
            isSubmitting.value = false
        }
    }

    return {
        passwordValue,
        confirmPasswordValue,
        isSubmitting,
        canSubmit,
        errorMessage,
        handleSubmit
    }
}
