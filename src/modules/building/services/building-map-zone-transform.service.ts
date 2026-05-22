import {BUILDING_MAP_DOOR_CONSTANTS} from '@/modules/building/constants/building-map-door.constants'
import {BUILDING_MAP_GEOMETRY_CONSTANTS} from '@/modules/building/constants/building-map-geometry.constants'
import {BUILDING_MAP_ZONE_UI_CONSTANTS} from '@/modules/building/constants/building-map-zone-ui.constants'
import {buildingMapEntranceDoorPlacementContextService} from '@/modules/building/services/building-map-entrance-door-placement-context.service'
import {buildingMapGeometryService} from '@/modules/building/services/building-map-geometry.service'
import {BuildingMapActionType} from '@/modules/building/enums/building-map-action-type.enum'
import {BuildingMapResizeEdge} from '@/modules/building/enums/building-map-resize-edge.enum'
import type {BlockedGeometryPreview} from '@/modules/building/interfaces/blocked-geometry-preview.interface'
import type {BuildingMapMoveAction} from '@/modules/building/interfaces/building-map-move-action.interface'
import type {BuildingMapPanAction} from '@/modules/building/interfaces/building-map-pan-action.interface'
import type {BuildingMapResizeAction} from '@/modules/building/interfaces/building-map-resize-action.interface'
import type {BuildingMapRectangle} from '@/modules/building/interfaces/building-map-rectangle.interface'
import type {DoorMapItem} from '@/modules/building/interfaces/door-map-item.interface'
import type {GeometryDependencies} from '@/modules/building/interfaces/geometry-dependencies.interface'
import type {ZoneMapItem} from '@/modules/building/interfaces/zone-map-item.interface'
import {BUILDING_MAP_VIEWPORT_CONSTANTS} from '@/modules/building/constants/building-map-viewport.constants'

class BuildingMapZoneTransformService {
    private getUiScale(unitSize: number) {
        return Math.max(
            0.55,
            Math.min(
                1,
                unitSize / BUILDING_MAP_VIEWPORT_CONSTANTS.DEFAULT_UNIT_SIZE
            )
        )
    }

