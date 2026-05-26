import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

export function useLogoutButton() {
    const router = useRouter()
    const authStore = useAuthStore()

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

    return {
        handleLogout
    }
}
