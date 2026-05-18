import { computed } from 'vue'
import { Events } from '@/enums/events.enum'
import type { BuildingViewSidebarEmits } from '@/modules/building/interfaces/building-view-sidebar-emits.interface'
import type { BuildingViewSidebarProperties } from '@/modules/building/interfaces/building-view-sidebar-properties.interface'
import type { CurrentBuildingEmployee } from '@/modules/building/interfaces/current-building-employee.interface'
import type { FloorItem } from '@/modules/building/interfaces/floor-item.interface'

export const useBuildingSidebar = (
    properties: BuildingViewSidebarProperties,
    emit: BuildingViewSidebarEmits
) => {
    const sidePanelTabs = computed(() => {
        const tabs = [{ id: 'floors', label: properties.translations.floors.title }]
        if (!properties.isEmployeesHidden) {
            tabs.push({ id: 'employees', label: properties.translations.employees.title })
        }
        return tabs
    })

    const toolbarClasses = computed(() => ({
        'is-add-floor-hidden': properties.isFloorsCollapsed || (!properties.isEmployeesHidden && properties.sidePanelTab === 'employees')
    }))

    const getFloorRowClasses = (floor: FloorItem) => ({
        'is-selected': properties.selectedFloorId === floor.floor_id,
        'is-dragging': properties.draggedFloorId === floor.floor_id
    })

    const selectSidePanelTab = (tab: string | number) => {
        if (tab !== 'floors' && tab !== 'employees') return
        if (tab === 'employees' && properties.isEmployeesHidden) return
        emit(Events.SELECT_SIDE_PANEL_TAB, tab)
    }

    const selectFloor = (floorId: number) => emit(Events.UPDATE_SELECTED_FLOOR_ID, floorId)
    const updateFloorsSearch = (value: string) => emit(Events.UPDATE_FLOORS_SEARCH, value)
    const updateBuildingEmployeesSearch = (value: string) => emit(Events.UPDATE_BUILDING_EMPLOYEES_SEARCH, value)
    const updateFloorsOffset = (value: number) => emit(Events.UPDATE_FLOORS_OFFSET, value)
    const updateBuildingEmployeesOffset = (value: number) => emit(Events.UPDATE_BUILDING_EMPLOYEES_OFFSET, value)
    const toggleFloorsCollapsed = () => emit(Events.TOGGLE_FLOORS_COLLAPSED)
    const openCreateFloorModal = () => emit(Events.OPEN_CREATE_FLOOR_MODAL)
    const openEditFloorModal = (floor: FloorItem) => emit(Events.OPEN_EDIT_FLOOR_MODAL, floor)
    const openDeleteFloorModal = (floorId: number) => emit(Events.OPEN_DELETE_FLOOR_MODAL, floorId)
    const startFloorDrag = (floor: FloorItem, event: DragEvent) => emit(Events.START_FLOOR_DRAG, floor, event)
    const moveFloorDrag = (floor: FloorItem) => emit(Events.MOVE_FLOOR_DRAG, floor)
    const finishFloorDrag = () => emit(Events.FINISH_FLOOR_DRAG)
    const cancelFloorDrag = () => emit(Events.CANCEL_FLOOR_DRAG)
    const openBuildingEmployeeInfo = (employee: CurrentBuildingEmployee) => emit(Events.OPEN_BUILDING_EMPLOYEE_INFO, employee)
    const openEmployeeMovementReport = (employee: CurrentBuildingEmployee) => emit(Events.OPEN_EMPLOYEE_MOVEMENT_REPORT, employee)
    const openExpelModal = (employee: CurrentBuildingEmployee) => emit(Events.OPEN_EXPEL_MODAL, employee)

    return {
        sidePanelTabs,
        toolbarClasses,
        getFloorRowClasses,
        selectSidePanelTab,
        selectFloor,
        updateFloorsSearch,
        updateBuildingEmployeesSearch,
        updateFloorsOffset,
        updateBuildingEmployeesOffset,
        toggleFloorsCollapsed,
        openCreateFloorModal,
        openEditFloorModal,
        openDeleteFloorModal,
        startFloorDrag,
        moveFloorDrag,
        finishFloorDrag,
        cancelFloorDrag,
        openBuildingEmployeeInfo,
        openEmployeeMovementReport,
        openExpelModal
    }
}
