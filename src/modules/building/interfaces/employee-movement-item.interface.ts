export interface EmployeeMovementItem {
    scan_event_id: number
    created_at: string
    door_id: number
    floor_id: number
    zone_from_id: number | null
    zone_to_id: number | null
}