    public resolvePhotoUrl(photo: string | null) {
        if (!photo) return null
        if (/^https?:\/\//.test(photo)) return photo

        const apiBase = String(import.meta.env.VITE_API_BASE_URL || '')
            .replace(/\/api\/?$/, '')
            .replace(/\/$/, '')

        return `${apiBase}${photo.startsWith('/') ? photo : `/${photo}`}`
    }

    public getZoneStyle(zone: ZoneMapItem, unitSize: number) {
        const lineWidth = Math.max(0.25, Math.min(1, unitSize / BUILDING_MAP_VIEWPORT_CONSTANTS.DEFAULT_UNIT_SIZE))
        const radius = Math.max(1, Math.min(6, 6 * this.getUiScale(unitSize)))

        return {
            width: `${zone.width * unitSize}px`,
            height: `${zone.height * unitSize}px`,
            transform: `translate(${zone.x_coordinate * unitSize}px, ${zone.y_coordinate * unitSize}px)`,
            '--building-map-zone-line-width': `${lineWidth}px`,
            '--building-map-zone-radius': `${radius}px`
        }
    }

    public getZoneHeaderMetrics(zone: ZoneMapItem, unitSize: number) {
        const uiScale = this.getUiScale(unitSize)
        const scale = (value: number) => value * uiScale

        const zoneWidth = zone.width * unitSize
        const zoneHeight = zone.height * unitSize
        const actionInset = BUILDING_MAP_ZONE_UI_CONSTANTS.ACTION_INSET
        const actionSize = BUILDING_MAP_ZONE_UI_CONSTANTS.ACTION_SIZE
        const actionGap = BUILDING_MAP_ZONE_UI_CONSTANTS.ACTION_GAP
        const titleHeight = scale(BUILDING_MAP_ZONE_UI_CONSTANTS.TITLE_HEIGHT)
        const titleGap = scale(BUILDING_MAP_ZONE_UI_CONSTANTS.TITLE_GAP)
        const actionsWidth = actionSize * BUILDING_MAP_ZONE_UI_CONSTANTS.ACTIONS_COUNT + actionGap * 2
        const isCompactZone = zoneHeight < scale(BUILDING_MAP_ZONE_UI_CONSTANTS.COMPACT_ZONE_HEIGHT)
        const headerHeight = actionSize + titleGap + titleHeight

        const actionTop = isCompactZone
            ? (zoneHeight - headerHeight) / 2
            : actionInset + Math.min(
            Math.max(scale(BUILDING_MAP_ZONE_UI_CONSTANTS.DEFAULT_ACTION_TOP_REFERENCE) - zoneHeight, 0),
            scale(BUILDING_MAP_ZONE_UI_CONSTANTS.MAX_ACTION_TOP_OFFSET)
        )

        const titleCenterY = isCompactZone
            ? actionTop + actionSize + titleGap + titleHeight / 2
            : zoneHeight / 2 + Math.min(
            Math.max(scale(BUILDING_MAP_ZONE_UI_CONSTANTS.DEFAULT_TITLE_CENTER_REFERENCE) - zoneHeight / 2, 0),
            scale(BUILDING_MAP_ZONE_UI_CONSTANTS.MAX_TITLE_OFFSET)
        )

        return {
            zoneWidth,
            zoneHeight,
            actionSize,
            actionGap,
            actionsWidth,
            actionTop,
            titleOffset: titleCenterY - zoneHeight / 2
        }
    }

    public getZoneTitleStyle(
        zone: ZoneMapItem,
        unitSize: number,
        isViewMode = false,
        areActionsVisible = true
    ) {
        if (isViewMode) {
            const inset = 8 * this.getUiScale(unitSize)

            return {
                left: `${zone.x_coordinate * unitSize + inset}px`,
                top: `${zone.y_coordinate * unitSize + inset}px`,
                '--building-map-zone-title-offset': '0px',
                '--building-map-zone-title-max-width': `${Math.min(144, Math.max(zone.width * unitSize - inset * 2, 40))}px`,
                '--building-map-zone-title-transform': 'none'
            }
        }

        const titleOffset = areActionsVisible
            ? Math.max(0, this.getZoneHeaderMetrics(zone, unitSize).titleOffset)
            : 0

        return {
            left: `${(zone.x_coordinate + zone.width / 2) * unitSize}px`,
            top: `${(zone.y_coordinate + zone.height / 2) * unitSize}px`,
            '--building-map-zone-title-offset': `${titleOffset}px`,
            '--building-map-zone-title-max-width': `${Math.min(
                144 * this.getUiScale(unitSize),
                Math.max(
                    zone.width * unitSize - 18 * this.getUiScale(unitSize),
                    52 * this.getUiScale(unitSize)
                )
            )}px`,
            '--building-map-zone-title-transform': 'translate(-50%, calc(-50% + var(--building-map-zone-title-offset)))'
        }
    }

    public getZoneActionStyle(zone: ZoneMapItem, unitSize: number) {
        const actionInset = BUILDING_MAP_ZONE_UI_CONSTANTS.ACTION_INSET
        const {
            zoneWidth,
            actionSize,
            actionGap,
            actionsWidth,
            actionTop
        } = this.getZoneHeaderMetrics(zone, unitSize)

        const actionsStart = zoneWidth >= actionsWidth + actionInset * 2
            ? actionInset
            : (zoneWidth - actionsWidth) / 2

        return {
            left: `${zone.x_coordinate * unitSize + actionsStart}px`,
            top: `${zone.y_coordinate * unitSize + actionTop}px`,
            width: `${actionsWidth}px`,
            height: `${actionSize}px`,
            '--building-map-zone-upload-left': '0px',
            '--building-map-zone-upload-top': '0px',
            '--building-map-zone-upload-transform': 'none',
            '--building-map-zone-access-left': `${actionSize + actionGap}px`,
            '--building-map-zone-access-top': '0px',
            '--building-map-zone-access-transform': 'none',
            '--building-map-zone-delete-left': `${(actionSize + actionGap) * 2}px`,
            '--building-map-zone-delete-top': '0px',
            '--building-map-zone-delete-transform': 'none'
        }
    }

    public createMoveAction(event: MouseEvent, zone: ZoneMapItem): BuildingMapMoveAction {
        return {
            type: BuildingMapActionType.MOVE,
            zone,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startX: zone.x_coordinate,
            startY: zone.y_coordinate,
            currentDeltaX: 0,
            currentDeltaY: 0,
            lastValidDeltaX: 0,
            lastValidDeltaY: 0,
            hasLoadedDependencies: false
        }
    }

    public createResizeAction(
        event: MouseEvent,
        zone: ZoneMapItem,
        edge: BuildingMapResizeEdge
    ): BuildingMapResizeAction {
        return {
            type: BuildingMapActionType.RESIZE,
            zone,
            edge,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startX: zone.x_coordinate,
            startY: zone.y_coordinate,
            startWidth: zone.width,
            startHeight: zone.height,
            lastValidDeltaX: 0,
            lastValidDeltaY: 0,
            currentDeltaX: 0,
            currentDeltaY: 0,
            hasLoadedDependencies: false
        }
    }

    public createPanAction(
        event: MouseEvent,
        panX: number,
        panY: number
    ): BuildingMapPanAction {
        return {
            type: BuildingMapActionType.PAN,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startPanX: panX,
            startPanY: panY,
            currentPanX: panX,
            currentPanY: panY
        }
    }

    public mergeDependencyZonesWithPreview(
        dependencyZones: ZoneMapItem[],
        currentPreview: ZoneMapItem[]
    ) {
        return dependencyZones.map((item) => {
            const previewZone = currentPreview.find((zoneItem) => zoneItem.zone_id === item.zone_id)
            return previewZone
                ? {
                    ...item,
                    x_coordinate: previewZone.x_coordinate,
                    y_coordinate: previewZone.y_coordinate,
                    width: previewZone.width,
                    height: previewZone.height
                }
                : {...item}
        })
    }

    public getMovePreview(params: {
        zones: ZoneMapItem[]
        deltaX: number
        deltaY: number
        doors?: DoorMapItem[]
        geometryDependencies?: GeometryDependencies | null
        blockedZoneCollisionMessage?: string
        blockedDoorBetweenMessage?: string
        blockedEntranceDoorMessage?: string
        newZoneTitle?: string
        shouldBuildBlockedPreview?: boolean
    }) {
        const zones = params.zones.map((item) => ({
            ...item,
            x_coordinate: item.x_coordinate + params.deltaX,
            y_coordinate: item.y_coordinate + params.deltaY
        }))

        if (!params.doors) {
            return {
                zones,
                blockedGeometryPreview: null
            }
        }

        const coordinatesMap = buildingMapGeometryService.createCoordinatesMap(zones)
        const validation = this.isGeometryCandidateValid({
            zones,
            coordinatesMap,
            doors: params.doors,
            geometryDependencies: params.geometryDependencies || null,
            blockedZoneCollisionMessage: params.blockedZoneCollisionMessage || params.blockedDoorBetweenMessage || '',
            blockedDoorBetweenMessage: params.blockedDoorBetweenMessage || '',
            blockedEntranceDoorMessage: params.blockedEntranceDoorMessage || '',
            newZoneTitle: params.newZoneTitle || '',
            shouldBuildBlockedPreview: Boolean(params.shouldBuildBlockedPreview)
        })

        if (!validation.isValid) {
            return {
                zones: null,
                blockedGeometryPreview: validation.blockedGeometryPreview
            }
        }

        return {
            zones,
            blockedGeometryPreview: null
        }
    }

    public clampMoveDelta(params: {
        action: BuildingMapMoveAction
        deltaX: number
        deltaY: number
        zones: ZoneMapItem[]
        doors: DoorMapItem[]
        geometryDependencies: GeometryDependencies | null
        blockedZoneCollisionMessage: string
        blockedDoorBetweenMessage: string
        blockedEntranceDoorMessage: string
        newZoneTitle: string
    }) {
        let lowX = params.action.lastValidDeltaX
        let lowY = params.action.lastValidDeltaY
        let highX = params.deltaX
        let highY = params.deltaY
        let nearestValid = this.getMovePreview({
            zones: params.zones,
            deltaX: lowX,
            deltaY: lowY,
            doors: params.doors,
            geometryDependencies: params.geometryDependencies,
            blockedZoneCollisionMessage: params.blockedZoneCollisionMessage,
            blockedDoorBetweenMessage: params.blockedDoorBetweenMessage,
            blockedEntranceDoorMessage: params.blockedEntranceDoorMessage,
            newZoneTitle: params.newZoneTitle,
            shouldBuildBlockedPreview: false
        })

        for (let iteration = 0; iteration < 10; iteration += 1) {
            const middleX = (lowX + highX) / 2
            const middleY = (lowY + highY) / 2
            const candidate = this.getMovePreview({
                zones: params.zones,
                deltaX: middleX,
                deltaY: middleY,
                doors: params.doors,
                geometryDependencies: params.geometryDependencies,
                blockedZoneCollisionMessage: params.blockedZoneCollisionMessage,
                blockedDoorBetweenMessage: params.blockedDoorBetweenMessage,
                blockedEntranceDoorMessage: params.blockedEntranceDoorMessage,
                newZoneTitle: params.newZoneTitle,
                shouldBuildBlockedPreview: false
            })

            if (candidate.zones) {
                lowX = middleX
                lowY = middleY
                nearestValid = candidate
                continue
            }

            highX = middleX
            highY = middleY
        }

        const rawBlockedPreview = this.getMovePreview({
            zones: params.zones,
            deltaX: highX,
            deltaY: highY,
            doors: params.doors,
            geometryDependencies: params.geometryDependencies,
            blockedZoneCollisionMessage: params.blockedZoneCollisionMessage,
            blockedDoorBetweenMessage: params.blockedDoorBetweenMessage,
            blockedEntranceDoorMessage: params.blockedEntranceDoorMessage,
            newZoneTitle: params.newZoneTitle,
            shouldBuildBlockedPreview: true
        }).blockedGeometryPreview

        const blockedPreview = this.withFallbackPositioningZones(
            rawBlockedPreview,
            nearestValid.zones
        )

        return nearestValid.zones
            ? {
                zones: nearestValid.zones,
                blockedGeometryPreview: blockedPreview,
                lastValidDeltaX: lowX,
                lastValidDeltaY: lowY
            }
            : null
    }

    public getMoveCommitPayload(params: {
        zone: ZoneMapItem
        previewZones: ZoneMapItem[] | null
        startX: number
        startY: number
    }) {
        const zone = params.previewZones?.find((item) => item.zone_id === params.zone.zone_id)

        if (!zone) return null

        const payload = {
            x_coordinate: Math.round(zone.x_coordinate),
            y_coordinate: Math.round(zone.y_coordinate)
        }

        const hasChanged =
            Math.abs(payload.x_coordinate - params.startX) >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_COMMIT_DELTA
            || Math.abs(payload.y_coordinate - params.startY) >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_COMMIT_DELTA

        return hasChanged
            ? {
                zoneId: zone.zone_id,
                payload
            }
            : null
    }

    public getResizeCommitPayload(params: {
        zone: ZoneMapItem
        previewZones: ZoneMapItem[] | null
        startX: number
        startY: number
        startWidth: number
        startHeight: number
    }) {
        const zone = params.previewZones?.find((item) => item.zone_id === params.zone.zone_id)

        if (!zone) return null

        const payload = {
            x_coordinate: Math.round(zone.x_coordinate),
            y_coordinate: Math.round(zone.y_coordinate),
            width: Math.max(BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE, Math.round(zone.width)),
            height: Math.max(BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE, Math.round(zone.height))
        }

        const hasChanged =
            Math.abs(payload.x_coordinate - params.startX) >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_COMMIT_DELTA
            || Math.abs(payload.y_coordinate - params.startY) >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_COMMIT_DELTA
            || Math.abs(payload.width - params.startWidth) >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_COMMIT_DELTA
            || Math.abs(payload.height - params.startHeight) >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_COMMIT_DELTA

        return hasChanged
            ? {
                zoneId: zone.zone_id,
                payload,
                zones: params.previewZones?.map((item) => ({...item})) || []
            }
            : null
    }

    private doRangesOverlap(
        firstStart: number,
        firstEnd: number,
        secondStart: number,
        secondEnd: number
    ) {
        return firstStart < secondEnd - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            && secondStart < firstEnd - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
    }

    private isSameFloorResizeScope(first: ZoneMapItem, second: ZoneMapItem) {
        return first.floor_id === second.floor_id
            || first.is_transition_between_floors
            || second.is_transition_between_floors
    }

    private getResizeMovedZoneIds(params: {
        targetZoneId: number
        edge: BuildingMapResizeEdge
        zones: ZoneMapItem[]
        doors: DoorMapItem[]
        coordinatesMap: Map<number, BuildingMapRectangle>
    }) {
        const movedZoneIds = new Set<number>()

        if (params.edge.includes('left')) {
            this.findZonesByPosition(
                params.targetZoneId,
                this.getPositionPredicate('x'),
                params.zones,
                params.doors,
                params.coordinatesMap
            ).forEach((zone) => movedZoneIds.add(zone.zone_id))
        }

        if (params.edge.includes('right')) {
            this.findZonesByPosition(
                params.targetZoneId,
                this.getPositionPredicate('width'),
                params.zones,
                params.doors,
                params.coordinatesMap
            ).forEach((zone) => movedZoneIds.add(zone.zone_id))
        }

        if (params.edge.includes('top')) {
            this.findZonesByPosition(
                params.targetZoneId,
                this.getPositionPredicate('y'),
                params.zones,
                params.doors,
                params.coordinatesMap
            ).forEach((zone) => movedZoneIds.add(zone.zone_id))
        }

        if (params.edge.includes('bottom')) {
            this.findZonesByPosition(
                params.targetZoneId,
                this.getPositionPredicate('height'),
                params.zones,
                params.doors,
                params.coordinatesMap
            ).forEach((zone) => movedZoneIds.add(zone.zone_id))
        }

        return movedZoneIds
    }

    private constrainResizeToNeighbourZones(params: {
        zone: ZoneMapItem
        edge: BuildingMapResizeEdge
        rect: BuildingMapRectangle
        zones: ZoneMapItem[]
        doors: DoorMapItem[]
        coordinatesMap: Map<number, BuildingMapRectangle>
    }) {
        const movedZoneIds = this.getResizeMovedZoneIds({
            targetZoneId: params.zone.zone_id,
            edge: params.edge,
            zones: params.zones,
            doors: params.doors,
            coordinatesMap: params.coordinatesMap
        })

        let left = params.rect.x
        let top = params.rect.y
        let right = params.rect.x + params.rect.width
        let bottom = params.rect.y + params.rect.height

        const originalLeft = params.zone.x_coordinate
        const originalTop = params.zone.y_coordinate
        const originalRight = params.zone.x_coordinate + params.zone.width
        const originalBottom = params.zone.y_coordinate + params.zone.height
        const blockingZoneIds = new Set<number>()

        for (const zone of params.zones) {
            if (zone.zone_id === params.zone.zone_id) continue
            if (movedZoneIds.has(zone.zone_id)) continue
            if (!this.isSameFloorResizeScope(params.zone, zone)) continue

            const blocker = params.coordinatesMap.get(zone.zone_id)
            if (!blocker) continue

            const blockerLeft = blocker.x
            const blockerTop = blocker.y
            const blockerRight = blocker.x + blocker.width
            const blockerBottom = blocker.y + blocker.height

            if (
                params.edge.includes('right')
                && blockerLeft >= originalRight - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                && this.doRangesOverlap(top, bottom, blockerTop, blockerBottom)
            ) {
                if (right > blockerLeft) {
                    blockingZoneIds.add(zone.zone_id)
                }

                right = Math.min(right, blockerLeft)
            }

            if (
                params.edge.includes('left')
                && blockerRight <= originalLeft + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                && this.doRangesOverlap(top, bottom, blockerTop, blockerBottom)
            ) {
                if (left < blockerRight) {
                    blockingZoneIds.add(zone.zone_id)
                }

                left = Math.max(left, blockerRight)
            }

            if (
                params.edge.includes('bottom')
                && blockerTop >= originalBottom - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                && this.doRangesOverlap(left, right, blockerLeft, blockerRight)
            ) {
                if (bottom > blockerTop) {
                    blockingZoneIds.add(zone.zone_id)
                }

                bottom = Math.min(bottom, blockerTop)
            }

            if (
                params.edge.includes('top')
                && blockerBottom <= originalTop + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                && this.doRangesOverlap(left, right, blockerLeft, blockerRight)
            ) {
                if (top < blockerBottom) {
                    blockingZoneIds.add(zone.zone_id)
                }

                top = Math.max(top, blockerBottom)
            }
        }

        if (right - left < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) {
            if (params.edge.includes('left')) {
                left = right - BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
            } else {
                right = left + BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
            }
        }

        if (bottom - top < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) {
            if (params.edge.includes('top')) {
                top = bottom - BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
            } else {
                bottom = top + BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
            }
        }

        return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top,
            blockingZoneIds: [...blockingZoneIds]
        }
    }

