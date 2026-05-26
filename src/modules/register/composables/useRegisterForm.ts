import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { registerRepository } from '../repositories/register.repository'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/enums/user-role.enum'
import { Events } from '@/enums/events.enum'
import { VALIDATION } from '@/constants/validation.constants'
import { isValidEmailInputValue } from '@/composables/useBaseInput'
import type { RegisterFormEmits } from '../interfaces/register-form-emits.interface'
import {CommonTranslations} from "@/interfaces/common-translations.interface";

export function useRegisterForm(
    getCommon: () => CommonTranslations,
    initialRole: UserRole,
    emit: RegisterFormEmits
) {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    const nameValue = ref('')
    const emailValue = ref('')
    const passwordValue = ref('')
    const confirmPasswordValue = ref('')
    const isSubmitting = ref(false)
    const errorKey = ref<string | null>(null)
    const serverMessage = ref('')

    const activeRole = computed(() => {
        return route.path.includes('tag-admin') ? UserRole.TAG_ADMIN : UserRole.ORGANIZATION_ADMIN
    })

    const roleTabs = computed(() => [
        { id: UserRole.ORGANIZATION_ADMIN, label: getCommon().roles[UserRole.ORGANIZATION_ADMIN] },
        { id: UserRole.TAG_ADMIN, label: getCommon().roles[UserRole.TAG_ADMIN] }
    ])

    const errorMessage = computed(() => {
        if (!errorKey.value) return ''
        const t = getCommon()

        switch (errorKey.value) {
            case 'invalidEmail': return t.errors.invalidEmail
            case 'shortPassword': return t.errors.shortPassword
            case 'passwordMismatch': return t.errors.passwordMismatch
            case 'invalidToken': return t.errors.invalidToken
            case 'emailConflict': return t.errors.emailConflict
            case 'server': return serverMessage.value || t.errors.unexpected
            default: return t.errors.unexpected
        }
    })

    const canSubmit = computed(() =>
        nameValue.value.trim().length > 0 &&
        emailValue.value.trim().length > 0 &&
        passwordValue.value.trim().length > 0 &&
        confirmPasswordValue.value.trim().length > 0
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
        if (passwordValue.value !== confirmPasswordValue.value) {
            errorKey.value = 'passwordMismatch'
            return false
        }
        if (!route.query.token) {
            errorKey.value = 'invalidToken'
            return false
        }
        return true
    }

    const handleRoleChange = (role: UserRole) => {
        errorKey.value = null
        const rolePath = role === UserRole.TAG_ADMIN ? 'tag-admin' : 'organization-admin'
        void router.push({ path: `/register/${rolePath}`, query: route.query })
    }

    const handleFormSubmit = async () => {
        errorKey.value = null
        if (!validateForm()) return

        isSubmitting.value = true
        try {
            const response = await registerRepository.register(activeRole.value, {
                full_name: nameValue.value,
                email: emailValue.value,
                password: passwordValue.value,
                invite_token: route.query.token as string
            })

            const { access_token } = response.data
            if (access_token) {
                authStore.setToken(activeRole.value, access_token)
                void router.push({ name: 'Verification' })
            }
            emit(Events.SUBMIT, response.data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                if (status === 400) errorKey.value = 'invalidToken'
                else if (status === 409) errorKey.value = 'emailConflict'
                else {
                    errorKey.value = 'server'
                    serverMessage.value = error.response?.data?.message || ''
                }
            } else {
                errorKey.value = 'unexpected'
            }
        } finally {
            isSubmitting.value = false
        }
    }

    return {
        nameValue,
        emailValue,
        passwordValue,
        confirmPasswordValue,
        activeRole,
        roleTabs,
        errorMessage,
        canSubmit,
        isSubmitting,
        handleFormSubmit,
        handleRoleChange
    }
}
