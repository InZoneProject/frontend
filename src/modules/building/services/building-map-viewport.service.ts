import type {Ref} from 'vue'
import {Events} from '@/enums/events.enum'
import {BUILDING_MAP_GEOMETRY_CONSTANTS} from '@/modules/building/constants/building-map-geometry.constants'
import {BUILDING_MAP_VIEWPORT_CONSTANTS} from '@/modules/building/constants/building-map-viewport.constants'
import {buildingMapGeometryService} from '@/modules/building/services/building-map-geometry.service'
import type {BuildingMapEmits} from '@/modules/building/interfaces/building-map-emits.interface'
import type {BuildingMapProperties} from '@/modules/building/interfaces/building-map-properties.interface'
import type {ViewportBounds} from '@/modules/building/interfaces/viewport-bounds.interface'
import type {ZoneMapItem} from '@/modules/building/interfaces/zone-map-item.interface'

class BuildingMapViewportService {
    private getElementViewportSize(
        mapElement: HTMLDivElement | null,
        unitSize: number,
        fallbackViewport: ViewportBounds
    ) {
        const rect = mapElement?.getBoundingClientRect()

        return {
            width: rect ? rect.width / unitSize : fallbackViewport.width,
            height: rect ? rect.height / unitSize : fallbackViewport.height
        }
    }

    private getElementViewportForPan(
        mapElement: HTMLDivElement | null,
        unitSize: number,
        fallbackViewport: ViewportBounds,
        nextPanX: number,
        nextPanY: number
    ): ViewportBounds {
        const size = this.getElementViewportSize(mapElement, unitSize, fallbackViewport)

        return {
            x: Math.floor(-nextPanX / unitSize),
            y: Math.floor(-nextPanY / unitSize),
            width: Math.ceil(size.width),
            height: Math.ceil(size.height)
        }
    }

    private getElementViewport(
        mapElement: HTMLDivElement | null,
        unitSize: number,
        fallbackViewport: ViewportBounds,
        panX: number,
        panY: number
    ): ViewportBounds {
        return this.getElementViewportForPan(mapElement, unitSize, fallbackViewport, panX, panY)
    }

    private areViewportsEqual(first: ViewportBounds | null, second: ViewportBounds) {
        return first !== null
            && first.x === second.x
            && first.y === second.y
            && first.width === second.width
            && first.height === second.height
    }

    private doesElementViewportContainZone(viewport: ViewportBounds, zone: ZoneMapItem) {
        const viewportRight = viewport.x + viewport.width
        const viewportBottom = viewport.y + viewport.height
        const zoneRight = zone.x_coordinate + zone.width
        const zoneBottom = zone.y_coordinate + zone.height

        return zone.x_coordinate < viewportRight
            && zoneRight > viewport.x
            && zone.y_coordinate < viewportBottom
            && zoneBottom > viewport.y
    }

    public getZonesBounds(zones: ZoneMapItem[]) {
        if (zones.length === 0) return null

        return {
            minX: Math.min(...zones.map((zone) => zone.x_coordinate)),
            minY: Math.min(...zones.map((zone) => zone.y_coordinate)),
            maxX: Math.max(...zones.map((zone) => zone.x_coordinate + zone.width)),
            maxY: Math.max(...zones.map((zone) => zone.y_coordinate + zone.height))
        }
    }

    private getElementClampedPanToZones(
        zones: ZoneMapItem[],
        mapElement: HTMLDivElement | null,
        unitSize: number,
        fallbackViewport: ViewportBounds,
        nextPanX: number,
        nextPanY: number
    ) {
        const bounds = this.getZonesBounds(zones)
        if (!bounds) return null

        const viewport = this.getElementViewportSize(mapElement, unitSize, fallbackViewport)
        const visibleGap = BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
        const minAllowedX = bounds.minX - viewport.width + visibleGap
        const maxAllowedX = bounds.maxX - visibleGap
        const minAllowedY = bounds.minY - viewport.height + visibleGap
        const maxAllowedY = bounds.maxY - visibleGap
        const nextViewportX = -nextPanX / unitSize
        const nextViewportY = -nextPanY / unitSize
        const clampedViewportX = buildingMapGeometryService.clampValue(nextViewportX, minAllowedX, maxAllowedX)
        const clampedViewportY = buildingMapGeometryService.clampValue(nextViewportY, minAllowedY, maxAllowedY)

        return {
            x: -clampedViewportX * unitSize,
            y: -clampedViewportY * unitSize
        }
    }

