import { BUILDING_MAP_GEOMETRY_CONSTANTS } from '@/modules/building/constants/building-map-geometry.constants'
import { BUILDING_MAP_HOVER_CONSTANTS } from '@/modules/building/constants/building-map-hover.constants'
import { buildingMapEntranceDoorPlacementContextService } from '@/modules/building/services/building-map-entrance-door-placement-context.service'
import { buildingMapFreeSideSliceService } from '@/modules/building/services/building-map-free-side-slice.service'
import { buildingMapGeometryService } from '@/modules/building/services/building-map-geometry.service'
import { buildingMapOtherFloorEntranceDoorAuraService } from '@/modules/building/services/building-map-other-floor-entrance-door-aura.service'
import { buildingMapSideService } from '@/modules/building/services/building-map-side.service'
import { buildingMapTransitionService } from '@/modules/building/services/building-map-transition.service'
import type { AddDoorHandle } from '@/modules/building/interfaces/add-door-handle.interface'
import type { AddZoneHandle } from '@/modules/building/interfaces/add-zone-handle.interface'
import type { BuildingMapAddDoorPayload } from '@/modules/building/interfaces/building-map-add-door-payload.interface'
import type { BuildingMapAddZonePayload } from '@/modules/building/interfaces/building-map-add-zone-payload.interface'
import type { BuildingMapEntranceDoorCheck } from '@/modules/building/interfaces/building-map-entrance-door-check.interface'
import type { BuildingMapRectangle } from '@/modules/building/interfaces/building-map-rectangle.interface'
import type { BuildingMapRegularZonePayload } from '@/modules/building/interfaces/building-map-regular-zone-payload.interface'
import type { BuildingMapSegment } from '@/modules/building/interfaces/building-map-segment.interface'
import type { BuildingMapTransitionSegment } from '@/modules/building/interfaces/building-map-transition-segment.interface'
import type { BuildingMapTransitionZonePayload } from '@/modules/building/interfaces/building-map-transition-zone-payload.interface'
import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import {BUILDING_MAP_DOOR_CONSTANTS} from "@/modules/building/constants/building-map-door.constants";

class BuildingMapAddHandleService {
    private readonly epsilon = BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
    private readonly connectionThickness = 0.25

    getHandleCenter(
        side: 'left' | 'right' | 'top' | 'bottom',
        zone: { x_coordinate: number; y_coordinate: number; width: number; height: number },
        segment: BuildingMapSegment
    ) {
        const sideCenter = segment.start + (segment.end - segment.start) / 2
        const offset = BUILDING_MAP_HOVER_CONSTANTS.ADD_HANDLE_EDGE_GAP
            + BUILDING_MAP_HOVER_CONSTANTS.ADD_HANDLE_DEPTH / 2

        const centerX = side === 'left'
            ? zone.x_coordinate - offset
            : side === 'right'
                ? zone.x_coordinate + zone.width + offset
                : sideCenter

        const centerY = side === 'top'
            ? zone.y_coordinate - offset
            : side === 'bottom'
                ? zone.y_coordinate + zone.height + offset
                : sideCenter

        return { centerX, centerY }
    }

    getHandleStyle(
        center: { centerX: number; centerY: number },
        handleSize: number,
        depthCssValue = `calc(${BUILDING_MAP_HOVER_CONSTANTS.ADD_HANDLE_DEPTH} * var(--building-map-unit))`
    ): Record<string, string> {
        return {
            left: `calc(${center.centerX} * var(--building-map-unit))`,
            top: `calc(${center.centerY} * var(--building-map-unit))`,
            '--building-map-add-handle-size': `calc(${handleSize} * var(--building-map-unit))`,
            '--building-map-add-handle-depth': depthCssValue
        }
    }

    getProbeStyle(
        side: 'left' | 'right' | 'top' | 'bottom',
        center: { centerX: number; centerY: number },
        handleSize: number,
        depthCssValue = `calc(${BUILDING_MAP_HOVER_CONSTANTS.ADD_HANDLE_DEPTH} * var(--building-map-unit))`
    ): Record<string, string> {
        return {
            left: `calc(${center.centerX} * var(--building-map-unit))`,
            top: `calc(${center.centerY} * var(--building-map-unit))`,
            width: (side === 'left' || side === 'right')
                ? depthCssValue
                : `calc(${handleSize} * var(--building-map-unit))`,
            height: (side === 'top' || side === 'bottom')
                ? depthCssValue
                : `calc(${handleSize} * var(--building-map-unit))`
        }
    }

    getConnectionRectangle(
        zone: { x_coordinate: number; y_coordinate: number; width: number; height: number },
        side: 'left' | 'right' | 'top' | 'bottom',
        segment: BuildingMapSegment
    ) {
        if (side === 'left') {
            return {
                x: zone.x_coordinate - this.connectionThickness,
                y: segment.start,
                width: this.connectionThickness,
                height: segment.end - segment.start
            }
        }

        if (side === 'right') {
            return {
                x: zone.x_coordinate + zone.width,
                y: segment.start,
                width: this.connectionThickness,
                height: segment.end - segment.start
            }
        }

        if (side === 'top') {
            return {
                x: segment.start,
                y: zone.y_coordinate - this.connectionThickness,
                width: segment.end - segment.start,
                height: this.connectionThickness
            }
        }

        return {
            x: segment.start,
            y: zone.y_coordinate + zone.height,
            width: segment.end - segment.start,
            height: this.connectionThickness
        }
    }

    getCoordinateFromPointer(params: {
        handle: AddZoneHandle
        clientX: number
        clientY: number
        mapRect: DOMRect
        panX: number
        panY: number
        unitSize: number
    }) {
        const mapX = (params.clientX - params.mapRect.left - params.panX) / params.unitSize
        const mapY = (params.clientY - params.mapRect.top - params.panY) / params.unitSize

        return params.handle.side === 'left' || params.handle.side === 'right'
            ? mapY
            : mapX
    }

