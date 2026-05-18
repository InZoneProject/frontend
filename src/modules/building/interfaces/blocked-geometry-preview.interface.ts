import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { FloorItem } from '@/modules/building/interfaces/floor-item.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'

export interface BlockedGeometryPreview {
    floor: FloorItem
    zones: ZoneMapItem[]
    positioningZones?: ZoneMapItem[]
    fallbackPositioningZones?: ZoneMapItem[]
    doors: DoorMapItem[]
    highlightedDoorId?: number
    highlightedDoorIds?: number[]
    message: string
}
