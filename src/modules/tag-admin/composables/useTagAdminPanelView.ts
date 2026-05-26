import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { LIST } from '@/constants/list.constants'
import { DATA_TABLE_CONSTANTS } from '@/constants/data-table.constants'
import type { OrganizationInfo } from '@/modules/organization/interfaces/organization-info.interface'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import type { OrganizationMemberProfile } from '@/interfaces/organization-member-profile.interface'
import type { TagAdminEmployeeItem } from '@/modules/tag-admin/interfaces/tag-admin-employee-item.interface'
import type { TagAdminPanelTranslations } from '@/modules/tag-admin/interfaces/tag-admin-panel-translations.interface'
import type { RfidTagItem } from '@/modules/tag-admin/interfaces/rfid-tag-item.interface'
import { tagAdminPanelRepository } from '@/modules/tag-admin/repositories/tag-admin-panel.repository'

export const useTagAdminPanelView = (translations: Ref<TagAdminPanelTranslations>) => {
    const { formatDate } = useDateFormatter()

    const defaultOrganizationInfo: OrganizationInfo = {
        organization_id: 0,
        title: '',
        description: null,
        created_at: ''
    }

    const organizationInfo = ref<OrganizationInfo>(defaultOrganizationInfo)
    const employees = ref<TagAdminEmployeeItem[]>([])
    const searchQuery = ref('')
    const tableOffset = ref(0)
    const tableLimit = ref(LIST.DEFAULT_LIMIT)
    const tableTotal = ref(0)
    const isLoadingInfo = ref(false)
    const isLoadingTable = ref(false)
    const isLoadingMemberInfo = ref(false)
    const isMemberInfoOpen = ref(false)
    const selectedMemberProfile = ref<OrganizationMemberProfile | null>(null)
    const selectedMemberErrorMessage = ref('')
    const isTagModalOpen = ref(false)
    const selectedTag = ref<RfidTagItem | null>(null)
    const availableTags = ref<RfidTagItem[]>([])
    const tagSearchQuery = ref('')
    const tagOffset = ref(0)
    const tagLimit = ref(LIST.DEFAULT_LIMIT)
    const tagTotal = ref(0)
    const isLoadingTags = ref(false)
    const tagModalErrorMessage = ref('')
    const errorMessage = ref('')

    let searchDebounceTimeout: number | null = null
    let tagSearchDebounceTimeout: number | null = null
    let employeesRequestId = 0
    let tagsRequestId = 0

    const formattedOrganizationCreatedAt = computed(() =>
        organizationInfo.value.created_at ? formatDate(organizationInfo.value.created_at) : '—'
    )

    const tagStatusLabel = (employee: TagAdminEmployeeItem) =>
        employee.has_assigned_tag
            ? translations.value.table.tagAssigned
            : translations.value.table.tagMissing

    const fetchOrganizationInfo = async () => {
        isLoadingInfo.value = true
        errorMessage.value = ''

        try {
            const organizationResponse = await tagAdminPanelRepository.getOrganizationInfo()
            organizationInfo.value = organizationResponse.data
        } catch {
            organizationInfo.value = defaultOrganizationInfo
            errorMessage.value = translations.value.errors.server
        } finally {
            isLoadingInfo.value = false
        }
    }

    const openEmployeeInfo = async (employee: TagAdminEmployeeItem) => {
        if (!organizationInfo.value.organization_id) return

        isMemberInfoOpen.value = true
        isLoadingMemberInfo.value = true
        selectedMemberProfile.value = null
        selectedMemberErrorMessage.value = ''

        try {
            const response = await tagAdminPanelRepository.getEmployeeProfile(
                organizationInfo.value.organization_id,
                employee.id
            )
            selectedMemberProfile.value = response.data
        } catch {
            selectedMemberErrorMessage.value = translations.value.errors.server
        } finally {
            isLoadingMemberInfo.value = false
        }
    }

    const closeEmployeeInfo = () => {
        isMemberInfoOpen.value = false
        selectedMemberProfile.value = null
        selectedMemberErrorMessage.value = ''
    }

    const employeeTagActionLabel = computed(() => {
        if (!selectedMemberProfile.value) return translations.value.memberInfo.assignTag
        const employee = employees.value.find((item) => item.id === selectedMemberProfile.value?.id)
        return employee?.has_assigned_tag
            ? translations.value.memberInfo.unassignTag
            : translations.value.memberInfo.assignTag
    })

    const fetchAssignedTag = async (employeeId: number) => {
        const response = await tagAdminPanelRepository.getAssignedTag(employeeId)
        selectedTag.value = response.data
    }

    const fetchAvailableTags = async () => {
        if (!selectedMemberProfile.value) return
        const requestId = ++tagsRequestId
        isLoadingTags.value = true
        tagModalErrorMessage.value = ''

        try {
            const response = await tagAdminPanelRepository.getAvailableTags(selectedMemberProfile.value.id, {
                search: tagSearchQuery.value,
                offset: tagOffset.value,
                limit: tagLimit.value
            })
            if (requestId !== tagsRequestId) return

            availableTags.value = tagOffset.value === 0
                ? response.data.items
                : [...availableTags.value, ...response.data.items]
            tagTotal.value = response.data.total
        } catch {
            if (requestId !== tagsRequestId) return
            if (tagOffset.value === 0) availableTags.value = []
            tagTotal.value = 0
            tagModalErrorMessage.value = translations.value.errors.server
        } finally {
            if (requestId === tagsRequestId) isLoadingTags.value = false
        }
    }

    const openTagModal = async () => {
        if (!selectedMemberProfile.value) return
        isTagModalOpen.value = true
        tagModalErrorMessage.value = ''
        tagSearchQuery.value = ''
        tagOffset.value = 0

        try {
            await fetchAssignedTag(selectedMemberProfile.value.id)
        } catch {
            tagModalErrorMessage.value = translations.value.errors.server
        }
        await fetchAvailableTags()
    }

    const closeTagModal = () => {
        isTagModalOpen.value = false
        selectedTag.value = null
        availableTags.value = []
        tagModalErrorMessage.value = ''
    }

    const assignTag = async (tag: RfidTagItem) => {
        if (!selectedMemberProfile.value) return
        tagModalErrorMessage.value = ''

        try {
            await tagAdminPanelRepository.assignTag(selectedMemberProfile.value.id, tag.rfid_tag_id)
            selectedTag.value = tag
            availableTags.value = availableTags.value.filter((item) => item.rfid_tag_id !== tag.rfid_tag_id)
            employees.value = employees.value.map((employee) =>
                employee.id === selectedMemberProfile.value?.id
                    ? { ...employee, has_assigned_tag: true }
                    : employee
            )
        } catch {
            tagModalErrorMessage.value = translations.value.errors.server
        }
    }

    const unassignTag = async () => {
        if (!selectedMemberProfile.value) return
        tagModalErrorMessage.value = ''

        try {
            await tagAdminPanelRepository.unassignTag(selectedMemberProfile.value.id)
            if (selectedTag.value && tagOffset.value === 0) {
                availableTags.value = [selectedTag.value, ...availableTags.value]
            }
            selectedTag.value = null
            employees.value = employees.value.map((employee) =>
                employee.id === selectedMemberProfile.value?.id
                    ? { ...employee, has_assigned_tag: false }
                    : employee
            )
        } catch {
            tagModalErrorMessage.value = translations.value.errors.server
        }
    }

    const fetchEmployees = async () => {
        const requestId = ++employeesRequestId
        isLoadingTable.value = true
        errorMessage.value = ''

        try {
            const params: OrganizationListParams = {
                search: searchQuery.value,
                offset: tableOffset.value,
                limit: tableLimit.value
            }
            const response = await tagAdminPanelRepository.getEmployees(params)
            if (requestId !== employeesRequestId) return

            employees.value = tableOffset.value === 0
                ? response.data.items
                : [...employees.value, ...response.data.items]
            tableTotal.value = response.data.total
        } catch {
            if (requestId !== employeesRequestId) return
            if (tableOffset.value === 0) employees.value = []
            tableTotal.value = 0
            errorMessage.value = translations.value.errors.server
        } finally {
            if (requestId === employeesRequestId) isLoadingTable.value = false
        }
    }

    onMounted(() => {
        void fetchOrganizationInfo()
        void fetchEmployees()
    })

    onBeforeUnmount(() => {
        if (searchDebounceTimeout !== null) window.clearTimeout(searchDebounceTimeout)
        if (tagSearchDebounceTimeout !== null) window.clearTimeout(tagSearchDebounceTimeout)
    })

    watch(searchQuery, () => {
        if (searchDebounceTimeout !== null) window.clearTimeout(searchDebounceTimeout)
        searchDebounceTimeout = window.setTimeout(() => {
            if (tableOffset.value !== 0) {
                tableOffset.value = 0
                return
            }
            void fetchEmployees()
        }, DATA_TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS)
    })

    watch(tableOffset, () => {
        void fetchEmployees()
    })

    watch(tagSearchQuery, () => {
        if (!isTagModalOpen.value) return
        if (tagSearchDebounceTimeout !== null) window.clearTimeout(tagSearchDebounceTimeout)
        tagSearchDebounceTimeout = window.setTimeout(() => {
            if (tagOffset.value !== 0) {
                tagOffset.value = 0
                return
            }
            void fetchAvailableTags()
        }, DATA_TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS)
    })

    watch(tagOffset, () => {
        if (isTagModalOpen.value) void fetchAvailableTags()
    })

    return {
        organizationInfo,
        employees,
        searchQuery,
        tableOffset,
        tableLimit,
        tableTotal,
        isLoadingInfo,
        isLoadingTable,
        isLoadingMemberInfo,
        isMemberInfoOpen,
        selectedMemberProfile,
        selectedMemberErrorMessage,
        isTagModalOpen,
        selectedTag,
        availableTags,
        tagSearchQuery,
        tagOffset,
        tagLimit,
        tagTotal,
        isLoadingTags,
        tagModalErrorMessage,
        errorMessage,
        formattedOrganizationCreatedAt,
        employeeTagActionLabel,
        formatDate,
        tagStatusLabel,
        openEmployeeInfo,
        closeEmployeeInfo,
        openTagModal,
        closeTagModal,
        assignTag,
        unassignTag
    }
}
