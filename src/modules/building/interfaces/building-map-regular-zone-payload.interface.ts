import type { BuildingMapZoneGeometry } from '@/modules/building/interfaces/building-map-zone-geometry.interface'

export interface BuildingMapRegularZonePayload extends BuildingMapZoneGeometry {
    zone_from_id: number
    side: 'left' | 'right' | 'top' | 'bottom'
    title: string
    can_create_transition: false
    creation_mode?: 'regular'
}
