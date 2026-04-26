import { computed, ref, toRef, watch } from 'vue'
import { isAxiosError } from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { isValidPhoneInputValue } from '@/composables/useBaseInput'
import { organizationAdminProfileRepository } from '@/repositories/organization-admin-profile.repository'
import { Events } from '@/enums/events.enum'
import type { ProfileFormEmits } from '@/interfaces/profile-form-emits.interface'
import type { ProfileFormProperties } from '@/interfaces/profile-form-properties.interface'

export function useProfileForm(
    properties: ProfileFormProperties,
    emit: ProfileFormEmits
) {
    const router = useRouter()
    const authStore = useAuthStore()
    const isOpen = toRef(properties, 'isOpen')
    const fileInputReference = ref<HTMLInputElement | null>(null)

    const nameValue = ref('')
    const emailValue = ref('')
    const phoneValue = ref('')
    const photoUrl = ref('')

    const initialName = ref('')
    const initialPhone = ref('')
    const initialPhotoUrl = ref('')

    const isLoadingProfile = ref(false)
    const isSaving = ref(false)
    const isUploadingPhoto = ref(false)
    const isDeleting = ref(false)
    const isDeleteModalOpen = ref(false)
    const isSaveAttempted = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const getTranslations = () => properties.translations

    const isPhoneValid = computed(() => isValidPhoneInputValue(phoneValue.value))

    const hasChanges = computed(() => {
        return (
            nameValue.value.trim() !== initialName.value ||
            phoneValue.value.trim() !== initialPhone.value ||
            photoUrl.value !== initialPhotoUrl.value
        )
    })

    const canSave = computed(() => {
        if (isLoadingProfile.value || isSaving.value || isUploadingPhoto.value || isDeleting.value) {
            return false
        }

        if (nameValue.value.trim().length === 0 || !isPhoneValid.value) {
            return false
        }

        return hasChanges.value
    })

    const isFormDisabled = computed(() => {
        return isLoadingProfile.value || isSaving.value || isUploadingPhoto.value || isDeleting.value
    })

    const phoneErrorMessage = computed(() => {
        if (!isSaveAttempted.value || isPhoneValid.value || phoneValue.value.trim().length === 0) {
            return ''
        }
        return getTranslations().errors.invalidPhone
    })

    const resetDraft = (): void => {
        nameValue.value = initialName.value
        phoneValue.value = initialPhone.value
        photoUrl.value = initialPhotoUrl.value
        errorMessage.value = ''
        successMessage.value = ''
        isSaveAttempted.value = false
    }

    const setProfileData = (name: string, email: string, phone: string, photo: string): void => {
        initialName.value = name
        initialPhone.value = phone
        initialPhotoUrl.value = photo

        nameValue.value = name
        emailValue.value = email
        phoneValue.value = phone
        photoUrl.value = photo
    }

    const fetchProfile = async (): Promise<void> => {
        isLoadingProfile.value = true
        errorMessage.value = ''
        successMessage.value = ''

        try {
            const response = await organizationAdminProfileRepository.getProfile()
            setProfileData(
                response.data.full_name,
                response.data.email,
                response.data.phone ?? '',
                response.data.photo ?? ''
            )
        } catch (_error) {
            errorMessage.value = getTranslations().errors.loadFailed
        } finally {
            isLoadingProfile.value = false
        }
    }

    const handlePhotoSelected = async (event: Event): Promise<void> => {
        const target = event.target as HTMLInputElement
        const selectedFile = target.files?.[0]

        if (!selectedFile) {
            return
        }

        const formData = new FormData()
        formData.append('photo', selectedFile)

        isUploadingPhoto.value = true
        errorMessage.value = ''
        successMessage.value = ''

        try {
            const response = await organizationAdminProfileRepository.updateProfilePhoto(formData)
            const nextPhotoUrl = response.data.photo
            photoUrl.value = nextPhotoUrl
            initialPhotoUrl.value = nextPhotoUrl
        } catch (_error) {
            errorMessage.value = getTranslations().errors.uploadFailed
        } finally {
            isUploadingPhoto.value = false
            target.value = ''
        }
    }

    const handleSave = async (): Promise<void> => {
        isSaveAttempted.value = true

        if (!isPhoneValid.value) {
            return
        }

        if (!canSave.value) {
            return
        }

        isSaving.value = true
        errorMessage.value = ''
        successMessage.value = ''

        try {
            const response = await organizationAdminProfileRepository.updateProfileInfo({
                name: nameValue.value.trim(),
                phone_number: phoneValue.value.trim()
            })

            const normalizedPhone = response.data.phone_number ?? ''
            setProfileData(response.data.name, emailValue.value, normalizedPhone, photoUrl.value)
            isSaveAttempted.value = false
            successMessage.value = getTranslations().success.saved
        } catch (error) {
            if (isAxiosError(error)) {
                const messageFromServer = error.response?.data?.message
                if (typeof messageFromServer === 'string' && messageFromServer.length > 0) {
                    errorMessage.value = messageFromServer
                } else {
                    errorMessage.value = getTranslations().errors.saveFailed
                }
            } else {
                errorMessage.value = getTranslations().errors.saveFailed
            }
        } finally {
            isSaving.value = false
        }
    }

    const openDeleteModal = (): void => {
        isDeleteModalOpen.value = true
    }

    const closeDeleteModal = (): void => {
        isDeleteModalOpen.value = false
    }

    const handleDeleteAccount = async (): Promise<void> => {
        isDeleting.value = true
        errorMessage.value = ''
        successMessage.value = ''

        try {
            await organizationAdminProfileRepository.deleteProfile()
            authStore.clearTokens()
            closeDeleteModal()
            emit(Events.CLOSE)
            await router.push({ name: 'Login' })
        } catch (_error) {
            errorMessage.value = getTranslations().errors.deleteFailed
        } finally {
            isDeleting.value = false
        }
    }

    const handleClose = (): void => {
        if (isSaving.value || isUploadingPhoto.value || isDeleting.value) {
            return
        }

        closeDeleteModal()
        resetDraft()
        emit(Events.CLOSE)
    }

    watch(isOpen, (nextIsOpen) => {
        if (nextIsOpen) {
            void fetchProfile()
            return
        }

        closeDeleteModal()
        resetDraft()
    })

    watch([nameValue, phoneValue], () => {
        if (!hasChanges.value) {
            return
        }

        successMessage.value = ''
    })

    const triggerPhotoUpload = (): void => {
        if (isFormDisabled.value) {
            return
        }

        fileInputReference.value?.click()
    }

    const handleEmailValueUpdate = (): void => {
        return
    }

    const handlePhotoLoadingError = (): void => {
        photoUrl.value = ''
    }

    return {
        fileInputReference,
        triggerPhotoUpload,
        handleEmailValueUpdate,
        handlePhotoLoadingError,
        nameValue,
        emailValue,
        phoneValue,
        photoUrl,
        errorMessage,
        successMessage,
        phoneErrorMessage,
        isLoadingProfile,
        isSaving,
        isUploadingPhoto,
        isDeleting,
        isDeleteModalOpen,
        canSave,
        isFormDisabled,
        handlePhotoSelected,
        handleSave,
        handleClose,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteAccount
    }
}
