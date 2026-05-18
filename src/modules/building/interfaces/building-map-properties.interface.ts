import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { ViewportBounds } from '@/modules/building/interfaces/viewport-bounds.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import { BuildingMapMode } from '@/modules/building/enums/building-map-mode.enum'

export interface BuildingMapProperties {
    zones: ZoneMapItem[]
    transitionValidationZones: ZoneMapItem[]
    transitionValidationDoors: DoorMapItem[]
    deletableZoneIds: number[]
    deletableDoorIds: number[]
    doors: DoorMapItem[]
    viewport: ViewportBounds
    buildingId: number
    currentFloorId: number
    mode: BuildingMapMode
    loading: boolean
    newZoneTitle: string
    isEditingZone: boolean
    isZoneCreateModalOpen: boolean
    editingZoneLabel: string
    blockedZoneCollisionMessage: string
    blockedDoorBetweenMessage: string
    blockedEntranceDoorMessage: string
}
