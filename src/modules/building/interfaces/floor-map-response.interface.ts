import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { FloorMapMeta } from '@/modules/building/interfaces/floor-map-meta.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import type { ZoneCluster } from '@/modules/building/interfaces/zone-cluster.interface'

export interface FloorMapResponse {
    zones: ZoneMapItem[]
    doors: DoorMapItem[]
    transition_validation_zones: ZoneMapItem[]
    transition_validation_doors: DoorMapItem[]
    deletable_zone_ids: number[]
    deletable_door_ids: number[]
    map_meta: FloorMapMeta
    zone_clusters: ZoneCluster[]
}
