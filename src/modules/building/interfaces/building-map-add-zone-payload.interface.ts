import type { BuildingMapZoneGeometry } from '@/modules/building/interfaces/building-map-zone-geometry.interface'
import type { BuildingMapRegularZonePayload } from '@/modules/building/interfaces/building-map-regular-zone-payload.interface'
import type { BuildingMapTransitionZonePayload } from '@/modules/building/interfaces/building-map-transition-zone-payload.interface'

export interface BuildingMapAddZonePayload extends BuildingMapZoneGeometry {
    zone_from_id: number
    side: 'left' | 'right' | 'top' | 'bottom'
    title: string
    can_create_transition: boolean
    creation_mode?: 'regular' | 'transition' | 'hybrid'
    hide_type_tabs?: boolean
    transition_geometry?: BuildingMapZoneGeometry
    regular_payload?: BuildingMapRegularZonePayload
    transition_payload?: BuildingMapTransitionZonePayload
}
