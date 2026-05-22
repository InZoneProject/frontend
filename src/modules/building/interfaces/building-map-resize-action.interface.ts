import { BuildingMapActionType } from '@/modules/building/enums/building-map-action-type.enum'
import { BuildingMapResizeEdge } from '@/modules/building/enums/building-map-resize-edge.enum'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'

export interface BuildingMapResizeAction {
    type: BuildingMapActionType.RESIZE
    zone: ZoneMapItem
    edge: BuildingMapResizeEdge
    startClientX: number
    startClientY: number
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    lastValidDeltaX: number
    lastValidDeltaY: number
    currentDeltaX: number
    currentDeltaY: number
    hasLoadedDependencies: boolean
    lastPreviewSignature?: string
}
