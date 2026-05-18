export interface EmployeeLocationSocketPayload {
    employee_id: number
    door_id: number
    zone_id: number | null
    previous_zone_id: number | null
    floor_id: number | null
    previous_floor_id: number | null
    full_name: string
    email: string
    photo: string | null
    timestamp: string
}
