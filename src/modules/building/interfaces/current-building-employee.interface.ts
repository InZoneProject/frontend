export interface CurrentBuildingEmployee {
    employee_id: number
    full_name: string
    email: string
    photo: string | null
    zone_id: number
    zone_title: string
    floor_id: number | null
    last_scan_at: string | null
}
