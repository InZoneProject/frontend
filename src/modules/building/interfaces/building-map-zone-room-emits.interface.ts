import { Events } from '@/enums/events.enum'
import type { EmployeeLocation } from '@/modules/building/interfaces/employee-location.interface'
import type { BuildingMapZoneRoomResizeEdge } from '@/modules/building/interfaces/building-map-zone-room-resize-edge.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'

export interface BuildingMapZoneRoomEmits {
    (event: Events.START_MOVE, mouseEvent: MouseEvent, zone: ZoneMapItem): void
    (
        event: Events.START_RESIZE,
        mouseEvent: MouseEvent,
        zone: ZoneMapItem,
        edge: BuildingMapZoneRoomResizeEdge['edge']
    ): void
    (event: Events.RESIZE_HOVER, isHovered: boolean): void
    (event: Events.DELETE_ZONE, zoneId: number): void
    (event: Events.UPDATE_ZONE_PHOTO, zoneId: number, file: File): void
    (event: Events.OPEN_EMPLOYEE_INFO, employee: EmployeeLocation): void
}
