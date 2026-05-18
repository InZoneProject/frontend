export interface BuildingMapAddDoorPayload {
    zone_from_id: number | null
    zone_to_id: number
    floor_id: number
    entrance_door_side?: 'left' | 'right' | 'top' | 'bottom'
}
