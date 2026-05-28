import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useAuthStore } from '@/stores/auth.store'

export function useLogoutButton() {
    const router = useRouter()
    const authStore = useAuthStore()
    const { translations } = useLanguageSwitcher()
    const isConfirmOpen = ref(false)
    const commonTranslations = computed(() => translations.value.common)

    const openConfirm = () => {
        isConfirmOpen.value = true
    }

    const closeConfirm = () => {
        isConfirmOpen.value = false
    }

    const handleLogout = async () => {
        const isGlobalSession = !!authStore.globalToken
        const isTagAdminSession = !!authStore.tagToken
        const isGlobalPath = window.location.pathname.includes('global-admin')
        const isTagPath = window.location.pathname.includes('tag')

        authStore.clearTokens()

        if (isGlobalSession || isGlobalPath) {
            await router.push('/login/global-admin')
            return
        }

        await router.push(isTagAdminSession || isTagPath ? '/login/tag-admin' : '/login/organization-admin')
    }

    const confirmLogout = async () => {
        closeConfirm()
        await handleLogout()
    }

    return {
        commonTranslations,
        isConfirmOpen,
        openConfirm,
        closeConfirm,
        confirmLogout,
        handleLogout
    }
}
