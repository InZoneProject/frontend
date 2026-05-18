import { ref, computed, onMounted, watch, type Ref } from 'vue'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import { globalAdminRepository } from '../repositories/global-admin.repository'
import { useDateFormatter } from '@/composables/useDateFormatter'
import type { OrganizationAdmin } from '@/interfaces/organization-admin.interface'
import type { InviteHistory } from '@/modules/global-admin/interfaces/invite-history.interface'
import type { GlobalAdminPanelTranslations } from '../interfaces/global-admin-panel-translations.interface'
import { LIST } from '@/constants/list.constants'

export const useGlobalAdminPanelView = (translations: Ref<GlobalAdminPanelTranslations>) => {
    const { formatDate, formatRange } = useDateFormatter()

    const activeTab = ref<'admins' | 'history'>('admins')
    const searchQuery = ref('')
    const isDeleteModalOpen = ref(false)
    const adminToDelete = ref<number | null>(null)

    const inviteLink = ref<string | null>(null)
    const expiresAt = ref<string | null>(null)
    const inviteCopySuccessMessage = ref('')
    const isGenerating = ref(false)
    const isInitialLoading = ref(true)

    const admins = ref<OrganizationAdmin[]>([])
    const history = ref<InviteHistory[]>([])
    const isLoadingData = ref(false)
    const isDeleting = ref(false)
    const tableOffset = ref(0)
    const tableLimit = ref(LIST.DEFAULT_LIMIT)
    const tableTotal = ref(0)

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
            const requestParams: OrganizationListParams = {
                search: searchQuery.value,
                offset: tableOffset.value,
                limit: tableLimit.value
            }
            const response = await globalAdminRepository.getOrganizationAdmins(requestParams)
            admins.value = tableOffset.value === 0
                ? response.data.items
                : [...admins.value, ...response.data.items]
            tableTotal.value = response.data.total
        } finally {
            isLoadingData.value = false
        }
    }

    const fetchHistory = async () => {
        isLoadingData.value = true
        try {
            const requestParams: OrganizationListParams = {
                search: searchQuery.value,
                offset: tableOffset.value,
                limit: tableLimit.value
            }
            const response = await globalAdminRepository.getInviteHistory(requestParams)
            history.value = tableOffset.value === 0
                ? response.data.items
                : [...history.value, ...response.data.items]
            tableTotal.value = response.data.total
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
            inviteCopySuccessMessage.value = ''
        } finally {
            isGenerating.value = false
        }
    }

    const copyToClipboard = async () => {
        if (inviteLink.value) {
            await navigator.clipboard.writeText(inviteLink.value)
            inviteCopySuccessMessage.value = translations.value.inviteSection.copySuccess
        }
    }

    const clearInvite = () => {
        inviteLink.value = null
        expiresAt.value = null
        inviteCopySuccessMessage.value = ''
    }

    const clearInviteCopySuccessMessage = () => {
        inviteCopySuccessMessage.value = ''
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
            admins.value = admins.value.filter((admin) => admin.organization_admin_id !== adminToDelete.value)
            tableTotal.value = Math.max(0, tableTotal.value - 1)
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

    watch(activeTab, () => {
        inviteCopySuccessMessage.value = ''
        tableTotal.value = 0
        admins.value = []
        history.value = []
        if (tableOffset.value !== 0) {
            tableOffset.value = 0
            return
        }
        loadTabData()
    })

    watch(searchQuery, () => {
        if (tableOffset.value !== 0) {
            tableOffset.value = 0
            return
        }
        admins.value = []
        history.value = []
        loadTabData()
    })

    watch(tableOffset, () => {
        loadTabData()
    })

    return {
        activeTab,
        searchQuery,
        isDeleteModalOpen,
        inviteLink,
        expiresAt,
        inviteCopySuccessMessage,
        isGenerating,
        isInitialLoading,
        tabs,
        tableItems,
        tableOffset,
        tableLimit,
        tableTotal,
        currentPlaceholder,
        isLoadingData,
        isDeleting,
        formatDate,
        formatRange,
        generateLink,
        copyToClipboard,
        clearInvite,
        clearInviteCopySuccessMessage,
        openDeleteModal,
        confirmDelete,
        closeDeleteModal
    }
}