    public getResizePreview(params: {
        zone: ZoneMapItem
        edge: BuildingMapResizeEdge
        deltaX: number
        deltaY: number
        zones: ZoneMapItem[]
        doors: DoorMapItem[]
        geometryDependencies: GeometryDependencies | null
        blockedZoneCollisionMessage: string
        blockedDoorBetweenMessage: string
        blockedEntranceDoorMessage: string
        newZoneTitle: string
        shouldBuildBlockedPreview: boolean
    }) {
        if (params.deltaX === 0 && params.deltaY === 0) {
            return {
                zones: params.zones.map((item) => ({...item})),
                blockedGeometryPreview: null
            }
        }

        let nextX = params.zone.x_coordinate
        let nextY = params.zone.y_coordinate
        let nextWidth = params.zone.width
        let nextHeight = params.zone.height

        if (params.edge.includes('left')) {
            nextX = params.zone.x_coordinate + params.deltaX
            nextWidth = params.zone.width - params.deltaX
        }

        if (params.edge.includes('right')) {
            nextWidth = params.zone.width + params.deltaX
        }

        if (params.edge.includes('top')) {
            nextY = params.zone.y_coordinate + params.deltaY
            nextHeight = params.zone.height - params.deltaY
        }

        if (params.edge.includes('bottom')) {
            nextHeight = params.zone.height + params.deltaY
        }

        if (nextWidth < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) {
            if (params.edge.includes('left')) {
                nextX -= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE - nextWidth
            }

            nextWidth = BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
        }

        if (nextHeight < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) {
            if (params.edge.includes('top')) {
                nextY -= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE - nextHeight
            }

            nextHeight = BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
        }

        const zones = params.zones.map((item) => ({...item}))
        const coordinatesMap = buildingMapGeometryService.createCoordinatesMap(zones)

        const rawRect = {
            x: nextX,
            y: nextY,
            width: nextWidth,
            height: nextHeight
        }

        const constrainedRect = this.constrainResizeToNeighbourZones({
            zone: params.zone,
            edge: params.edge,
            rect: rawRect,
            zones,
            doors: params.doors,
            coordinatesMap
        })

        const wasConstrained =
            Math.abs(constrainedRect.x - rawRect.x) > BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            || Math.abs(constrainedRect.y - rawRect.y) > BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            || Math.abs(constrainedRect.width - rawRect.width) > BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            || Math.abs(constrainedRect.height - rawRect.height) > BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON

        if (wasConstrained && constrainedRect.blockingZoneIds.length > 0) {
            let constrainedBlockedGeometryPreview: BlockedGeometryPreview | null = null

            if (params.shouldBuildBlockedPreview) {
                const previewZones = params.zones.map((item) => ({...item}))
                const previewCoordinatesMap = buildingMapGeometryService.createCoordinatesMap(previewZones)

                const previewTargetCoords = previewCoordinatesMap.get(params.zone.zone_id)

                if (previewTargetCoords) {
                    previewTargetCoords.x = Math.round(constrainedRect.x)
                    previewTargetCoords.y = Math.round(constrainedRect.y)
                    previewTargetCoords.width = Math.max(
                        BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
                        Math.round(constrainedRect.width)
                    )
                    previewTargetCoords.height = Math.max(
                        BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
                        Math.round(constrainedRect.height)
                    )
                }

                const blockingZone = params.zones.find((zone) =>
                    zone.zone_id === constrainedRect.blockingZoneIds[0]
                )

                const floorId = params.zone.floor_id ?? blockingZone?.floor_id ?? null

                const floor = params.geometryDependencies?.floors.find((item) =>
                    item.floor_id === floorId
                )

                if (blockingZone && floor && previewTargetCoords) {
                    constrainedBlockedGeometryPreview = {
                        floor,
                        zones: previewZones
                            .filter((zone) =>
                                zone.zone_id === params.zone.zone_id ||
                                zone.zone_id === blockingZone.zone_id
                            )
                            .map((zone) => {
                                const coords = previewCoordinatesMap.get(zone.zone_id)

                                return coords
                                    ? {
                                        ...zone,
                                        x_coordinate: coords.x,
                                        y_coordinate: coords.y,
                                        width: coords.width,
                                        height: coords.height
                                    }
                                    : zone
                            }),
                        doors: [],
                        message: params.blockedZoneCollisionMessage
                            .replace('{first}', params.zone.title || params.newZoneTitle)
                            .replace('{second}', blockingZone.title || params.newZoneTitle)
                    }
                }
            }

            return {
                zones: null,
                blockedGeometryPreview: constrainedBlockedGeometryPreview
            }
        }

        nextX = constrainedRect.x
        nextY = constrainedRect.y
        nextWidth = constrainedRect.width
        nextHeight = constrainedRect.height

        const commitNextX = Math.round(nextX)
        const commitNextY = Math.round(nextY)
        const commitNextWidth = Math.max(
            BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
            Math.round(nextWidth)
        )
        const commitNextHeight = Math.max(
            BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
            Math.round(nextHeight)
        )

        const deltas = {
            deltaX: commitNextX - params.zone.x_coordinate,
            deltaY: commitNextY - params.zone.y_coordinate,
            deltaWidth: commitNextWidth - params.zone.width,
            deltaHeight: commitNextHeight - params.zone.height,
            newX: commitNextX,
            newY: commitNextY,
            newWidth: commitNextWidth,
            newHeight: commitNextHeight
        }

        if (!this.applyGeometryChanges(
            params.zone.zone_id,
            deltas,
            zones,
            coordinatesMap,
            params.doors
        )) {
            return {
                zones: null,
                blockedGeometryPreview: null
            }
        }

        const validation = this.isGeometryCandidateValid({
            zones,
            coordinatesMap,
            doors: params.doors,
            geometryDependencies: params.geometryDependencies,
            blockedZoneCollisionMessage: params.blockedZoneCollisionMessage,
            blockedDoorBetweenMessage: params.blockedDoorBetweenMessage,
            blockedEntranceDoorMessage: params.blockedEntranceDoorMessage,
            newZoneTitle: params.newZoneTitle,
            shouldBuildBlockedPreview: params.shouldBuildBlockedPreview
        })

        if (!validation.isValid) {
            return {
                zones: null,
                blockedGeometryPreview: validation.blockedGeometryPreview
            }
        }

        return {
            zones: this.createZonesFromCoordinates(zones, coordinatesMap),
            blockedGeometryPreview: null
        }
    }

