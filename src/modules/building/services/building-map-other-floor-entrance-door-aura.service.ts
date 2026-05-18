import {BUILDING_MAP_DOOR_CONSTANTS} from '@/modules/building/constants/building-map-door.constants'
import {BUILDING_MAP_GEOMETRY_CONSTANTS} from '@/modules/building/constants/building-map-geometry.constants'
import {buildingMapAddHandleService} from '@/modules/building/services/building-map-add-handle.service'
import {buildingMapEntranceDoorPlacementContextService} from '@/modules/building/services/building-map-entrance-door-placement-context.service'
import {buildingMapFreeSideSliceService} from '@/modules/building/services/building-map-free-side-slice.service'
import {buildingMapGeometryService} from '@/modules/building/services/building-map-geometry.service'
import {buildingMapSideService} from '@/modules/building/services/building-map-side.service'
import {buildingMapTransitionService} from '@/modules/building/services/building-map-transition.service'
import type {BuildingMapEntranceDoorCheck} from '@/modules/building/interfaces/building-map-entrance-door-check.interface'
import type {BuildingMapRectangle} from '@/modules/building/interfaces/building-map-rectangle.interface'
import type {BuildingMapSegment} from '@/modules/building/interfaces/building-map-segment.interface'
import type {BuildingMapTransitionSegment} from '@/modules/building/interfaces/building-map-transition-segment.interface'
import type {DoorMapItem} from '@/modules/building/interfaces/door-map-item.interface'
import type {ZoneMapItem} from '@/modules/building/interfaces/zone-map-item.interface'

class BuildingMapOtherFloorEntranceDoorAuraService {
    public getOtherFloorEntranceDoorChecks(
        sourceZones: ZoneMapItem[],
        sourceDoors: DoorMapItem[],
        currentFloorId: number
    ): BuildingMapEntranceDoorCheck[] {
        const zonesById = new Map(sourceZones.map((zone) => [zone.zone_id, zone]))

        const checks = new Map<string, BuildingMapEntranceDoorCheck>()

        for (const door of sourceDoors) {
            if (
                !door.is_entrance
                || !door.entrance_door_side
                || door.floor_id === currentFloorId
            ) continue

            const zone = zonesById.get(door.zone_to_id)
            if (!zone) continue

            const key = `${zone.zone_id}:${door.floor_id}:${door.entrance_door_side}`
            const existing = checks.get(key)

            if (existing) {
                existing.doorsCount += 1
                continue
            }

            checks.set(key, {
                zone,
                side: door.entrance_door_side,
                floorId: door.floor_id,
                doorsCount: 1
            })
        }

        return [...checks.values()]
    }

    public doesTransitionCandidateOverlapOtherFloorProjectedEntranceDoorAura(params: {
        sourceZone: ZoneMapItem
        sourceSide: 'left' | 'right' | 'top' | 'bottom'
        addSegment: BuildingMapSegment
        candidateRectangle: BuildingMapRectangle
        sourceZones: ZoneMapItem[]
        sourceDoors: DoorMapItem[]
        otherFloorEntranceDoorChecks: BuildingMapEntranceDoorCheck[]
    }) {
        const connectionRectangle = buildingMapAddHandleService.getConnectionRectangle(
            params.sourceZone,
            params.sourceSide,
            params.addSegment
        )

        for (const check of params.otherFloorEntranceDoorChecks) {
            if (
                check.side !== params.sourceSide
                || buildingMapEntranceDoorPlacementContextService.getEntranceDoorBlockedSegmentsForZone(
                    buildingMapGeometryService.toRectangle(check.zone),
                    params.candidateRectangle,
                    check.side,
                    BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
                    true
                ).length === 0
            ) continue

            const projectedPlacementGroups = buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForCandidate(
                check.zone,
                check.side,
                check.floorId,
                params.candidateRectangle,
                params.sourceZones,
                params.sourceDoors,
                check.doorsCount
            )

            if (projectedPlacementGroups.length === 0) {
                const currentPlacementGroups = buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForZones(
                    check.zone,
                    check.side,
                    check.floorId,
                    params.sourceZones,
                    check.doorsCount
                )

                const currentAuraRectangles = buildingMapEntranceDoorPlacementContextService.getEntranceDoorAuraRectanglesFromPlacementGroups(
                    check.zone,
                    check.side,
                    currentPlacementGroups
                )

                const currentAuraTouchesCandidate = currentAuraRectangles.some((auraRectangle) =>
                    buildingMapGeometryService.checkOverlap(params.candidateRectangle, auraRectangle)
                    || buildingMapGeometryService.checkOverlap(connectionRectangle, auraRectangle)
                )

                if (currentAuraTouchesCandidate) return true

                continue
            }

            const projectedAuraRectangles = buildingMapEntranceDoorPlacementContextService.getEntranceDoorAuraRectanglesFromPlacementGroups(
                check.zone,
                check.side,
                projectedPlacementGroups
            )

            const projectedAuraTouchesCandidate = projectedAuraRectangles.some((auraRectangle) =>
                buildingMapGeometryService.checkOverlap(params.candidateRectangle, auraRectangle)
                || buildingMapGeometryService.checkOverlap(connectionRectangle, auraRectangle)
            )

            if (projectedAuraTouchesCandidate) return true
        }

        return false
    }

