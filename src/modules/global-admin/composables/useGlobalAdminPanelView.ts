import { ref, computed, onMounted, watch, type Ref } from 'vue'
import { globalAdminRepository } from '../repositories/global-admin.repository'
import { useDateFormatter } from '@/composables/useDateFormatter'
import type { OrganizationAdmin } from '@/interfaces/organization-admin.interface'
import type { InviteHistory } from '@/modules/global-admin/interfaces/invite-history.interface'
import type { GlobalAdminPanelTranslations } from '../interfaces/global-admin-panel-translations.interface'

export const useGlobalAdminPanelView = (translations: Ref<GlobalAdminPanelTranslations>) => {
    const { formatDate, formatRange } = useDateFormatter()

    const activeTab = ref<'admins' | 'history'>('admins')
    const searchQuery = ref('')
    const isDeleteModalOpen = ref(false)
    const adminToDelete = ref<number | null>(null)

    const inviteLink = ref<string | null>(null)
    const expiresAt = ref<string | null>(null)
    const isGenerating = ref(false)
    const isInitialLoading = ref(true)

    const admins = ref<OrganizationAdmin[]>([])
    const history = ref<InviteHistory[]>([])
    const isLoadingData = ref(false)
    const isDeleting = ref(false)

    const tabs = computed(() => [
        { id: 'admins', label: translations.value.tabs.admins },
        { id: 'history', label: translations.value.tabs.history }
    ])

    const tableItems = computed<(OrganizationAdmin | InviteHistory)[]>(() => {
        return activeTab.value === 'admins' ? admins.value : history.value
    })

    const currentPlaceholder = computed(() => {
        return translations.value.table.searchPlaceholder
    })

    const fetchInviteStatus = async () => {
        isInitialLoading.value = true
        try {
            const response = await globalAdminRepository.getInviteStatus()
            if (response.data) {
                inviteLink.value = response.data.invite_url
                expiresAt.value = response.data.expires_at
            }
        } catch {
            inviteLink.value = null
            expiresAt.value = null
        } finally {
            isInitialLoading.value = false
        }
    }

    const fetchAdmins = async () => {
        isLoadingData.value = true
        try {
            const response = await globalAdminRepository.getOrganizationAdmins({
                search: searchQuery.value,
                offset: 0,
                limit: 20
            })
            admins.value = response.data.items
        } finally {
            isLoadingData.value = false
        }
    }

    const fetchHistory = async () => {
        isLoadingData.value = true
        try {
            const response = await globalAdminRepository.getInviteHistory({
                search: searchQuery.value,
                offset: 0,
                limit: 20
            })
            history.value = response.data.items
        } finally {
            isLoadingData.value = false
        }
    }

    const loadTabData = () => {
        if (activeTab.value === 'admins') {
            void fetchAdmins()
        } else {
            void fetchHistory()
        }
    }

    const generateLink = async () => {
        isGenerating.value = true
        try {
            const response = await globalAdminRepository.generateInvite()
            inviteLink.value = response.data.invite_url
            expiresAt.value = response.data.expires_at
            if (activeTab.value === 'history') void fetchHistory()
        } finally {
            isGenerating.value = false
        }
    }

    const copyToClipboard = async () => {
        if (inviteLink.value) {
            await navigator.clipboard.writeText(inviteLink.value)
        }
    }

    const openDeleteModal = (id: number) => {
        adminToDelete.value = id
        isDeleteModalOpen.value = true
    }

    const confirmDelete = async () => {
        if (adminToDelete.value === null) return

        isDeleting.value = true
        try {
            await globalAdminRepository.deleteOrganizationAdmin(adminToDelete.value)
            await fetchAdmins()
        } finally {
            isDeleting.value = false
            isDeleteModalOpen.value = false
            adminToDelete.value = null
        }
    }

    const closeDeleteModal = () => {
        isDeleteModalOpen.value = false
        adminToDelete.value = null
    }

    onMounted(() => {
        void fetchInviteStatus()
        loadTabData()
    })

    watch([activeTab, searchQuery], () => {
        loadTabData()
    })

    return {
        activeTab,
        searchQuery,
        isDeleteModalOpen,
        inviteLink,
        expiresAt,
        isGenerating,
        isInitialLoading,
        tabs,
        tableItems,
        currentPlaceholder,
        isLoadingData,
        isDeleting,
        formatDate,
        formatRange,
        generateLink,
        copyToClipboard,
        openDeleteModal,
        confirmDelete,
        closeDeleteModal
    }
}