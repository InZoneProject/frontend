import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Events } from '@/enums/events.enum'
import { DURATION } from '@/constants/duration.constants'
import { VALIDATION } from '@/constants/validation.constants'
import { useAuthStore } from '@/stores/auth.store'
import { verificationRepository } from '../repositories/verification.repository'
import type { VerificationFormEmits } from '../interfaces/verification-form-emits.interface'
import type { VerificationTranslations } from '../interfaces/verification-translations.interface'

export function useVerificationForm(
    emit: VerificationFormEmits,
    getTranslations: () => VerificationTranslations
) {
    const router = useRouter()
    const authStore = useAuthStore()

    const codeValue = ref('')
    const isCodeSent = ref(false)
    const isTimerActive = ref(false)
    const expiresAt = ref('')
    const isSubmitting = ref(false)
    const isInitialLoading = ref(true)
    const errorCode = ref<string | null>(null)

    const actionButtonText = computed(() =>
        isTimerActive.value ? getTranslations().sentBtn : getTranslations().sendBtn
    )

    const currentErrorMessage = computed(() => {
        if (!errorCode.value) return ''
        const translations = getTranslations()
        return translations.errors[errorCode.value as keyof typeof translations.errors]
    })

    const infoDescriptionText = computed(() =>
        isCodeSent.value ? getTranslations().sentDescription : getTranslations().initialDescription
    )

    const onTimerFinish = () => {
        isTimerActive.value = false
        expiresAt.value = ''
    }

    const redirectToDashboard = () => {
        if (authStore.orgToken) {
            void router.push({ name: 'OrganizationDashboard' })
        } else if (authStore.tagToken) {
            void router.push({ name: 'TagDashboard' })
        }
    }

    const handleSendCode = async () => {
        isSubmitting.value = true
        errorCode.value = null
        try {
            await verificationRepository.resendCode()
            const now = new Date()
            const expirationDate = new Date(now.getTime() + 10 * DURATION.MS_IN_MINUTE)

            expiresAt.value = expirationDate.toISOString()
            isCodeSent.value = true
            isTimerActive.value = true
            codeValue.value = ''

            emit(Events.RESEND)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                errorCode.value = 'alreadySent'
            }
        } finally {
            isSubmitting.value = false
        }
    }

    const fetchVerificationStatus = async () => {
        isInitialLoading.value = true
        try {
            const response = await verificationRepository.getVerificationStatus()
            const status = response.data

            if (status.is_verified) {
                authStore.setVerified(true)
                redirectToDashboard()
                return
            }

            if (status.expires_at) {
                expiresAt.value = status.expires_at
                isCodeSent.value = true
                isTimerActive.value = true
            } else {
                void handleSendCode()
            }
        } catch {
            isCodeSent.value = false
        } finally {
            isInitialLoading.value = false
        }
    }

    const handleSubmit = async () => {
        const isCodeValid = codeValue.value.length === VALIDATION.VERIFICATION_CODE_LENGTH

        if (isCodeValid && isCodeSent.value) {
            isSubmitting.value = true
            errorCode.value = null
            try {
                await verificationRepository.verifyEmail(codeValue.value)

                authStore.setVerified(true)
                redirectToDashboard()

                emit(Events.SUBMIT, codeValue.value)
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 400) {
                    errorCode.value = 'invalidCode'
                    codeValue.value = ''
                }
            } finally {
                isSubmitting.value = false
            }
        }
    }

    watch(codeValue, (newValue) => {
        if (newValue.length > 0 && errorCode.value) {
            errorCode.value = null
        }
        if (newValue.length === VALIDATION.VERIFICATION_CODE_LENGTH && isCodeSent.value) {
            void handleSubmit()
        }
    })

    onMounted(() => {
        void fetchVerificationStatus()
    })

    return {
        codeValue,
        isCodeSent,
        isTimerActive,
        expiresAt,
        isSubmitting,
        isInitialLoading,
        errorCode,
        actionButtonText,
        currentErrorMessage,
        infoDescriptionText,
        onTimerFinish,
        handleSendCode
    }
}