    public clampResizeDelta(params: {
        action: {
            zone: ZoneMapItem
            edge: BuildingMapResizeEdge
            lastValidDeltaX: number
            lastValidDeltaY: number
        }
        deltaX: number
        deltaY: number
        zones: ZoneMapItem[]
        doors: DoorMapItem[]
        geometryDependencies: GeometryDependencies | null
        blockedZoneCollisionMessage: string
        blockedDoorBetweenMessage: string
        blockedEntranceDoorMessage: string
        newZoneTitle: string
    }) {
        let lowX = params.action.lastValidDeltaX
        let lowY = params.action.lastValidDeltaY
        let highX = params.deltaX
        let highY = params.deltaY

        let nearestValid = this.getResizePreview({
            zone: params.action.zone,
            edge: params.action.edge,
            deltaX: lowX,
            deltaY: lowY,
            zones: params.zones,
            doors: params.doors,
            geometryDependencies: params.geometryDependencies,
            blockedZoneCollisionMessage: params.blockedZoneCollisionMessage,
            blockedDoorBetweenMessage: params.blockedDoorBetweenMessage,
            blockedEntranceDoorMessage: params.blockedEntranceDoorMessage,
            newZoneTitle: params.newZoneTitle,
            shouldBuildBlockedPreview: false
        })

        for (let index = 0; index < BUILDING_MAP_GEOMETRY_CONSTANTS.RESIZE_CLAMP_ITERATIONS; index += 1) {
            const middleX = (lowX + highX) / 2
            const middleY = (lowY + highY) / 2

            const candidate = this.getResizePreview({
                zone: params.action.zone,
                edge: params.action.edge,
                deltaX: middleX,
                deltaY: middleY,
                zones: params.zones,
                doors: params.doors,
                geometryDependencies: params.geometryDependencies,
                blockedZoneCollisionMessage: params.blockedZoneCollisionMessage,
                blockedDoorBetweenMessage: params.blockedDoorBetweenMessage,
                blockedEntranceDoorMessage: params.blockedEntranceDoorMessage,
                newZoneTitle: params.newZoneTitle,
                shouldBuildBlockedPreview: false
            })

            if (candidate.zones) {
                nearestValid = candidate
                lowX = middleX
                lowY = middleY
            } else {
                highX = middleX
                highY = middleY
            }
        }

        const rawBlockedPreview = this.getResizePreview({
            zone: params.action.zone,
            edge: params.action.edge,
            deltaX: highX,
            deltaY: highY,
            zones: params.zones,
            doors: params.doors,
            geometryDependencies: params.geometryDependencies,
            blockedZoneCollisionMessage: params.blockedZoneCollisionMessage,
            blockedDoorBetweenMessage: params.blockedDoorBetweenMessage,
            blockedEntranceDoorMessage: params.blockedEntranceDoorMessage,
            newZoneTitle: params.newZoneTitle,
            shouldBuildBlockedPreview: true
        }).blockedGeometryPreview

        const blockedPreview = this.withFallbackPositioningZones(
            rawBlockedPreview,
            nearestValid.zones
        )

        return nearestValid.zones
            ? {
                zones: nearestValid.zones,
                blockedGeometryPreview: blockedPreview,
                lastValidDeltaX: lowX,
                lastValidDeltaY: lowY
            }
            : null
    }

