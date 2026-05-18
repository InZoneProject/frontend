import { computed, ref } from 'vue'
import { Events } from '@/enums/events.enum'
import type { OrganizationMemberPositionsProperties } from '@/interfaces/organization-member-positions-properties.interface'

export const useOrganizationMemberPositions = (properties: OrganizationMemberPositionsProperties) => {
    const isVisible = computed(() => properties.isOpen)
    const showAssignedLoader = computed(() => properties.loadingAssigned)
    const showAvailableLoader = computed(() => properties.isEditMode && properties.loadingAvailable)

    const dragOverAssigned = ref(false)
    const dragOverAvailable = ref(false)

    const closeEvent: Events.CLOSE = Events.CLOSE
    const backToInfoEvent: Events.BACK_TO_INFO = Events.BACK_TO_INFO
    const startEditEvent: Events.START_EDIT = Events.START_EDIT
    const finishEditEvent: Events.FINISH_EDIT = Events.FINISH_EDIT
    const addPositionEvent: Events.ADD_POSITION = Events.ADD_POSITION
    const editEvent: Events.EDIT = Events.EDIT
    const deleteEvent: Events.DELETE = Events.DELETE
    const assignEvent: Events.ASSIGN = Events.ASSIGN
    const unassignEvent: Events.UNASSIGN = Events.UNASSIGN
    const updateAssignedSearchEvent: Events.UPDATE_ASSIGNED_SEARCH_VALUE = Events.UPDATE_ASSIGNED_SEARCH_VALUE
    const updateAvailableSearchEvent: Events.UPDATE_AVAILABLE_SEARCH_VALUE = Events.UPDATE_AVAILABLE_SEARCH_VALUE
    const updateAssignedOffsetEvent: Events.UPDATE_ASSIGNED_OFFSET = Events.UPDATE_ASSIGNED_OFFSET
    const updateAvailableOffsetEvent: Events.UPDATE_AVAILABLE_OFFSET = Events.UPDATE_AVAILABLE_OFFSET

    const onDragStart = (
        event: DragEvent,
        positionId: number,
        source: 'assigned' | 'available'
    ) => {
        if (!properties.isEditMode || !event.dataTransfer) {
            return
        }

        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', `${source}:${positionId}`)
    }

    const onDragOver = (event: DragEvent, target: 'assigned' | 'available') => {
        if (!properties.isEditMode) {
            return
        }

        event.preventDefault()

        if (target === 'assigned') {
            dragOverAssigned.value = true
            dragOverAvailable.value = false
            return
        }

        dragOverAvailable.value = true
        dragOverAssigned.value = false
    }

    const clearDragState = () => {
        dragOverAssigned.value = false
        dragOverAvailable.value = false
    }

    const onDrop = (
        event: DragEvent,
        target: 'assigned' | 'available',
        onAssign: (positionId: number) => void,
        onUnassign: (positionId: number) => void
    ) => {
        if (!properties.isEditMode) {
            return
        }

        event.preventDefault()

        const payload = event.dataTransfer?.getData('text/plain') || ''
        const [source, rawPositionId] = payload.split(':')
        const positionId = Number(rawPositionId)

        clearDragState()

        if (!source || Number.isNaN(positionId)) {
            return
        }

        if (source === 'available' && target === 'assigned') {
            onAssign(positionId)
            return
        }

        if (source === 'assigned' && target === 'available') {
            onUnassign(positionId)
        }
    }

    const formatPositionCreatedAt = (value: string) => {
        return properties.formatDate(value)
    }

    return {
        isVisible,
        showAssignedLoader,
        showAvailableLoader,
        dragOverAssigned,
        dragOverAvailable,
        closeEvent,
        backToInfoEvent,
        startEditEvent,
        finishEditEvent,
        addPositionEvent,
        editEvent,
        deleteEvent,
        assignEvent,
        unassignEvent,
        updateAssignedSearchEvent,
        updateAvailableSearchEvent,
        updateAssignedOffsetEvent,
        updateAvailableOffsetEvent,
        onDragStart,
        onDragOver,
        clearDragState,
        onDrop,
        formatPositionCreatedAt
    }
}