    resolveHoveredAddHandleState(params: {
        baseHandles: AddZoneHandle[]
        handle: AddZoneHandle
        currentHandle: AddZoneHandle | null
        currentCoordinate: number | null
        nextCoordinate: number
    }) {
        const nextPreferredCoordinate = Number(params.nextCoordinate.toFixed(2))
        const isSameActiveSide =
            params.currentHandle !== null
            && params.currentHandle.zoneId === params.handle.zoneId
            && params.currentHandle.side === params.handle.side
        const shouldKeepCurrentHandle =
            isSameActiveSide
            && params.currentHandle !== null
            && this.doesAddHandleContainCoordinate(params.currentHandle, nextPreferredCoordinate)

        const shiftedHandle: AddZoneHandle | null = isSameActiveSide && params.currentHandle
            ? this.getWholeAddHandleShiftCandidate(
                params.baseHandles,
                params.currentHandle,
                nextPreferredCoordinate
            )
            : null

        const bestHandle = this.getCenteredAddHandleCandidate(
            params.baseHandles,
            params.handle,
            nextPreferredCoordinate
        )
        const bestHandleLength = bestHandle.sliceEnd - bestHandle.sliceStart
        const shiftedHandleLength = shiftedHandle
            ? shiftedHandle.sliceEnd - shiftedHandle.sliceStart
            : 0
        const currentHandleLength = params.currentHandle
            ? params.currentHandle.sliceEnd - params.currentHandle.sliceStart
            : 0

        const nextHandle = shiftedHandle
        && params.currentHandle
        && shiftedHandle.key !== params.currentHandle.key
        && shiftedHandleLength >= bestHandleLength - this.epsilon
            ? shiftedHandle
            : shouldKeepCurrentHandle && currentHandleLength >= bestHandleLength - this.epsilon
                ? params.currentHandle!
                : bestHandle

        return {
            key: nextHandle.key,
            handle: nextHandle,
            coordinate: params.currentCoordinate !== null
            && Math.abs(params.currentCoordinate - nextPreferredCoordinate)
            < BUILDING_MAP_HOVER_CONSTANTS.ADD_HANDLE_COORDINATE_UPDATE_THRESHOLD
                ? params.currentCoordinate
                : nextPreferredCoordinate
        }
    }

    doSegmentsOverlap(
        first: BuildingMapSegment,
        second: BuildingMapSegment
    ) {
        return first.start < second.end - this.epsilon
            && second.start < first.end - this.epsilon
    }

    getHandleTransitionLength(handle: AddZoneHandle) {
        return handle.transitionSegments
            .reduce((total, segment) => total + (segment.end - segment.start), 0)
    }

    doesHandleTransitionContainCoordinate(handle: AddZoneHandle, coordinate: number) {
        return handle.transitionSegments.some((segment) =>
            coordinate >= segment.start - this.epsilon
            && coordinate <= segment.end + this.epsilon
        )
    }

    doesHandleTransitionStrictlyContainCoordinate(handle: AddZoneHandle, coordinate: number) {
        return handle.transitionSegments.some((segment) =>
            coordinate >= segment.start - this.epsilon
            && coordinate < segment.end - this.epsilon
        )
    }

    doTransitionSegmentsStrictlyContainCoordinate(
        transitionSegments: BuildingMapSegment[],
        coordinate: number
    ) {
        return transitionSegments.some((segment) =>
            coordinate >= segment.start - this.epsilon
            && coordinate < segment.end - this.epsilon
        )
    }

    getSegmentDistanceToCoordinate(segment: BuildingMapSegment, coordinate: number) {
        if (
            coordinate >= segment.start - this.epsilon
            && coordinate <= segment.end + this.epsilon
        ) {
            return 0
        }

        return Math.min(
            Math.abs(coordinate - segment.start),
            Math.abs(coordinate - segment.end)
        )
    }

    getHandleTransitionDistanceToCoordinate(handle: AddZoneHandle, coordinate: number) {
        if (handle.transitionSegments.length === 0) {
            return this.getSegmentDistanceToCoordinate(
                {
                    start: handle.sliceStart,
                    end: handle.sliceEnd
                },
                coordinate
            )
        }

        return Math.min(
            ...handle.transitionSegments.map((segment) =>
                this.getSegmentDistanceToCoordinate(segment, coordinate)
            )
        )
    }

    doesCoordinateTouchHandleTransition(handle: AddZoneHandle, coordinate: number) {
        return handle.transitionSegments.some((segment) =>
            coordinate >= segment.start - this.epsilon
            && coordinate <= segment.end + this.epsilon
        )
    }

    getDistanceToHandleTransition(handle: AddZoneHandle, coordinate: number) {
        if (handle.transitionSegments.length === 0) {
            if (
                coordinate >= handle.sliceStart - this.epsilon
                && coordinate <= handle.sliceEnd + this.epsilon
            ) return 0

            return Math.min(
                Math.abs(coordinate - handle.sliceStart),
                Math.abs(coordinate - handle.sliceEnd)
            )
        }

        return Math.min(
            ...handle.transitionSegments.map((segment) => {
                if (
                    coordinate >= segment.start - this.epsilon
                    && coordinate <= segment.end + this.epsilon
                ) return 0

                return Math.min(
                    Math.abs(coordinate - segment.start),
                    Math.abs(coordinate - segment.end)
                )
            })
        )
    }

