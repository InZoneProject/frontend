import {BUILDING_MAP_DOOR_CONSTANTS} from '@/modules/building/constants/building-map-door.constants'
import {BUILDING_MAP_GEOMETRY_CONSTANTS} from '@/modules/building/constants/building-map-geometry.constants'
import {buildingMapFreeSideSliceService} from '@/modules/building/services/building-map-free-side-slice.service'
import {buildingMapGeometryService} from '@/modules/building/services/building-map-geometry.service'
import {buildingMapSideService} from '@/modules/building/services/building-map-side.service'
import type {BuildingMapDoorPlacementGroup} from '@/modules/building/interfaces/building-map-door-placement-group.interface'
import type {BuildingMapRectangle} from '@/modules/building/interfaces/building-map-rectangle.interface'
import type {BuildingMapSegment} from '@/modules/building/interfaces/building-map-segment.interface'
import type {BuildingMapTransitionSegment} from '@/modules/building/interfaces/building-map-transition-segment.interface'
import type {DoorMapItem} from '@/modules/building/interfaces/door-map-item.interface'
import type {ZoneMapItem} from '@/modules/building/interfaces/zone-map-item.interface'

class BuildingMapEntranceDoorPlacementContextService {
    public getDoorCenterOnSegment(
        segment: BuildingMapSegment,
        doorIndex: number,
        doorsCount: number
    ) {
        const safeDoorsCount = Math.max(1, doorsCount)
        const safeDoorIndex = Math.max(0, Math.min(doorIndex, safeDoorsCount - 1))
        const doorSize = BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE
        const groupLength = safeDoorsCount * doorSize
        const segmentLength = segment.end - segment.start
        const groupStart = segment.start + Math.max(0, (segmentLength - groupLength) / 2)

        return groupStart + safeDoorIndex * doorSize + doorSize / 2
    }

    public getRegularDoorCenterOnSegment(
        segment: BuildingMapSegment,
        doorIndex: number,
        doorsCount: number
    ) {
        const safeDoorsCount = Math.max(1, doorsCount)
        const safeDoorIndex = Math.max(0, Math.min(doorIndex, safeDoorsCount - 1))
        const doorSize = BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE
        const segmentLength = segment.end - segment.start
        const doorsLength = safeDoorsCount * doorSize
        const freeLength = Math.max(0, segmentLength - doorsLength)
        const spacing = freeLength / (safeDoorsCount + 1)

        return segment.start
            + spacing * (safeDoorIndex + 1)
            + doorSize * safeDoorIndex
            + doorSize / 2
    }

    public getEntranceDoorCenterOnPlacement(
        placement: BuildingMapSegment,
        doorIndex: number,
        doorsCount: number
    ) {
        const safeDoorsCount = Math.max(1, doorsCount)
        const safeDoorIndex = Math.max(0, Math.min(doorIndex, safeDoorsCount - 1))
        const doorSize = BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE
        const placementLength = placement.end - placement.start
        const doorsLength = safeDoorsCount * doorSize
        const freeLength = Math.max(0, placementLength - doorsLength)
        const spacing = freeLength / (safeDoorsCount + 1)

        return placement.start
            + spacing * (safeDoorIndex + 1)
            + doorSize * safeDoorIndex
            + doorSize / 2
    }

    public getRegularDoorsRequiredLength(doorsCount: number) {
        if (doorsCount <= 0) return 0

        return doorsCount * BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE
    }

    public subtractSegment(
        sourceSegments: BuildingMapSegment[],
        occupiedSegment: BuildingMapSegment
    ) {
        return buildingMapGeometryService.subtractSegment(
            sourceSegments,
            occupiedSegment
        )
    }

