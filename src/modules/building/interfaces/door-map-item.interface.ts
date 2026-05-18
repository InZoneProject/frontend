export interface DoorMapItem {
    door_id: number
    is_entrance: boolean
    entrance_door_side: 'top' | 'bottom' | 'left' | 'right' | null
    zone_from_id: number | null
    zone_to_id: number
    floor_id: number
    rfid_reader_id: number | null
}