    public focusBuilding(zones: ZoneMapItem[], mapElement: HTMLDivElement | null) {
        const rect = mapElement?.getBoundingClientRect()
        const bounds = this.getZonesBounds(zones)
        if (!rect || !bounds) return null

        const buildingWidth = Math.max(1, bounds.maxX - bounds.minX)
        const buildingHeight = Math.max(1, bounds.maxY - bounds.minY)
        const unitSize = Math.max(
            BUILDING_MAP_VIEWPORT_CONSTANTS.MIN_UNIT_SIZE,
            Math.min(
                (rect.width * BUILDING_MAP_VIEWPORT_CONSTANTS.FOCUS_SCALE) / buildingWidth,
                (rect.height * BUILDING_MAP_VIEWPORT_CONSTANTS.FOCUS_SCALE) / buildingHeight
            )
        )

        return {
            unitSize,
            panX: rect.width / 2 - (bounds.minX + buildingWidth / 2) * unitSize,
            panY: rect.height / 2 - (bounds.minY + buildingHeight / 2) * unitSize
        }
    }

    public getViewportForPan(
        mapRef: Ref<HTMLDivElement | null>,
        unitSize: Ref<number>,
        properties: BuildingMapProperties,
        nextPanX: number,
        nextPanY: number
    ) {
        return this.getElementViewportForPan(
            mapRef.value,
            unitSize.value,
            properties.viewport,
            nextPanX,
            nextPanY
        )
    }

    public getViewportSize(
        mapRef: Ref<HTMLDivElement | null>,
        unitSize: Ref<number>,
        properties: BuildingMapProperties
    ) {
        return this.getElementViewportSize(
            mapRef.value,
            unitSize.value,
            properties.viewport
        )
    }

    public getViewport(
        mapRef: Ref<HTMLDivElement | null>,
        unitSize: Ref<number>,
        panX: Ref<number>,
        panY: Ref<number>,
        properties: BuildingMapProperties
    ) {
        return this.getElementViewport(
            mapRef.value,
            unitSize.value,
            properties.viewport,
            panX.value,
            panY.value
        )
    }

    public syncViewport(params: {
        mapRef: Ref<HTMLDivElement | null>
        unitSize: Ref<number>
        panX: Ref<number>
        panY: Ref<number>
        properties: BuildingMapProperties
        emit: BuildingMapEmits
        lastSyncedViewport: Ref<ViewportBounds | null>
        viewportSyncDebounce: Ref<number | null>
    }) {
        if (params.viewportSyncDebounce.value !== null) {
            window.clearTimeout(params.viewportSyncDebounce.value)
            params.viewportSyncDebounce.value = null
        }

        const viewport = this.getViewport(
            params.mapRef,
            params.unitSize,
            params.panX,
            params.panY,
            params.properties
        )

        if (this.areViewportsEqual(params.lastSyncedViewport.value, viewport)) return

        params.lastSyncedViewport.value = viewport
        params.emit(Events.UPDATE_VIEWPORT, viewport)
    }

    public scheduleViewportSync(params: {
        mapRef: Ref<HTMLDivElement | null>
        unitSize: Ref<number>
        panX: Ref<number>
        panY: Ref<number>
        properties: BuildingMapProperties
        emit: BuildingMapEmits
        lastSyncedViewport: Ref<ViewportBounds | null>
        viewportSyncDebounce: Ref<number | null>
    }) {
        if (params.viewportSyncDebounce.value !== null) {
            window.clearTimeout(params.viewportSyncDebounce.value)
        }

        params.viewportSyncDebounce.value = window.setTimeout(() => {
            params.viewportSyncDebounce.value = null
            this.syncViewport(params)
        }, BUILDING_MAP_VIEWPORT_CONSTANTS.VIEWPORT_SYNC_DELAY_MS)
    }

