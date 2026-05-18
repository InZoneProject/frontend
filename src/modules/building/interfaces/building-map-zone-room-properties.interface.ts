import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import type { EmployeeLocation } from '@/modules/building/interfaces/employee-location.interface'

export interface BuildingMapZoneRoomProperties {
    zone: ZoneMapItem
    zoneStyle: Record<string, string>
    isPreview: boolean
    isCurrentFloor: boolean
    canResize: boolean
    canDelete: boolean
    employeeLocations: EmployeeLocation[]
    photoUrl: string | null
    isViewMode: boolean
    isInteractionDisabled: boolean
}