    isBetterAddHandle(
        candidate: AddZoneHandle,
        current: AddZoneHandle,
        preferredCoordinate: number | null = null
    ) {
        const candidateTransitionLength = this.getHandleTransitionLength(candidate)
        const currentTransitionLength = this.getHandleTransitionLength(current)

        if (!this.isSameCoordinate(candidateTransitionLength, currentTransitionLength)) {
            return candidateTransitionLength > currentTransitionLength
        }

        if (preferredCoordinate !== null) {
            const candidateTouches = this.doesCoordinateTouchHandleTransition(candidate, preferredCoordinate)
            const currentTouches = this.doesCoordinateTouchHandleTransition(current, preferredCoordinate)

            if (candidateTouches !== currentTouches) return candidateTouches

            const candidateDistance = this.getDistanceToHandleTransition(candidate, preferredCoordinate)
            const currentDistance = this.getDistanceToHandleTransition(current, preferredCoordinate)

            if (!this.isSameCoordinate(candidateDistance, currentDistance)) {
                return candidateDistance < currentDistance
            }
        }

        if (preferredCoordinate !== null && candidate.doorPlacementSplitScore !== current.doorPlacementSplitScore) {
            return candidate.doorPlacementSplitScore > current.doorPlacementSplitScore
        }

        const candidateLength = candidate.sliceEnd - candidate.sliceStart
        const currentLength = current.sliceEnd - current.sliceStart

        if (!this.isSameCoordinate(candidateLength, currentLength)) {
            return candidateLength > currentLength
        }

        return candidate.key < current.key
    }

    shouldShiftWholeAddHandleForCoordinate(
        current: AddZoneHandle,
        candidate: AddZoneHandle,
        preferredCoordinate: number
    ) {
        const shiftsForward =
            candidate.sliceStart > current.sliceStart + this.epsilon
            && candidate.sliceEnd > current.sliceEnd + this.epsilon

        if (shiftsForward) {
            return preferredCoordinate >= current.sliceEnd - 1 - this.epsilon
                && preferredCoordinate <= current.sliceEnd + this.epsilon
        }

        const shiftsBackward =
            candidate.sliceStart < current.sliceStart - this.epsilon
            && candidate.sliceEnd < current.sliceEnd - this.epsilon

        if (shiftsBackward) {
            return preferredCoordinate <= current.sliceStart + 1 + this.epsilon
                && preferredCoordinate >= current.sliceStart - this.epsilon
        }

        return false
    }

    doesAddHandleContainCoordinate(handle: AddZoneHandle, coordinate: number) {
        return coordinate >= handle.sliceStart - this.epsilon
            && coordinate <= handle.sliceEnd + this.epsilon
    }

    getAddHandleDistanceToCoordinate(handle: AddZoneHandle, coordinate: number) {
        if (this.doesAddHandleContainCoordinate(handle, coordinate)) return 0

        return Math.min(
            Math.abs(coordinate - handle.sliceStart),
            Math.abs(coordinate - handle.sliceEnd)
        )
    }

    getCenteredAddHandleCandidate(
        baseHandles: AddZoneHandle[],
        anchor: AddZoneHandle,
        preferredCoordinate: number
    ) {
        const sideCandidates = baseHandles.filter((candidate) =>
            candidate.zoneId === anchor.zoneId
            && candidate.side === anchor.side
        )
        const containingCandidates = sideCandidates.filter((candidate) =>
            this.doesAddHandleContainCoordinate(candidate, preferredCoordinate)
        )
        const candidates = containingCandidates.length > 0
            ? containingCandidates
            : sideCandidates.filter((candidate) =>
                this.getAddHandleDistanceToCoordinate(candidate, preferredCoordinate)
                <= BUILDING_MAP_HOVER_CONSTANTS.ADD_HANDLE_EDGE_SNAP_TOLERANCE + this.epsilon
            )

        if (candidates.length === 0) return anchor

        const nearestDistance = Math.min(
            ...candidates.map((candidate) =>
                this.getAddHandleDistanceToCoordinate(candidate, preferredCoordinate)
            )
        )

        const nearestCandidates = containingCandidates.length > 0
            ? candidates
            : candidates.filter((candidate) =>
                this.isSameCoordinate(
                    this.getAddHandleDistanceToCoordinate(candidate, preferredCoordinate),
                    nearestDistance
                )
            )

        return nearestCandidates.reduce((best, candidate) => {
            const candidateLength = candidate.sliceEnd - candidate.sliceStart
            const bestLength = best.sliceEnd - best.sliceStart
            const candidateCenter = candidate.sliceStart + candidateLength / 2
            const bestCenter = best.sliceStart + bestLength / 2
            const candidateCenterDistance = Math.abs(candidateCenter - preferredCoordinate)
            const bestCenterDistance = Math.abs(bestCenter - preferredCoordinate)
            const candidateTransitionLength = this.getHandleTransitionLength(candidate)
            const bestTransitionLength = this.getHandleTransitionLength(best)

            if (!this.isSameCoordinate(candidateTransitionLength, bestTransitionLength)) {
                return candidateTransitionLength > bestTransitionLength ? candidate : best
            }

            if (!this.isSameCoordinate(candidateLength, bestLength)) {
                return candidateLength > bestLength ? candidate : best
            }

            if (candidate.doorPlacementSplitScore !== best.doorPlacementSplitScore) {
                return candidate.doorPlacementSplitScore > best.doorPlacementSplitScore ? candidate : best
            }

            if (!this.isSameCoordinate(candidateCenterDistance, bestCenterDistance)) {
                return candidateCenterDistance < bestCenterDistance ? candidate : best
            }

            return this.isBetterAddHandle(candidate, best, preferredCoordinate) ? candidate : best
        })
    }

