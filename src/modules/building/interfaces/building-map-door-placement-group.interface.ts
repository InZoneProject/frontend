import type { BuildingMapSegment } from '@/modules/building/interfaces/building-map-segment.interface'

export interface BuildingMapDoorPlacementGroup {
    startIndex: number
    doorsCount: number
    placement: BuildingMapSegment
}