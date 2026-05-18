import type { EmployeeLocation } from '@/modules/building/interfaces/employee-location.interface'

class BuildingMapEmployeeService {
    getVisibleEmployeesByZone(employeeLocations: EmployeeLocation[]) {
        const employeesByZone = new Map<number, EmployeeLocation[]>()

        for (const location of employeeLocations) {
            const employees = employeesByZone.get(location.zone_id) || []
            employees.push(location)
            employeesByZone.set(location.zone_id, employees)
        }

        return employeesByZone
    }
}

export const buildingMapEmployeeService = new BuildingMapEmployeeService()
