import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { loginRepository } from '@/modules/login/repositories/login.repository'
import { VALIDATION } from '@/constants/validation.constants'
import { UserRole } from '@/enums/user-role.enum'
import { Events } from '@/enums/events.enum'
import { isValidEmailInputValue } from '@/composables/useBaseInput'
import type { LoginFormEmits } from '@/modules/login/interfaces/login-form-emits.interface'
import type { CommonTranslations } from "@/interfaces/common-translations.interface"

export function useLoginForm(
    getCommonTranslations: () => CommonTranslations,
    emit: LoginFormEmits
) {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const emailValue = ref('')
    const passwordValue = ref('')
    const errorKey = ref<string | null>(null)
    const serverMessage = ref('')
    const isSubmitting = ref(false)

    const activeRole = computed((): UserRole => {
        if (route.path.includes('global-admin')) return UserRole.GLOBAL_ADMIN
        if (route.path.includes('tag-admin')) return UserRole.TAG_ADMIN
        return UserRole.ORGANIZATION_ADMIN
    })

    const isGlobalAdmin = computed((): boolean => activeRole.value === UserRole.GLOBAL_ADMIN)

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

    const errorMessage = computed((): string => {
        if (!errorKey.value) return ''
        const translations = getCommonTranslations()

        switch (errorKey.value) {
            case 'invalidEmail': return translations.errors.invalidEmail
            case 'shortPassword': return translations.errors.shortPassword
            case 'unauthorized': return translations.errors.unauthorized
            case 'server': return serverMessage.value || translations.errors.unexpected
            case 'unexpected': return translations.errors.unexpected
            default: return ''
        }
    })

    const canSubmit = computed((): boolean =>
        emailValue.value.trim().length > 0 && passwordValue.value.trim().length > 0
    )

    const validateForm = (): boolean => {
        if (!isValidEmailInputValue(emailValue.value)) {
            errorKey.value = 'invalidEmail'
            return false
        }
        if (passwordValue.value.length < VALIDATION.MINIMUM_PASSWORD_LENGTH) {
            errorKey.value = 'shortPassword'
            return false
        }
        return true
    }

    const handleRoleChange = (newRole: UserRole): void => {
        errorKey.value = null
        serverMessage.value = ''
        const rolePath = newRole.replace('_', '-')
        void router.push(`/login/${rolePath}`)
    }

    const handleForgotPasswordRedirect = (): void => {
        if (activeRole.value === UserRole.GLOBAL_ADMIN) return
        void router.push(`/forgot-password/${activeRole.value}`)
    }

    const handleFormSubmit = async (): Promise<void> => {
        if (!validateForm()) return

        isSubmitting.value = true
        errorKey.value = null
        serverMessage.value = ''

        try {
            const response = await loginRepository.login(
                emailValue.value,
                passwordValue.value,
                activeRole.value
            )

            const { access_token, is_verified } = response.data

            if (access_token) {
                authStore.setToken(activeRole.value, access_token)

                if (activeRole.value === UserRole.GLOBAL_ADMIN) {
                    void router.push({ name: 'GlobalAdminPanel' })
                } else {
                    authStore.setVerified(is_verified)
                    void router.push({ name: activeRole.value === UserRole.ORGANIZATION_ADMIN
                        ? is_verified ? 'Organizations' : 'Verification'
                        : is_verified ? 'TagAdminPanel' : 'Verification'
                    })
                }
            }

            emit(Events.SUBMIT, response.data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                const responseData = error.response?.data as { message?: string | string[] } | undefined
                const message = responseData?.message || error.message

                if (status === 401) {
                    errorKey.value = 'unauthorized'
                } else {
                    errorKey.value = 'server'
                    serverMessage.value = Array.isArray(message) ? message[0] : (message as string || '')
                }
            } else {
                errorKey.value = 'unexpected'
            }
        } finally {
            isSubmitting.value = false
        }
    }

    return {
        emailValue,
        passwordValue,
        activeRole,
        isGlobalAdmin,
        roleTabs,
        errorMessage,
        canSubmit,
        isSubmitting,
        handleFormSubmit,
        handleRoleChange,
        handleForgotPasswordRedirect
    }
}