    public getBlockedGeometryPreview(params: {
        coordinatesMap: Map<number, BuildingMapRectangle>
        zones: ZoneMapItem[]
        doors: DoorMapItem[]
        geometryDependencies: GeometryDependencies | null
        blockedZoneCollisionMessage: string
        blockedDoorBetweenMessage: string
        blockedEntranceDoorMessage: string
        newZoneTitle: string
    }) {
        return this.buildBlockedPreview(
            params.coordinatesMap,
            params.zones,
            params.doors,
            params.geometryDependencies,
            params.blockedZoneCollisionMessage,
            params.blockedDoorBetweenMessage,
            params.blockedEntranceDoorMessage,
            params.newZoneTitle
        )
    }

    private findConnectedZones(
        zoneId: number,
        zones: ZoneMapItem[],
        doors: DoorMapItem[],
        coordinatesMap: Map<number, BuildingMapRectangle>
    ) {
        const connectedZoneIds = new Set<number>()

        for (const door of doors) {
            if (door.is_entrance || door.zone_from_id === null) continue

            const zoneFromCoords = coordinatesMap.get(door.zone_from_id)
            const zoneToCoords = coordinatesMap.get(door.zone_to_id)

            if (zoneFromCoords && zoneToCoords) {
                const intersection = buildingMapGeometryService.calculateIntersection(
                    zoneFromCoords,
                    zoneToCoords
                )

                if (!intersection.hasIntersection) continue
            }

            if (door.zone_from_id === zoneId) {
                connectedZoneIds.add(door.zone_to_id)
            }

            if (door.zone_to_id === zoneId) {
                connectedZoneIds.add(door.zone_from_id)
            }
        }

        return zones.filter((item) => connectedZoneIds.has(item.zone_id))
    }

    private getPositionPredicate(
        dimension: 'x' | 'y' | 'width' | 'height'
    ) {
        if (dimension === 'x') {
            return (
                target: BuildingMapRectangle,
                zone: BuildingMapRectangle
            ) => zone.x + zone.width <= target.x
        }

        if (dimension === 'width') {
            return (
                target: BuildingMapRectangle,
                zone: BuildingMapRectangle
            ) => zone.x >= target.x + target.width
        }

        if (dimension === 'y') {
            return (
                target: BuildingMapRectangle,
                zone: BuildingMapRectangle
            ) => zone.y + zone.height <= target.y
        }

        return (
            target: BuildingMapRectangle,
            zone: BuildingMapRectangle
        ) => zone.y >= target.y + target.height
    }

