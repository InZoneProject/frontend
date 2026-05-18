import { BaseRepository } from '@/api/base.repository'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import type { EmployeeLocation } from '@/modules/building/interfaces/employee-location.interface'
import type { CurrentBuildingEmployee } from '@/modules/building/interfaces/current-building-employee.interface'
import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { FloorMapResponse } from '@/modules/building/interfaces/floor-map-response.interface'
import type { FloorItem } from '@/modules/building/interfaces/floor-item.interface'
import type { GeometryDependencies } from '@/modules/building/interfaces/geometry-dependencies.interface'
import type { ViewportBounds } from '@/modules/building/interfaces/viewport-bounds.interface'
import type { ViewportPageParams } from '@/modules/building/interfaces/viewport-page-params.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import type { RfidReaderItem } from '@/modules/building/interfaces/rfid-reader-item.interface'
import type { EmployeeMovementItem } from '@/modules/building/interfaces/employee-movement-item.interface'
import type { EmployeeReportInfo } from '@/modules/building/interfaces/employee-report-info.interface'
import type { EmployeeViolationItem } from '@/modules/building/interfaces/employee-violation-item.interface'
import type { OrganizationPositionItem } from '@/modules/organization/interfaces/organization-position-item.interface'
import type { ZoneAccessRuleItem } from '@/modules/building/interfaces/zone-access-rule-item.interface'
import { ZoneAccessRuleType } from '@/modules/building/enums/zone-access-rule-type.enum'

class BuildingRepository extends BaseRepository {
    constructor() {
        super('/buildings')
    }

    getFloors(buildingId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<FloorItem>>(`/${buildingId}/floors`, { params })
    }

    createFloor(buildingId: number, payload: { floor_number: number; floor_name: string }) {
        return this.post<FloorItem>(`/${buildingId}/floors`, payload)
    }

    updateFloorName(floorId: number, floorName: string) {
        return this.patch<FloorItem>(`/floors/${floorId}/name`, { floor_name: floorName })
    }

    reorderFloor(floorId: number, newFloorNumber: number) {
        return this.patch<void>(`/floors/${floorId}/reorder`, { new_floor_number: newFloorNumber })
    }

    deleteFloor(floorId: number) {
        return this.delete<void>(`/floors/${floorId}`)
    }

    getFloorMap(floorId: number, viewport: ViewportPageParams) {
        return this.get<FloorMapResponse>(`/floors/${floorId}/map`, { params: viewport })
    }

    getFloorMapSeed(floorId: number) {
        return this.get<{ viewport: ViewportBounds }>(`/floors/${floorId}/map-seed`)
    }

    updateZoneGeometry(zoneId: number, payload: { width: number; height: number; x_coordinate: number; y_coordinate: number }) {
        return this.patch<void>(`/zones/${zoneId}/geometry`, payload)
    }

    updateZoneTitle(zoneId: number, title: string) {
        return this.patch<{ zone_id: number; title: string }>(`/zones/${zoneId}/title`, { title })
    }

    updateZonePhoto(zoneId: number, photo: File) {
        const formData = new FormData()
        formData.append('photo', photo)
        return this.patch<Pick<ZoneMapItem, 'zone_id' | 'photo'>>(`/zones/${zoneId}/photo`, formData)
    }

    getZoneGeometryDependencies(zoneId: number, viewport?: ViewportBounds) {
        return this.get<GeometryDependencies>(`/zones/${zoneId}/geometry-dependencies`, { params: viewport })
    }

    shiftBuildingZones(zoneId: number, payload: { x_coordinate: number; y_coordinate: number }) {
        return this.patch<void>(`/zones/${zoneId}/shift`, payload)
    }

    createZone(payload: {
        title: string
        width: number
        height: number
        x_coordinate: number
        y_coordinate: number
        building_id: number
        is_transition_between_floors: boolean
        floor_id?: number
        zone_from_id: number
    }) {
        return this.post(`/zones`, payload)
    }

    deleteZone(zoneId: number) {
        return this.delete<void>(`/zones/${zoneId}`)
    }

    createDoor(payload: { zone_from_id: number; zone_to_id: number; floor_id: number }) {
        return this.post<Pick<DoorMapItem, 'door_id' | 'zone_from_id' | 'zone_to_id' | 'floor_id'>>(`/doors`, payload)
    }

    createEntranceDoor(payload: { zone_id: number; entrance_door_side: 'top' | 'bottom' | 'left' | 'right'; floor_id: number }) {
        return this.post<Pick<DoorMapItem, 'door_id' | 'floor_id' | 'entrance_door_side'> & { zone_id: number }>(`/entrance-doors`, payload)
    }

    deleteDoor(doorId: number, isEntrance: boolean) {
        return this.delete<void>(isEntrance ? `/entrance-doors/${doorId}` : `/doors/${doorId}`)
    }

    assignReaderToDoor(doorId: number, readerId: number) {
        return this.post<void>(`/doors/${doorId}/reader`, { rfid_reader_id: readerId })
    }