    getWholeAddHandleShiftCandidate(
        baseHandles: AddZoneHandle[],
        current: AddZoneHandle,
        preferredCoordinate: number | null
    ) {
        if (preferredCoordinate === null) return current

        const candidates = baseHandles.filter((candidate) =>
                candidate.key !== current.key
                && candidate.zoneId === current.zoneId
                && candidate.side === current.side
                && this.doSegmentsOverlap(
                    { start: current.sliceStart, end: current.sliceEnd },
                    { start: candidate.sliceStart, end: candidate.sliceEnd }
                )
                && this.shouldShiftWholeAddHandleForCoordinate(current, candidate, preferredCoordinate)
                && Math.abs(candidate.sliceStart - current.sliceStart) <= 1 + this.epsilon
                && Math.abs(candidate.sliceEnd - current.sliceEnd) <= 1 + this.epsilon
        )

        if (candidates.length === 0) return current

        return candidates.reduce((best, candidate) => {
            const candidateShift = Math.abs(candidate.sliceStart - current.sliceStart)
            const bestShift = Math.abs(best.sliceStart - current.sliceStart)

            if (!this.isSameCoordinate(candidateShift, bestShift)) {
                return candidateShift < bestShift ? candidate : best
            }

            return this.isBetterAddHandle(candidate, best, preferredCoordinate) ? candidate : best
        })
    }

    canCreateTransitionZoneAt(
        sourceZone: ZoneMapItem,
        rect: BuildingMapRectangle,
        validationZones: ZoneMapItem[]
    ) {
        const sourceExists = validationZones.some((zone) => zone.zone_id === sourceZone.zone_id)
        if (!sourceExists) return false

        return !validationZones.some((other) => {
            if (other.zone_id === sourceZone.zone_id) return false

            return buildingMapGeometryService.checkOverlap(
                rect,
                buildingMapGeometryService.toRectangle(other)
            )
        })
    }

