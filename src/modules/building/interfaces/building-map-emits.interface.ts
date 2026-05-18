import { Events } from '@/enums/events.enum'
import type { BuildingMapAddDoorPayload } from '@/modules/building/interfaces/building-map-add-door-payload.interface'
import type { BuildingMapAddZonePayload } from '@/modules/building/interfaces/building-map-add-zone-payload.interface'
import type { EmployeeLocation } from '@/modules/building/interfaces/employee-location.interface'
import type { ViewportBounds } from '@/modules/building/interfaces/viewport-bounds.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import { BuildingMapMode } from '@/modules/building/enums/building-map-mode.enum'

export interface BuildingMapEmits {
    (event: Events.UPDATE_VIEWPORT, value: ViewportBounds): void
    (event: Events.UPDATE_MODE, value: BuildingMapMode): void
    (event: Events.COMMIT_ZONE_GEOMETRY, zoneId: number, value: { width: number; height: number; x_coordinate: number; y_coordinate: number }, previewZones?: ZoneMapItem[]): void
    (event: Events.SHIFT_ZONE, zoneId: number, value: { x_coordinate: number; y_coordinate: number }): void
    (event: Events.UPDATE_ZONE_TITLE, zoneId: number, title: string): void
    (event: Events.UPDATE_ZONE_PHOTO, zoneId: number, file: File): void
    (event: Events.ADD_ZONE, value: BuildingMapAddZonePayload): void
    (event: Events.DELETE_ZONE, zoneId: number): void
    (event: Events.OPEN_ZONE_ACCESS_RULES, zoneId: number): void
    (event: Events.DELETE_DOOR, doorId: number, isEntrance: boolean): void
    (event: Events.OPEN_DOOR_READER, doorId: number): void
    (event: Events.OPEN_EMPLOYEE_INFO, employee: EmployeeLocation): void
    (event: Events.ADD_DOOR, value: BuildingMapAddDoorPayload): void
}
