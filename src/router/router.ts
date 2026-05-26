import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/enums/user-role.enum'
import { useAuthStore } from '@/stores/auth.store'
import { pinia } from '@/stores/pinia'

const routes: RouteRecordRaw[] = [
    {
        path: '/login/organization-admin',
        name: 'Login',
        component: () => import('@/modules/login/views/LoginView.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/login/tag-admin',
        name: 'LoginTagAdmin',
        component: () => import('@/modules/login/views/LoginView.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/login/global-admin',
        name: 'LoginGlobalAdmin',
        component: () => import('@/modules/login/views/LoginView.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/login',
        redirect: '/login/organization-admin'
    },
    {
        path: '/forgot-password/organization-admin',
        name: 'ForgotPassword',
        component: () => import('@/modules/forgot-password/views/ForgotPasswordView.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/forgot-password/tag-admin',
        name: 'ForgotPasswordTagAdmin',
        component: () => import('@/modules/forgot-password/views/ForgotPasswordView.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/forgot-password',
        redirect: '/forgot-password/organization-admin'
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('@/modules/reset-password/views/ResetPasswordView.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/register/organization-admin',
        name: 'Register',
        component: () => import('@/modules/register/views/RegisterView.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/register/tag-admin',
        name: 'RegisterTagAdmin',
        component: () => import('@/modules/register/views/RegisterView.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/verify',
        name: 'Verification',
        component: () => import('@/modules/verification/views/VerificationView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/global-admin-panel',
        name: 'GlobalAdminPanel',
        component: () => import('@/modules/global-admin/views/GlobalAdminPanelView.vue'),
        meta: {
            requiresAuth: true,
            role: UserRole.GLOBAL_ADMIN
        }
    },
    {
        path: '/organizations/:organizationId?',
        name: 'Organizations',
        component: () => import('@/modules/organizations/views/OrganizationsView.vue'),
        meta: {
            requiresAuth: true,
            role: UserRole.ORGANIZATION_ADMIN
        }
    },
    {
        path: '/buildings/:buildingId',
        name: 'Building',
        component: () => import('@/modules/building/views/BuildingView.vue'),
        meta: {
            requiresAuth: true,
            role: UserRole.ORGANIZATION_ADMIN
        }
    },
    {
        path: '/organization-dashboard',
        redirect: '/organizations'
    },
    {
        path: '/tag-admin-panel',
        name: 'TagAdminPanel',
        component: () => import('@/modules/tag-admin/views/TagAdminPanelView.vue'),
        meta: {
            requiresAuth: true,
            role: UserRole.TAG_ADMIN
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/modules/not-found/views/NotFoundView.vue')
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})

const getVerificationStatusFromToken = (token: string | null): boolean | null => {
    if (!token) return null

    try {
        const [, payload] = token.split('.')
        if (!payload) return null

        const normalizedPayload = payload
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(Math.ceil(payload.length / 4) * 4, '=')
        const decodedPayload = JSON.parse(atob(normalizedPayload)) as { is_email_verified?: boolean }

        return Boolean(decodedPayload.is_email_verified)
    } catch {
        return null
    }
}

router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore(pinia)

    const hasGlobalToken = !!authStore.globalToken
    const hasOrgToken = !!authStore.orgToken
    const hasTagToken = !!authStore.tagToken
    const isAuthenticated = hasGlobalToken || hasOrgToken || hasTagToken
    const tokenVerificationStatus = getVerificationStatusFromToken(authStore.orgToken || authStore.tagToken)
    if (tokenVerificationStatus !== null && tokenVerificationStatus !== authStore.isVerified) {
        authStore.setVerified(tokenVerificationStatus)
    }
    const isVerified = tokenVerificationStatus ?? authStore.isVerified

    if (to.path === '/') {
        if (hasGlobalToken) return next({ name: 'GlobalAdminPanel' })
        if (hasOrgToken) return next({ name: isVerified ? 'Organizations' : 'Verification' })
        if (hasTagToken) return next({ name: isVerified ? 'TagAdminPanel' : 'Verification' })
        return next('/login/organization-admin')
    }

    if (hasGlobalToken) {
        if (to.name !== 'GlobalAdminPanel' && to.name !== 'NotFound') {
            return next({ name: 'GlobalAdminPanel' })
        }
        return next()
    }

    if (isAuthenticated) {
        if (to.meta.guestOnly) {
            if (hasOrgToken) return next({ name: isVerified ? 'Organizations' : 'Verification' })
            if (hasTagToken) return next({ name: isVerified ? 'TagAdminPanel' : 'Verification' })
        }

        if (!isVerified) {
            if (to.name !== 'Verification') {
                return next({ name: 'Verification' })
            }
            return next()
        }

        if (isVerified) {
            if (hasOrgToken && to.name !== 'Organizations' && to.name !== 'Building' && to.name !== 'NotFound') {
                return next({ name: 'Organizations' })
            }
            if (hasTagToken && to.name !== 'TagAdminPanel' && to.name !== 'NotFound') {
                return next({ name: 'TagAdminPanel' })
            }
        }
    }

    if (!isAuthenticated && to.meta.requiresAuth) {
        if (to.path.includes('global-admin')) {
            return next('/login/global-admin')
        }

        if (to.path.includes('tag')) {
            return next('/login/tag-admin')
        }

        return next('/login/organization-admin')
    }

    next()
})
