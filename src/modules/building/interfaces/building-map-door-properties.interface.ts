import type { RenderedDoor } from '@/modules/building/interfaces/rendered-door.interface'

export interface BuildingMapDoorProperties {
    door: RenderedDoor
    isCurrentFloor: boolean
    canDelete: boolean
    areActionsVisible: boolean
    isScanActive: boolean
}
