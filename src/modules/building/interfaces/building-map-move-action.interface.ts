import { BuildingMapActionType } from '@/modules/building/enums/building-map-action-type.enum'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'

export interface BuildingMapMoveAction {
    type: BuildingMapActionType.MOVE
    zone: ZoneMapItem
    startClientX: number
    startClientY: number
    startX: number
    startY: number
    currentDeltaX: number
    currentDeltaY: number
    lastValidDeltaX: number
    lastValidDeltaY: number
    hasLoadedDependencies: boolean
}