    public getOtherFloorEntranceDoorAuraAdjustedTransitionSegments(params: {
        sourceZone: ZoneMapItem
        sourceSide: 'left' | 'right' | 'top' | 'bottom'
        transitionSegments: BuildingMapTransitionSegment[]
        candidateRect: BuildingMapRectangle
        sourceZones: ZoneMapItem[]
        sourceDoors: DoorMapItem[]
        otherFloorEntranceDoorChecks: BuildingMapEntranceDoorCheck[]
        preferredCoordinate?: number | null
    }) {
        const auraRectangles: BuildingMapRectangle[] = []
        const transitionCandidateRect = buildingMapTransitionService.getTransitionSegmentsBoundingRectangle(
            params.sourceZone,
            params.sourceSide,
            params.transitionSegments
        )

        for (const check of params.otherFloorEntranceDoorChecks) {
            const normalPlacementGroups = buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForZones(
                check.zone,
                check.side,
                check.floorId,
                params.sourceZones,
                check.doorsCount
            )

            const normalAuraRectangles = buildingMapEntranceDoorPlacementContextService.getEntranceDoorAuraRectanglesFromPlacementGroups(
                check.zone,
                check.side,
                normalPlacementGroups
            )

            const doesCandidateTouchNormalAura = normalAuraRectangles.some((auraRectangle) =>
                transitionCandidateRect !== null
                && buildingMapGeometryService.checkOverlap(transitionCandidateRect, auraRectangle)
            )

            const shouldProjectDoorPlacement =
                transitionCandidateRect !== null
                && (
                    doesCandidateTouchNormalAura
                    || buildingMapEntranceDoorPlacementContextService.getEntranceDoorBlockedSegmentsForZone(
                        buildingMapGeometryService.toRectangle(check.zone),
                        transitionCandidateRect,
                        check.side,
                        BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
                        true
                    ).length > 0
                )

            const preferredProjectedPlacementGroups =
                shouldProjectDoorPlacement && params.preferredCoordinate !== null && params.preferredCoordinate !== undefined
                    ? buildingMapEntranceDoorPlacementContextService.getBestOtherFloorEntranceDoorPlacementGroupsForTransition(
                        check.zone,
                        check.side,
                        check.floorId,
                        params.sourceZone,
                        params.sourceSide,
                        params.transitionSegments,
                        params.sourceZones,
                        check.doorsCount,
                        params.preferredCoordinate
                    )
                    : []

            const hardProjectedPlacementGroups =
                shouldProjectDoorPlacement && preferredProjectedPlacementGroups.length === 0
                    ? buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForCandidate(
                        check.zone,
                        check.side,
                        check.floorId,
                        transitionCandidateRect ?? params.candidateRect,
                        params.sourceZones,
                        params.sourceDoors,
                        check.doorsCount,
                        true,
                        true
                    )
                    : []

            const softProjectedPlacementGroups =
                shouldProjectDoorPlacement
                && hardProjectedPlacementGroups.length === 0
                    ? buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForCandidate(
                        check.zone,
                        check.side,
                        check.floorId,
                        transitionCandidateRect ?? params.candidateRect,
                        params.sourceZones,
                        params.sourceDoors,
                        check.doorsCount,
                        false,
                        true
                    )
                    : []

            const pressureProjectedPlacementGroups =
                shouldProjectDoorPlacement
                && hardProjectedPlacementGroups.length === 0
                && softProjectedPlacementGroups.length === 0
                    ? buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForCandidate(
                        check.zone,
                        check.side,
                        check.floorId,
                        transitionCandidateRect ?? params.candidateRect,
                        params.sourceZones,
                        params.sourceDoors,
                        check.doorsCount,
                        false,
                        false
                    )
                    : []

            const placementGroups = preferredProjectedPlacementGroups.length > 0
                ? preferredProjectedPlacementGroups
                : hardProjectedPlacementGroups.length > 0
                    ? hardProjectedPlacementGroups
                    : softProjectedPlacementGroups.length > 0
                        ? softProjectedPlacementGroups
                        : pressureProjectedPlacementGroups.length > 0
                            ? pressureProjectedPlacementGroups
                            : normalPlacementGroups

            if (placementGroups.length === 0) continue

            auraRectangles.push(
                ...buildingMapEntranceDoorPlacementContextService.getEntranceDoorAuraRectanglesFromPlacementGroups(
                    check.zone,
                    check.side,
                    placementGroups
                )
            )
        }

        const greenCells = new Map<number, number>()
        const blockedCells: BuildingMapSegment[] = []

        for (const transitionSegment of params.transitionSegments) {
            const start = Math.ceil(transitionSegment.start - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
            const end = Math.floor(transitionSegment.end + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)

            for (let cell = start; cell < end; cell += 1) {
                let safeOutward = 0

                for (
                    let depth = transitionSegment.outward;
                    depth >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE;
                    depth -= 1
                ) {
                    const cellRect = buildingMapSideService.getSideSliceRectangle(
                        params.sourceZone,
                        params.sourceSide,
                        cell,
                        cell + 1,
                        depth
                    )

                    const overlapsAura = auraRectangles.some((auraRectangle) =>
                        buildingMapGeometryService.checkOverlap(cellRect, auraRectangle)
                    )

                    if (overlapsAura) continue

                    safeOutward = depth
                    break
                }

                if (safeOutward <= 0) {
                    blockedCells.push({
                        start: cell,
                        end: cell + 1
                    })
                    continue
                }

                const existingOutward = greenCells.get(cell) || 0
                greenCells.set(cell, Math.max(existingOutward, safeOutward))
            }
        }

        const adjustedTransitionSegments: BuildingMapTransitionSegment[] = []

        let cursor = Math.min(
            ...params.transitionSegments.map((segment) =>
                Math.ceil(segment.start - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
            )
        )

        const limit = Math.max(
            ...params.transitionSegments.map((segment) =>
                Math.floor(segment.end + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
            )
        )

        while (cursor < limit) {
            const outwardForCell = greenCells.get(cursor)

            if (!outwardForCell) {
                cursor += 1
                continue
            }

            const start = cursor
            let end = cursor + 1
            let segmentOutward = outwardForCell

            while (end < limit) {
                const nextOutward = greenCells.get(end)

                if (!nextOutward) break

                segmentOutward = Math.min(segmentOutward, nextOutward)
                end += 1
            }

            adjustedTransitionSegments.push({
                start,
                end,
                outward: segmentOutward
            })

            cursor = end
        }

        return {
            transitionSegments: adjustedTransitionSegments,
            blockedSegments: buildingMapFreeSideSliceService.mergeSegments(blockedCells)
        }
    }
}

export const buildingMapOtherFloorEntranceDoorAuraService = new BuildingMapOtherFloorEntranceDoorAuraService()
