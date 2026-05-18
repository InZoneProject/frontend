import type { ViewportPageParams } from '@/modules/building/interfaces/viewport-page-params.interface'

class BuildingMapCacheService {
    private readonly loadedViewportsByFloorId = new Map<number, ViewportPageParams[]>()

    public clear(floorId?: number) {
        if (floorId === undefined) {
            this.loadedViewportsByFloorId.clear()
            return
        }

        this.loadedViewportsByFloorId.delete(floorId)
    }

    public getViewportKey(viewport: ViewportPageParams) {
        return [
            Math.floor(viewport.x),
            Math.floor(viewport.y),
            Math.ceil(viewport.width),
            Math.ceil(viewport.height)
        ].join(':')
    }

    public markViewportLoaded(floorId: number, viewport: ViewportPageParams) {
        const loadedViewports = this.loadedViewportsByFloorId.get(floorId) || []
        const normalizedViewport = this.normalizeViewport(viewport)

        if (loadedViewports.some((item) => this.doesViewportContain(item, normalizedViewport))) return

        this.loadedViewportsByFloorId.set(floorId, [...loadedViewports, normalizedViewport])
    }

    public isViewportLoaded(floorId: number, viewport: ViewportPageParams) {
        const loadedViewports = this.loadedViewportsByFloorId.get(floorId)
        if (!loadedViewports) return false

        const normalizedViewport = this.normalizeViewport(viewport)

        return loadedViewports.some((item) => this.doesViewportContain(item, normalizedViewport))
    }

    private normalizeViewport(viewport: ViewportPageParams): ViewportPageParams {
        return {
            x: Math.floor(viewport.x),
            y: Math.floor(viewport.y),
            width: Math.ceil(viewport.width),
            height: Math.ceil(viewport.height),
            limit: viewport.limit
        }
    }

    private doesViewportContain(container: ViewportPageParams, viewport: ViewportPageParams) {
        return viewport.x >= container.x
            && viewport.y >= container.y
            && viewport.x + viewport.width <= container.x + container.width
            && viewport.y + viewport.height <= container.y + container.height
    }
}

export const buildingMapCacheService = new BuildingMapCacheService()
