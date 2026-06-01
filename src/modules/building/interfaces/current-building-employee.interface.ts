export interface CurrentBuildingEmployee {
    employee_id: number
    full_name: string
    email: string
    photo: string | null
    zone_id: number | null
    zone_title: string
    floor_id: number | null
    floor_number: number | null
    is_transition_between_floors: boolean
    last_scan_at: string | null
}
