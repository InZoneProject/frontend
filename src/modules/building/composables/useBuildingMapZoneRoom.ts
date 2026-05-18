import { computed, onBeforeUnmount, ref } from 'vue'
import { Events } from '@/enums/events.enum'
import { BUILDING_MAP_ZONE_ROOM_CONSTANTS } from '@/modules/building/constants/building-map-zone-room.constants'
import { BuildingMapResizeEdge } from '@/modules/building/enums/building-map-resize-edge.enum'
import type { BuildingMapZoneRoomEmits } from '@/modules/building/interfaces/building-map-zone-room-emits.interface'
import type { BuildingMapZoneRoomProperties } from '@/modules/building/interfaces/building-map-zone-room-properties.interface'
import type { BuildingMapZoneRoomResizeEdge } from '@/modules/building/interfaces/building-map-zone-room-resize-edge.interface'

const getPixelValue = (value: string | undefined) => {
    return Number(String(value || '0').replace('px', '')) || 0
}

export const useBuildingMapZoneRoom = (
    properties: BuildingMapZoneRoomProperties,
    emit: BuildingMapZoneRoomEmits
) => {
    const activeResizeEdge = ref<BuildingMapResizeEdge | ''>('')

    const isZoneHovered = ref(false)

    const setZoneHover = (isHovered: boolean) => {
        isZoneHovered.value = isHovered
    }

    const clearActiveResizeEdge = () => {
        activeResizeEdge.value = ''
    }

    const startMove = (event: MouseEvent) => {
        if (event.button !== 0) return
        emit(Events.START_MOVE, event, properties.zone)
    }

    const startResize = (
        event: MouseEvent,
        edge: BuildingMapZoneRoomResizeEdge['edge']
    ) => {
        if (event.button !== 0) return
        if (!properties.canResize) return

        activeResizeEdge.value = edge
        emit(Events.START_RESIZE, event, properties.zone, edge)
    }

    const setResizeHover = (isHovered: boolean) => {
        if (properties.isInteractionDisabled || !properties.canResize) return
        emit(Events.RESIZE_HOVER, isHovered)
    }

    const isActiveResize = (edge: BuildingMapResizeEdge) => activeResizeEdge.value === edge
    const isResizing = computed(() => activeResizeEdge.value.length > 0)

    const isResizeControlsVisible = computed(() =>
        isZoneHovered.value || isResizing.value
    )

    const zonePixelWidth = computed(() => getPixelValue(properties.zoneStyle.width))
    const zonePixelHeight = computed(() => getPixelValue(properties.zoneStyle.height))

    const maxEmployeeColumns = computed(() => {
        const availableWidth = Math.max(0, zonePixelWidth.value - BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_GRID_HORIZONTAL_PADDING)

        return Math.max(
            1,
            Math.floor((availableWidth + BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_ICON_GAP) / (BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_ICON_SIZE + BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_ICON_GAP))
        )
    })

    const maxEmployeeRows = computed(() => {
        const availableHeight = Math.max(0, zonePixelHeight.value - BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_GRID_VERTICAL_PADDING)

        return Math.max(
            1,
            Math.floor((availableHeight + BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_ICON_GAP) / (BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_ICON_SIZE + BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_ICON_GAP))
        )
    })

    const employeeVisibleCapacity = computed(() =>
        Math.max(1, maxEmployeeColumns.value * maxEmployeeRows.value)
    )

    const visibleEmployeeLocations = computed(() => {
        if (!properties.isViewMode) return []

        if (properties.employeeLocations.length <= employeeVisibleCapacity.value) {
            return properties.employeeLocations
        }

        return properties.employeeLocations.slice(0, Math.max(0, employeeVisibleCapacity.value - 1))
    })

    const hiddenEmployeeLocationsCount = computed(() => {
        if (!properties.isViewMode) return 0

        return Math.max(
            0,
            properties.employeeLocations.length - visibleEmployeeLocations.value.length
        )
    })

    const renderedEmployeeItemsCount = computed(() =>
        visibleEmployeeLocations.value.length + (hiddenEmployeeLocationsCount.value > 0 ? 1 : 0)
    )

    const employeeGridColumns = computed(() => {
        const itemsCount = renderedEmployeeItemsCount.value

        if (itemsCount <= 0) return 1

        const rows = Math.min(
            maxEmployeeRows.value,
            Math.ceil(itemsCount / maxEmployeeColumns.value)
        )

        return Math.max(
            1,
            Math.min(
                maxEmployeeColumns.value,
                Math.ceil(itemsCount / rows)
            )
        )
    })

    const employeeGridStyle = computed(() => ({
        '--building-map-zone-employees-columns': `repeat(${employeeGridColumns.value}, ${BUILDING_MAP_ZONE_ROOM_CONSTANTS.EMPLOYEE_ICON_SIZE}px)`
    }))

    window.addEventListener('mouseup', clearActiveResizeEdge)

    onBeforeUnmount(() => {
        window.removeEventListener('mouseup', clearActiveResizeEdge)
    })

    return {
        startMove,
        startResize,
        setResizeHover,
        isActiveResize,
        isResizing,
        setZoneHover,
        isResizeControlsVisible,
        visibleEmployeeLocations,
        hiddenEmployeeLocationsCount,
        employeeGridStyle
    }
}
