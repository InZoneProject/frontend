import type { CurrentBuildingEmployee } from '@/modules/building/interfaces/current-building-employee.interface'
import type { FloorItem } from '@/modules/building/interfaces/floor-item.interface'
import type { BuildingViewSidebarTranslations } from '@/modules/building/interfaces/building-view-sidebar-translations.interface'

export interface BuildingViewSidebarProperties {
    translations: BuildingViewSidebarTranslations
    displayedFloors: FloorItem[]
    currentBuildingEmployees: CurrentBuildingEmployee[]
    sidePanelTab: 'floors' | 'employees'
    selectedFloorId: number
    floorsSearch: string
    buildingEmployeesSearch: string
    floorsOffset: number
    buildingEmployeesOffset: number
    floorsLimit: number
    buildingEmployeesLimit: number
    floorsTotal: number
    buildingEmployeesTotal: number
    isFloorsCollapsed: boolean
    isLoadingFloors: boolean
    isLoadingBuildingEmployees: boolean
    isEmployeesHidden: boolean
    draggedFloorId: number
    floorsErrorMessage?: string
    buildingEmployeesErrorMessage?: string
}
