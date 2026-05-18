import { BaseRepository } from '@/api/base.repository'
import type { BuildingInfo } from '@/modules/building/interfaces/building-info.interface'

class BuildingEditDeleteRepository extends BaseRepository {
    constructor() {
        super('/buildings')
    }

    getBuildingInfo(buildingId: number) {
        return this.get<BuildingInfo>(`/${buildingId}`)
    }

    updateBuilding(buildingId: number, payload: { title: string; address: string | null }) {
        return this.patch<BuildingInfo>(`/${buildingId}`, payload)
    }

    deleteBuilding(buildingId: number) {
        return this.delete<void>(`/${buildingId}`)
    }
}

export const buildingEditDeleteRepository = new BuildingEditDeleteRepository()