    private findZonesByPosition(
        zoneId: number,
        predicate: (targetCoords: BuildingMapRectangle, zoneCoords: BuildingMapRectangle) => boolean,
        zones: ZoneMapItem[],
        doors: DoorMapItem[],
        coordinatesMap: Map<number, BuildingMapRectangle>
    ) {
        const targetCoords = coordinatesMap.get(zoneId)

        if (!targetCoords) return []

        const result: ZoneMapItem[] = []
        const visited = new Set<number>([zoneId])
        const queue: number[] = []

        for (const zone of this.findConnectedZones(
            zoneId,
            zones,
            doors,
            coordinatesMap
        )) {
            const coords = coordinatesMap.get(zone.zone_id)

            if (!coords || !predicate(targetCoords, coords)) continue

            visited.add(zone.zone_id)
            result.push(zone)
            queue.push(zone.zone_id)
        }

        while (queue.length > 0) {
            const currentId = queue.shift()!
            const currentZone = zones.find((zone) => zone.zone_id === currentId)

            for (const zone of this.findConnectedZones(
                currentId,
                zones,
                doors,
                coordinatesMap
            )) {
                if (visited.has(zone.zone_id)) continue

                if (
                    zone.floor_id !== undefined
                    && currentZone?.floor_id !== undefined
                    && zone.floor_id !== currentZone.floor_id
                    && !zone.is_transition_between_floors
                    && !currentZone.is_transition_between_floors
                ) continue

                visited.add(zone.zone_id)
                result.push(zone)
                queue.push(zone.zone_id)
            }
        }

        return result
    }

    private applyCoordinateChange(
        zoneId: number,
        dimension: 'x' | 'y' | 'width' | 'height',
        delta: number,
        zones: ZoneMapItem[],
        doors: DoorMapItem[],
        coordinatesMap: Map<number, BuildingMapRectangle>
    ) {
        const predicate = this.getPositionPredicate(dimension)
        const affectedZones = this.findZonesByPosition(
            zoneId,
            predicate,
            zones,
            doors,
            coordinatesMap
        )

        for (const zone of affectedZones) {
            const coords = coordinatesMap.get(zone.zone_id)

            if (!coords) continue

            if (dimension === 'x' || dimension === 'width') {
                coords.x += delta
            } else {
                coords.y += delta
            }
        }
    }

    private applyGeometryChanges(
        targetZoneId: number,
        deltas: {
            deltaX: number
            deltaY: number
            deltaWidth: number
            deltaHeight: number
            newX: number
            newY: number
            newWidth: number
            newHeight: number
        },
        zones: ZoneMapItem[],
        coordinatesMap: Map<number, BuildingMapRectangle>,
        doors: DoorMapItem[]
    ) {
        const targetCoords = coordinatesMap.get(targetZoneId)

        if (!targetCoords) return false

        if (deltas.deltaX !== 0) {
            this.applyCoordinateChange(
                targetZoneId,
                'x',
                deltas.deltaX,
                zones,
                doors,
                coordinatesMap
            )
            targetCoords.x = deltas.newX
        }

        if (deltas.deltaWidth !== 0) {
            this.applyCoordinateChange(
                targetZoneId,
                'width',
                deltas.deltaWidth,
                zones,
                doors,
                coordinatesMap
            )
            targetCoords.width = deltas.newWidth
        }

        if (deltas.deltaY !== 0) {
            this.applyCoordinateChange(
                targetZoneId,
                'y',
                deltas.deltaY,
                zones,
                doors,
                coordinatesMap
            )
            targetCoords.y = deltas.newY
        }

        if (deltas.deltaHeight !== 0) {
            this.applyCoordinateChange(
                targetZoneId,
                'height',
                deltas.deltaHeight,
                zones,
                doors,
                coordinatesMap
            )
            targetCoords.height = deltas.newHeight
        }

        return true
    }

    private groupDoorsByZonePair(
        doorsSource: DoorMapItem[]
    ) {
        const map = new Map<string, DoorMapItem[]>()

        for (const door of doorsSource) {
            if (door.is_entrance || door.zone_from_id === null) continue

            const pairKey = [door.zone_from_id, door.zone_to_id]
                .sort((first, second) => first - second)
                .join('-')

            map.set(pairKey, [
                ...(map.get(pairKey) || []),
                door
            ])
        }

        return map
    }

    private createDisconnectPreviewZones(
        zones: ZoneMapItem[],
        coordinatesMap: Map<number, BuildingMapRectangle>,
        zoneFromId: number,
        zoneToId: number
    ) {
        return zones
            .filter((zone) => zone.zone_id === zoneFromId || zone.zone_id === zoneToId)
            .map((zone) => {
                const coords = coordinatesMap.get(zone.zone_id)

                return coords
                    ? {
                        ...zone,
                        x_coordinate: coords.x,
                        y_coordinate: coords.y,
                        width: coords.width,
                        height: coords.height
                    }
                    : zone
            })
    }

    private createEntrancePreviewZones(
        zones: ZoneMapItem[],
        coordinatesMap: Map<number, BuildingMapRectangle>,
        zoneToId: number,
        blockingZoneId: number
    ) {
        return this.createDisconnectPreviewZones(
            zones,
            coordinatesMap,
            zoneToId,
            blockingZoneId
        )
    }

    private withFallbackPositioningZones(
        preview: BlockedGeometryPreview | null,
        fallbackZones: ZoneMapItem[] | null
    ) {
        if (!preview || !fallbackZones) return preview

        const fallbackZonesById = new Map(
            fallbackZones.map((zone) => [zone.zone_id, zone])
        )

        const fixedPreviewZones = preview.zones.map((zone) => {
            const fallbackZone = fallbackZonesById.get(zone.zone_id)

            return fallbackZone
                ? {
                    ...zone,
                    x_coordinate: fallbackZone.x_coordinate,
                    y_coordinate: fallbackZone.y_coordinate,
                    width: fallbackZone.width,
                    height: fallbackZone.height
                }
                : zone
        })

        const entranceDoor = preview.doors.find((door) =>
            door.is_entrance && door.entrance_door_side
        )

        if (!entranceDoor) {
            return {
                ...preview,
                zones: fixedPreviewZones
            }
        }

        const fallbackEntranceZone = fallbackZones.find((zone) =>
            zone.zone_id === entranceDoor.zone_to_id
        )

        if (!fallbackEntranceZone) {
            return {
                ...preview,
                zones: fixedPreviewZones
            }
        }

        return {
            ...preview,
            zones: fixedPreviewZones,
            fallbackPositioningZones: fallbackZones.filter((zone) =>
                this.isZoneInEntranceDoorScope(
                    zone,
                    fallbackEntranceZone,
                    entranceDoor.floor_id
                )
            )
        }
    }