    createAddSegmentsForFreeSlice(params: {
        zone: ZoneMapItem
        side: 'left' | 'right' | 'top' | 'bottom'
        slice: BuildingMapSegment
        doorsCount: number
        sourceZones: ZoneMapItem[]
        sourceDoors: DoorMapItem[]
        currentFloorId: number
    }) {
        const candidates: Array<{
            addSegment: BuildingMapSegment
            doorSegments: BuildingMapSegment[]
        }> = []

        const addCandidate = (addSegment: BuildingMapSegment) => {
            if (addSegment.end - addSegment.start < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) return

            if (!buildingMapEntranceDoorPlacementContextService.canPlaceEntranceDoorsAfterAddSegment(
                params.zone,
                params.side,
                addSegment,
                params.doorsCount,
                params.sourceZones,
                params.sourceDoors,
                params.currentFloorId
            )) return

            const duplicate = candidates.some((candidate) =>
                buildingMapGeometryService.isSameCoordinate(candidate.addSegment.start, addSegment.start)
                && buildingMapGeometryService.isSameCoordinate(candidate.addSegment.end, addSegment.end)
            )

            if (!duplicate) {
                candidates.push({
                    addSegment,
                    doorSegments: []
                })
            }
        }

        const sliceLength = params.slice.end - params.slice.start
        const maximumLength = Math.min(
            BUILDING_MAP_GEOMETRY_CONSTANTS.MAX_ADDED_ZONE_SIDE,
            Math.floor(sliceLength + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
        )

        const startMin = Math.ceil(params.slice.start - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
        for (
            let length = maximumLength;
            length >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE;
            length -= 1
        ) {
            const startMax = Math.floor(params.slice.end - length + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)

            for (let start = startMin; start <= startMax; start += 1) {
                addCandidate({
                    start,
                    end: start + length
                })
            }
        }

        return candidates.sort((first, second) => {
            const firstLength = first.addSegment.end - first.addSegment.start
            const secondLength = second.addSegment.end - second.addSegment.start

            if (!buildingMapGeometryService.isSameCoordinate(firstLength, secondLength)) {
                return secondLength - firstLength
            }

            return first.addSegment.start - second.addSegment.start
        })
    }

    findBestValidAddCandidate(params: {
        zone: ZoneMapItem
        side: 'left' | 'right' | 'top' | 'bottom'
        segment: BuildingMapSegment
        freeSegments: BuildingMapSegment[]
        doorsCount: number
        maxOutward: number
        sourceZones: ZoneMapItem[]
        sourceDoors: DoorMapItem[]
        currentFloorId: number
    }) {
        let best: {
            segment: BuildingMapSegment
            outward: number
            doorSegments: BuildingMapSegment[]
            doorPlacementSignature: string
            doorPlacementSplitScore: number
            rect: BuildingMapRectangle
        } | null = null

        if (params.segment.end - params.segment.start < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) return null

        const doorSegments = buildingMapEntranceDoorPlacementContextService.getDoorSegmentsAfterAdding(
            params.freeSegments,
            params.segment
        )

        for (
            let outward = params.maxOutward;
            outward >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE;
            outward -= 1
        ) {
            const { rect } = buildingMapFreeSideSliceService.getAddCandidateGeometry(
                params.zone,
                params.side,
                params.segment,
                outward
            )

            if (!buildingMapEntranceDoorPlacementContextService.doesCandidateKeepEntranceDoorsValid(
                rect,
                params.sourceZones,
                params.sourceDoors
            )) continue

            const doorPlacementGroups = params.doorsCount > 0
                ? buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForCandidate(
                    params.zone,
                    params.side,
                    params.zone.floor_id ?? params.currentFloorId,
                    rect,
                    params.sourceZones,
                    params.sourceDoors,
                    params.doorsCount,
                    true,
                    true
                )
                : []

            const doorPlacementSplitScore = buildingMapEntranceDoorPlacementContextService.getEntranceDoorSplitScoreForAddSegment(
                params.segment,
                doorPlacementGroups
            )

            if (
                params.doorsCount > 0
                && doorPlacementGroups.length === 0
            ) continue

            best = {
                segment: params.segment,
                outward,
                doorSegments,
                doorPlacementSignature: buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsSignature(
                    doorPlacementGroups
                ),
                doorPlacementSplitScore,
                rect
            }

            break
        }

        return best
    }

    createPayloadFromDynamicTransitionSegments(
        handle: AddZoneHandle,
        transitionSegments: BuildingMapTransitionSegment[]
    ): BuildingMapAddZonePayload {
        const regularPayload: BuildingMapRegularZonePayload =
            handle.payload.regular_payload || {
                zone_from_id: handle.payload.zone_from_id,
                side: handle.payload.side,
                x_coordinate: handle.payload.x_coordinate,
                y_coordinate: handle.payload.y_coordinate,
                width: handle.payload.width,
                height: handle.payload.height,
                title: handle.payload.title,
                can_create_transition: false,
                creation_mode: 'regular'
            }

        const rawTransitionPayload = transitionSegments.length > 0
            ? buildingMapTransitionService.createPayloadForSegment(
                {
                    side: handle.side,
                    payload: {
                        ...regularPayload,
                        can_create_transition: true
                    }
                },
                transitionSegments[0]
            )
            : null

        const transitionPayload: BuildingMapTransitionZonePayload | undefined = rawTransitionPayload
            ? {
                zone_from_id: rawTransitionPayload.zone_from_id,
                side: rawTransitionPayload.side,
                x_coordinate: rawTransitionPayload.x_coordinate,
                y_coordinate: rawTransitionPayload.y_coordinate,
                width: rawTransitionPayload.width,
                height: rawTransitionPayload.height,
                title: rawTransitionPayload.title,
                can_create_transition: true,
                creation_mode: 'transition',
                transition_geometry: rawTransitionPayload.transition_geometry!
            }
            : undefined

        return {
            ...handle.payload,
            can_create_transition: transitionSegments.length > 0,
            creation_mode: transitionSegments.length > 0
                ? handle.payload.creation_mode
                : 'regular',
            regular_payload: regularPayload,
            transition_payload: transitionPayload
        }
    }

    getCursorAdjustedAddHandle(params: {
        handle: AddZoneHandle
        hoveredCoordinate: number | null
        auraSourceZones: ZoneMapItem[]
        auraSourceDoors: DoorMapItem[]
        otherFloorEntranceDoorChecks: BuildingMapEntranceDoorCheck[]
        fallbackTransitionSegments?: BuildingMapTransitionSegment[]
    }) {
        if (params.hoveredCoordinate === null || params.handle.baseTransitionSegments.length === 0) {
            return {
                ...params.handle,
                canCreateTransition: false,
                transitionMode: 'none' as const,
                transitionSignature: '',
                transitionSegments: [],
                payload: this.createPayloadFromDynamicTransitionSegments(params.handle, [])
            }
        }

        const preferredTransitionCoordinate = buildingMapGeometryService.clampValue(
            params.hoveredCoordinate,
            params.handle.baseSegment.start,
            params.handle.baseSegment.end
        )

        if (preferredTransitionCoordinate === null) {
            return {
                ...params.handle,
                canCreateTransition: false,
                transitionMode: 'none' as const,
                transitionSignature: '',
                transitionSegments: [],
                payload: this.createPayloadFromDynamicTransitionSegments(params.handle, [])
            }
        }

        const stableAuraAdjustedTransition = buildingMapOtherFloorEntranceDoorAuraService.getOtherFloorEntranceDoorAuraAdjustedTransitionSegments({
            sourceZone: params.handle.sourceZone,
            sourceSide: params.handle.side,
            transitionSegments: params.handle.baseTransitionSegments,
            candidateRect: this.getAddHandleDoorCollisionRect(params.handle),
            sourceZones: params.auraSourceZones,
            sourceDoors: params.auraSourceDoors,
            otherFloorEntranceDoorChecks: params.otherFloorEntranceDoorChecks,
            preferredCoordinate: null
        })

        const cursorAuraAdjustedTransition = buildingMapOtherFloorEntranceDoorAuraService.getOtherFloorEntranceDoorAuraAdjustedTransitionSegments({
            sourceZone: params.handle.sourceZone,
            sourceSide: params.handle.side,
            transitionSegments: params.handle.baseTransitionSegments,
            candidateRect: this.getAddHandleDoorCollisionRect(params.handle),
            sourceZones: params.auraSourceZones,
            sourceDoors: params.auraSourceDoors,
            otherFloorEntranceDoorChecks: params.otherFloorEntranceDoorChecks,
            preferredCoordinate: preferredTransitionCoordinate
        })

        const cursorTransitionSegments = cursorAuraAdjustedTransition.transitionSegments
            .filter((segment) =>
                segment.end - segment.start >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
            )
        const stableTransitionSegments = stableAuraAdjustedTransition.transitionSegments
            .filter((segment) =>
                segment.end - segment.start >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
            )

        const transitionSegments = this.getBestAuraValidatedTransitionSegmentsForCoordinate(
            stableTransitionSegments,
            cursorTransitionSegments,
            preferredTransitionCoordinate
        )

        if (transitionSegments.length === 0) {
            const fallbackTransitionSegments = this.getAuraValidatedFallbackTransitionSegments(
                params.fallbackTransitionSegments || [],
                [
                    ...stableTransitionSegments,
                    ...cursorTransitionSegments
                ]
            )

            if (fallbackTransitionSegments.length === 0) {
                return {
                    ...params.handle,
                    canCreateTransition: false,
                    transitionMode: 'none' as const,
                    transitionSignature: '',
                    transitionSegments: [],
                    payload: this.createPayloadFromDynamicTransitionSegments(params.handle, [])
                }
            }

            return {
                ...params.handle,
                canCreateTransition: true,
                transitionMode: params.handle.transitionMode,
                transitionSignature: this.getTransitionSegmentsSignature(fallbackTransitionSegments),
                transitionSegments: fallbackTransitionSegments.map((segment) => ({
                    ...segment,
                    style: buildingMapTransitionService.getAddHandleSegmentStyle(
                        params.handle.side,
                        params.handle.baseSegment,
                        segment
                    )
                })),
                payload: this.createPayloadFromDynamicTransitionSegments(
                    params.handle,
                    fallbackTransitionSegments
                )
            }
        }

        const visibleTransitionSegments = this.getPreferredTransitionSegmentsForCoordinate(
            transitionSegments,
            preferredTransitionCoordinate
        )

        if (visibleTransitionSegments.length === 0) {
            return {
                ...params.handle,
                canCreateTransition: false,
                transitionMode: 'none' as const,
                transitionSignature: '',
                transitionSegments: [],
                payload: this.createPayloadFromDynamicTransitionSegments(params.handle, [])
            }
        }

        return {
            ...params.handle,
            canCreateTransition: visibleTransitionSegments.length > 0,
            transitionMode: visibleTransitionSegments.length > 0
                ? params.handle.transitionMode
                : 'none' as const,
            transitionSignature: this.getTransitionSegmentsSignature(visibleTransitionSegments),
            transitionSegments: visibleTransitionSegments.map((segment) => ({
                ...segment,
                style: buildingMapTransitionService.getAddHandleSegmentStyle(
                    params.handle.side,
                    params.handle.baseSegment,
                    segment
                )
            })),
            payload: this.createPayloadFromDynamicTransitionSegments(
                params.handle,
                visibleTransitionSegments
            )
        }
    }

    getPreferredTransitionSegmentsForCoordinate(
        transitionSegments: BuildingMapTransitionSegment[],
        coordinate: number,
        requireContainingCoordinate = false
    ) {
        if (transitionSegments.length === 0) return []

        const containingSegments = transitionSegments.filter((segment) =>
            coordinate >= segment.start - this.epsilon
            && coordinate <= segment.end + this.epsilon
        )

        if (containingSegments.length > 0) {
            const bestContainingSegment = containingSegments
                .slice()
                .sort((first, second) => {
                    const firstLength = first.end - first.start
                    const secondLength = second.end - second.start

                    if (!this.isSameCoordinate(firstLength, secondLength)) {
                        return secondLength - firstLength
                    }

                    return first.start - second.start
                })[0]

            return bestContainingSegment ? [bestContainingSegment] : []
        }

        if (requireContainingCoordinate) return []

        if (transitionSegments.length === 1) return transitionSegments

        const bestSegment = transitionSegments
            .slice()
            .sort((first, second) => {
                const firstDistance = this.getSegmentDistanceToCoordinate(first, coordinate)
                const secondDistance = this.getSegmentDistanceToCoordinate(second, coordinate)

                if (!this.isSameCoordinate(firstDistance, secondDistance)) {
                    return firstDistance - secondDistance
                }

                const firstLength = first.end - first.start
                const secondLength = second.end - second.start

                if (!this.isSameCoordinate(firstLength, secondLength)) {
                    return secondLength - firstLength
                }

                return first.start - second.start
            })[0]

        return bestSegment ? [bestSegment] : []
    }

    getBestAuraValidatedTransitionSegmentsForCoordinate(
        stableTransitionSegments: BuildingMapTransitionSegment[],
        cursorTransitionSegments: BuildingMapTransitionSegment[],
        coordinate: number
    ) {
        const stablePreferredSegments = this.getPreferredTransitionSegmentsForCoordinate(
            stableTransitionSegments,
            coordinate,
            true
        )
        const cursorPreferredSegments = this.getPreferredTransitionSegmentsForCoordinate(
            cursorTransitionSegments,
            coordinate,
            true
        )
        const stableLength = this.getTransitionSegmentsLength(stablePreferredSegments)
        const cursorLength = this.getTransitionSegmentsLength(cursorPreferredSegments)

        if (cursorPreferredSegments.length > 0) return cursorPreferredSegments
        if (stablePreferredSegments.length > 0) return stablePreferredSegments

        const cursorDistance = this.getDistanceToTransitionSegments(cursorPreferredSegments, coordinate)
        const stableDistance = this.getDistanceToTransitionSegments(stablePreferredSegments, coordinate)

        if (
            this.isSameCoordinate(cursorDistance, 0)
            && !this.isSameCoordinate(stableDistance, 0)
        ) {
            return cursorPreferredSegments
        }

        if (!this.isSameCoordinate(stableLength, cursorLength)) {
            return stableLength > cursorLength
                ? stablePreferredSegments
                : cursorPreferredSegments
        }

        if (!this.isSameCoordinate(stableDistance, cursorDistance)) {
            return cursorDistance < stableDistance
                ? cursorPreferredSegments
                : stablePreferredSegments
        }

        return stablePreferredSegments
    }

    getTransitionSegmentsLength(
        transitionSegments: BuildingMapTransitionSegment[]
    ) {
        return transitionSegments.reduce((total, segment) =>
            total + segment.end - segment.start,
        0)
    }

    getDistanceToTransitionSegments(
        transitionSegments: BuildingMapTransitionSegment[],
        coordinate: number
    ) {
        if (transitionSegments.length === 0) return Number.POSITIVE_INFINITY

        return Math.min(
            ...transitionSegments.map((segment) =>
                this.getSegmentDistanceToCoordinate(segment, coordinate)
            )
        )
    }

    getAuraValidatedFallbackTransitionSegments(
        fallbackTransitionSegments: BuildingMapTransitionSegment[],
        safeTransitionSegments: BuildingMapTransitionSegment[]
    ) {
        const clippedSegments: BuildingMapTransitionSegment[] = []

        for (const fallbackSegment of fallbackTransitionSegments) {
            for (const safeSegment of safeTransitionSegments) {
                const start = Math.max(fallbackSegment.start, safeSegment.start)
                const end = Math.min(fallbackSegment.end, safeSegment.end)

                if (end - start < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) continue

                clippedSegments.push({
                    start,
                    end,
                    outward: Math.min(fallbackSegment.outward, safeSegment.outward)
                })
            }
        }

        return clippedSegments
            .sort((first, second) => {
                const firstLength = first.end - first.start
                const secondLength = second.end - second.start

                if (!this.isSameCoordinate(firstLength, secondLength)) {
                    return secondLength - firstLength
                }

                return first.start - second.start
            })
            .slice(0, 1)
    }

    getTransitionSegmentsSignature(
        transitionSegments: BuildingMapTransitionSegment[]
    ) {
        return transitionSegments
            .map((segment) => [
                Number(segment.start.toFixed(3)),
                Number(segment.end.toFixed(3)),
                Number(segment.outward.toFixed(3))
            ].join(':'))
            .join('|')
    }

    removeOverlappingAddHandles(
        sourceHandles: AddZoneHandle[],
        getPreferredCoordinate: (handle: AddZoneHandle) => number | null = () => null
    ) {
        return sourceHandles.filter((currentHandle) =>
            !sourceHandles.some((otherHandle) => {
                if (otherHandle.key === currentHandle.key) return false
                if (otherHandle.zoneId !== currentHandle.zoneId) return false
                if (otherHandle.side !== currentHandle.side) return false

                const overlaps = this.doSegmentsOverlap(
                    { start: currentHandle.sliceStart, end: currentHandle.sliceEnd },
                    { start: otherHandle.sliceStart, end: otherHandle.sliceEnd }
                )

                if (!overlaps) return false

                const preferredCoordinate = getPreferredCoordinate(currentHandle)

                if (preferredCoordinate !== null) {
                    return this.isBetterAddHandle(otherHandle, currentHandle, preferredCoordinate)
                }

                if (
                    otherHandle.sliceStart <= currentHandle.sliceStart + this.epsilon
                    && otherHandle.sliceEnd >= currentHandle.sliceEnd - this.epsilon
                ) {
                    return this.isBetterAddHandle(otherHandle, currentHandle)
                }

                return false
            })
        )
    }

    getDoorHandleKey(
        zoneId: number,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        insertIndex: number
    ) {
        return `entrance:${zoneId}:${side}:${floorId}:${insertIndex}`
    }

    getAddDoorHandlePayload(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number
    ): BuildingMapAddDoorPayload {
        return {
            zone_from_id: null,
            zone_to_id: zone.zone_id,
            floor_id: floorId,
            entrance_door_side: side
        }
    }

    private getInterZoneDoorHandleKey(
        zoneFromId: number,
        zoneToId: number,
        floorId: number,
        insertIndex: number
    ) {
        const firstZoneId = Math.min(zoneFromId, zoneToId)
        const secondZoneId = Math.max(zoneFromId, zoneToId)

        return `between:${firstZoneId}:${secondZoneId}:${floorId}:${insertIndex}`
    }

    private getInterZoneDoorPayload(
        zoneFrom: ZoneMapItem,
        zoneTo: ZoneMapItem,
        floorId: number
    ): BuildingMapAddDoorPayload {
        return {
            zone_from_id: zoneFrom.zone_id,
            zone_to_id: zoneTo.zone_id,
            floor_id: floorId
        }
    }

    private getSameFloorAdjacentZonePairs(zones: ZoneMapItem[], currentFloorId: number) {
        const pairs: Array<{
            zoneFrom: ZoneMapItem
            zoneTo: ZoneMapItem
            segment: BuildingMapSegment
            x: number
            y: number
            isVertical: boolean
        }> = []

        for (const zoneFrom of zones) {
            for (const zoneTo of zones) {
                if (zoneFrom.zone_id >= zoneTo.zone_id) continue

                const zoneFromFloorId = zoneFrom.floor_id ?? currentFloorId
                const zoneToFloorId = zoneTo.floor_id ?? currentFloorId

                if (zoneFromFloorId !== currentFloorId) continue
                if (zoneToFloorId !== currentFloorId) continue

                const fromLeft = zoneFrom.x_coordinate
                const fromRight = zoneFrom.x_coordinate + zoneFrom.width
                const fromTop = zoneFrom.y_coordinate
                const fromBottom = zoneFrom.y_coordinate + zoneFrom.height

                const toLeft = zoneTo.x_coordinate
                const toRight = zoneTo.x_coordinate + zoneTo.width
                const toTop = zoneTo.y_coordinate
                const toBottom = zoneTo.y_coordinate + zoneTo.height

                const touchesVertically =
                    this.isSameCoordinate(fromRight, toLeft)
                    || this.isSameCoordinate(toRight, fromLeft)

                if (touchesVertically) {
                    const start = Math.max(fromTop, toTop)
                    const end = Math.min(fromBottom, toBottom)

                    if (end - start >= BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE) {
                        pairs.push({
                            zoneFrom,
                            zoneTo,
                            segment: { start, end },
                            x: this.isSameCoordinate(fromRight, toLeft) ? fromRight : fromLeft,
                            y: start + (end - start) / 2,
                            isVertical: true
                        })
                    }

                    continue
                }

                const touchesHorizontally =
                    this.isSameCoordinate(fromBottom, toTop)
                    || this.isSameCoordinate(toBottom, fromTop)

                if (touchesHorizontally) {
                    const start = Math.max(fromLeft, toLeft)
                    const end = Math.min(fromRight, toRight)

                    if (end - start >= BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE) {
                        pairs.push({
                            zoneFrom,
                            zoneTo,
                            segment: { start, end },
                            x: start + (end - start) / 2,
                            y: this.isSameCoordinate(fromBottom, toTop) ? fromBottom : fromTop,
                            isVertical: false
                        })
                    }
                }
            }
        }

        return pairs
    }

    private getEntranceDoorSideKey(
        zoneId: number,
        side: 'left' | 'right' | 'top' | 'bottom'
    ) {
        return `${zoneId}:${side}`
    }

    private getInterZoneDoorPairKey(zoneFromId: number, zoneToId: number) {
        const firstZoneId = Math.min(zoneFromId, zoneToId)
        const secondZoneId = Math.max(zoneFromId, zoneToId)

        return `${firstZoneId}:${secondZoneId}`
    }

    private getEntranceDoorsCountBySide(
        doors: DoorMapItem[],
        floorId: number
    ) {
        const counts = new Map<string, number>()

        for (const door of doors) {
            if (
                !door.is_entrance
                || door.floor_id !== floorId
                || door.zone_to_id === null
                || !door.entrance_door_side
            ) continue

            const key = this.getEntranceDoorSideKey(door.zone_to_id, door.entrance_door_side)
            counts.set(key, (counts.get(key) || 0) + 1)
        }

        return counts
    }

    private getInterZoneDoorsCountByPair(
        doors: DoorMapItem[],
        floorId: number
    ) {
        const counts = new Map<string, number>()

        for (const door of doors) {
            if (
                door.is_entrance
                || door.floor_id !== floorId
                || door.zone_from_id === null
                || door.zone_to_id === null
            ) continue

            const key = this.getInterZoneDoorPairKey(door.zone_from_id, door.zone_to_id)
            counts.set(key, (counts.get(key) || 0) + 1)
        }

        return counts
    }

    getAddDoorHandles(params: {
        zones: ZoneMapItem[]
        doors: DoorMapItem[]
        currentFloorId: number
        unitSize: number
    }): AddDoorHandle[] {
        const handles: AddDoorHandle[] = []
        const entranceDoorCountsBySide = this.getEntranceDoorsCountBySide(
            params.doors,
            params.currentFloorId
        )
        const interZoneDoorCountsByPair = this.getInterZoneDoorsCountByPair(
            params.doors,
            params.currentFloorId
        )

        /**
         * 1. Entrance doors.
         * Тут лишається стара логіка з аурою.
         */
        for (const zone of params.zones) {
            for (const side of buildingMapSideService.sides) {
                const sideDoorsCount = entranceDoorCountsBySide.get(
                    this.getEntranceDoorSideKey(zone.zone_id, side)
                ) || 0

                const placementGroups = buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForZones(
                    zone,
                    side,
                    params.currentFloorId,
                    params.zones,
                    sideDoorsCount + 1
                )

                if (placementGroups.length === 0) continue

                for (let insertIndex = 0; insertIndex <= sideDoorsCount; insertIndex += 1) {
                    const center = buildingMapEntranceDoorPlacementContextService.getEntranceDoorCenterFromPlacementGroups(
                        placementGroups,
                        insertIndex
                    )

                    if (center === null) continue

                    const x = side === 'left'
                        ? zone.x_coordinate
                        : side === 'right'
                            ? zone.x_coordinate + zone.width
                            : center

                    const y = side === 'top'
                        ? zone.y_coordinate
                        : side === 'bottom'
                            ? zone.y_coordinate + zone.height
                            : center

                    handles.push({
                        key: this.getDoorHandleKey(
                            zone.zone_id,
                            side,
                            params.currentFloorId,
                            insertIndex
                        ),
                        style: {
                            left: `${x * params.unitSize}px`,
                            top: `${y * params.unitSize}px`
                        },
                        insertIndex,
                        payload: this.getAddDoorHandlePayload(
                            zone,
                            side,
                            params.currentFloorId
                        )
                    })
                }
            }
        }

        /**
         * 2. Doors between zones.
         * Тут НЕ використовуємо aura.
         * Логіка проста: якщо дві зони мають спільну межу і там є місце для дверей,
         * показуємо зелений handle по центру доступного спільного сегмента.
         */
        const adjacentPairs = this.getSameFloorAdjacentZonePairs(
            params.zones,
            params.currentFloorId
        )

        for (const pair of adjacentPairs) {
            const existingDoorsCount = interZoneDoorCountsByPair.get(
                this.getInterZoneDoorPairKey(pair.zoneFrom.zone_id, pair.zoneTo.zone_id)
            ) || 0

            const capacity = Math.floor(
                (pair.segment.end - pair.segment.start + this.epsilon)
                / BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE
            )

            if (existingDoorsCount >= capacity) continue

            const nextDoorsCount = existingDoorsCount + 1

            for (let insertIndex = 0; insertIndex <= existingDoorsCount; insertIndex += 1) {
                const center = buildingMapEntranceDoorPlacementContextService.getRegularDoorCenterOnSegment(
                    pair.segment,
                    insertIndex,
                    nextDoorsCount
                )

                const x = pair.isVertical ? pair.x : center
                const y = pair.isVertical ? center : pair.y

                handles.push({
                    key: this.getInterZoneDoorHandleKey(
                        pair.zoneFrom.zone_id,
                        pair.zoneTo.zone_id,
                        params.currentFloorId,
                        insertIndex
                    ),
                    style: {
                        left: `${x * params.unitSize}px`,
                        top: `${y * params.unitSize}px`
                    },
                    insertIndex,
                    payload: this.getInterZoneDoorPayload(
                        pair.zoneFrom,
                        pair.zoneTo,
                        params.currentFloorId
                    )
                })
            }
        }

        return handles
    }

    private isSameCoordinate(first: number, second: number) {
        return Math.abs(first - second) <= this.epsilon
    }

    private getAddHandleDoorCollisionRect(
        handle: AddZoneHandle
    ): BuildingMapRectangle {
        const geometry = handle.payload.door_collision_geometry

        if (geometry) {
            return {
                x: geometry.x_coordinate,
                y: geometry.y_coordinate,
                width: geometry.width,
                height: geometry.height
            }
        }

        return {
            x: handle.payload.x_coordinate,
            y: handle.payload.y_coordinate,
            width: handle.payload.width,
            height: handle.payload.height
        }
    }
}

export const buildingMapAddHandleService = new BuildingMapAddHandleService()
