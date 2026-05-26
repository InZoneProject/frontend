import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDateFormatter } from '@/composables/useDateFormatter'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import { organizationsRepository } from '@/modules/organizations/repositories/organizations.repository'
import type { OrganizationItem } from '@/modules/organizations/interfaces/organization-item.interface'
import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'
import { LIST } from '@/constants/list.constants'
import { DATA_TABLE_CONSTANTS } from '@/constants/data-table.constants'

export const useOrganizationsView = (translations: Ref<OrganizationsTranslations>) => {
    const { formatDate } = useDateFormatter()
    const router = useRouter()
    const route = useRoute()

    const searchQuery = ref('')
    const organizations = ref<OrganizationItem[]>([])
    const isLoadingData = ref(false)
    const tableOffset = ref(0)
    const tableLimit = ref(LIST.DEFAULT_LIMIT)
    const tableTotal = ref(0)

    const isOrganizationFormModalOpen = ref(false)
    const organizationFormMode = ref<'create' | 'edit'>('create')
    const organizationToEditId = ref<number | null>(null)
    const organizationFormNameValue = ref('')
    const organizationFormDescriptionValue = ref('')
    const initialOrganizationFormNameValue = ref('')
    const initialOrganizationFormDescriptionValue = ref('')
    const isOrganizationFormSubmitting = ref(false)

    const isDeleteModalOpen = ref(false)
    const organizationToDelete = ref<number | null>(null)
    const isDeleting = ref(false)
    let searchDebounceTimeout: number | null = null
    let organizationsRequestId = 0

    const runBackground = (request: Promise<unknown>) => {
        request.catch(() => undefined)
    }

    const selectedOrganizationId = computed(() => {
        const rawValue = route.params.organizationId
        const parsedId = Number(rawValue)

        if (!Number.isFinite(parsedId) || parsedId <= 0) {
            return 0
        }

        return parsedId
    })

    const currentPlaceholder = computed(() => translations.value.table.searchPlaceholder)

    const canSubmitOrganizationForm = computed(() => {
        const title = organizationFormNameValue.value.trim()
        if (title.length === 0) {
            return false
        }

        if (organizationFormMode.value === 'create') {
            return true
        }

        const description = organizationFormDescriptionValue.value.trim()
        return (
            title !== initialOrganizationFormNameValue.value
            || description !== initialOrganizationFormDescriptionValue.value
        )
    })

    const fetchOrganizations = async () => {
        if (isLoadingData.value) return
        const requestId = ++organizationsRequestId
        isLoadingData.value = true

        try {
            const requestParams: OrganizationListParams = {
                search: searchQuery.value,
                offset: tableOffset.value,
                limit: tableLimit.value
            }
            const response = await organizationsRepository.getOrganizations(requestParams)
            if (requestId !== organizationsRequestId) return
            organizations.value = tableOffset.value === 0
                ? response.data.items
                : [...organizations.value, ...response.data.items]
            tableTotal.value = response.data.total
        } catch {
            if (requestId !== organizationsRequestId) return
            if (tableOffset.value === 0) {
                organizations.value = []
                tableTotal.value = 0
            }
        } finally {
            if (requestId === organizationsRequestId) isLoadingData.value = false
        }
    }

    const openCreateModal = () => {
        organizationFormMode.value = 'create'
        organizationToEditId.value = null
        organizationFormNameValue.value = ''
        organizationFormDescriptionValue.value = ''
        initialOrganizationFormNameValue.value = ''
        initialOrganizationFormDescriptionValue.value = ''
        isOrganizationFormModalOpen.value = true
    }

    const openEditModal = (organization: OrganizationItem) => {
        organizationFormMode.value = 'edit'
        organizationToEditId.value = organization.organization_id
        organizationFormNameValue.value = organization.title
        organizationFormDescriptionValue.value = organization.description || ''
        initialOrganizationFormNameValue.value = organization.title.trim()
        initialOrganizationFormDescriptionValue.value = (organization.description || '').trim()
        isOrganizationFormModalOpen.value = true
    }

    const closeOrganizationFormModal = () => {
        isOrganizationFormModalOpen.value = false
    }

    const submitOrganizationForm = async () => {
        if (!canSubmitOrganizationForm.value) return

        isOrganizationFormSubmitting.value = true

        try {
            const descriptionValue = organizationFormDescriptionValue.value.trim()
            const titleValue = organizationFormNameValue.value.trim()

            if (organizationFormMode.value === 'create') {
                const response = await organizationsRepository.createOrganization({
                    title: titleValue,
                    ...(descriptionValue.length > 0 ? { description: descriptionValue } : {})
                })

                isOrganizationFormModalOpen.value = false
                organizations.value = [response.data, ...organizations.value]
                tableTotal.value += 1
                await openOrganizationPage(response.data.organization_id)
                return
            } else if (organizationToEditId.value !== null) {
                const response = await organizationsRepository.updateOrganization(organizationToEditId.value, {
                    title: titleValue,
                    description: descriptionValue.length > 0 ? descriptionValue : null
                })
                organizations.value = organizations.value.map((organization) =>
                    organization.organization_id === organizationToEditId.value
                        ? response.data
                        : organization
                )
            }

            isOrganizationFormModalOpen.value = false
        } finally {
            isOrganizationFormSubmitting.value = false
        }
    }

    const openDeleteModal = (organizationId: number) => {
        organizationToDelete.value = organizationId
        isDeleteModalOpen.value = true
    }

    const openOrganizationPage = async (organizationId: number) => {
        await router.push({
            name: 'Organizations',
            params: {
                organizationId: String(organizationId)
            },
            query: route.query
        })
    }

    const closeOrganizationPage = async () => {
        await router.push({
            name: 'Organizations',
            params: {},
            query: {}
        })
    }

    const closeDeleteModal = () => {
        organizationToDelete.value = null
        isDeleteModalOpen.value = false
    }

    const confirmDelete = async () => {
        if (organizationToDelete.value === null) return

        isDeleting.value = true

        try {
            await organizationsRepository.deleteOrganization(organizationToDelete.value)
            organizations.value = organizations.value.filter(
                (organization) => organization.organization_id !== organizationToDelete.value
            )
            tableTotal.value = Math.max(0, tableTotal.value - 1)
        } finally {
            isDeleting.value = false
            closeDeleteModal()
        }
    }

    onMounted(() => {
        runBackground(fetchOrganizations())
    })

    watch(searchQuery, () => {
        if (tableOffset.value !== 0) {
            tableOffset.value = 0
            return
        }
        if (searchDebounceTimeout !== null) {
            window.clearTimeout(searchDebounceTimeout)
        }

        searchDebounceTimeout = window.setTimeout(() => {
            runBackground(fetchOrganizations())
        }, DATA_TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS)
    })

    watch(tableOffset, () => {
        runBackground(fetchOrganizations())
    })

    onBeforeUnmount(() => {
        if (searchDebounceTimeout !== null) {
            window.clearTimeout(searchDebounceTimeout)
        }
    })

    return {
        searchQuery,
        organizations,
        isLoadingData,
        tableOffset,
        tableLimit,
        tableTotal,
        currentPlaceholder,
        isOrganizationFormModalOpen,
        organizationFormMode,
        organizationFormNameValue,
        organizationFormDescriptionValue,
        isOrganizationFormSubmitting,
        canSubmitOrganizationForm,
        isDeleteModalOpen,
        isDeleting,
        selectedOrganizationId,
        formatDate,
        openCreateModal,
        openEditModal,
        openOrganizationPage,
        closeOrganizationPage,
        closeOrganizationFormModal,
        submitOrganizationForm,
        openDeleteModal,
        closeDeleteModal,
        confirmDelete
    }
}
