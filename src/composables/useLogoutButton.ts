import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

export function useLogoutButton() {
    const router = useRouter()
    const authStore = useAuthStore()

    const handleLogout = async () => {
        const isGlobalPath = window.location.pathname.includes('global-admin')

        authStore.clearTokens()

        await router.push(isGlobalPath ? '/login/global-admin' : '/login/organization-admin')
    }

    return {
        handleLogout
    }
}
