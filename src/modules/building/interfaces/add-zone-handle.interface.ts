import type { BuildingMapAddZonePayload } from '@/modules/building/interfaces/building-map-add-zone-payload.interface'
import type { BuildingMapRegularZonePayload } from '@/modules/building/interfaces/building-map-regular-zone-payload.interface'
import type { BuildingMapTransitionSegment } from '@/modules/building/interfaces/building-map-transition-segment.interface'
import type { BuildingMapTransitionZonePayload } from '@/modules/building/interfaces/building-map-transition-zone-payload.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import type { BuildingMapSegment } from '@/modules/building/interfaces/building-map-segment.interface'

export interface AddZoneHandle {
    key: string
    zoneId: number
    side: 'left' | 'right' | 'top' | 'bottom'
    style: Record<string, string>
    probeStyle: Record<string, string>
    sliceStart: number
    sliceEnd: number
    doorSegments: Array<BuildingMapSegment>
    doorPlacementSignature: string
    doorPlacementSplitScore: number
    canCreateTransition: boolean
    transitionMode: 'none' | 'partial' | 'full'
    transitionSignature: string
    transitionSegments: Array<{ start: number; end: number; outward: number; style: Record<string, string> }>
    sourceZone: ZoneMapItem
    baseSegment: BuildingMapSegment
    baseTransitionSegments: Array<BuildingMapTransitionSegment>
    payload: BuildingMapAddZonePayload & {
        regular_payload?: BuildingMapRegularZonePayload
        transition_payload?: BuildingMapTransitionZonePayload
        door_collision_geometry?: {
            x_coordinate: number
            y_coordinate: number
            width: number
            height: number
        }
    }
}
