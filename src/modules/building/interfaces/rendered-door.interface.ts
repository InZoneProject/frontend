export interface RenderedDoor {
    door_id: number
    floor_id: number
    is_entrance: boolean
    zone_from_id: number | null
    zone_to_id: number
    rfid_reader_id: number | null
    side: 'top' | 'bottom' | 'left' | 'right'
    style: Record<string, string>
}
