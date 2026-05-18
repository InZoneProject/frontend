import { Events } from '@/enums/events.enum'
import type { CurrentBuildingEmployee } from '@/modules/building/interfaces/current-building-employee.interface'
import type { FloorItem } from '@/modules/building/interfaces/floor-item.interface'

export interface BuildingViewSidebarEmits {
    (event: Events.UPDATE_FLOORS_SEARCH, value: string): void
    (event: Events.UPDATE_BUILDING_EMPLOYEES_SEARCH, value: string): void
    (event: Events.UPDATE_FLOORS_OFFSET, value: number): void
    (event: Events.UPDATE_BUILDING_EMPLOYEES_OFFSET, value: number): void
    (event: Events.UPDATE_SELECTED_FLOOR_ID, value: number): void
    (event: Events.SELECT_SIDE_PANEL_TAB, value: 'floors' | 'employees'): void
    (event: Events.TOGGLE_FLOORS_COLLAPSED): void
    (event: Events.OPEN_CREATE_FLOOR_MODAL): void
    (event: Events.OPEN_EDIT_FLOOR_MODAL, floor: FloorItem): void
    (event: Events.OPEN_DELETE_FLOOR_MODAL, floorId: number): void
    (event: Events.START_FLOOR_DRAG, floor: FloorItem, nativeEvent: DragEvent): void
    (event: Events.MOVE_FLOOR_DRAG, floor: FloorItem): void
    (event: Events.FINISH_FLOOR_DRAG): void
    (event: Events.CANCEL_FLOOR_DRAG): void
    (event: Events.OPEN_BUILDING_EMPLOYEE_INFO, employee: CurrentBuildingEmployee): void
    (event: Events.OPEN_EMPLOYEE_MOVEMENT_REPORT, employee: CurrentBuildingEmployee): void
    (event: Events.OPEN_EXPEL_MODAL, employee: CurrentBuildingEmployee): void
}