    public cleanupViewportSync(viewportSyncDebounce: Ref<number | null>) {
        if (viewportSyncDebounce.value === null) return

        window.clearTimeout(viewportSyncDebounce.value)
        viewportSyncDebounce.value = null
    }

    public doesViewportContainZone(
        viewport: ViewportBounds,
        zone: ZoneMapItem
    ) {
        return this.doesElementViewportContainZone(viewport, zone)
    }

    public keepAtLeastOneZoneVisible(params: {
        zones: ZoneMapItem[]
        mapRef: Ref<HTMLDivElement | null>
        unitSize: Ref<number>
        panX: Ref<number>
        panY: Ref<number>
        properties: BuildingMapProperties
    }) {
        const rect = params.mapRef.value?.getBoundingClientRect()
        if (!rect || params.zones.length === 0) return

        const viewport = this.getElementViewport(
            params.mapRef.value,
            params.unitSize.value,
            params.properties.viewport,
            params.panX.value,
            params.panY.value
        )
        if (params.zones.some((zone) => this.doesElementViewportContainZone(viewport, zone))) return

        const viewportCenterX = viewport.x + viewport.width / 2
        const viewportCenterY = viewport.y + viewport.height / 2
        const nearestZone = params.zones.reduce((nearest, zone) => {
            const zoneCenterX = zone.x_coordinate + zone.width / 2
            const zoneCenterY = zone.y_coordinate + zone.height / 2
            const nearestCenterX = nearest.x_coordinate + nearest.width / 2
            const nearestCenterY = nearest.y_coordinate + nearest.height / 2
            const distance = Math.hypot(zoneCenterX - viewportCenterX, zoneCenterY - viewportCenterY)
            const nearestDistance = Math.hypot(nearestCenterX - viewportCenterX, nearestCenterY - viewportCenterY)

            return distance < nearestDistance ? zone : nearest
        }, params.zones[0])

        const nextPan = {
            panX: rect.width / 2 - (nearestZone.x_coordinate + nearestZone.width / 2) * params.unitSize.value,
            panY: rect.height / 2 - (nearestZone.y_coordinate + nearestZone.height / 2) * params.unitSize.value
        }

        if (!nextPan) return

        params.panX.value = nextPan.panX
        params.panY.value = nextPan.panY
    }

    public clampPanToZones(params: {
        zones: ZoneMapItem[]
        mapRef: Ref<HTMLDivElement | null>
        unitSize: Ref<number>
        properties: BuildingMapProperties
        nextPanX: number
        nextPanY: number
    }) {
        return this.getElementClampedPanToZones(
            params.zones,
            params.mapRef.value,
            params.unitSize.value,
            params.properties.viewport,
            params.nextPanX,
            params.nextPanY
        )
    }

    public applyPan(
        panX: Ref<number>,
        panY: Ref<number>,
        nextPanX: number,
        nextPanY: number
    ) {
        panX.value = nextPanX
        panY.value = nextPanY

        return true
    }

    public getMinZoomForFit(
        zones: ZoneMapItem[],
        mapRef: Ref<HTMLDivElement | null>
    ) {
        const rect = mapRef.value?.getBoundingClientRect()
        if (!rect || zones.length === 0) return BUILDING_MAP_VIEWPORT_CONSTANTS.MIN_UNIT_SIZE

        const bounds = this.getZonesBounds(zones)
        if (!bounds) return BUILDING_MAP_VIEWPORT_CONSTANTS.MIN_UNIT_SIZE

        const buildingWidth = Math.max(1, bounds.maxX - bounds.minX)
        const buildingHeight = Math.max(1, bounds.maxY - bounds.minY)
        const fit = Math.min(
            (rect.width * BUILDING_MAP_VIEWPORT_CONSTANTS.FOCUS_SCALE) / buildingWidth,
            (rect.height * BUILDING_MAP_VIEWPORT_CONSTANTS.FOCUS_SCALE) / buildingHeight
        )

        return Math.max(BUILDING_MAP_VIEWPORT_CONSTANTS.MIN_UNIT_SIZE, fit)
    }
}

export const buildingMapViewportControllerService = new BuildingMapViewportService()
