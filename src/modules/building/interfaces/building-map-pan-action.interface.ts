import { BuildingMapActionType } from '@/modules/building/enums/building-map-action-type.enum'

export interface BuildingMapPanAction {
    type: BuildingMapActionType.PAN
    startClientX: number
    startClientY: number
    startPanX: number
    startPanY: number
    currentPanX: number
    currentPanY: number
}