    private buildBlockedPreview(
        coordinatesMap: Map<number, BuildingMapRectangle>,
        zones: ZoneMapItem[],
        doors: DoorMapItem[],
        geometryDependencies: GeometryDependencies | null,
        blockedZoneCollisionMessage: string,
        blockedDoorBetweenMessage: string,
        blockedEntranceDoorMessage: string,
        newZoneTitle: string
    ): BlockedGeometryPreview | null {
        for (let firstIndex = 0; firstIndex < zones.length; firstIndex += 1) {
            for (let secondIndex = firstIndex + 1; secondIndex < zones.length; secondIndex += 1) {
                const first = zones[firstIndex]
                const second = zones[secondIndex]
                const sameFloorScope = first.floor_id === second.floor_id
                    || first.is_transition_between_floors
                    || second.is_transition_between_floors

                if (!sameFloorScope) continue

                const firstCoords = coordinatesMap.get(first.zone_id)
                const secondCoords = coordinatesMap.get(second.zone_id)

                if (!firstCoords || !secondCoords || !buildingMapGeometryService.checkOverlap(firstCoords, secondCoords)) {
                    continue
                }

                const floorId = first.floor_id ?? second.floor_id
                const floor = geometryDependencies?.floors.find((item) => item.floor_id === floorId)

                if (!floor) continue

                return {
                    floor,
                    zones: this.createDisconnectPreviewZones(
                        zones,
                        coordinatesMap,
                        first.zone_id,
                        second.zone_id
                    ),
                    doors: [],
                    message: blockedZoneCollisionMessage
                        .replace('{first}', first.title || newZoneTitle)
                        .replace('{second}', second.title || newZoneTitle)
                }
            }
        }

        for (const [, regularDoors] of this.groupDoorsByZonePair(doors)) {
            const firstDoor = regularDoors[0]

            if (firstDoor.zone_from_id === null) continue

            const zoneFromCoords = coordinatesMap.get(firstDoor.zone_from_id)
            const zoneToCoords = coordinatesMap.get(firstDoor.zone_to_id)

            if (!zoneFromCoords || !zoneToCoords) continue

            const intersection = buildingMapGeometryService.calculateIntersection(
                zoneFromCoords,
                zoneToCoords
            )
            const originalZoneFrom = zones.find((zone) => zone.zone_id === firstDoor.zone_from_id)
            const originalZoneTo = zones.find((zone) => zone.zone_id === firstDoor.zone_to_id)
            const originalIntersection = originalZoneFrom && originalZoneTo
                ? buildingMapGeometryService.calculateIntersection(
                    buildingMapGeometryService.toRectangle(originalZoneFrom),
                    buildingMapGeometryService.toRectangle(originalZoneTo)
                )
                : null

            if (
                intersection.hasIntersection
                && (
                    !originalIntersection?.hasIntersection
                    || originalIntersection.side === null
                    || intersection.side === originalIntersection.side
                )
                && intersection.intersectionLength + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                >= buildingMapEntranceDoorPlacementContextService.getRegularDoorsRequiredLength(regularDoors.length)
            ) continue

            const zoneFrom = zones.find((zone) => zone.zone_id === firstDoor.zone_from_id)
            const zoneTo = zones.find((zone) => zone.zone_id === firstDoor.zone_to_id)
            const floorId = zoneTo?.floor_id ?? zoneFrom?.floor_id

            if (floorId === null || floorId === undefined) continue

            const floor = geometryDependencies?.floors.find((item) => item.floor_id === floorId)

            if (!floor) continue

            return {
                floor,
                zones: this.createDisconnectPreviewZones(
                    zones,
                    coordinatesMap,
                    firstDoor.zone_from_id,
                    firstDoor.zone_to_id
                ),
                doors: regularDoors,
                highlightedDoorId: firstDoor.door_id,
                highlightedDoorIds: regularDoors.map((door) => door.door_id),
                message: blockedDoorBetweenMessage
                    .replace('{first}', zoneFrom?.title || newZoneTitle)
                    .replace('{second}', zoneTo?.title || newZoneTitle)
            }
        }

        for (const door of doors.filter((item) => item.is_entrance && item.entrance_door_side)) {
            const projectedZones = this.createZonesFromCoordinates(zones, coordinatesMap)
            const zoneTo = projectedZones.find((zone) => zone.zone_id === door.zone_to_id)
            const zoneCoords = coordinatesMap.get(door.zone_to_id)

            if (!zoneTo || !zoneCoords || !door.entrance_door_side) continue

            const sameSideDoors = doors.filter((item) =>
                item.is_entrance
                && item.zone_to_id === door.zone_to_id
                && item.entrance_door_side === door.entrance_door_side
                && item.floor_id === door.floor_id
            )

            const blockingZones: ZoneMapItem[] = []

            for (const otherZone of zones) {
                if (otherZone.zone_id === zoneTo.zone_id) continue
                if (!otherZone.is_transition_between_floors && otherZone.floor_id !== door.floor_id) continue

                const otherCoords = coordinatesMap.get(otherZone.zone_id)

                if (
                    !otherCoords
                    || buildingMapEntranceDoorPlacementContextService.getEntranceDoorBlockedSegmentsForZone(
                        zoneCoords,
                        otherCoords,
                        door.entrance_door_side,
                        BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
                        false
                    ).length === 0
                ) continue

                blockingZones.push(otherZone)
            }

            const freeSegments = buildingMapEntranceDoorPlacementContextService.getEntranceDoorAuraAwareFreeSegments(
                zoneTo,
                door.entrance_door_side,
                door.floor_id,
                projectedZones,
                true
            )

            if (buildingMapEntranceDoorPlacementContextService.canRelocateEntranceDoors(
                freeSegments,
                sameSideDoors.length
            )) continue

            const floor = geometryDependencies?.floors.find((item) => item.floor_id === door.floor_id)

            if (!floor) continue

            const previewZones = this.createEntrancePreviewZones(
                zones,
                coordinatesMap,
                door.zone_to_id,
                blockingZones[0]?.zone_id || door.zone_to_id
            )

            const positioningZones = projectedZones.filter((zone) =>
                this.isZoneInEntranceDoorScope(zone, zoneTo, door.floor_id)
            )

            const fallbackPositioningZones = zones.filter((zone) =>
                this.isZoneInEntranceDoorScope(zone, zoneTo, door.floor_id)
            )

            return {
                floor,
                zones: previewZones,
                positioningZones,
                fallbackPositioningZones,
                doors: sameSideDoors,
                highlightedDoorId: door.door_id,
                highlightedDoorIds: sameSideDoors.map((item) => item.door_id),
                message: blockedEntranceDoorMessage.replace('{zone}', zoneTo.title)
            }
        }

        return null
    }

