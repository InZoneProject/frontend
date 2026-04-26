import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDateFormatter } from '@/composables/useDateFormatter'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import { organizationsRepository } from '@/modules/organizations/repositories/organizations.repository'
import type { OrganizationItem } from '@/modules/organizations/interfaces/organization-item.interface'
import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'

export const useOrganizationsView = (translations: Ref<OrganizationsTranslations>) => {
    const { formatDate } = useDateFormatter()
    const router = useRouter()
    const route = useRoute()

    const searchQuery = ref('')
    const organizations = ref<OrganizationItem[]>([])
    const isLoadingData = ref(false)

    const isOrganizationFormModalOpen = ref(false)
    const organizationFormMode = ref<'create' | 'edit'>('create')
    const organizationToEditId = ref<number | null>(null)
    const organizationFormNameValue = ref('')
    const organizationFormDescriptionValue = ref('')
    const isOrganizationFormSubmitting = ref(false)

    const isDeleteModalOpen = ref(false)
    const organizationToDelete = ref<number | null>(null)
    const isDeleting = ref(false)
    let searchDebounceTimeout: number | null = null

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
        return organizationFormNameValue.value.trim().length > 0
    })

    const fetchOrganizations = async () => {
        isLoadingData.value = true

        try {
            const requestParams: OrganizationListParams = {
                search: searchQuery.value,
                offset: 0,
                limit: 20
            }
            const response = await organizationsRepository.getOrganizations(requestParams)

            organizations.value = response.data.items
        } finally {
            isLoadingData.value = false
        }
    }

    const openCreateModal = () => {
        organizationFormMode.value = 'create'
        organizationToEditId.value = null
        organizationFormNameValue.value = ''
        organizationFormDescriptionValue.value = ''
        isOrganizationFormModalOpen.value = true
    }

    const openEditModal = (organization: OrganizationItem) => {
        organizationFormMode.value = 'edit'
        organizationToEditId.value = organization.organization_id
        organizationFormNameValue.value = organization.title
        organizationFormDescriptionValue.value = organization.description || ''
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
                await fetchOrganizations()
                await openOrganizationPage(response.data.organization_id)
                return
            } else if (organizationToEditId.value !== null) {
                await organizationsRepository.updateOrganization(organizationToEditId.value, {
                    title: titleValue,
                    description: descriptionValue.length > 0 ? descriptionValue : null
                })
            }

            isOrganizationFormModalOpen.value = false
            await fetchOrganizations()
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
            await fetchOrganizations()
        } finally {
            isDeleting.value = false
            closeDeleteModal()
        }
    }

    onMounted(() => {
        void fetchOrganizations()
    })

    watch(searchQuery, () => {
        if (searchDebounceTimeout !== null) {
            window.clearTimeout(searchDebounceTimeout)
        }

        searchDebounceTimeout = window.setTimeout(() => {
            void fetchOrganizations()
        }, 300)
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
