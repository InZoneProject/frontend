import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { FloorItem } from '@/modules/building/interfaces/floor-item.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'

export interface GeometryDependencies {
    zones: ZoneMapItem[]
    doors: DoorMapItem[]
    floors: FloorItem[]
}