    private isZoneInEntranceDoorScope(
        zone: ZoneMapItem,
        entranceZone: ZoneMapItem,
        floorId: number
    ) {
        return zone.floor_id === floorId
            || zone.is_transition_between_floors
            || entranceZone.is_transition_between_floors
    }

    private shouldValidateEntranceDoorGroupAfterZoneChange(
        entranceZone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        doorsCount: number,
        changedZoneIds: Set<number>,
        zones: ZoneMapItem[]
    ) {
        if (changedZoneIds.has(entranceZone.zone_id)) return true

        const changedZonesInSameScope = zones.filter((zone) =>
            changedZoneIds.has(zone.zone_id)
            && zone.zone_id !== entranceZone.zone_id
            && this.isZoneInEntranceDoorScope(zone, entranceZone, floorId)
        )

        if (changedZonesInSameScope.length === 0) return false

        const auraBand = buildingMapEntranceDoorPlacementContextService.getEntranceDoorAuraBandForRender(
            entranceZone,
            side,
            floorId,
            doorsCount,
            zones
        )

        if (!auraBand) return true

        const auraRectangle = buildingMapEntranceDoorPlacementContextService.getEntranceDoorAuraRectangle(
            buildingMapGeometryService.toRectangle(entranceZone),
            side,
            auraBand,
            BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE
        )

        return changedZonesInSameScope.some((zone) =>
            buildingMapGeometryService.checkOverlap(
                buildingMapGeometryService.toRectangle(zone),
                auraRectangle
            )
        )
    }

    private isGeometryCandidateValid(params: {
        zones: ZoneMapItem[]
        coordinatesMap: Map<number, BuildingMapRectangle>
        doors: DoorMapItem[]
        geometryDependencies: GeometryDependencies | null
        blockedZoneCollisionMessage: string
        blockedDoorBetweenMessage: string
        blockedEntranceDoorMessage: string
        newZoneTitle: string
        shouldBuildBlockedPreview: boolean
    }) {
        let zonesOk = true

        for (let firstIndex = 0; firstIndex < params.zones.length; firstIndex += 1) {
            for (let secondIndex = firstIndex + 1; secondIndex < params.zones.length; secondIndex += 1) {
                const first = params.zones[firstIndex]
                const second = params.zones[secondIndex]

                const sameFloorScope = first.floor_id === second.floor_id
                    || first.is_transition_between_floors
                    || second.is_transition_between_floors

                if (!sameFloorScope) continue

                const firstCoords = params.coordinatesMap.get(first.zone_id)
                const secondCoords = params.coordinatesMap.get(second.zone_id)

                if (
                    firstCoords
                    && secondCoords
                    && buildingMapGeometryService.checkOverlap(firstCoords, secondCoords)
                ) {
                    zonesOk = false
                    break
                }
            }

            if (!zonesOk) break
        }

        let doorsOk = true

        for (const [, doors] of this.groupDoorsByZonePair(params.doors)) {
            const firstDoor = doors[0]

            if (firstDoor.zone_from_id === null) continue

            const zoneFromCoords = params.coordinatesMap.get(firstDoor.zone_from_id)
            const zoneToCoords = params.coordinatesMap.get(firstDoor.zone_to_id)

            if (!zoneFromCoords || !zoneToCoords) continue

            const intersection = buildingMapGeometryService.calculateIntersection(
                zoneFromCoords,
                zoneToCoords
            )
            const originalZoneFrom = params.zones.find((zone) => zone.zone_id === firstDoor.zone_from_id)
            const originalZoneTo = params.zones.find((zone) => zone.zone_id === firstDoor.zone_to_id)
            const originalIntersection = originalZoneFrom && originalZoneTo
                ? buildingMapGeometryService.calculateIntersection(
                    buildingMapGeometryService.toRectangle(originalZoneFrom),
                    buildingMapGeometryService.toRectangle(originalZoneTo)
                )
                : null

            if (
                !intersection.hasIntersection
                || (
                    originalIntersection?.hasIntersection
                    && originalIntersection.side !== null
                    && intersection.side !== originalIntersection.side
                )
                || intersection.intersectionLength + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                < buildingMapEntranceDoorPlacementContextService.getRegularDoorsRequiredLength(doors.length)
            ) {
                doorsOk = false
                break
            }
        }

        let entrancesOk = true
        const entranceDoors = params.doors.filter((door) => door.is_entrance)
        const changedZoneIds = buildingMapGeometryService.getChangedZoneIds(
            params.zones,
            params.coordinatesMap
        )

        const projectedZones = this.createZonesFromCoordinates(
            params.zones,
            params.coordinatesMap
        )

        const checkedEntranceGroups = new Set<string>()

        for (const door of entranceDoors) {
            if (!door.entrance_door_side) continue

            const key = `${door.zone_to_id}:${door.floor_id}:${door.entrance_door_side}`

            if (checkedEntranceGroups.has(key)) continue

            checkedEntranceGroups.add(key)

            const zoneTo = projectedZones.find((zone) => zone.zone_id === door.zone_to_id)

            if (!zoneTo) continue

            const sameSideDoors = entranceDoors.filter((item) =>
                item.zone_to_id === door.zone_to_id
                && item.entrance_door_side === door.entrance_door_side
                && item.floor_id === door.floor_id
            )

            const shouldValidateGroup = this.shouldValidateEntranceDoorGroupAfterZoneChange(
                zoneTo,
                door.entrance_door_side,
                door.floor_id,
                sameSideDoors.length,
                changedZoneIds,
                projectedZones
            )

            if (!shouldValidateGroup) continue

            const placementGroups = buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForZones(
                zoneTo,
                door.entrance_door_side,
                door.floor_id,
                projectedZones,
                sameSideDoors.length
            )

            if (placementGroups.length === 0) {
                entrancesOk = false
                break
            }
        }

        const isValid = zonesOk && doorsOk && entrancesOk

        return {
            isValid,
            blockedGeometryPreview: !isValid && params.shouldBuildBlockedPreview
                ? this.buildBlockedPreview(
                    params.coordinatesMap,
                    params.zones,
                    params.doors,
                    params.geometryDependencies,
                    params.blockedZoneCollisionMessage,
                    params.blockedDoorBetweenMessage,
                    params.blockedEntranceDoorMessage,
                    params.newZoneTitle
                )
                : null
        }
    }

    private createZonesFromCoordinates(
        zones: ZoneMapItem[],
        coordinatesMap: Map<number, BuildingMapRectangle>
    ) {
        return zones.map((item) => {
            const coords = coordinatesMap.get(item.zone_id)

            return coords
                ? {
                    ...item,
                    x_coordinate: coords.x,
                    y_coordinate: coords.y,
                    width: coords.width,
                    height: coords.height
                }
                : item
        })
    }
}

export const buildingMapZoneTransformService = new BuildingMapZoneTransformService()
