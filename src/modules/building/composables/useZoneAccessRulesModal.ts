import { computed, onMounted, ref, watch } from 'vue'
import { Events } from '@/enums/events.enum'
import { buildingRepository } from '@/modules/building/repositories/building.repository'
import type { ZoneAccessRuleItem } from '@/modules/building/interfaces/zone-access-rule-item.interface'
import { positionsRepository } from '@/repositories/positions.repository'
import type { OrganizationPositionItem } from '@/modules/organization/interfaces/organization-position-item.interface'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import type { ZoneAccessRulesModalProperties } from '@/modules/building/interfaces/zone-access-rules-modal-properties.interface'
import { ZoneAccessRuleType } from '@/modules/building/enums/zone-access-rule-type.enum'
import { LIST } from '@/constants/list.constants'

export const useZoneAccessRulesModal = (
    properties: ZoneAccessRulesModalProperties,
    emit: (event: Events.CLOSE) => void
) => {
    const limit = LIST.DEFAULT_LIMIT
    const isEditMode = ref(false)
    const isPositionsMode = ref(false)
    const selectedRule = ref<ZoneAccessRuleItem | null>(null)
    const assignedRules = ref<ZoneAccessRuleItem[]>([])
    const availableRules = ref<ZoneAccessRuleItem[]>([])
    const assignedPositions = ref<OrganizationPositionItem[]>([])
    const availablePositions = ref<OrganizationPositionItem[]>([])
    const assignedSearch = ref('')
    const availableSearch = ref('')
    const assignedOffset = ref(0)
    const availableOffset = ref(0)
    const assignedTotal = ref(0)
    const availableTotal = ref(0)
    const loadingAssigned = ref(false)
    const loadingAvailable = ref(false)
    const dragOverAssigned = ref(false)
    const dragOverAvailable = ref(false)
    const ruleToDetach = ref<ZoneAccessRuleItem | null>(null)
    const ruleToDelete = ref<ZoneAccessRuleItem | null>(null)
    const positionToDelete = ref<OrganizationPositionItem | null>(null)
    const isConfirmLoading = ref(false)
    const ruleFormOpen = ref(false)
    const ruleFormMode = ref<'create' | 'edit'>('create')
    const ruleEditingId = ref(0)
    const ruleTitle = ref('')
    const ruleAccessType = ref<ZoneAccessRuleType>(ZoneAccessRuleType.FORBIDDEN)
    const ruleMaxDuration = ref('')
    const initialRuleTitle = ref('')
    const initialRuleAccessType = ref<ZoneAccessRuleType>(ZoneAccessRuleType.FORBIDDEN)
    const initialRuleMaxDuration = ref('')
    const positionFormOpen = ref(false)
    const positionFormMode = ref<'create' | 'edit'>('create')
    const positionEditingId = ref(0)
    const positionRole = ref('')
    const positionDescription = ref('')
    const initialPositionRole = ref('')
    const initialPositionDescription = ref('')
    let assignedSearchTimeout: number | null = null
    let availableSearchTimeout: number | null = null

    const closeEvent: Events.CLOSE = Events.CLOSE
    const translations = properties.translations
    const isVisible = computed(() => properties.isOpen)
    const normalizedRuleTitle = computed(() => ruleTitle.value.trim())
    const normalizedRuleMaxDuration = computed(() => ruleAccessType.value === ZoneAccessRuleType.TIME_LIMITED
        ? ruleMaxDuration.value.trim()
        : '')
    const hasRuleChanges = computed(() => {
        if (ruleFormMode.value === 'create') return true
        return normalizedRuleTitle.value !== initialRuleTitle.value
            || ruleAccessType.value !== initialRuleAccessType.value
            || normalizedRuleMaxDuration.value !== initialRuleMaxDuration.value
    })
    const canSubmitRule = computed(() => {
        return normalizedRuleTitle.value.length > 0
            && (ruleAccessType.value !== ZoneAccessRuleType.TIME_LIMITED || Number(ruleMaxDuration.value) > 0)
            && hasRuleChanges.value
    })
    const normalizedPositionRole = computed(() => positionRole.value.trim())
    const normalizedPositionDescription = computed(() => positionDescription.value.trim())
    const canSubmitPosition = computed(() => {
        if (normalizedPositionRole.value.length === 0) return false
        if (positionFormMode.value === 'create') return true
        return normalizedPositionRole.value !== initialPositionRole.value
            || normalizedPositionDescription.value !== initialPositionDescription.value
    })
    const currentAssigned = computed<Array<ZoneAccessRuleItem | OrganizationPositionItem>>(() => isPositionsMode.value ? assignedPositions.value : assignedRules.value)
    const currentAvailable = computed<Array<ZoneAccessRuleItem | OrganizationPositionItem>>(() => isPositionsMode.value ? availablePositions.value : availableRules.value)
    const accessTypeOptions = computed(() => [
        {
            value: ZoneAccessRuleType.FORBIDDEN,
            label: translations.accessTypeForbidden
        },
        {
            value: ZoneAccessRuleType.TIME_LIMITED,
            label: translations.accessTypeTimeLimited
        }
    ])
    const getRuleAccessTypeLabel = (accessType: ZoneAccessRuleType) => {
        if (accessType === ZoneAccessRuleType.TIME_LIMITED) return translations.accessTypeTimeLimited
        return translations.accessTypeForbidden
    }
    const modalTitle = computed(() => {
        const zoneTitle = properties.zoneTitle.trim()
        const zoneTitleLabel = zoneTitle ? ` "${zoneTitle}"` : ''

        if (!isPositionsMode.value) {
            return `${translations.rulesTitle}${zoneTitleLabel}`
        }

        const ruleTitle = selectedRule.value?.title?.trim() || ''
        const ruleTitleLabel = ruleTitle ? ` "${ruleTitle}"` : ''
        return `${translations.positionsTitle}${ruleTitleLabel}${translations.zoneInTitle}${zoneTitleLabel}`
    })
    const editButtonLabel = computed(() => isPositionsMode.value ? translations.editPositions : translations.edit)
    const assignedTitle = computed(() => translations.assigned)
    const availableTitle = computed(() => translations.available)
    const ruleFormTitle = computed(() => ruleFormMode.value === 'create' ? translations.createRule : translations.editRule)
    const positionFormTitle = computed(() => positionFormMode.value === 'create' ? translations.createPosition : translations.editPosition)

    const params = (search: string, offset: number): OrganizationListParams => ({ search, offset, limit })
    const getItemId = (item: ZoneAccessRuleItem | OrganizationPositionItem) => isPositionsMode.value ? (item as OrganizationPositionItem).position_id : (item as ZoneAccessRuleItem).zone_access_rule_id
    const getItemTitle = (item: ZoneAccessRuleItem | OrganizationPositionItem) => isPositionsMode.value ? (item as OrganizationPositionItem).role : (item as ZoneAccessRuleItem).title
    const getItemDescription = (item: ZoneAccessRuleItem | OrganizationPositionItem) => {
        if (isPositionsMode.value) return (item as OrganizationPositionItem).description || '-'
        return getRuleAccessTypeLabel((item as ZoneAccessRuleItem).access_type)
    }
    const formatCreatedAt = (value: string) => properties.formatDate(value)

    const fetchAssigned = async () => {
        if (!properties.isOpen || properties.zoneId <= 0) return
        loadingAssigned.value = true
        try {
            if (isPositionsMode.value && selectedRule.value) {
                const response = await buildingRepository.getRulePositions(properties.zoneId, selectedRule.value.zone_access_rule_id, params(assignedSearch.value, assignedOffset.value))
                assignedPositions.value = assignedOffset.value === 0
                    ? response.data.items
                    : [...assignedPositions.value, ...response.data.items]
                assignedTotal.value = response.data.total
                return
            }

            const response = await buildingRepository.getZoneRules(properties.zoneId, params(assignedSearch.value, assignedOffset.value))
            assignedRules.value = assignedOffset.value === 0
                ? response.data.items
                : [...assignedRules.value, ...response.data.items]
            assignedTotal.value = response.data.total
        } finally {
            loadingAssigned.value = false
        }
    }

    const fetchAvailable = async () => {
        if (!properties.isOpen || properties.zoneId <= 0 || !isEditMode.value) return
        loadingAvailable.value = true
        try {
            if (isPositionsMode.value && selectedRule.value) {
                const response = await buildingRepository.getUnassignedRulePositions(properties.zoneId, selectedRule.value.zone_access_rule_id, params(availableSearch.value, availableOffset.value))
                availablePositions.value = availableOffset.value === 0
                    ? response.data.items
                    : [...availablePositions.value, ...response.data.items]
                availableTotal.value = response.data.total
                return
            }

            const response = await buildingRepository.getUnassignedZoneRules(properties.zoneId, params(availableSearch.value, availableOffset.value))
            availableRules.value = availableOffset.value === 0
                ? response.data.items
                : [...availableRules.value, ...response.data.items]
            availableTotal.value = response.data.total
        } finally {
            loadingAvailable.value = false
        }
    }

    const refresh = async () => {
        await fetchAssigned()
        await fetchAvailable()
    }
    const refreshAssignedFromFirstPage = async () => {
        const assignedOffsetWasZero = assignedOffset.value === 0
        assignedOffset.value = 0
        if (assignedOffsetWasZero) {
            await fetchAssigned()
        }
    }
    const refreshAvailableFromFirstPage = async () => {
        const availableOffsetWasZero = availableOffset.value === 0
        availableOffset.value = 0
        if (availableOffsetWasZero) {
            await fetchAvailable()
        }
    }
    const removePositionFromList = (list: 'assigned' | 'available', positionId: number) => {
        if (list === 'assigned') {
            const before = assignedPositions.value.length
            assignedPositions.value = assignedPositions.value.filter((item) => item.position_id !== positionId)
            if (before !== assignedPositions.value.length) {
                assignedTotal.value = Math.max(0, assignedTotal.value - 1)
            }
            return
        }

        const before = availablePositions.value.length
        availablePositions.value = availablePositions.value.filter((item) => item.position_id !== positionId)
        if (before !== availablePositions.value.length) {
            availableTotal.value = Math.max(0, availableTotal.value - 1)
        }
    }
    const removeRuleFromList = (list: 'assigned' | 'available', ruleId: number) => {
        if (list === 'assigned') {
            const before = assignedRules.value.length
            assignedRules.value = assignedRules.value.filter((item) => item.zone_access_rule_id !== ruleId)
            if (before !== assignedRules.value.length) {
                assignedTotal.value = Math.max(0, assignedTotal.value - 1)
            }
            return
        }

        const before = availableRules.value.length
        availableRules.value = availableRules.value.filter((item) => item.zone_access_rule_id !== ruleId)
        if (before !== availableRules.value.length) {
            availableTotal.value = Math.max(0, availableTotal.value - 1)
        }
    }
    const updateRuleInCurrentList = (rule: ZoneAccessRuleItem) => {
        const assignedIndex = assignedRules.value.findIndex((item) => item.zone_access_rule_id === rule.zone_access_rule_id)
        if (assignedIndex >= 0) {
            assignedRules.value[assignedIndex] = { ...assignedRules.value[assignedIndex], ...rule }
            return
        }

        const availableIndex = availableRules.value.findIndex((item) => item.zone_access_rule_id === rule.zone_access_rule_id)
        if (availableIndex >= 0) {
            availableRules.value[availableIndex] = { ...availableRules.value[availableIndex], ...rule }
        }
    }
    const updatePositionInCurrentList = (position: OrganizationPositionItem) => {
        const assignedIndex = assignedPositions.value.findIndex((item) => item.position_id === position.position_id)
        if (assignedIndex >= 0) {
            assignedPositions.value[assignedIndex] = position
            return
        }

        const availableIndex = availablePositions.value.findIndex((item) => item.position_id === position.position_id)
        if (availableIndex >= 0) {
            availablePositions.value[availableIndex] = position
        }
    }

    const resetListsState = () => {
        assignedSearch.value = ''
        availableSearch.value = ''
        assignedOffset.value = 0
        availableOffset.value = 0
        availableRules.value = []
        availablePositions.value = []
    }

    const startEdit = async () => {
        isEditMode.value = true
        availableOffset.value = 0
        await fetchAvailable()
    }

    const finishEdit = () => {
        isEditMode.value = false
        availableRules.value = []
        availablePositions.value = []
        availableSearch.value = ''
    }

    const close = () => {
        isEditMode.value = false
        isPositionsMode.value = false
        selectedRule.value = null
        resetListsState()
        emit(Events.CLOSE)
    }

    const openPositions = async (rule: ZoneAccessRuleItem) => {
        selectedRule.value = rule
        isPositionsMode.value = true
        isEditMode.value = false
        resetListsState()
        await refresh()
    }

    const openItemPositions = async (item: ZoneAccessRuleItem | OrganizationPositionItem) => {
        if (isPositionsMode.value) return
        await openPositions(item as ZoneAccessRuleItem)
    }

    const backToRules = async () => {
        isPositionsMode.value = false
        selectedRule.value = null
        isEditMode.value = true
        resetListsState()
        await refresh()
    }

    const onDragStart = (event: DragEvent, id: number, source: 'assigned' | 'available') => {
        if (!isEditMode.value || !event.dataTransfer) return
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', `${source}:${id}`)
    }

    const onDragOver = (event: DragEvent, target: 'assigned' | 'available') => {
        if (!isEditMode.value) return
        event.preventDefault()
        dragOverAssigned.value = target === 'assigned'
        dragOverAvailable.value = target === 'available'
    }

    const clearDragState = () => {
        dragOverAssigned.value = false
        dragOverAvailable.value = false
    }

    const assignItem = async (id: number) => {
        if (isPositionsMode.value && selectedRule.value) {
            await buildingRepository.attachPosition(properties.zoneId, selectedRule.value.zone_access_rule_id, id)
            removePositionFromList('available', id)
            await refreshAssignedFromFirstPage()
        } else {
            await buildingRepository.attachRule(properties.zoneId, id)
            removeRuleFromList('available', id)
            await refreshAssignedFromFirstPage()
        }
    }

    const unassignItem = async (id: number) => {
        if (isPositionsMode.value && selectedRule.value) {
            await buildingRepository.detachPosition(properties.zoneId, selectedRule.value.zone_access_rule_id, id)
            removePositionFromList('assigned', id)
            await refreshAvailableFromFirstPage()
            return
        }

        const rule = assignedRules.value.find((item) => item.zone_access_rule_id === id)
        if (rule?.has_positions) {
            ruleToDetach.value = rule
            return
        }

        await buildingRepository.detachRule(properties.zoneId, id)
        removeRuleFromList('assigned', id)
        await refreshAvailableFromFirstPage()
    }

    const onDrop = async (event: DragEvent, target: 'assigned' | 'available') => {
        if (!isEditMode.value) return
        event.preventDefault()

        const [source, rawId] = (event.dataTransfer?.getData('text/plain') || '').split(':')
        const id = Number(rawId)
        clearDragState()

        if (!source || Number.isNaN(id) || source === target) return
        if (target === 'assigned') await assignItem(id)
        if (target === 'available') await unassignItem(id)
    }

    const editItem = (item: ZoneAccessRuleItem | OrganizationPositionItem) => {
        if (isPositionsMode.value) openEditPosition(item as OrganizationPositionItem)
        else openEditRule(item as ZoneAccessRuleItem)
    }

    const deleteItem = (item: ZoneAccessRuleItem | OrganizationPositionItem) => {
        if (isPositionsMode.value) positionToDelete.value = item as OrganizationPositionItem
        else ruleToDelete.value = item as ZoneAccessRuleItem
    }

    const confirmDetachRule = async () => {
        if (!ruleToDetach.value) return
        isConfirmLoading.value = true
        try {
            await buildingRepository.detachRule(properties.zoneId, ruleToDetach.value.zone_access_rule_id)
            removeRuleFromList('assigned', ruleToDetach.value.zone_access_rule_id)
            ruleToDetach.value = null
            await refreshAvailableFromFirstPage()
        } finally {
            isConfirmLoading.value = false
        }
    }

    const openCreateRule = () => {
        ruleFormMode.value = 'create'
        ruleEditingId.value = 0
        ruleTitle.value = ''
        ruleAccessType.value = ZoneAccessRuleType.FORBIDDEN
        ruleMaxDuration.value = ''
        initialRuleTitle.value = ''
        initialRuleAccessType.value = ZoneAccessRuleType.FORBIDDEN
        initialRuleMaxDuration.value = ''
        ruleFormOpen.value = true
    }

    const openEditRule = (rule: ZoneAccessRuleItem) => {
        ruleFormMode.value = 'edit'
        ruleEditingId.value = rule.zone_access_rule_id
        ruleTitle.value = rule.title
        ruleAccessType.value = rule.access_type
        ruleMaxDuration.value = rule.max_duration_minutes ? String(rule.max_duration_minutes) : ''
        initialRuleTitle.value = rule.title.trim()
        initialRuleAccessType.value = rule.access_type
        initialRuleMaxDuration.value = rule.access_type === ZoneAccessRuleType.TIME_LIMITED
            ? (rule.max_duration_minutes ? String(rule.max_duration_minutes) : '')
            : ''
        ruleFormOpen.value = true
    }

    const submitRule = async () => {
        if (!canSubmitRule.value) return
        const payload = {
            organization_id: properties.organizationId,
            title: ruleTitle.value.trim(),
            access_type: ruleAccessType.value,
            max_duration_minutes: ruleAccessType.value === ZoneAccessRuleType.TIME_LIMITED
                ? Number(ruleMaxDuration.value)
                : null
        }

        if (ruleFormMode.value === 'create') {
            await buildingRepository.createRule(payload)
            await refreshAvailableFromFirstPage()
        } else {
            const response = await buildingRepository.updateRule(ruleEditingId.value, payload)
            updateRuleInCurrentList(response.data)
        }

        ruleFormOpen.value = false
    }

    const confirmDeleteRule = async () => {
        if (!ruleToDelete.value) return
        isConfirmLoading.value = true
        try {
            await buildingRepository.deleteRule(ruleToDelete.value.zone_access_rule_id)
            removeRuleFromList('assigned', ruleToDelete.value.zone_access_rule_id)
            removeRuleFromList('available', ruleToDelete.value.zone_access_rule_id)
            ruleToDelete.value = null
        } finally {
            isConfirmLoading.value = false
        }
    }

    const openCreatePosition = () => {
        positionFormMode.value = 'create'
        positionEditingId.value = 0
        positionRole.value = ''
        positionDescription.value = ''
        initialPositionRole.value = ''
        initialPositionDescription.value = ''
        positionFormOpen.value = true
    }

    const openEditPosition = (position: OrganizationPositionItem) => {
        positionFormMode.value = 'edit'
        positionEditingId.value = position.position_id
        positionRole.value = position.role
        positionDescription.value = position.description || ''
        initialPositionRole.value = position.role.trim()
        initialPositionDescription.value = (position.description || '').trim()
        positionFormOpen.value = true
    }

    const submitPosition = async () => {
        if (!canSubmitPosition.value) return
        const payload = {
            organization_id: properties.organizationId,
            role: positionRole.value.trim(),
            description: positionDescription.value.trim() || null
        }

        if (positionFormMode.value === 'create') {
            await positionsRepository.createPosition(payload)
            await refreshAvailableFromFirstPage()
        } else {
            const response = await positionsRepository.updatePosition(positionEditingId.value, payload)
            updatePositionInCurrentList(response.data)
        }

        positionFormOpen.value = false
    }

    const confirmDeletePosition = async () => {
        if (!positionToDelete.value) return
        isConfirmLoading.value = true
        try {
            await positionsRepository.deletePosition(positionToDelete.value.position_id)
            removePositionFromList('assigned', positionToDelete.value.position_id)
            removePositionFromList('available', positionToDelete.value.position_id)
            positionToDelete.value = null
        } finally {
            isConfirmLoading.value = false
        }
    }

    watch(() => properties.isOpen, (value) => {
        if (value) void refresh()
    })
    watch(assignedSearch, () => {
        if (assignedOffset.value !== 0) {
            assignedOffset.value = 0
            return
        }
        if (assignedSearchTimeout) window.clearTimeout(assignedSearchTimeout)
        assignedSearchTimeout = window.setTimeout(() => void fetchAssigned(), LIST.SEARCH_DEBOUNCE_MS)
    })
    watch(availableSearch, () => {
        if (availableOffset.value !== 0) {
            availableOffset.value = 0
            return
        }
        if (availableSearchTimeout) window.clearTimeout(availableSearchTimeout)
        availableSearchTimeout = window.setTimeout(() => void fetchAvailable(), LIST.SEARCH_DEBOUNCE_MS)
    })
    watch(assignedOffset, () => void fetchAssigned())
    watch(availableOffset, () => void fetchAvailable())
    onMounted(() => {
        if (properties.isOpen) void refresh()
    })

    return {
        limit,
        isVisible,
        isEditMode,
        isPositionsMode,
        selectedRule,
        assignedSearch,
        availableSearch,
        assignedOffset,
        availableOffset,
        assignedTotal,
        availableTotal,
        loadingAssigned,
        loadingAvailable,
        dragOverAssigned,
        dragOverAvailable,
        ruleToDetach,
        ruleToDelete,
        positionToDelete,
        isConfirmLoading,
        ruleFormOpen,
        ruleFormMode,
        ruleTitle,
        ruleAccessType,
        ruleMaxDuration,
        positionFormOpen,
        positionFormMode,
        positionRole,
        positionDescription,
        canSubmitRule,
        canSubmitPosition,
        currentAssigned,
        currentAvailable,
        modalTitle,
        editButtonLabel,
        assignedTitle,
        availableTitle,
        ruleFormTitle,
        positionFormTitle,
        closeEvent,
        translations,
        accessTypeOptions,
        getItemId,
        getItemTitle,
        getItemDescription,
        formatCreatedAt,
        startEdit,
        finishEdit,
        close,
        openPositions,
        openItemPositions,
        backToRules,
        onDragStart,
        onDragOver,
        clearDragState,
        onDrop,
        editItem,
        deleteItem,
        confirmDetachRule,
        openCreateRule,
        submitRule,
        confirmDeleteRule,
        openCreatePosition,
        submitPosition,
        confirmDeletePosition
    }
}
