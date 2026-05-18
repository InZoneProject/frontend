import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDateFormatter } from '@/composables/useDateFormatter'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import type { OrganizationMemberProfile } from '@/interfaces/organization-member-profile.interface'
import { organizationEditDeleteRepository } from '@/repositories/organization-edit-delete.repository'
import { participantsControlRepository } from '@/repositories/participants-control.repository'
import { organizationRepository } from '@/modules/organization/repositories/organization.repository'
import { positionsRepository } from '@/repositories/positions.repository'
import type { OrganizationInfo } from '@/modules/organization/interfaces/organization-info.interface'
import type { OrganizationBuildingItem } from '@/modules/organization/interfaces/organization-building-item.interface'
import type { OrganizationMemberItem } from '@/modules/organization/interfaces/organization-member-item.interface'
import type { OrganizationRfidTagItem } from '@/modules/organization/interfaces/organization-rfid-tag-item.interface'
import type { OrganizationPositionItem } from '@/modules/organization/interfaces/organization-position-item.interface'
import type { OrganizationsTranslations } from '@/modules/organizations/interfaces/organizations-translations.interface'
import { LIST } from '@/constants/list.constants'

export const useOrganizationView = (params: {
    organizationId: number
    translations: Ref<OrganizationsTranslations>
    onDeleted: () => void
}) => {
    const { formatDate } = useDateFormatter()
    const router = useRouter()
    const route = useRoute()

    const resolveQueryValue = (value: string | string[] | null | undefined) => {
        if (Array.isArray(value)) {
            return value[0] || ''
        }

        return value || ''
    }

    const isInviteTab = (value: string): value is 'employeesInvite' | 'tagAdminInvite' => {
        return value === 'employeesInvite' || value === 'tagAdminInvite'
    }

    const isListTab = (value: string): value is 'buildings' | 'members' | 'tags' => {
        return value === 'buildings' || value === 'members' || value === 'tags'
    }

    const queryInviteTab = resolveQueryValue(route.query.inviteTab as string | string[] | null | undefined)
    const queryListTab = resolveQueryValue(route.query.listTab as string | string[] | null | undefined)

    const defaultOrganizationInfo: OrganizationInfo = {
        organization_id: 0,
        title: '',
        description: null,
        created_at: ''
    }

    const organizationInfo = ref<OrganizationInfo>(defaultOrganizationInfo)

    const isLoadingInfo = ref(false)
    const isLoadingInviteStatus = ref(false)
    const isGeneratingInvite = ref(false)
    const isLoadingTable = ref(false)

    const activeInviteTab = ref<'employeesInvite' | 'tagAdminInvite'>(
        isInviteTab(queryInviteTab) ? queryInviteTab : 'employeesInvite',
    )
    const employeeInviteLink = ref('')
    const employeeInviteExpiresAt = ref('')
    const tagAdminInviteLink = ref('')
    const tagAdminInviteExpiresAt = ref('')
    const employeeInviteCopySuccessMessage = ref('')
    const tagAdminInviteCopySuccessMessage = ref('')

    const activeListTab = ref<'buildings' | 'members' | 'tags'>(
        isListTab(queryListTab) ? queryListTab : 'buildings',
    )
    const searchQuery = ref('')

    const buildings = ref<OrganizationBuildingItem[]>([])
    const members = ref<OrganizationMemberItem[]>([])
    const tags = ref<OrganizationRfidTagItem[]>([])
    const tableOffset = ref(0)
    const tableLimit = ref(LIST.DEFAULT_LIMIT)
    const tableTotal = ref(0)

    const isEditModalOpen = ref(false)
    const isDeleteModalOpen = ref(false)
    const isSubmittingEdit = ref(false)
    const isDeleting = ref(false)

    const isBuildingModalOpen = ref(false)
    const buildingModalMode = ref<'create' | 'edit'>('create')
    const buildingToEditId = ref<number | null>(null)
    const buildingToDeleteId = ref<number | null>(null)
    const buildingTitleValue = ref('')
    const buildingAddressValue = ref('')
    const initialBuildingTitleValue = ref('')
    const initialBuildingAddressValue = ref('')
    const isBuildingSubmitting = ref(false)
    const isDeleteBuildingModalOpen = ref(false)
    const isDeletingBuilding = ref(false)
    const isTagModalOpen = ref(false)
    const tagModalMode = ref<'create' | 'edit'>('create')
    const tagToEditId = ref<number | null>(null)
    const tagToDeleteId = ref<number | null>(null)
    const tagNameValue = ref('')
    const tagUidValue = ref('')
    const initialTagNameValue = ref('')
    const isTagSubmitting = ref(false)
    const isDeleteTagModalOpen = ref(false)
    const isDeletingTag = ref(false)

    const isExpelModalOpen = ref(false)
    const isExpellingMember = ref(false)
    const memberToExpel = ref<OrganizationMemberItem | null>(null)

    const isMemberInfoModalOpen = ref(false)
    const selectedMemberProfile = ref<OrganizationMemberProfile | null>(null)
    const isLoadingMemberProfile = ref(false)

    const isMemberPositionsModalOpen = ref(false)
    const isPositionsEditMode = ref(false)
    const isLoadingMemberPositions = ref(false)
    const isLoadingAvailablePositions = ref(false)
    const assignedMemberPositions = ref<OrganizationPositionItem[]>([])
    const availableMemberPositions = ref<OrganizationPositionItem[]>([])
    const assignedPositionsOffset = ref(0)
    const assignedPositionsTotal = ref(0)
    const availablePositionsOffset = ref(0)
    const availablePositionsTotal = ref(0)
    const memberPositionsLimit = LIST.DEFAULT_LIMIT
    const assignedPositionsSearchValue = ref('')
    const availablePositionsSearchValue = ref('')

    const isPositionUpsertModalOpen = ref(false)
    const positionModalMode = ref<'create' | 'edit'>('create')
    const positionToEditId = ref<number | null>(null)
    const positionRoleValue = ref('')
    const positionDescriptionValue = ref('')
    const initialPositionRoleValue = ref('')
    const initialPositionDescriptionValue = ref('')
    const isPositionSubmitting = ref(false)

    const isDeletePositionModalOpen = ref(false)
    const positionToDeleteId = ref<number | null>(null)
    const isDeletingPosition = ref(false)

    const editNameValue = ref('')
    const editDescriptionValue = ref('')
    const initialEditNameValue = ref('')
    const initialEditDescriptionValue = ref('')

    const revealedTagIds = ref<Set<number>>(new Set<number>())

    let searchDebounceTimeout: number | null = null
    let assignedPositionsSearchDebounceTimeout: number | null = null
    let availablePositionsSearchDebounceTimeout: number | null = null
    let organizationInfoRequestId = 0
    let inviteStatusRequestId = 0
    let activeTabRequestId = 0

    const runBackground = (request: Promise<unknown>) => {
        request.catch(() => undefined)
    }

    const handleProfilePhotoUpdated = (event: Event) => {
        const detail = (event as CustomEvent<{ email?: string; photo?: string }>).detail
        if (!detail?.email) return

        members.value = members.value.map((member) =>
            member.email === detail.email
                ? { ...member, photo: detail.photo || null }
                : member
        )

        if (selectedMemberProfile.value?.email === detail.email) {
            selectedMemberProfile.value = {
                ...selectedMemberProfile.value,
                photo: detail.photo || null
            }
        }
    }

    const clearEmployeeInviteCopySuccessMessage = () => {
        employeeInviteCopySuccessMessage.value = ''
    }

    const clearTagAdminInviteCopySuccessMessage = () => {
        tagAdminInviteCopySuccessMessage.value = ''
    }

    const inviteTabs = computed(() => [
        { id: 'employeesInvite', label: params.translations.value.page.tabs.employeesInvite },
        { id: 'tagAdminInvite', label: params.translations.value.page.tabs.tagAdminInvite }
    ])

    const listTabs = computed(() => [
        { id: 'buildings', label: params.translations.value.page.tabs.buildings },
        { id: 'members', label: params.translations.value.page.tabs.members },
        { id: 'tags', label: params.translations.value.page.tabs.tags }
    ])

    const currentListPlaceholder = computed(() => {
        return activeListTab.value === 'members'
            ? params.translations.value.page.table.membersSearchPlaceholder
            : params.translations.value.page.table.searchPlaceholder
    })

    const activeInviteLink = computed(() => {
        return activeInviteTab.value === 'employeesInvite'
            ? employeeInviteLink.value
            : tagAdminInviteLink.value
    })

    const activeInviteExpiresAt = computed(() => {
        return activeInviteTab.value === 'employeesInvite'
            ? employeeInviteExpiresAt.value
            : tagAdminInviteExpiresAt.value
    })

    const activeInviteCopySuccessMessage = computed(() => {
        return activeInviteTab.value === 'employeesInvite'
            ? employeeInviteCopySuccessMessage.value
            : tagAdminInviteCopySuccessMessage.value
    })

    const tableItems = computed<(OrganizationBuildingItem | OrganizationMemberItem | OrganizationRfidTagItem)[]>(() => {
        if (activeListTab.value === 'buildings') return buildings.value
        if (activeListTab.value === 'members') return members.value
        return tags.value
    })

    const formattedCreatedAt = computed(() => {
        if (!organizationInfo.value.created_at) {
            return '—'
        }

        return formatDate(organizationInfo.value.created_at)
    })

    const canSubmitOrganizationForm = computed(() => {
        const title = editNameValue.value.trim()
        if (title.length === 0) {
            return false
        }

        const description = editDescriptionValue.value.trim()
        return title !== initialEditNameValue.value || description !== initialEditDescriptionValue.value
    })

    const canSubmitBuildingForm = computed(() => {
        const title = buildingTitleValue.value.trim()
        if (title.length === 0) {
            return false
        }

        if (buildingModalMode.value === 'create') {
            return true
        }

        const address = buildingAddressValue.value.trim()
        return title !== initialBuildingTitleValue.value || address !== initialBuildingAddressValue.value
    })
    const canSubmitTagForm = computed(() => {
        const hasName = tagNameValue.value.trim().length > 0

        if (tagModalMode.value === 'edit') {
            return hasName && tagNameValue.value.trim() !== initialTagNameValue.value
        }

        const rawTagUid = tagUidValue.value.trim()
        const parsedTagUid = Number(rawTagUid)
        return hasName && rawTagUid.length > 0 && Number.isFinite(parsedTagUid)
    })
    const canSubmitPositionForm = computed(() => {
        const role = positionRoleValue.value.trim()
        if (role.length === 0) {
            return false
        }

        if (positionModalMode.value === 'create') {
            return true
        }

        const description = positionDescriptionValue.value.trim()
        return role !== initialPositionRoleValue.value || description !== initialPositionDescriptionValue.value
    })

    const expelModalMessage = computed(() => {
        if (!memberToExpel.value) {
            return ''
        }

        const messagePrefix = memberToExpel.value.role === 'tag_admin'
            ? params.translations.value.page.modals.expelMember.messageTagAdmin
            : params.translations.value.page.modals.expelMember.messageEmployee

        return `${messagePrefix} "${memberToExpel.value.full_name}"?`
    })

    const getSelectedEmployeeId = () => {
        if (!selectedMemberProfile.value || selectedMemberProfile.value.role !== 'employee') {
            return null
        }

        return selectedMemberProfile.value.id
    }

    const fetchOrganizationInfo = async () => {
        const requestId = ++organizationInfoRequestId
        isLoadingInfo.value = true

        try {
            const response = await organizationEditDeleteRepository.getOrganizationInfo(params.organizationId)
            if (requestId !== organizationInfoRequestId) return
            organizationInfo.value = response.data
        } catch {
            if (requestId === organizationInfoRequestId) {
                organizationInfo.value = defaultOrganizationInfo
            }
        } finally {
            if (requestId === organizationInfoRequestId) isLoadingInfo.value = false
        }
    }

    const fetchInviteStatuses = async () => {
        const requestId = ++inviteStatusRequestId
        isLoadingInviteStatus.value = true

        try {
            const [employeeStatusResponse, tagAdminStatusResponse] = await Promise.all([
                organizationRepository.getEmployeeInviteStatus(params.organizationId),
                organizationRepository.getTagAdminInviteStatus(params.organizationId)
            ])

            if (requestId !== inviteStatusRequestId) return

            employeeInviteLink.value = employeeStatusResponse.data?.invite_url || ''
            employeeInviteExpiresAt.value = employeeStatusResponse.data?.expires_at || ''

            tagAdminInviteLink.value = tagAdminStatusResponse.data?.invite_url || ''
            tagAdminInviteExpiresAt.value = tagAdminStatusResponse.data?.expires_at || ''
        } catch {
            if (requestId !== inviteStatusRequestId) return
            employeeInviteLink.value = ''
            employeeInviteExpiresAt.value = ''
            tagAdminInviteLink.value = ''
            tagAdminInviteExpiresAt.value = ''
        } finally {
            if (requestId === inviteStatusRequestId) isLoadingInviteStatus.value = false
        }
    }

    const fetchActiveTabData = async () => {
        if (isLoadingTable.value) return
        const requestId = ++activeTabRequestId
        isLoadingTable.value = true

        try {
            const requestParams: OrganizationListParams = {
                search: searchQuery.value,
                offset: tableOffset.value,
                limit: tableLimit.value
            }

            if (activeListTab.value === 'buildings') {
                const response = await organizationRepository.getBuildings(params.organizationId, requestParams)
                if (requestId !== activeTabRequestId) return
                buildings.value = tableOffset.value === 0
                    ? response.data.items
                    : [...buildings.value, ...response.data.items]
                tableTotal.value = response.data.total
                selectedMemberProfile.value = null
                return
            }

            if (activeListTab.value === 'members') {
                const response = await organizationRepository.getMembers(params.organizationId, requestParams)
                if (requestId !== activeTabRequestId) return
                const nextMembers = response.data.items
                tableTotal.value = response.data.total
                members.value = tableOffset.value === 0
                    ? nextMembers
                    : [...members.value, ...nextMembers]

                if (
                    selectedMemberProfile.value &&
                    !nextMembers.some((member) => member.id === selectedMemberProfile.value?.id)
                ) {
                    selectedMemberProfile.value = null
                    isMemberInfoModalOpen.value = false
                    isMemberPositionsModalOpen.value = false
                }
                return
            }

            const response = await organizationRepository.getRfidTags(params.organizationId, requestParams)
            if (requestId !== activeTabRequestId) return
            tags.value = tableOffset.value === 0
                ? response.data.items
                : [...tags.value, ...response.data.items]
            tableTotal.value = response.data.total
            selectedMemberProfile.value = null
        } catch {
            if (requestId !== activeTabRequestId) return
            if (tableOffset.value === 0) {
                buildings.value = []
                members.value = []
                tags.value = []
                tableTotal.value = 0
            }
        } finally {
            if (requestId === activeTabRequestId) isLoadingTable.value = false
        }
    }

    const fetchAssignedMemberPositions = async () => {
        const employeeId = getSelectedEmployeeId()

        if (employeeId === null) {
            assignedMemberPositions.value = []
            return
        }

        isLoadingMemberPositions.value = true

        try {
            const requestParams: OrganizationListParams = {
                search: assignedPositionsSearchValue.value,
                offset: assignedPositionsOffset.value,
                limit: LIST.DEFAULT_LIMIT
            }

            const response = await positionsRepository.getMemberPositions(
                params.organizationId,
                employeeId,
                requestParams
            )

            assignedMemberPositions.value = assignedPositionsOffset.value === 0
                ? response.data.items
                : [...assignedMemberPositions.value, ...response.data.items]
            assignedPositionsTotal.value = response.data.total
        } finally {
            isLoadingMemberPositions.value = false
        }
    }

    const fetchAvailableMemberPositions = async () => {
        const employeeId = getSelectedEmployeeId()

        if (employeeId === null) {
            availableMemberPositions.value = []
            return
        }

        isLoadingAvailablePositions.value = true

        try {
            const requestParams: OrganizationListParams = {
                search: availablePositionsSearchValue.value,
                offset: availablePositionsOffset.value,
                limit: LIST.DEFAULT_LIMIT
            }

            const response = await positionsRepository.getUnassignedEmployeePositions(
                params.organizationId,
                employeeId,
                requestParams
            )

            availableMemberPositions.value = availablePositionsOffset.value === 0
                ? response.data.items
                : [...availableMemberPositions.value, ...response.data.items]
            availablePositionsTotal.value = response.data.total
        } finally {
            isLoadingAvailablePositions.value = false
        }
    }

    const openEditModal = () => {
        editNameValue.value = organizationInfo.value.title
        editDescriptionValue.value = organizationInfo.value.description || ''
        initialEditNameValue.value = organizationInfo.value.title.trim()
        initialEditDescriptionValue.value = (organizationInfo.value.description || '').trim()
        isEditModalOpen.value = true
    }

    const closeEditModal = () => {
        isEditModalOpen.value = false
    }

    const submitOrganizationEdit = async () => {
        if (!canSubmitOrganizationForm.value) {
            return
        }

        isSubmittingEdit.value = true

        try {
            const normalizedDescription = editDescriptionValue.value.trim()

            await organizationEditDeleteRepository.updateOrganization(params.organizationId, {
                title: editNameValue.value.trim(),
                description: normalizedDescription.length > 0 ? normalizedDescription : null
            })

            closeEditModal()
            await fetchOrganizationInfo()
        } finally {
            isSubmittingEdit.value = false
        }
    }

    const openDeleteModal = () => {
        isDeleteModalOpen.value = true
    }

    const closeDeleteModal = () => {
        isDeleteModalOpen.value = false
    }

    const openCreateBuildingModal = () => {
        buildingModalMode.value = 'create'
        buildingToEditId.value = null
        buildingTitleValue.value = ''
        buildingAddressValue.value = ''
        initialBuildingTitleValue.value = ''
        initialBuildingAddressValue.value = ''
        isBuildingModalOpen.value = true
    }

    const openEditBuildingModal = (building: OrganizationBuildingItem) => {
        buildingModalMode.value = 'edit'
        buildingToEditId.value = building.building_id
        buildingTitleValue.value = building.title || ''
        buildingAddressValue.value = building.address || ''
        initialBuildingTitleValue.value = (building.title || '').trim()
        initialBuildingAddressValue.value = (building.address || '').trim()
        isBuildingModalOpen.value = true
    }

    const openBuildingPage = async (building: OrganizationBuildingItem) => {
        await router.push({
            name: 'Building',
            params: { buildingId: String(building.building_id) },
            query: { mode: 'view' }
        })
    }

    const closeBuildingModal = () => {
        isBuildingModalOpen.value = false
    }

    const submitBuilding = async () => {
        if (!canSubmitBuildingForm.value) {
            return
        }

        isBuildingSubmitting.value = true

        try {
            const title = buildingTitleValue.value.trim()
            const normalizedAddress = buildingAddressValue.value.trim()
            const address = normalizedAddress.length > 0 ? normalizedAddress : null

            if (buildingModalMode.value === 'create') {
                const response = await organizationRepository.createBuilding({
                    organization_id: params.organizationId,
                    title,
                    address
                })

                if (activeListTab.value === 'buildings') {
                    buildings.value = [{
                        building_id: response.data.building_id,
                        title: response.data.title,
                        address: response.data.address,
                        created_at: new Date().toISOString()
                    }, ...buildings.value]
                    tableTotal.value += 1
                }
            } else if (buildingToEditId.value !== null) {
                await organizationRepository.updateBuilding(buildingToEditId.value, {
                    title,
                    address
                })

                buildings.value = buildings.value.map((building) =>
                    building.building_id === buildingToEditId.value
                        ? { ...building, title, address }
                        : building
                )
            }

            closeBuildingModal()
        } finally {
            isBuildingSubmitting.value = false
        }
    }

    const openDeleteBuildingModal = (buildingId: number) => {
        buildingToDeleteId.value = buildingId
        isDeleteBuildingModalOpen.value = true
    }

    const closeDeleteBuildingModal = () => {
        buildingToDeleteId.value = null
        isDeleteBuildingModalOpen.value = false
    }

    const confirmDeleteBuilding = async () => {
        if (buildingToDeleteId.value === null) {
            return
        }

        isDeletingBuilding.value = true

        try {
            await organizationRepository.deleteBuilding(buildingToDeleteId.value)
            buildings.value = buildings.value.filter((building) => building.building_id !== buildingToDeleteId.value)
            tableTotal.value = Math.max(0, tableTotal.value - 1)
        } finally {
            isDeletingBuilding.value = false
            closeDeleteBuildingModal()
        }
    }

    const openCreateTagModal = () => {
        tagModalMode.value = 'create'
        tagToEditId.value = null
        tagNameValue.value = ''
        tagUidValue.value = ''
        initialTagNameValue.value = ''
        isTagModalOpen.value = true
    }

    const openEditTagModal = (tag: OrganizationRfidTagItem) => {
        tagModalMode.value = 'edit'
        tagToEditId.value = tag.rfid_tag_id
        tagNameValue.value = tag.name || ''
        tagUidValue.value = String(tag.tag_uid)
        initialTagNameValue.value = (tag.name || '').trim()
        isTagModalOpen.value = true
    }

    const closeTagModal = () => {
        isTagModalOpen.value = false
    }

    const submitTag = async () => {
        if (!canSubmitTagForm.value) {
            return
        }

        isTagSubmitting.value = true

        try {
            const name = tagNameValue.value.trim()

            if (tagModalMode.value === 'create') {
                const response = await organizationRepository.createRfidTag({
                    organization_id: params.organizationId,
                    tag_uid: Number(tagUidValue.value.trim()),
                    name
                })

                if (activeListTab.value === 'tags') {
                    tags.value = [{
                        ...response.data,
                        created_at: new Date().toISOString()
                    }, ...tags.value]
                    tableTotal.value += 1
                }
            } else if (tagToEditId.value !== null) {
                await organizationRepository.updateRfidTag(tagToEditId.value, { name })
                tags.value = tags.value.map((tag) =>
                    tag.rfid_tag_id === tagToEditId.value
                        ? { ...tag, name }
                        : tag
                )
            }

            closeTagModal()
        } finally {
            isTagSubmitting.value = false
        }
    }

    const openDeleteTagModal = (tagId: number) => {
        tagToDeleteId.value = tagId
        isDeleteTagModalOpen.value = true
    }

    const closeDeleteTagModal = () => {
        tagToDeleteId.value = null
        isDeleteTagModalOpen.value = false
    }

    const confirmDeleteTag = async () => {
        if (tagToDeleteId.value === null) {
            return
        }

        isDeletingTag.value = true

        try {
            await organizationRepository.deleteRfidTag(tagToDeleteId.value)
            tags.value = tags.value.filter((tag) => tag.rfid_tag_id !== tagToDeleteId.value)
            tableTotal.value = Math.max(0, tableTotal.value - 1)
        } finally {
            isDeletingTag.value = false
            closeDeleteTagModal()
        }
    }

    const openExpelModal = (member: OrganizationMemberItem) => {
        if (member.role === 'organization_admin') {
            return
        }

        memberToExpel.value = member
        isExpelModalOpen.value = true
    }

    const closeExpelModal = () => {
        memberToExpel.value = null
        isExpelModalOpen.value = false
    }

    const confirmExpelMember = async () => {
        if (!memberToExpel.value || memberToExpel.value.role === 'organization_admin') {
            return
        }

        isExpellingMember.value = true

        try {
            const expelTarget = memberToExpel.value
            if (!expelTarget) {
                return
            }

            if (expelTarget.role === 'tag_admin') {
                await participantsControlRepository.removeTagAdmin(params.organizationId, expelTarget.id)
            } else {
                await participantsControlRepository.removeEmployee(params.organizationId, expelTarget.id)
            }

            members.value = members.value.filter((member) => member.id !== expelTarget.id)
            tableTotal.value = Math.max(0, tableTotal.value - 1)
            closeExpelModal()
        } finally {
            isExpellingMember.value = false
        }
    }

    const closeMemberInfoModal = () => {
        isMemberInfoModalOpen.value = false
    }

    const closeMemberPositionsModal = () => {
        isMemberPositionsModalOpen.value = false
        isPositionsEditMode.value = false
    }

    const viewMemberPositions = async () => {
        if (!selectedMemberProfile.value || selectedMemberProfile.value.role !== 'employee') {
            return
        }

        isMemberInfoModalOpen.value = false
        isMemberPositionsModalOpen.value = true
        isPositionsEditMode.value = false
        assignedPositionsOffset.value = 0
        availablePositionsOffset.value = 0
        availableMemberPositions.value = []
        assignedPositionsSearchValue.value = ''
        availablePositionsSearchValue.value = ''

        await fetchAssignedMemberPositions()
    }

    const backToMemberInfo = () => {
        isMemberPositionsModalOpen.value = false
        isPositionsEditMode.value = false
        isMemberInfoModalOpen.value = true
    }

    const startEditMemberPositions = async () => {
        isPositionsEditMode.value = true
        availablePositionsOffset.value = 0
        await fetchAvailableMemberPositions()
    }

    const finishEditMemberPositions = () => {
        isPositionsEditMode.value = false
        availablePositionsSearchValue.value = ''
        availableMemberPositions.value = []
    }

    const openCreatePositionModal = () => {
        positionModalMode.value = 'create'
        positionToEditId.value = null
        positionRoleValue.value = ''
        positionDescriptionValue.value = ''
        initialPositionRoleValue.value = ''
        initialPositionDescriptionValue.value = ''
        isPositionUpsertModalOpen.value = true
    }

    const openEditPositionModal = (positionId: number) => {
        const targetPosition = assignedMemberPositions.value.find((position) => position.position_id === positionId)
            || availableMemberPositions.value.find((position) => position.position_id === positionId)

        if (!targetPosition) {
            return
        }

        positionModalMode.value = 'edit'
        positionToEditId.value = targetPosition.position_id
        positionRoleValue.value = targetPosition.role
        positionDescriptionValue.value = targetPosition.description || ''
        initialPositionRoleValue.value = targetPosition.role.trim()
        initialPositionDescriptionValue.value = (targetPosition.description || '').trim()
        isPositionUpsertModalOpen.value = true
    }

    const closePositionUpsertModal = () => {
        isPositionUpsertModalOpen.value = false
    }

    const submitPosition = async () => {
        if (!canSubmitPositionForm.value) {
            return
        }

        isPositionSubmitting.value = true

        try {
            const normalizedDescription = positionDescriptionValue.value.trim()
            const payload = {
                role: positionRoleValue.value.trim(),
                description: normalizedDescription.length > 0 ? normalizedDescription : null
            }

            if (positionModalMode.value === 'create') {
                const response = await positionsRepository.createPosition({
                    organization_id: params.organizationId,
                    ...payload
                })
                if (isPositionsEditMode.value) {
                    availableMemberPositions.value = [response.data, ...availableMemberPositions.value]
                    availablePositionsTotal.value += 1
                }
            } else if (positionToEditId.value !== null) {
                await positionsRepository.updatePosition(positionToEditId.value, payload)
                const assignedIndex = assignedMemberPositions.value.findIndex((position) => position.position_id === positionToEditId.value)
                if (assignedIndex >= 0) {
                    assignedMemberPositions.value[assignedIndex] = {
                        ...assignedMemberPositions.value[assignedIndex],
                        ...payload
                    }
                } else {
                    const availableIndex = availableMemberPositions.value.findIndex((position) => position.position_id === positionToEditId.value)
                    if (availableIndex >= 0) {
                        availableMemberPositions.value[availableIndex] = {
                            ...availableMemberPositions.value[availableIndex],
                            ...payload
                        }
                    }
                }
            }

            closePositionUpsertModal()
        } finally {
            isPositionSubmitting.value = false
        }
    }

    const openDeletePositionModal = (positionId: number) => {
        positionToDeleteId.value = positionId
        isDeletePositionModalOpen.value = true
    }

    const closeDeletePositionModal = () => {
        positionToDeleteId.value = null
        isDeletePositionModalOpen.value = false
    }

    const confirmDeletePosition = async () => {
        if (positionToDeleteId.value === null) {
            return
        }

        isDeletingPosition.value = true

        try {
            await positionsRepository.deletePosition(positionToDeleteId.value)
            const assignedBefore = assignedMemberPositions.value.length
            assignedMemberPositions.value = assignedMemberPositions.value.filter(
                (position) => position.position_id !== positionToDeleteId.value
            )
            if (assignedBefore !== assignedMemberPositions.value.length) {
                assignedPositionsTotal.value = Math.max(0, assignedPositionsTotal.value - 1)
            }

            const availableBefore = availableMemberPositions.value.length
            availableMemberPositions.value = availableMemberPositions.value.filter(
                (position) => position.position_id !== positionToDeleteId.value
            )
            if (availableBefore !== availableMemberPositions.value.length) {
                availablePositionsTotal.value = Math.max(0, availablePositionsTotal.value - 1)
            }

            closeDeletePositionModal()
        } finally {
            isDeletingPosition.value = false
        }
    }

    const assignPositionToMember = async (positionId: number) => {
        const employeeId = getSelectedEmployeeId()

        if (employeeId === null || !isPositionsEditMode.value) {
            return
        }

        isLoadingMemberPositions.value = true
        isLoadingAvailablePositions.value = true

        try {
            await positionsRepository.assignPosition(employeeId, positionId)
            const movedPosition = availableMemberPositions.value.find((position) => position.position_id === positionId)
            availableMemberPositions.value = availableMemberPositions.value.filter((position) => position.position_id !== positionId)
            availablePositionsTotal.value = Math.max(0, availablePositionsTotal.value - 1)
            if (movedPosition) {
                assignedMemberPositions.value = [movedPosition, ...assignedMemberPositions.value]
            }
            assignedPositionsTotal.value += 1
            await fetchAssignedMemberPositions()
        } finally {
            isLoadingMemberPositions.value = false
            isLoadingAvailablePositions.value = false
        }
    }

    const unassignPositionFromMember = async (positionId: number) => {
        const employeeId = getSelectedEmployeeId()

        if (employeeId === null || !isPositionsEditMode.value) {
            return
        }

        isLoadingMemberPositions.value = true
        isLoadingAvailablePositions.value = true

        try {
            await positionsRepository.unassignPosition(employeeId, positionId)
            const movedPosition = assignedMemberPositions.value.find((position) => position.position_id === positionId)
            assignedMemberPositions.value = assignedMemberPositions.value.filter((position) => position.position_id !== positionId)
            assignedPositionsTotal.value = Math.max(0, assignedPositionsTotal.value - 1)
            if (movedPosition) {
                availableMemberPositions.value = [movedPosition, ...availableMemberPositions.value]
            }
            availablePositionsTotal.value += 1
            await fetchAvailableMemberPositions()
        } finally {
            isLoadingMemberPositions.value = false
            isLoadingAvailablePositions.value = false
        }
    }

    const selectMember = async (member: OrganizationMemberItem, event?: MouseEvent) => {
        if (event) {
            const target = event.target as HTMLElement | null

            if (target?.closest('.td-actions')) {
                return
            }
        }

        isMemberPositionsModalOpen.value = false
        isMemberInfoModalOpen.value = true
        isLoadingMemberProfile.value = true

        try {
            const response = await participantsControlRepository.getMemberProfile(
                params.organizationId,
                member.id,
                member.role
            )

            selectedMemberProfile.value = response.data
        } finally {
            isLoadingMemberProfile.value = false
        }
    }

    const confirmDelete = async () => {
        isDeleting.value = true

        try {
            await organizationEditDeleteRepository.deleteOrganization(params.organizationId)
            params.onDeleted()
        } finally {
            isDeleting.value = false
            closeDeleteModal()
        }
    }

    const generateInvite = async () => {
        isGeneratingInvite.value = true

        try {
            if (activeInviteTab.value === 'employeesInvite') {
                const response = await organizationRepository.generateEmployeeInvite(params.organizationId)
                employeeInviteLink.value = response.data.invite_url
                employeeInviteExpiresAt.value = response.data.expires_at
                clearEmployeeInviteCopySuccessMessage()
                return
            }

            const response = await organizationRepository.generateTagAdminInvite(params.organizationId)
            tagAdminInviteLink.value = response.data.invite_url
            tagAdminInviteExpiresAt.value = response.data.expires_at
            clearTagAdminInviteCopySuccessMessage()
        } finally {
            isGeneratingInvite.value = false
        }
    }

    const copyActiveInvite = async () => {
        if (!activeInviteLink.value) {
            return
        }

        await navigator.clipboard.writeText(activeInviteLink.value)

        const successMessage = params.translations.value.page.inviteSection.copySuccess
        if (activeInviteTab.value === 'employeesInvite') {
            employeeInviteCopySuccessMessage.value = successMessage
            return
        }

        tagAdminInviteCopySuccessMessage.value = successMessage
    }

    const clearActiveInvite = () => {
        if (activeInviteTab.value === 'employeesInvite') {
            employeeInviteLink.value = ''
            employeeInviteExpiresAt.value = ''
            clearEmployeeInviteCopySuccessMessage()
            return
        }

        tagAdminInviteLink.value = ''
        tagAdminInviteExpiresAt.value = ''
        clearTagAdminInviteCopySuccessMessage()
    }

    const clearActiveInviteCopySuccessMessage = () => {
        if (activeInviteTab.value === 'employeesInvite') {
            clearEmployeeInviteCopySuccessMessage()
            return
        }

        clearTagAdminInviteCopySuccessMessage()
    }

    const toggleTagUidVisibility = (tagId: number) => {
        const nextSet = new Set(revealedTagIds.value)

        if (nextSet.has(tagId)) {
            nextSet.delete(tagId)
        } else {
            nextSet.add(tagId)
        }

        revealedTagIds.value = nextSet
    }

    const isTagUidVisible = (tagId: number): boolean => {
        return revealedTagIds.value.has(tagId)
    }

    const getRoleLabel = (role: OrganizationMemberItem['role']) => {
        if (role === 'organization_admin') {
            return params.translations.value.page.table.roleLabels.organizationAdmin
        }

        if (role === 'tag_admin') {
            return params.translations.value.page.table.roleLabels.tagAdmin
        }

        return params.translations.value.page.table.roleLabels.employee
    }

    const syncTabsToRoute = async () => {
        const currentInviteTab = resolveQueryValue(route.query.inviteTab as string | string[] | null | undefined)
        const currentListTab = resolveQueryValue(route.query.listTab as string | string[] | null | undefined)

        if (currentInviteTab === activeInviteTab.value && currentListTab === activeListTab.value) {
            return
        }

        await router.replace({
            name: 'Organizations',
            params: {
                organizationId: String(params.organizationId)
            },
            query: {
                ...route.query,
                inviteTab: activeInviteTab.value,
                listTab: activeListTab.value
            }
        })
    }

    onMounted(() => {
        window.addEventListener('profile-photo-updated', handleProfilePhotoUpdated)
        runBackground(fetchOrganizationInfo())
        runBackground(fetchInviteStatuses())
        runBackground(fetchActiveTabData())
        void syncTabsToRoute()
    })

    watch(activeListTab, () => {
        tableOffset.value = 0
        if (activeListTab.value !== 'members') {
            selectedMemberProfile.value = null
            isMemberInfoModalOpen.value = false
            isMemberPositionsModalOpen.value = false
            isPositionsEditMode.value = false
        }

        if (activeListTab.value !== 'tags') {
            isTagModalOpen.value = false
            isDeleteTagModalOpen.value = false
            tagToDeleteId.value = null
            tagToEditId.value = null
        }

        runBackground(fetchActiveTabData())
    })

    watch(searchQuery, () => {
        tableOffset.value = 0
        if (searchDebounceTimeout !== null) {
            window.clearTimeout(searchDebounceTimeout)
        }

        searchDebounceTimeout = window.setTimeout(() => {
            runBackground(fetchActiveTabData())
        }, LIST.SEARCH_DEBOUNCE_MS)
    })

    watch(tableOffset, () => {
        runBackground(fetchActiveTabData())
    })

    watch(assignedPositionsSearchValue, () => {
        assignedPositionsOffset.value = 0
        if (!isMemberPositionsModalOpen.value) {
            return
        }

        if (assignedPositionsSearchDebounceTimeout !== null) {
            window.clearTimeout(assignedPositionsSearchDebounceTimeout)
        }

        assignedPositionsSearchDebounceTimeout = window.setTimeout(() => {
            runBackground(fetchAssignedMemberPositions())
        }, LIST.SEARCH_DEBOUNCE_MS)
    })

    watch(assignedPositionsOffset, () => {
        if (!isMemberPositionsModalOpen.value) {
            return
        }
        runBackground(fetchAssignedMemberPositions())
    })

    watch(availablePositionsSearchValue, () => {
        availablePositionsOffset.value = 0
        if (!isMemberPositionsModalOpen.value || !isPositionsEditMode.value) {
            return
        }

        if (availablePositionsSearchDebounceTimeout !== null) {
            window.clearTimeout(availablePositionsSearchDebounceTimeout)
        }

        availablePositionsSearchDebounceTimeout = window.setTimeout(() => {
            runBackground(fetchAvailableMemberPositions())
        }, LIST.SEARCH_DEBOUNCE_MS)
    })

    watch(availablePositionsOffset, () => {
        if (!isMemberPositionsModalOpen.value || !isPositionsEditMode.value) {
            return
        }
        runBackground(fetchAvailableMemberPositions())
    })

    watch(activeInviteTab, () => {
        clearEmployeeInviteCopySuccessMessage()
        clearTagAdminInviteCopySuccessMessage()
    })

    watch([activeInviteTab, activeListTab], () => {
        void syncTabsToRoute()
    })

    watch(
        () => [route.query.inviteTab, route.query.listTab],
        ([inviteTabValue, listTabValue]) => {
            const normalizedInviteTab = resolveQueryValue(inviteTabValue as string | string[] | null | undefined)
            const normalizedListTab = resolveQueryValue(listTabValue as string | string[] | null | undefined)

            if (isInviteTab(normalizedInviteTab) && normalizedInviteTab !== activeInviteTab.value) {
                activeInviteTab.value = normalizedInviteTab
            }

            if (isListTab(normalizedListTab) && normalizedListTab !== activeListTab.value) {
                activeListTab.value = normalizedListTab
            }
        },
    )

    onBeforeUnmount(() => {
        window.removeEventListener('profile-photo-updated', handleProfilePhotoUpdated)
        if (searchDebounceTimeout !== null) {
            window.clearTimeout(searchDebounceTimeout)
        }

        if (assignedPositionsSearchDebounceTimeout !== null) {
            window.clearTimeout(assignedPositionsSearchDebounceTimeout)
        }

        if (availablePositionsSearchDebounceTimeout !== null) {
            window.clearTimeout(availablePositionsSearchDebounceTimeout)
        }
    })

    return {
        organizationInfo,
        isLoadingInfo,
        isLoadingInviteStatus,
        isGeneratingInvite,
        isLoadingTable,
        activeInviteTab,
        activeListTab,
        searchQuery,
        inviteTabs,
        listTabs,
        currentListPlaceholder,
        activeInviteLink,
        activeInviteExpiresAt,
        activeInviteCopySuccessMessage,
        tableItems,
        tableOffset,
        tableLimit,
        tableTotal,
        formattedCreatedAt,
        formatDate,
        isEditModalOpen,
        isDeleteModalOpen,
        isSubmittingEdit,
        isDeleting,
        isBuildingModalOpen,
        buildingModalMode,
        buildingTitleValue,
        buildingAddressValue,
        isBuildingSubmitting,
        canSubmitBuildingForm,
        isDeleteBuildingModalOpen,
        isDeletingBuilding,
        isTagModalOpen,
        tagModalMode,
        tagNameValue,
        tagUidValue,
        isTagSubmitting,
        canSubmitTagForm,
        isDeleteTagModalOpen,
        isDeletingTag,
        isExpelModalOpen,
        isExpellingMember,
        isMemberInfoModalOpen,
        selectedMemberProfile,
        isLoadingMemberProfile,
        isMemberPositionsModalOpen,
        isPositionsEditMode,
        isLoadingMemberPositions,
        isLoadingAvailablePositions,
        assignedMemberPositions,
        availableMemberPositions,
        assignedPositionsSearchValue,
        availablePositionsSearchValue,
        memberPositionsLimit,
        assignedPositionsOffset,
        assignedPositionsTotal,
        availablePositionsOffset,
        availablePositionsTotal,
        isPositionUpsertModalOpen,
        positionModalMode,
        positionRoleValue,
        positionDescriptionValue,
        isPositionSubmitting,
        canSubmitPositionForm,
        isDeletePositionModalOpen,
        isDeletingPosition,
        editNameValue,
        editDescriptionValue,
        memberToExpel,
        canSubmitOrganizationForm,
        expelModalMessage,
        openEditModal,
        closeEditModal,
        submitOrganizationEdit,
        openDeleteModal,
        closeDeleteModal,
        openCreateBuildingModal,
        openEditBuildingModal,
        openBuildingPage,
        closeBuildingModal,
        submitBuilding,
        openDeleteBuildingModal,
        closeDeleteBuildingModal,
        confirmDeleteBuilding,
        openCreateTagModal,
        openEditTagModal,
        closeTagModal,
        submitTag,
        openDeleteTagModal,
        closeDeleteTagModal,
        confirmDeleteTag,
        openExpelModal,
        closeExpelModal,
        confirmExpelMember,
        closeMemberInfoModal,
        closeMemberPositionsModal,
        viewMemberPositions,
        backToMemberInfo,
        startEditMemberPositions,
        finishEditMemberPositions,
        openCreatePositionModal,
        openEditPositionModal,
        closePositionUpsertModal,
        submitPosition,
        openDeletePositionModal,
        closeDeletePositionModal,
        confirmDeletePosition,
        assignPositionToMember,
        unassignPositionFromMember,
        selectMember,
        confirmDelete,
        generateInvite,
        copyActiveInvite,
        clearActiveInvite,
        clearActiveInviteCopySuccessMessage,
        toggleTagUidVisibility,
        isTagUidVisible,
        getRoleLabel
    }
}