    public getDoorCapacityOnSegment(segment: BuildingMapSegment) {
        return Math.max(0, Math.floor(
            (segment.end - segment.start + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
            / BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE
        ))
    }

    public getBestDoorSegments(
        segments: BuildingMapSegment[],
        doorsCount: number
    ) {
        const validSegments = buildingMapFreeSideSliceService.sortSegmentsByAvailableSpace(segments)
            .filter((segment) => this.getDoorCapacityOnSegment(segment) > 0)

        const segmentForAllDoors = validSegments.find((segment) =>
            this.getDoorCapacityOnSegment(segment) >= doorsCount
        )

        if (segmentForAllDoors) return [segmentForAllDoors]

        const totalCapacity = validSegments.reduce(
            (total, segment) => total + this.getDoorCapacityOnSegment(segment),
            0
        )

        return totalCapacity >= doorsCount ? validSegments : []
    }

    public getEntranceDoorsCountOnSide(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        sourceDoors: DoorMapItem[]
    ) {
        return sourceDoors
            .filter((door) =>
                door.is_entrance
                && door.zone_to_id === zone.zone_id
                && door.entrance_door_side === side
                && door.floor_id === floorId
            ).length
    }

    public getEntranceDoorBaseFreeSegments(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        zones: ZoneMapItem[]
    ) {
        const zoneRect = buildingMapGeometryService.toRectangle(zone)
        const totalSegment = buildingMapSideService.getZoneSideSegment(zone, side)

        const occupiedByAdjacentZones = zones
            .filter((otherZone) =>
                    otherZone.zone_id !== zone.zone_id
                    && (
                        otherZone.floor_id === floorId
                        || otherZone.is_transition_between_floors
                        || zone.is_transition_between_floors
                    )
            )
            .map((otherZone) => buildingMapGeometryService.toRectangle(otherZone))
            .filter((otherRect) =>
                buildingMapFreeSideSliceService.isZoneAdjacentToSide(
                    zoneRect,
                    otherRect,
                    side
                )
            )
            .map((otherRect) =>
                buildingMapFreeSideSliceService.calculateSegmentOnSide(
                    zoneRect,
                    otherRect,
                    side
                )
            )
            .filter((segment) => segment.end > segment.start)

        return buildingMapFreeSideSliceService.calculateFreeSegments(
            totalSegment,
            buildingMapFreeSideSliceService.mergeSegments(occupiedByAdjacentZones)
        )
    }

    public getEntranceDoorAuraAwareFreeSegments(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        zones: ZoneMapItem[],
        includeEndBlocks = true
    ) {
        const zoneRect = buildingMapGeometryService.toRectangle(zone)
        let freeSegments = this.getEntranceDoorBaseFreeSegments(
            zone,
            side,
            floorId,
            zones
        )

        const blockingSegments = zones
            .filter((otherZone) =>
                    otherZone.zone_id !== zone.zone_id
                    && (
                        otherZone.floor_id === floorId
                        || otherZone.is_transition_between_floors
                        || zone.is_transition_between_floors
                    )
            )
            .map((otherZone) => buildingMapGeometryService.toRectangle(otherZone))
            .flatMap((otherRect) =>
                this.getEntranceDoorBlockedSegmentsForZone(
                    zoneRect,
                    otherRect,
                    side,
                    BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
                    includeEndBlocks
                )
            )

        for (const blockingSegment of blockingSegments) {
            freeSegments = this.subtractSegment(
                freeSegments,
                blockingSegment
            )
        }

        return freeSegments
    }

    public getEntranceDoorAuraSegmentForRender(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        doorsCount: number,
        zones: ZoneMapItem[]
    ) {
        if (doorsCount <= 0) return null

        const freeSegments = this.getEntranceDoorAuraAwareFreeSegments(
            zone,
            side,
            floorId,
            zones
        )

        const placementSegments = this.getBestDoorSegments(
            freeSegments,
            doorsCount
        )

        return placementSegments[0] || null
    }

    public getDoorSegmentsAfterAdding(
        freeSegments: BuildingMapSegment[],
        addSegment: BuildingMapSegment,
        clearance: number = BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE
    ) {
        return this.subtractSegment(
            freeSegments,
            {
                start: addSegment.start - clearance,
                end: addSegment.end + clearance
            }
        )
    }

    public canPlaceEntranceDoorsAfterAddSegment(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        addSegment: BuildingMapSegment,
        doorsCount: number,
        sourceZones: ZoneMapItem[],
        sourceDoors: DoorMapItem[],
        currentFloorId: number
    ) {
        if (doorsCount === 0) return true

        const floorId = zone.floor_id ?? currentFloorId
        const candidateRect = buildingMapSideService.getSideSliceRectangle(
            zone,
            side,
            addSegment.start,
            addSegment.end,
            BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
        )

        return this.getEntranceDoorPlacementGroupsForCandidate(
            zone,
            side,
            floorId,
            candidateRect,
            sourceZones,
            sourceDoors,
            doorsCount,
            false
        ).length > 0
    }

    public canRelocateEntranceDoors(
        freeSegments: BuildingMapSegment[],
        doorsCount: number
    ) {
        if (doorsCount === 0) return true

        const totalCapacity = freeSegments.reduce(
            (total, segment) => total + this.getDoorCapacityOnSegment(segment),
            0
        )

        return totalCapacity >= doorsCount
    }

    public getEntranceDoorBlockedSegmentsForZone(
        zoneRect: BuildingMapRectangle,
        otherRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom',
        clearance: number = BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
        includeEndBlocks = false
    ) {
        const auraBlockedSegment = this.getEntranceDoorAuraBlockedSegment(
            zoneRect,
            otherRect,
            side,
            clearance
        )
        const endBlockedSegment = includeEndBlocks
            ? this.getEntranceDoorAuraEndBlockedSegment(zoneRect, otherRect, side)
            : null

        return [
            auraBlockedSegment,
            endBlockedSegment
        ].filter((segment): segment is BuildingMapSegment => segment !== null && segment.end > segment.start)
    }

    public getEntranceDoorAuraRectangle(
        zoneRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom',
        doorBand: BuildingMapSegment,
        clearance: number = BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE
    ) {
        const sideAuraPadding = clearance
        const outwardAuraDepth = clearance + 1

        if (side === 'top') {
            return {
                x: doorBand.start - sideAuraPadding,
                y: zoneRect.y - outwardAuraDepth,
                width: doorBand.end - doorBand.start + sideAuraPadding * 2,
                height: outwardAuraDepth
            }
        }

        if (side === 'bottom') {
            return {
                x: doorBand.start - sideAuraPadding,
                y: zoneRect.y + zoneRect.height,
                width: doorBand.end - doorBand.start + sideAuraPadding * 2,
                height: outwardAuraDepth
            }
        }

        if (side === 'left') {
            return {
                x: zoneRect.x - outwardAuraDepth,
                y: doorBand.start - sideAuraPadding,
                width: outwardAuraDepth,
                height: doorBand.end - doorBand.start + sideAuraPadding * 2
            }
        }

        return {
            x: zoneRect.x + zoneRect.width,
            y: doorBand.start - sideAuraPadding,
            width: outwardAuraDepth,
            height: doorBand.end - doorBand.start + sideAuraPadding * 2
        }
    }

    private getEntranceDoorAuraBlockedSegment(
        zoneRect: BuildingMapRectangle,
        otherRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom',
        clearance: number
    ) {
        const safeClearance = Math.max(0, clearance)
        const outwardAuraDepth = safeClearance + 1
        const total = buildingMapSideService.getSideSegment(zoneRect, side)
        let distanceFromDoorSide: number
        let start: number
        let end: number

        if (side === 'right') {
            distanceFromDoorSide = otherRect.x - (zoneRect.x + zoneRect.width)
            start = otherRect.y - safeClearance
            end = otherRect.y + otherRect.height + safeClearance
        } else if (side === 'left') {
            distanceFromDoorSide = zoneRect.x - (otherRect.x + otherRect.width)
            start = otherRect.y - safeClearance
            end = otherRect.y + otherRect.height + safeClearance
        } else if (side === 'bottom') {
            distanceFromDoorSide = otherRect.y - (zoneRect.y + zoneRect.height)
            start = otherRect.x - safeClearance
            end = otherRect.x + otherRect.width + safeClearance
        } else {
            distanceFromDoorSide = zoneRect.y - (otherRect.y + otherRect.height)
            start = otherRect.x - safeClearance
            end = otherRect.x + otherRect.width + safeClearance
        }

        if (
            distanceFromDoorSide < -BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            || distanceFromDoorSide >= outwardAuraDepth - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
        ) return null

        const segment = {
            start: Math.max(total.start, start),
            end: Math.min(total.end, end)
        }

        return segment.end > segment.start ? segment : null
    }

    private getEntranceDoorAuraEndBlockedSegment(
        zoneRect: BuildingMapRectangle,
        otherRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom'
    ) {
        const clearance = BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE
        const outwardAuraDepth = clearance + 1
        const total = buildingMapSideService.getSideSegment(zoneRect, side)

        const getBlockLength = (distance: number) => {
            if (
                distance < -BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                || distance >= clearance - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            ) return 0

            return clearance - Math.max(0, distance)
        }

        if (side === 'left' || side === 'right') {
            const auraStartX = side === 'left'
                ? zoneRect.x - outwardAuraDepth
                : zoneRect.x + zoneRect.width
            const auraEndX = side === 'left'
                ? zoneRect.x
                : zoneRect.x + zoneRect.width + outwardAuraDepth
            const overlapsOutwardAuraBand = otherRect.x < auraEndX
                && otherRect.x + otherRect.width > auraStartX

            if (!overlapsOutwardAuraBand) return null

            const distanceFromTop = zoneRect.y - (otherRect.y + otherRect.height)
            const topBlockLength = getBlockLength(distanceFromTop)
            if (topBlockLength > 0) {
                return {
                    start: total.start,
                    end: Math.min(total.end, total.start + topBlockLength)
                }
            }

            const distanceFromBottom = otherRect.y - (zoneRect.y + zoneRect.height)
            const bottomBlockLength = getBlockLength(distanceFromBottom)
            if (bottomBlockLength > 0) {
                return {
                    start: Math.max(total.start, total.end - bottomBlockLength),
                    end: total.end
                }
            }
        } else {
            const auraStartY = side === 'top'
                ? zoneRect.y - outwardAuraDepth
                : zoneRect.y + zoneRect.height
            const auraEndY = side === 'top'
                ? zoneRect.y
                : zoneRect.y + zoneRect.height + outwardAuraDepth
            const overlapsOutwardAuraBand = otherRect.y < auraEndY
                && otherRect.y + otherRect.height > auraStartY

            if (!overlapsOutwardAuraBand) return null

            const distanceFromLeft = zoneRect.x - (otherRect.x + otherRect.width)
            const leftBlockLength = getBlockLength(distanceFromLeft)
            if (leftBlockLength > 0) {
                return {
                    start: total.start,
                    end: Math.min(total.end, total.start + leftBlockLength)
                }
            }

            const distanceFromRight = otherRect.x - (zoneRect.x + zoneRect.width)
            const rightBlockLength = getBlockLength(distanceFromRight)
            if (rightBlockLength > 0) {
                return {
                    start: Math.max(total.start, total.end - rightBlockLength),
                    end: total.end
                }
            }
        }

        return null
    }

    public doesRectangleOverlapAny(
        rectangle: BuildingMapRectangle,
        blockingRectangles: BuildingMapRectangle[]
    ) {
        return blockingRectangles.some((blockingRectangle) =>
            buildingMapGeometryService.checkOverlap(
                rectangle,
                blockingRectangle
            )
        )
    }

    public doesEntranceDoorAuraPlacementOverlapAny(
        zoneRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom',
        placement: BuildingMapSegment,
        doorsCount: number,
        blockingRectangles: BuildingMapRectangle[],
        clearance: number = BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE
    ) {
        for (let doorIndex = 0; doorIndex < doorsCount; doorIndex += 1) {
            const center = this.getEntranceDoorCenterOnPlacement(
                placement,
                doorIndex,
                doorsCount
            )

            const doorBand = {
                start: center - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2,
                end: center + BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2
            }

            const auraRectangle = this.getEntranceDoorAuraRectangle(
                zoneRect,
                side,
                doorBand,
                clearance
            )

            if (this.doesRectangleOverlapAny(auraRectangle, blockingRectangles)) return true
        }

        return false
    }

    public findValidEntranceDoorBandInSegment(
        zoneRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom',
        segment: BuildingMapSegment,
        doorsCount: number,
        blockingRectangles: BuildingMapRectangle[],
        clearance: number = BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
        preferredCenter: number | null = null,
        preferCompactPlacement = false,
        softBlockingRectangles: BuildingMapRectangle[] = []
    ) {
        const minimumLength = doorsCount * BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE
        const segmentLength = segment.end - segment.start

        if (doorsCount <= 0 || segmentLength + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON < minimumLength) return null

        let bestSoftPlacement: BuildingMapSegment | null = null
        let bestSoftScore = Number.POSITIVE_INFINITY
        let bestSoftDistance = Number.POSITIVE_INFINITY

        const addCandidateStart = (
            starts: number[],
            value: number,
            minimumStart: number,
            maximumStart: number
        ) => {
            const clampedValue = buildingMapGeometryService.clampValue(
                value,
                minimumStart,
                maximumStart
            )
            const normalizedValue = Number(clampedValue.toFixed(6))

            if (!starts.some((item) => buildingMapGeometryService.isSameCoordinate(item, normalizedValue))) {
                starts.push(normalizedValue)
            }
        }

        const placementLengths: number[] = []

        if (preferCompactPlacement) {
            for (
                let placementLength = minimumLength;
                placementLength <= segmentLength + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON;
                placementLength += 0.5
            ) {
                placementLengths.push(placementLength)
            }
        } else {
            for (
                let placementLength = segmentLength;
                placementLength + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON >= minimumLength;
                placementLength -= 0.5
            ) {
                placementLengths.push(placementLength)
            }
        }

        for (const placementLength of placementLengths) {
            const minimumStart = segment.start
            const maximumStart = segment.end - placementLength
            const preferredPlacementCenter = preferredCenter ?? segment.start + segmentLength / 2
            const preferredStart = preferredPlacementCenter - placementLength / 2
            const candidateStarts: number[] = []

            addCandidateStart(candidateStarts, preferredStart, minimumStart, maximumStart)

            const maximumOffset = Math.ceil(Math.max(
                Math.abs(preferredStart - minimumStart),
                Math.abs(maximumStart - preferredStart)
            ) * 2)

            for (let offset = 1; offset <= maximumOffset; offset += 1) {
                const delta = offset / 2
                addCandidateStart(candidateStarts, preferredStart + delta, minimumStart, maximumStart)
                addCandidateStart(candidateStarts, preferredStart - delta, minimumStart, maximumStart)
            }

            addCandidateStart(candidateStarts, minimumStart, minimumStart, maximumStart)
            addCandidateStart(candidateStarts, maximumStart, minimumStart, maximumStart)

            for (const start of candidateStarts) {
                const placement = {
                    start,
                    end: start + placementLength
                }

                const overlapsHardBlocking = this.doesEntranceDoorAuraPlacementOverlapAny(
                    zoneRect,
                    side,
                    placement,
                    doorsCount,
                    blockingRectangles,
                    clearance
                )

                if (!overlapsHardBlocking) {
                    if (softBlockingRectangles.length === 0) {
                        return placement
                    }

                    let softScore = 0

                    for (let doorIndex = 0; doorIndex < doorsCount; doorIndex += 1) {
                        const center = this.getEntranceDoorCenterOnPlacement(
                            placement,
                            doorIndex,
                            doorsCount
                        )

                        const doorBand = {
                            start: center - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2,
                            end: center + BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2
                        }

                        const auraRectangle = this.getEntranceDoorAuraRectangle(
                            zoneRect,
                            side,
                            doorBand,
                            clearance
                        )

                        for (const softBlockingRectangle of softBlockingRectangles) {
                            softScore += buildingMapGeometryService.getRectangleArea(
                                buildingMapGeometryService.getRectangleIntersection(
                                    auraRectangle,
                                    softBlockingRectangle
                                )
                            )
                        }
                    }

                    const placementCenter = placement.start + (placement.end - placement.start) / 2
                    const preferredPlacementCenter = preferredCenter ?? segment.start + segmentLength / 2
                    const softDistance = Math.abs(placementCenter - preferredPlacementCenter)

                    if (
                        softScore < bestSoftScore - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                        || (
                            buildingMapGeometryService.isSameCoordinate(softScore, bestSoftScore)
                            && softDistance < bestSoftDistance
                        )
                    ) {
                        bestSoftScore = softScore
                        bestSoftDistance = softDistance
                        bestSoftPlacement = placement
                    }
                }
            }
        }

        return bestSoftPlacement
    }

    public getEntranceDoorBandForRender(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        doorsCount: number,
        zones: ZoneMapItem[]
    ) {
        if (doorsCount <= 0) return null

        const zoneRect = buildingMapGeometryService.toRectangle(zone)

        const freeSegments = this.getEntranceDoorAuraAwareFreeSegments(
            zone,
            side,
            floorId,
            zones
        )

        const placementSegments = this.getBestDoorSegments(
            freeSegments,
            doorsCount
        )

        const blockingRectangles = zones
            .filter((otherZone) =>
                    otherZone.zone_id !== zone.zone_id
                    && (
                        otherZone.floor_id === floorId
                        || otherZone.is_transition_between_floors
                        || zone.is_transition_between_floors
                    )
            )
            .map((otherZone) => buildingMapGeometryService.toRectangle(otherZone))

        for (const segment of placementSegments) {
            const doorsInSegment = Math.min(
                doorsCount,
                this.getDoorCapacityOnSegment(segment)
            )

            if (doorsInSegment <= 0) continue

            const band = this.findValidEntranceDoorBandInSegment(
                zoneRect,
                side,
                segment,
                doorsInSegment,
                blockingRectangles
            )

            if (band) return band
        }

        return null
    }

    public getEntranceDoorAuraBandForRender(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        doorsCount: number,
        zones: ZoneMapItem[]
    ) {
        const auraSegment = this.getEntranceDoorAuraSegmentForRender(
            zone,
            side,
            floorId,
            doorsCount,
            zones
        )

        if (!auraSegment) return null

        return {
            start: auraSegment.start,
            end: auraSegment.end
        }
    }

    public getEntranceDoorPlacementGroupsForCandidate(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        candidateRect: BuildingMapRectangle,
        sourceZones: ZoneMapItem[],
        sourceDoors: DoorMapItem[],
        doorsCount: number,
        shouldCandidateBlockDoorAura = true,
        shouldCandidateBlockDoorBody = true
    ) {
        void sourceDoors

        if (doorsCount <= 0) return []

        const projectedCandidateZone: ZoneMapItem = {
            ...zone,
            zone_id: -1,
            floor_id: floorId,
            is_transition_between_floors: false,
            x_coordinate: candidateRect.x,
            y_coordinate: candidateRect.y,
            width: candidateRect.width,
            height: candidateRect.height
        }

        const projectedZonesForDoorBody = shouldCandidateBlockDoorBody
            ? [
                ...sourceZones.filter((sourceZone) => sourceZone.zone_id !== -1),
                projectedCandidateZone
            ]
            : sourceZones.filter((sourceZone) => sourceZone.zone_id !== -1)

        const projectedZonesForDoorAura = shouldCandidateBlockDoorAura
            ? [
                ...sourceZones.filter((sourceZone) => sourceZone.zone_id !== -1),
                projectedCandidateZone
            ]
            : sourceZones.filter((sourceZone) => sourceZone.zone_id !== -1)

        let freeSegments = this.getEntranceDoorBaseFreeSegments(
            zone,
            side,
            floorId,
            projectedZonesForDoorBody
        )

        if (shouldCandidateBlockDoorAura) {
            const candidateBlockedSegments = this.getEntranceDoorBlockedSegmentsForZone(
                buildingMapGeometryService.toRectangle(zone),
                candidateRect,
                side,
                BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
                true
            )

            for (const blockedSegment of candidateBlockedSegments) {
                freeSegments = this.subtractSegment(
                    freeSegments,
                    blockedSegment
                )
            }
        }

        const softBlockingRectangles = shouldCandidateBlockDoorAura
            ? []
            : [candidateRect]
        const candidateSegment = buildingMapSideService.getSideSegment(candidateRect, side)
        const preferredCoordinate = candidateSegment.start + (candidateSegment.end - candidateSegment.start) / 2
        const normalPlacementGroups = this.getEntranceDoorPlacementGroupsForZones(
            zone,
            side,
            floorId,
            sourceZones,
            doorsCount
        )
        const blockingRectangles = projectedZonesForDoorAura
            .filter((sourceZone) =>
                    sourceZone.zone_id !== zone.zone_id
                    && (
                        sourceZone.floor_id === floorId
                        || sourceZone.is_transition_between_floors
                        || zone.is_transition_between_floors
                    )
            )
            .map((sourceZone) => buildingMapGeometryService.toRectangle(sourceZone))

        if (
            normalPlacementGroups.length > 0
            && this.areEntranceDoorPlacementGroupsValidInSegments(
                buildingMapGeometryService.toRectangle(zone),
                side,
                normalPlacementGroups,
                freeSegments,
                [
                    ...blockingRectangles,
                    ...softBlockingRectangles
                ]
            )
        ) {
            return normalPlacementGroups
        }

        const placementCandidates = [
            this.getEntranceDoorPlacementGroupsFromFreeSegments(
                zone,
                side,
                floorId,
                freeSegments,
                projectedZonesForDoorAura,
                doorsCount,
                softBlockingRectangles
            ),
            ...(doorsCount > 1
                ? this.getEntranceDoorPlacementGroupCandidatesFromFreeSegments(
                    zone,
                    side,
                    floorId,
                    freeSegments,
                    projectedZonesForDoorAura,
                    doorsCount,
                    preferredCoordinate,
                    softBlockingRectangles
                )
                : [])
        ].filter((placementGroups) => placementGroups.length > 0)

        if (placementCandidates.length === 0) return []

        return placementCandidates
            .slice()
            .sort((first, second) => {
                const firstSplitScore = this.getEntranceDoorSplitScoreForAddSegment(candidateSegment, first)
                const secondSplitScore = this.getEntranceDoorSplitScoreForAddSegment(candidateSegment, second)

                if (firstSplitScore !== secondSplitScore) return secondSplitScore - firstSplitScore

                const firstMovement = this.getEntranceDoorPlacementGroupsMovement(
                    normalPlacementGroups,
                    first
                )
                const secondMovement = this.getEntranceDoorPlacementGroupsMovement(
                    normalPlacementGroups,
                    second
                )

                if (!buildingMapGeometryService.isSameCoordinate(firstMovement, secondMovement)) {
                    return firstMovement - secondMovement
                }

                const firstSpan = Math.max(...first.map((group) => group.placement.end))
                    - Math.min(...first.map((group) => group.placement.start))
                const secondSpan = Math.max(...second.map((group) => group.placement.end))
                    - Math.min(...second.map((group) => group.placement.start))

                if (!buildingMapGeometryService.isSameCoordinate(firstSpan, secondSpan)) {
                    return firstSpan - secondSpan
                }

                return this.getEntranceDoorPlacementGroupsSignature(first)
                    .localeCompare(this.getEntranceDoorPlacementGroupsSignature(second))
            })[0]
    }

    public getEntranceDoorPlacementGroupsAfterRegularZoneAdd(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        candidateRect: BuildingMapRectangle,
        sourceZones: ZoneMapItem[],
        doorsCount: number
    ) {
        if (doorsCount <= 0) return []

        const projectedCandidateZone: ZoneMapItem = {
            ...zone,
            zone_id: -1,
            floor_id: floorId,
            is_transition_between_floors: false,
            x_coordinate: candidateRect.x,
            y_coordinate: candidateRect.y,
            width: candidateRect.width,
            height: candidateRect.height
        }

        return this.getEntranceDoorPlacementGroupsForZones(
            zone,
            side,
            floorId,
            [
                ...sourceZones.filter((sourceZone) => sourceZone.zone_id !== -1),
                projectedCandidateZone
            ],
            doorsCount
        )
    }

    private areEntranceDoorPlacementGroupsValidInSegments(
        zoneRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom',
        placementGroups: BuildingMapDoorPlacementGroup[],
        freeSegments: BuildingMapSegment[],
        blockingRectangles: BuildingMapRectangle[]
    ) {
        return placementGroups.every((group) => {
            const isInsideFreeSegment = freeSegments.some((segment) =>
                group.placement.start >= segment.start - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                && group.placement.end <= segment.end + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            )

            if (!isInsideFreeSegment) return false

            const auraRectangle = this.getEntranceDoorAuraRectangle(
                zoneRect,
                side,
                group.placement,
                BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE
            )

            return !this.doesRectangleOverlapAny(auraRectangle, blockingRectangles)
        })
    }

    private getEntranceDoorPlacementGroupsMovement(
        sourcePlacementGroups: BuildingMapDoorPlacementGroup[],
        candidatePlacementGroups: BuildingMapDoorPlacementGroup[]
    ) {
        if (sourcePlacementGroups.length !== candidatePlacementGroups.length) {
            return Number.POSITIVE_INFINITY
        }

        return candidatePlacementGroups.reduce((total, candidateGroup) => {
            const sourceGroup = sourcePlacementGroups.find((group) =>
                group.startIndex === candidateGroup.startIndex
            )

            if (!sourceGroup) return Number.POSITIVE_INFINITY

            const sourceCenter = sourceGroup.placement.start
                + (sourceGroup.placement.end - sourceGroup.placement.start) / 2
            const candidateCenter = candidateGroup.placement.start
                + (candidateGroup.placement.end - candidateGroup.placement.start) / 2

            return total + Math.abs(candidateCenter - sourceCenter)
        }, 0)
    }

    public getEntranceDoorPlacementGroupsFromFreeSegments(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        freeSegments: BuildingMapSegment[],
        sourceZones: ZoneMapItem[],
        doorsCount: number,
        softBlockingRectangles: BuildingMapRectangle[] = []
    ) {
        if (doorsCount <= 0) return []

        const validSegments = freeSegments.filter((segment) =>
            this.getDoorCapacityOnSegment(segment) > 0
        )

        const totalCapacity = validSegments.reduce(
            (total, segment) => total + this.getDoorCapacityOnSegment(segment),
            0
        )

        if (totalCapacity < doorsCount) return []

        const doorSize = BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE

        const segmentAllocations = validSegments.map((segment, index) => ({
            index,
            segment,
            doorsCount: 0,
            doorIndexes: [] as number[]
        }))

        for (let doorIndex = 0; doorIndex < doorsCount; doorIndex += 1) {
            const bestSegment = segmentAllocations
                .filter((allocation) =>
                    allocation.doorsCount < this.getDoorCapacityOnSegment(allocation.segment)
                )
                .sort((first, second) => {
                    const firstLength = first.segment.end - first.segment.start
                    const secondLength = second.segment.end - second.segment.start

                    const firstRemainingLength = firstLength - first.doorsCount * doorSize
                    const secondRemainingLength = secondLength - second.doorsCount * doorSize

                    if (!buildingMapGeometryService.isSameCoordinate(firstRemainingLength, secondRemainingLength)) {
                        return secondRemainingLength - firstRemainingLength
                    }

                    return first.segment.start - second.segment.start
                })[0]

            if (!bestSegment) return []

            bestSegment.doorsCount += 1
            bestSegment.doorIndexes.push(doorIndex)
        }

        const zoneRect = buildingMapGeometryService.toRectangle(zone)

        const blockingRectangles = sourceZones
            .filter((sourceZone) =>
                    sourceZone.zone_id !== zone.zone_id
                    && (
                        sourceZone.floor_id === floorId
                        || sourceZone.is_transition_between_floors
                        || zone.is_transition_between_floors
                    )
            )
            .map((sourceZone) => buildingMapGeometryService.toRectangle(sourceZone))

        const groups: BuildingMapDoorPlacementGroup[] = []

        for (const allocation of segmentAllocations
            .filter((item) => item.doorsCount > 0)
            .sort((first, second) => first.index - second.index)
            ) {
            const placement = this.findValidEntranceDoorBandInSegment(
                zoneRect,
                side,
                allocation.segment,
                allocation.doorsCount,
                blockingRectangles,
                BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
                null,
                false,
                softBlockingRectangles
            )

            if (!placement) return []

            allocation.doorIndexes.forEach((doorIndex, localIndex) => {
                const center = this.getEntranceDoorCenterOnPlacement(
                    placement,
                    localIndex,
                    allocation.doorsCount
                )

                groups.push({
                    startIndex: doorIndex,
                    doorsCount: 1,
                    placement: {
                        start: center - doorSize / 2,
                        end: center + doorSize / 2
                    }
                })
            })
        }

        return groups.sort((first, second) => first.startIndex - second.startIndex)
    }

    private getEntranceDoorPlacementGroupCandidatesFromFreeSegments(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        freeSegments: BuildingMapSegment[],
        sourceZones: ZoneMapItem[],
        doorsCount: number,
        preferredCoordinate: number | null = null,
        softBlockingRectangles: BuildingMapRectangle[] = []
    ) {
        if (doorsCount <= 0) return []

        const validSegments = freeSegments
            .filter((segment) => this.getDoorCapacityOnSegment(segment) > 0)
            .sort((first, second) => first.start - second.start)
        const totalCapacity = validSegments.reduce(
            (total, segment) => total + this.getDoorCapacityOnSegment(segment),
            0
        )

        if (totalCapacity < doorsCount) return []

        const zoneRect = buildingMapGeometryService.toRectangle(zone)
        const blockingRectangles = sourceZones
            .filter((sourceZone) =>
                    sourceZone.zone_id !== zone.zone_id
                    && (
                        sourceZone.floor_id === floorId
                        || sourceZone.is_transition_between_floors
                        || zone.is_transition_between_floors
                    )
            )
            .map((sourceZone) => buildingMapGeometryService.toRectangle(sourceZone))
        const candidates: BuildingMapDoorPlacementGroup[][] = []
        const doorSize = BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE

        const buildAllocations = (
            segmentIndex: number,
            remainingDoors: number,
            allocations: number[]
        ) => {
            if (segmentIndex === validSegments.length) {
                if (remainingDoors !== 0) return

                const groups: BuildingMapDoorPlacementGroup[] = []
                let doorIndex = 0

                for (let index = 0; index < allocations.length; index += 1) {
                    const segment = validSegments[index]
                    const segmentDoorsCount = allocations[index]

                    if (!segment || segmentDoorsCount <= 0) continue

                    const preferredCenter = preferredCoordinate === null
                        ? null
                        : segment.end <= preferredCoordinate + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                            ? segment.start
                            : segment.start >= preferredCoordinate - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                                ? segment.end
                                : null

                    const placement = this.findValidEntranceDoorBandInSegment(
                        zoneRect,
                        side,
                        segment,
                        segmentDoorsCount,
                        blockingRectangles,
                        BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
                        preferredCenter,
                        preferredCenter !== null,
                        softBlockingRectangles
                    )

                    if (!placement) return

                    for (let localIndex = 0; localIndex < segmentDoorsCount; localIndex += 1) {
                        const center = this.getEntranceDoorCenterOnPlacement(
                            placement,
                            localIndex,
                            segmentDoorsCount
                        )

                        groups.push({
                            startIndex: doorIndex,
                            doorsCount: 1,
                            placement: {
                                start: center - doorSize / 2,
                                end: center + doorSize / 2
                            }
                        })
                        doorIndex += 1
                    }
                }

                candidates.push(groups.sort((first, second) => first.startIndex - second.startIndex))
                return
            }

            const segment = validSegments[segmentIndex]
            if (!segment) return

            const capacity = Math.min(
                this.getDoorCapacityOnSegment(segment),
                remainingDoors
            )

            for (let count = 0; count <= capacity; count += 1) {
                const remainingSegmentsCapacity = validSegments
                    .slice(segmentIndex + 1)
                    .reduce((total, item) => total + this.getDoorCapacityOnSegment(item), 0)

                if (remainingDoors - count > remainingSegmentsCapacity) continue

                buildAllocations(
                    segmentIndex + 1,
                    remainingDoors - count,
                    [...allocations, count]
                )
            }
        }

        buildAllocations(0, doorsCount, [])

        return candidates
    }

    public getEntranceDoorSingleDoorPlacementCandidates(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        sourceZones: ZoneMapItem[],
        doorsCount: number
    ) {
        if (doorsCount <= 0) return []

        const freeSegments = this.getEntranceDoorBaseFreeSegments(
            zone,
            side,
            floorId,
            sourceZones
        ).filter((segment) => this.getDoorCapacityOnSegment(segment) > 0)

        const zoneRect = buildingMapGeometryService.toRectangle(zone)
        const blockingRectangles = sourceZones
            .filter((sourceZone) =>
                    sourceZone.zone_id !== zone.zone_id
                    && (
                        sourceZone.floor_id === floorId
                        || sourceZone.is_transition_between_floors
                        || zone.is_transition_between_floors
                    )
            )
            .map((sourceZone) => buildingMapGeometryService.toRectangle(sourceZone))

        const doorSize = BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE
        const bands: BuildingMapSegment[] = []

        for (const segment of freeSegments) {
            const startMin = Math.ceil(segment.start - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
            const startMax = Math.floor(segment.end - doorSize + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)

            for (let start = startMin; start <= startMax + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON; start += 0.5) {
                const band = {
                    start,
                    end: start + doorSize
                }

                if (this.doesEntranceDoorAuraPlacementOverlapAny(
                    zoneRect,
                    side,
                    band,
                    1,
                    blockingRectangles
                )) continue

                bands.push(band)
            }
        }

        const candidates: BuildingMapDoorPlacementGroup[][] = []

        const build = (
            selectedBands: BuildingMapSegment[],
            startIndex: number
        ) => {
            if (selectedBands.length === doorsCount) {
                candidates.push(selectedBands.map((band, index) => ({
                    startIndex: index,
                    doorsCount: 1,
                    placement: band
                })))
                return
            }

            for (let index = startIndex; index < bands.length; index += 1) {
                const band = bands[index]
                const overlapsSelectedBand = selectedBands.some((selectedBand) =>
                    band.start < selectedBand.end - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                    && band.end > selectedBand.start + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                )

                if (overlapsSelectedBand) continue

                build(
                    [...selectedBands, band],
                    index + 1
                )
            }
        }

        build([], 0)

        return candidates
    }

    private getEntranceDoorPlacementCandidatesForTransition(
        doorZone: ZoneMapItem,
        doorSide: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        sourceZone: ZoneMapItem,
        sourceSide: 'left' | 'right' | 'top' | 'bottom',
        transitionSegments: BuildingMapTransitionSegment[],
        sourceZones: ZoneMapItem[],
        doorsCount: number,
        preferredCoordinate: number
    ) {
        const candidates: BuildingMapDoorPlacementGroup[][] = []
        const signatures = new Set<string>()
        const addCandidate = (placementGroups: BuildingMapDoorPlacementGroup[]) => {
            if (placementGroups.length === 0) return

            const signature = this.getEntranceDoorPlacementGroupsSignature(placementGroups)
            if (signatures.has(signature)) return

            signatures.add(signature)
            candidates.push(placementGroups)
        }

        const getSubSegments = (transitionSegment: BuildingMapTransitionSegment) => {
            const segmentStart = Math.ceil(transitionSegment.start - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
            const segmentEnd = Math.floor(transitionSegment.end + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
            const segmentLength = segmentEnd - segmentStart
            const subSegments: BuildingMapTransitionSegment[] = []
            const subSegmentSignatures = new Set<string>()
            const addSubSegment = (start: number, end: number) => {
                const safeStart = Math.max(segmentStart, Math.min(start, segmentEnd))
                const safeEnd = Math.max(safeStart, Math.min(end, segmentEnd))

                if (safeEnd - safeStart < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) return

                const signature = `${safeStart}:${safeEnd}`
                if (subSegmentSignatures.has(signature)) return

                subSegmentSignatures.add(signature)
                subSegments.push({
                    start: safeStart,
                    end: safeEnd,
                    outward: transitionSegment.outward
                })
            }

            addSubSegment(segmentStart, segmentEnd)

            for (
                let length = BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE;
                length <= segmentLength;
                length += 1
            ) {
                const centeredStart = Math.round(preferredCoordinate - length / 2)

                addSubSegment(centeredStart, centeredStart + length)
                addSubSegment(Math.floor(preferredCoordinate), Math.floor(preferredCoordinate) + length)
                addSubSegment(Math.ceil(preferredCoordinate - length), Math.ceil(preferredCoordinate))
            }

            return subSegments
        }

        const baseFreeSegments = this.getEntranceDoorBaseFreeSegments(
            doorZone,
            doorSide,
            floorId,
            sourceZones
        )

        addCandidate(this.getEntranceDoorPlacementGroupsFromFreeSegments(
            doorZone,
            doorSide,
            floorId,
            baseFreeSegments,
            sourceZones,
            doorsCount
        ))

        for (const placementGroups of this.getEntranceDoorPlacementGroupCandidatesFromFreeSegments(
            doorZone,
            doorSide,
            floorId,
            baseFreeSegments,
            sourceZones,
            doorsCount,
            preferredCoordinate
        )) {
            addCandidate(placementGroups)
        }

        for (const transitionSegment of transitionSegments) {
            for (const subSegment of getSubSegments(transitionSegment)) {
                const transitionRect = buildingMapSideService.getSideSliceRectangle(
                    sourceZone,
                    sourceSide,
                    subSegment.start,
                    subSegment.end,
                    subSegment.outward
                )
                let freeSegments = baseFreeSegments
                const blockedSegments = this.getEntranceDoorBlockedSegmentsForZone(
                    buildingMapGeometryService.toRectangle(doorZone),
                    transitionRect,
                    doorSide,
                    BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
                    true
                )

                for (const blockedSegment of blockedSegments) {
                    freeSegments = this.subtractSegment(freeSegments, blockedSegment)
                }

                addCandidate(this.getEntranceDoorPlacementGroupsFromFreeSegments(
                    doorZone,
                    doorSide,
                    floorId,
                    freeSegments,
                    sourceZones,
                    doorsCount
                ))

                for (const placementGroups of this.getEntranceDoorPlacementGroupCandidatesFromFreeSegments(
                    doorZone,
                    doorSide,
                    floorId,
                    freeSegments,
                    sourceZones,
                    doorsCount,
                    preferredCoordinate
                )) {
                    addCandidate(placementGroups)
                }
            }
        }

        return candidates
    }

    private getDoorPlacementDistanceFromCenteredTransitionLayout(
        sourceZone: ZoneMapItem,
        sourceSide: 'left' | 'right' | 'top' | 'bottom',
        transitionRun: BuildingMapTransitionSegment,
        doorZone: ZoneMapItem,
        doorSide: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        sourceZones: ZoneMapItem[],
        placementGroups: BuildingMapDoorPlacementGroup[],
        doorsCount: number
    ) {
        const transitionRect = buildingMapSideService.getSideSliceRectangle(
            sourceZone,
            sourceSide,
            transitionRun.start,
            transitionRun.end,
            transitionRun.outward
        )
        let freeSegments = this.getEntranceDoorBaseFreeSegments(
            doorZone,
            doorSide,
            floorId,
            sourceZones
        )
        const blockedSegments = this.getEntranceDoorBlockedSegmentsForZone(
            buildingMapGeometryService.toRectangle(doorZone),
            transitionRect,
            doorSide,
            BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
            true
        )

        for (const blockedSegment of blockedSegments) {
            freeSegments = this.subtractSegment(freeSegments, blockedSegment)
        }

        const centeredGroups = this.getEntranceDoorPlacementGroupsFromFreeSegments(
            doorZone,
            doorSide,
            floorId,
            freeSegments,
            sourceZones,
            doorsCount
        )

        if (centeredGroups.length !== placementGroups.length) return Number.POSITIVE_INFINITY

        return placementGroups.reduce((total, group) => {
            const centeredGroup = centeredGroups.find((item) => item.startIndex === group.startIndex)
            if (!centeredGroup) return Number.POSITIVE_INFINITY

            const groupCenter = group.placement.start + (group.placement.end - group.placement.start) / 2
            const centeredGroupCenter = centeredGroup.placement.start
                + (centeredGroup.placement.end - centeredGroup.placement.start) / 2

            return total + Math.abs(groupCenter - centeredGroupCenter)
        }, 0)
    }

    public getTransitionScoreForEntranceDoorPlacementGroups(
        sourceZone: ZoneMapItem,
        sourceSide: 'left' | 'right' | 'top' | 'bottom',
        transitionSegments: BuildingMapTransitionSegment[],
        doorZone: ZoneMapItem,
        doorSide: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        sourceZones: ZoneMapItem[],
        placementGroups: BuildingMapDoorPlacementGroup[],
        doorsCount: number,
        preferredCoordinate: number
    ) {
        const auraRectangles = this.getEntranceDoorAuraRectanglesFromPlacementGroups(
            doorZone,
            doorSide,
            placementGroups
        )

        const greenCells = new Map<number, number>()

        for (const transitionSegment of transitionSegments) {
            const start = Math.ceil(transitionSegment.start - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)
            const end = Math.floor(transitionSegment.end + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON)

            for (let cell = start; cell < end; cell += 1) {
                let safeDepth = 0

                for (
                    let depth = transitionSegment.outward;
                    depth >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE;
                    depth -= 1
                ) {
                    const cellRect = buildingMapSideService.getSideSliceRectangle(
                        sourceZone,
                        sourceSide,
                        cell,
                        cell + 1,
                        depth
                    )

                    const overlapsAura = auraRectangles.some((auraRectangle) =>
                        buildingMapGeometryService.checkOverlap(cellRect, auraRectangle)
                    )

                    if (!overlapsAura) {
                        safeDepth = depth
                        break
                    }
                }

                if (safeDepth > 0) {
                    const existingDepth = greenCells.get(cell) || 0
                    greenCells.set(cell, Math.max(existingDepth, safeDepth))
                }
            }
        }

        const sortedGreenCells = [...greenCells.keys()].sort((first, second) => first - second)
        let containingRunLength = 0
        let containingRunStart = 0
        let containingRunEnd = 0
        let containingRunCenterDistance = Number.POSITIVE_INFINITY
        let largestRunStart = 0
        let largestRunEnd = 0
        let largestRunOutward = 0
        let largestRunLength = 0
        let nearestDistance = Number.POSITIVE_INFINITY
        let cursor = 0

        while (cursor < sortedGreenCells.length) {
            const start = sortedGreenCells[cursor]
            let end = start + 1
            cursor += 1

            while (cursor < sortedGreenCells.length && sortedGreenCells[cursor] === end) {
                end += 1
                cursor += 1
            }

            const runLength = end - start
            const runOutward = Math.min(
                ...sortedGreenCells
                    .filter((cell) => cell >= start && cell < end)
                    .map((cell) => greenCells.get(cell) || 0)
            )

            if (runLength > largestRunLength) {
                largestRunLength = runLength
                largestRunStart = start
                largestRunEnd = end
                largestRunOutward = runOutward
            }

            if (
                preferredCoordinate >= start - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                && preferredCoordinate <= end + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            ) {
                if (runLength > containingRunLength) {
                    containingRunLength = runLength
                    containingRunStart = start
                    containingRunEnd = end
                    containingRunCenterDistance = Math.abs(
                        preferredCoordinate - (start + (end - start) / 2)
                    )
                } else if (runLength === containingRunLength) {
                    containingRunCenterDistance = Math.min(
                        containingRunCenterDistance,
                        Math.abs(preferredCoordinate - (start + (end - start) / 2))
                    )
                }

                nearestDistance = 0
                continue
            }

            nearestDistance = Math.min(
                nearestDistance,
                Math.abs(preferredCoordinate - start),
                Math.abs(preferredCoordinate - end)
            )
        }

        const allStart = Math.min(...transitionSegments.map((segment) => segment.start))
        const allEnd = Math.max(...transitionSegments.map((segment) => segment.end))
        const hasGreenRunOnBothSides =
            containingRunLength > 0
            && containingRunStart > allStart + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            && containingRunEnd < allEnd - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON

        const doorBands = placementGroups.map((group) => group.placement)
        const doorsBeforeRun = containingRunLength > 0
            ? doorBands.filter((band) =>
                band.end <= containingRunStart + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            ).length
            : 0

        const doorsAfterRun = containingRunLength > 0
            ? doorBands.filter((band) =>
                band.start >= containingRunEnd - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
            ).length
            : 0
        const centeredPlacementDistance = largestRunLength > 0
            ? this.getDoorPlacementDistanceFromCenteredTransitionLayout(
                sourceZone,
                sourceSide,
                {
                    start: largestRunStart,
                    end: largestRunEnd,
                    outward: largestRunOutward
                },
                doorZone,
                doorSide,
                floorId,
                sourceZones,
                placementGroups,
                doorsCount
            )
            : Number.POSITIVE_INFINITY

        return {
            containsPreferredCoordinate: containingRunLength > 0,
            containingRunLength,
            containingRunCenterDistance,
            totalGreenLength: greenCells.size,
            largestRunLength,
            nearestDistance,
            splitDoorsScore: hasGreenRunOnBothSides
                ? Math.min(doorsBeforeRun, doorsAfterRun)
                : 0,
            centeredPlacementDistance,
            placementSpan: placementGroups.length > 0
                ? Math.max(...placementGroups.map((group) => group.placement.end))
                - Math.min(...placementGroups.map((group) => group.placement.start))
                : 0
        }
    }

    public getBestOtherFloorEntranceDoorPlacementGroupsForTransition(
        doorZone: ZoneMapItem,
        doorSide: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        sourceZone: ZoneMapItem,
        sourceSide: 'left' | 'right' | 'top' | 'bottom',
        transitionSegments: BuildingMapTransitionSegment[],
        sourceZones: ZoneMapItem[],
        doorsCount: number,
        preferredCoordinate: number
    ) {
        const placementCandidates = this.getEntranceDoorPlacementCandidatesForTransition(
            doorZone,
            doorSide,
            floorId,
            sourceZone,
            sourceSide,
            transitionSegments,
            sourceZones,
            doorsCount,
            preferredCoordinate
        )

        let bestCandidate: typeof placementCandidates[number] | null = null
        let bestScore: ReturnType<typeof this.getTransitionScoreForEntranceDoorPlacementGroups> | null = null

        for (const placementCandidate of placementCandidates) {
            const score = this.getTransitionScoreForEntranceDoorPlacementGroups(
                sourceZone,
                sourceSide,
                transitionSegments,
                doorZone,
                doorSide,
                floorId,
                sourceZones,
                placementCandidate,
                doorsCount,
                preferredCoordinate
            )

            if (
                !bestScore
                || Number(score.containsPreferredCoordinate) > Number(bestScore.containsPreferredCoordinate)
                || (
                    score.containsPreferredCoordinate === bestScore.containsPreferredCoordinate
                    && score.containingRunLength > bestScore.containingRunLength
                )
                || (
                    score.containsPreferredCoordinate === bestScore.containsPreferredCoordinate
                    && score.containingRunLength === bestScore.containingRunLength
                    && score.containingRunCenterDistance < bestScore.containingRunCenterDistance
                )
                || (
                    score.containsPreferredCoordinate === bestScore.containsPreferredCoordinate
                    && score.containingRunLength === bestScore.containingRunLength
                    && buildingMapGeometryService.isSameCoordinate(
                        score.containingRunCenterDistance,
                        bestScore.containingRunCenterDistance
                    )
                    && score.largestRunLength > bestScore.largestRunLength
                )
                || (
                    score.containsPreferredCoordinate === bestScore.containsPreferredCoordinate
                    && score.containingRunLength === bestScore.containingRunLength
                    && buildingMapGeometryService.isSameCoordinate(
                        score.containingRunCenterDistance,
                        bestScore.containingRunCenterDistance
                    )
                    && score.largestRunLength === bestScore.largestRunLength
                    && score.totalGreenLength > bestScore.totalGreenLength
                )
                || (
                    score.containsPreferredCoordinate === bestScore.containsPreferredCoordinate
                    && score.containingRunLength === bestScore.containingRunLength
                    && buildingMapGeometryService.isSameCoordinate(
                        score.containingRunCenterDistance,
                        bestScore.containingRunCenterDistance
                    )
                    && score.largestRunLength === bestScore.largestRunLength
                    && score.totalGreenLength === bestScore.totalGreenLength
                    && score.splitDoorsScore > bestScore.splitDoorsScore
                )
                || (
                    score.containsPreferredCoordinate === bestScore.containsPreferredCoordinate
                    && score.containingRunLength === bestScore.containingRunLength
                    && buildingMapGeometryService.isSameCoordinate(
                        score.containingRunCenterDistance,
                        bestScore.containingRunCenterDistance
                    )
                    && score.largestRunLength === bestScore.largestRunLength
                    && score.totalGreenLength === bestScore.totalGreenLength
                    && score.splitDoorsScore === bestScore.splitDoorsScore
                    && score.centeredPlacementDistance < bestScore.centeredPlacementDistance
                )
                || (
                    score.containsPreferredCoordinate === bestScore.containsPreferredCoordinate
                    && score.containingRunLength === bestScore.containingRunLength
                    && buildingMapGeometryService.isSameCoordinate(
                        score.containingRunCenterDistance,
                        bestScore.containingRunCenterDistance
                    )
                    && score.largestRunLength === bestScore.largestRunLength
                    && score.totalGreenLength === bestScore.totalGreenLength
                    && score.splitDoorsScore === bestScore.splitDoorsScore
                    && buildingMapGeometryService.isSameCoordinate(
                        score.centeredPlacementDistance,
                        bestScore.centeredPlacementDistance
                    )
                    && score.placementSpan < bestScore.placementSpan
                )
                || (
                    score.containsPreferredCoordinate === bestScore.containsPreferredCoordinate
                    && score.containingRunLength === bestScore.containingRunLength
                    && buildingMapGeometryService.isSameCoordinate(
                        score.containingRunCenterDistance,
                        bestScore.containingRunCenterDistance
                    )
                    && score.largestRunLength === bestScore.largestRunLength
                    && score.totalGreenLength === bestScore.totalGreenLength
                    && score.splitDoorsScore === bestScore.splitDoorsScore
                    && buildingMapGeometryService.isSameCoordinate(
                        score.centeredPlacementDistance,
                        bestScore.centeredPlacementDistance
                    )
                    && buildingMapGeometryService.isSameCoordinate(score.placementSpan, bestScore.placementSpan)
                    && score.nearestDistance < bestScore.nearestDistance
                )
            ) {
                bestCandidate = placementCandidate
                bestScore = score
            }
        }

        return bestCandidate || []
    }

    public getEntranceDoorPlacementGroupsForZones(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId: number,
        sourceZones: ZoneMapItem[],
        doorsCount: number
    ) {
        const freeSegments = this.getEntranceDoorAuraAwareFreeSegments(
            zone,
            side,
            floorId,
            sourceZones
        )

        return this.getEntranceDoorPlacementGroupsFromFreeSegments(
            zone,
            side,
            floorId,
            freeSegments,
            sourceZones,
            doorsCount
        )
    }

    public areEntranceDoorPlacementGroupsEqual(
        firstPlacementGroups: BuildingMapDoorPlacementGroup[],
        secondPlacementGroups: BuildingMapDoorPlacementGroup[]
    ) {
        if (firstPlacementGroups.length !== secondPlacementGroups.length) return false

        return firstPlacementGroups.every((firstPlacementGroup, index) => {
            const secondPlacementGroup = secondPlacementGroups[index]
            if (!secondPlacementGroup) return false

            return firstPlacementGroup.startIndex === secondPlacementGroup.startIndex
                && firstPlacementGroup.doorsCount === secondPlacementGroup.doorsCount
                && buildingMapGeometryService.isSameCoordinate(
                    firstPlacementGroup.placement.start,
                    secondPlacementGroup.placement.start
                )
                && buildingMapGeometryService.isSameCoordinate(
                    firstPlacementGroup.placement.end,
                    secondPlacementGroup.placement.end
                )
        })
    }

    public getEntranceDoorCenterFromPlacementGroups(
        groups: BuildingMapDoorPlacementGroup[],
        doorIndex: number
    ) {
        for (const group of groups) {
            const localIndex = doorIndex - group.startIndex

            if (localIndex < 0 || localIndex >= group.doorsCount) continue

            return this.getEntranceDoorCenterOnPlacement(
                group.placement,
                localIndex,
                group.doorsCount
            )
        }

        return null
    }

    public getEntranceDoorAuraRectanglesFromPlacementGroups(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        placementGroups: BuildingMapDoorPlacementGroup[]
    ) {
        const zoneRect = buildingMapGeometryService.toRectangle(zone)
        const auraRectangles: BuildingMapRectangle[] = []

        for (const placementGroup of placementGroups) {
            for (let doorIndex = 0; doorIndex < placementGroup.doorsCount; doorIndex += 1) {
                const center = this.getEntranceDoorCenterOnPlacement(
                    placementGroup.placement,
                    doorIndex,
                    placementGroup.doorsCount
                )

                auraRectangles.push(this.getEntranceDoorAuraRectangle(
                    zoneRect,
                    side,
                    {
                        start: center - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2,
                        end: center + BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2
                    }
                ))
            }
        }

        return auraRectangles
    }

    public getEntranceDoorPlacementGroupsSignature(
        placementGroups: BuildingMapDoorPlacementGroup[]
    ) {
        return placementGroups
            .map((group) => [
                group.startIndex,
                group.doorsCount,
                Number(group.placement.start.toFixed(3)),
                Number(group.placement.end.toFixed(3))
            ].join(':'))
            .join('|')
    }

    public getEntranceDoorSplitScoreForAddSegment(
        addSegment: BuildingMapSegment,
        placementGroups: BuildingMapDoorPlacementGroup[]
    ) {
        const doorsBefore = placementGroups.filter((group) =>
            group.placement.end <= addSegment.start + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
        ).reduce((total, group) => total + group.doorsCount, 0)

        const doorsAfter = placementGroups.filter((group) =>
            group.placement.start >= addSegment.end - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
        ).reduce((total, group) => total + group.doorsCount, 0)

        return Math.min(doorsBefore, doorsAfter)
    }

    public doesCandidateAffectEntranceDoorSide(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        candidateRect: BuildingMapRectangle,
        sourceZones: ZoneMapItem[],
        floorId: number,
        doorsCount: number
    ) {
        const zoneRect = buildingMapGeometryService.toRectangle(zone)
        const blockedSegments = this.getEntranceDoorBlockedSegmentsForZone(
            zoneRect,
            candidateRect,
            side,
            BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE,
            true
        )

        if (blockedSegments.length > 0) return true

        const currentPlacementGroups = this.getEntranceDoorPlacementGroupsForZones(
            zone,
            side,
            floorId,
            sourceZones,
            doorsCount
        )

        if (currentPlacementGroups.length === 0) return false

        const currentAuraRectangles = this.getEntranceDoorAuraRectanglesFromPlacementGroups(
            zone,
            side,
            currentPlacementGroups
        )

        return currentAuraRectangles.some((auraRectangle) =>
            buildingMapGeometryService.checkOverlap(candidateRect, auraRectangle)
        )
    }

    public doesCandidateKeepEntranceDoorsValid(
        candidateRect: BuildingMapRectangle,
        sourceZones: ZoneMapItem[],
        sourceDoors: DoorMapItem[]
    ) {
        const zonesById = new Map(sourceZones.map((zone) => [zone.zone_id, zone]))
        const checks = new Map<string, {
            zone: ZoneMapItem
            side: 'left' | 'right' | 'top' | 'bottom'
            floorId: number
            doorsCount: number
        }>()

        for (const door of sourceDoors) {
            if (!door.is_entrance || !door.entrance_door_side) continue

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

        for (const check of checks.values()) {
            const currentPlacementGroups = this.getEntranceDoorPlacementGroupsForZones(
                check.zone,
                check.side,
                check.floorId,
                sourceZones,
                check.doorsCount
            )

            if (currentPlacementGroups.length === 0) return false

            const candidateAffectsDoorSide = this.doesCandidateAffectEntranceDoorSide(
                check.zone,
                check.side,
                candidateRect,
                sourceZones,
                check.floorId,
                check.doorsCount
            )

            if (!candidateAffectsDoorSide) continue

            const placementGroups = this.getEntranceDoorPlacementGroupsForCandidate(
                check.zone,
                check.side,
                check.floorId,
                candidateRect,
                sourceZones,
                sourceDoors,
                check.doorsCount,
                true,
                true
            )

            if (placementGroups.length === 0) return false
        }

        return true
    }
}

export const buildingMapEntranceDoorPlacementContextService = new BuildingMapEntranceDoorPlacementContextService()
