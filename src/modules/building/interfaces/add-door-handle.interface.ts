import type { BuildingMapAddDoorPayload } from '@/modules/building/interfaces/building-map-add-door-payload.interface'

export interface AddDoorHandle {
    key: string
    style: Record<string, string>
    insertIndex: number
    payload: BuildingMapAddDoorPayload
}