    removeReaderFromDoor(doorId: number) {
        return this.delete<void>(`/doors/${doorId}/reader`)
    }

    getDoorReader(doorId: number) {
        return this.axiosInstance.get<RfidReaderItem | null>(`${import.meta.env.VITE_API_BASE_URL}/rfid/doors/${doorId}/reader`)
    }

    getAvailableReadersForDoor(doorId: number, params: OrganizationListParams) {
        return this.axiosInstance.get<PaginatedResponse<RfidReaderItem>>(`${import.meta.env.VITE_API_BASE_URL}/rfid/doors/${doorId}/available-readers`, { params })
    }

    updateReaderName(readerId: number, name: string) {
        return this.axiosInstance.patch<RfidReaderItem>(`${import.meta.env.VITE_API_BASE_URL}/rfid/readers/${readerId}`, { name })
    }

    regenerateReaderToken(readerId: number) {
        return this.axiosInstance.patch<{ rfid_reader_id: number; new_secret_token: string }>(`${import.meta.env.VITE_API_BASE_URL}/rfid/readers/${readerId}/token`)
    }

    createReaderForDoor(doorId: number, name: string) {
        return this.axiosInstance.post<RfidReaderItem & { secret_token: string }>(`${import.meta.env.VITE_API_BASE_URL}/rfid/doors/${doorId}/readers`, { name })
    }

    deleteReader(readerId: number) {
        return this.axiosInstance.delete<void>(`${import.meta.env.VITE_API_BASE_URL}/rfid/readers/${readerId}`)
    }

    getCurrentEmployeeLocations(floorId: number, viewport: ViewportBounds) {
        return this.get<EmployeeLocation[]>(`/floors/${floorId}/employees/current-locations`, { params: viewport })
    }

    getCurrentBuildingEmployees(buildingId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<CurrentBuildingEmployee>>(`/${buildingId}/employees/current`, { params })
    }

    getCurrentFloorEmployees(floorId: number, params: OrganizationListParams) {
        return this.get<PaginatedResponse<CurrentBuildingEmployee>>(`/floors/${floorId}/employees/current`, { params })
    }

    getEmployeeDailyMovements(buildingId: number, employeeId: number, date: string) {
        return this.get<{
            employee: EmployeeReportInfo
            movements: EmployeeMovementItem[]
            violations: EmployeeViolationItem[]
        }>(`/${buildingId}/employees/${employeeId}/daily-movements`, { params: { date } })
    }

    getZoneRules(zoneId: number, params: OrganizationListParams) {
        return this.axiosInstance.get<PaginatedResponse<ZoneAccessRuleItem>>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zones/${zoneId}/access-rules`, { params })
    }

    getUnassignedZoneRules(zoneId: number, params: OrganizationListParams) {
        return this.axiosInstance.get<PaginatedResponse<ZoneAccessRuleItem>>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zones/${zoneId}/unassigned-access-rules`, { params })
    }

    createRule(payload: { organization_id: number; title: string; access_type: ZoneAccessRuleType; max_duration_minutes?: number | null }) {
        return this.axiosInstance.post<ZoneAccessRuleItem>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zone-access-rules`, payload)
    }

    updateRule(ruleId: number, payload: { title: string; access_type: ZoneAccessRuleType; max_duration_minutes?: number | null }) {
        return this.axiosInstance.patch<ZoneAccessRuleItem>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zone-access-rules/${ruleId}`, payload)
    }

    deleteRule(ruleId: number) {
        return this.axiosInstance.delete<void>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zone-access-rules/${ruleId}`)
    }

    attachRule(zoneId: number, ruleId: number) {
        return this.axiosInstance.post<void>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zones/${zoneId}/rules/${ruleId}/attach`, {})
    }

    detachRule(zoneId: number, ruleId: number) {
        return this.axiosInstance.delete<void>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zones/${zoneId}/rules/${ruleId}`)
    }

    getRulePositions(zoneId: number, ruleId: number, params: OrganizationListParams) {
        return this.axiosInstance.get<PaginatedResponse<OrganizationPositionItem>>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zones/${zoneId}/rules/${ruleId}/positions`, { params })
    }

    getUnassignedRulePositions(zoneId: number, ruleId: number, params: OrganizationListParams) {
        return this.axiosInstance.get<PaginatedResponse<OrganizationPositionItem>>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zones/${zoneId}/rules/${ruleId}/unassigned-positions`, { params })
    }

    attachPosition(zoneId: number, ruleId: number, positionId: number) {
        return this.axiosInstance.post<void>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zones/${zoneId}/rules/${ruleId}/positions/${positionId}`)
    }

    detachPosition(zoneId: number, ruleId: number, positionId: number) {
        return this.axiosInstance.delete<void>(`${import.meta.env.VITE_API_BASE_URL}/access-control/zones/${zoneId}/rules/${ruleId}/positions/${positionId}`)
    }
}

export const buildingRepository = new BuildingRepository()
