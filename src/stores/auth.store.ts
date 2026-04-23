import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { UserRole } from '@/enums/user-role.enum'

export const useAuthStore = defineStore('auth', () => {
    const globalToken = ref<string | null>(localStorage.getItem('inzone_global_token'))
    const orgToken = ref<string | null>(localStorage.getItem('inzone_org_token'))
    const tagToken = ref<string | null>(localStorage.getItem('inzone_tag_token'))
    const isVerified = ref<boolean>(localStorage.getItem('inzone_is_verified') === 'true')

    const isGlobalAdminAuth = computed((): boolean => !!globalToken.value)
    const isOrgAdminAuth = computed((): boolean => !!orgToken.value)
    const isTagAdminAuth = computed((): boolean => !!tagToken.value)
    const isAuthenticated = computed((): boolean => isGlobalAdminAuth.value || isOrgAdminAuth.value || isTagAdminAuth.value)

    const setToken = (role: UserRole, token: string): void => {
        if (role === UserRole.GLOBAL_ADMIN) {
            globalToken.value = token
            localStorage.setItem('inzone_global_token', token)
        } else if (role === UserRole.ORGANIZATION_ADMIN) {
            orgToken.value = token
            localStorage.setItem('inzone_org_token', token)
        } else if (role === UserRole.TAG_ADMIN) {
            tagToken.value = token
            localStorage.setItem('inzone_tag_token', token)
        }
    }

    const setVerified = (status: boolean): void => {
        isVerified.value = status
        localStorage.setItem('inzone_is_verified', String(status))
    }

    const clearTokens = (): void => {
        globalToken.value = null
        orgToken.value = null
        tagToken.value = null
        isVerified.value = false

        localStorage.removeItem('inzone_global_token')
        localStorage.removeItem('inzone_org_token')
        localStorage.removeItem('inzone_tag_token')
        localStorage.removeItem('inzone_is_verified')
    }

    return {
        globalToken,
        orgToken,
        tagToken,
        isVerified,
        isGlobalAdminAuth,
        isOrgAdminAuth,
        isTagAdminAuth,
        isAuthenticated,
        setToken,
        setVerified,
        clearTokens
    }
})