import { BUILDING_MAP_GEOMETRY_CONSTANTS } from '@/modules/building/constants/building-map-geometry.constants'
import { buildingMapGeometryService } from '@/modules/building/services/building-map-geometry.service'
import { buildingMapSideService } from '@/modules/building/services/building-map-side.service'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import type { BuildingMapSegment } from '@/modules/building/interfaces/building-map-segment.interface'
import type { BuildingMapTransitionSegment } from '@/modules/building/interfaces/building-map-transition-segment.interface'

class BuildingMapTransitionService {
    private readonly epsilon = BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON

    normalizeHybridAddField(
        regularSegment: BuildingMapSegment,
        transitionSegments: Array<BuildingMapTransitionSegment>,
        blockedTransitionSegments: Array<BuildingMapSegment> = []
    ) {
        const cells: Array<{
            start: number
            end: number
            kind: 'regular' | 'transition'
            outward: number
            blockedByOtherFloorAura?: boolean
        }> = []
        const start = Math.ceil(regularSegment.start - this.epsilon)
        const end = Math.floor(regularSegment.end + this.epsilon)

        for (let cursor = start; cursor < end; cursor += 1) {
            const cellSegment = { start: cursor, end: cursor + 1 }
            const transitionSegment = transitionSegments.find((segment) =>
                cellSegment.start >= segment.start - this.epsilon
                && cellSegment.end <= segment.end + this.epsilon
            )
            const isTransitionCell = transitionSegment !== undefined
            const isBlockedByOtherFloorAura = blockedTransitionSegments.some((blockedSegment) =>
                cellSegment.start < blockedSegment.end - this.epsilon
                && cellSegment.end > blockedSegment.start + this.epsilon
            )

            cells.push({
                ...cellSegment,
                kind: isTransitionCell && !isBlockedByOtherFloorAura ? 'transition' : 'regular',
                outward: isTransitionCell && !isBlockedByOtherFloorAura ? transitionSegment.outward : 0,
                blockedByOtherFloorAura: isBlockedByOtherFloorAura
            })
        }

        if (cells.length < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) return null

        for (const run of this.getRunsByKind(cells)) {
            const runLength = run.endIndex - run.startIndex + 1

            if (run.kind !== 'transition' || runLength >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) continue

            for (let index = run.startIndex; index <= run.endIndex; index += 1) {
                cells[index].kind = 'regular'
                cells[index].outward = 0
                cells[index].blockedByOtherFloorAura = true
            }
        }

        if (cells.length < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) return null

        const visibleSegment = this.mergeCellsToSegments(cells)
            .sort((first, second) => (second.end - second.start) - (first.end - first.start))[0]

        if (!visibleSegment) return null

        const visibleCells = cells.filter((cell) =>
            cell.start >= visibleSegment.start - this.epsilon
            && cell.end <= visibleSegment.end + this.epsilon
        )

        if (visibleCells.length < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) return null

        return {
            segment: {
                start: visibleCells[0].start,
                end: visibleCells[visibleCells.length - 1].end
            },
            transitionSegments: this.mergeTransitionCellsToSegments(
                visibleCells.filter((cell) => cell.kind === 'transition')
            )
        }
    }

    getNearestTransitionCoordinate(
        transitionSegments: Array<BuildingMapSegment>,
        coordinate: number | null
    ) {
        if (transitionSegments.length === 0) return null

        if (coordinate === null) {
            const largestSegment = transitionSegments
                .slice()
                .sort((first, second) => (second.end - second.start) - (first.end - first.start))[0]

            return largestSegment.start + (largestSegment.end - largestSegment.start) / 2
        }

        let nearestCoordinate = coordinate
        let nearestDistance = Number.POSITIVE_INFINITY

        for (const segment of transitionSegments) {
            const clampedCoordinate = this.clampValue(coordinate, segment.start, segment.end)
            const distance = Math.abs(coordinate - clampedCoordinate)

            if (distance < nearestDistance) {
                nearestDistance = distance
                nearestCoordinate = clampedCoordinate
            }
        }

        return nearestCoordinate
    }

    getTransitionSegmentNearCoordinate(
        transitionSegments: Array<BuildingMapTransitionSegment>,
        coordinate: number | null
    ) {
        if (transitionSegments.length === 0) return null

        const nearestCoordinate = this.getNearestTransitionCoordinate(transitionSegments, coordinate)

        if (nearestCoordinate === null) return null

        return transitionSegments
            .slice()
            .sort((first, second) => {
                const firstLength = first.end - first.start
                const secondLength = second.end - second.start

                if (!this.isSameCoordinate(firstLength, secondLength)) {
                    return secondLength - firstLength
                }

                if (!this.isSameCoordinate(first.outward, second.outward)) {
                    return second.outward - first.outward
                }

                return this.getSegmentDistanceToCoordinate(first, nearestCoordinate)
                    - this.getSegmentDistanceToCoordinate(second, nearestCoordinate)
            })[0]
    }

    private getTransitionOutwardSize(segment: BuildingMapTransitionSegment) {
        return Math.max(
            BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
            Math.min(
                BUILDING_MAP_GEOMETRY_CONSTANTS.MAX_ADDED_ZONE_SIDE,
                Math.round(segment.outward)
            )
        )
    }

    getTransitionAddHandlePreviewRectForSegment(
        handle: {
            side: 'left' | 'right' | 'top' | 'bottom'
            payload: { x_coordinate: number; y_coordinate: number; width: number; height: number }
        },
        segment: BuildingMapTransitionSegment
    ) {
        const sideLength = Math.max(
            BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
            Math.round(segment.end - segment.start)
        )

        const outwardSize = this.getTransitionOutwardSize(segment)

        if (handle.side === 'left' || handle.side === 'right') {
            return {
                x: handle.side === 'left'
                    ? handle.payload.x_coordinate + handle.payload.width - outwardSize
                    : handle.payload.x_coordinate,
                y: Math.round(segment.start),
                width: outwardSize,
                height: sideLength
            }
        }

        return {
            x: Math.round(segment.start),
            y: handle.side === 'top'
                ? handle.payload.y_coordinate + handle.payload.height - outwardSize
                : handle.payload.y_coordinate,
            width: sideLength,
            height: outwardSize
        }
    }

    getTransitionAddHandlePreviewRect(handle: {
        side: 'left' | 'right' | 'top' | 'bottom'
        transitionSegments: Array<BuildingMapTransitionSegment>
        payload: { x_coordinate: number; y_coordinate: number; width: number; height: number }
    }) {
        const segment = handle.transitionSegments[0]
        if (!segment) return null
        return this.getTransitionAddHandlePreviewRectForSegment(handle, segment)
    }

    getAvailableOutwardDepth(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        sliceStart: number,
        sliceEnd: number,
        sourceZones: ZoneMapItem[]
    ) {
        let maxDepth = 0

        for (let depth = 1; depth <= BUILDING_MAP_GEOMETRY_CONSTANTS.MAX_ADDED_ZONE_SIDE; depth += 1) {
            const candidate = buildingMapSideService.getSideSliceRectangle(zone, side, sliceStart, sliceEnd, depth)

            const blocked = sourceZones
                .filter((other) => other.zone_id !== zone.zone_id)
                .some((other) => buildingMapGeometryService.checkOverlap(
                    candidate,
                    buildingMapGeometryService.toRectangle(other)
                ))

            if (blocked) break

            maxDepth = depth
        }

        return maxDepth
    }

    getTransitionSegmentsForCandidate(
        sourceZone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        segment: BuildingMapSegment,
        outward: number,
        sourceZones: ZoneMapItem[]
    ) {
        if (!sourceZones.some((zone) => zone.zone_id === sourceZone.zone_id)) return []

        const segmentStart = Math.ceil(segment.start - this.epsilon)
        const segmentEnd = Math.floor(segment.end + this.epsilon)
        const greenCells = new Map<number, number>()

        for (
            let start = segmentStart;
            start + BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE <= segmentEnd;
            start += 1
        ) {
            for (
                let end = start + BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE;
                end <= segmentEnd;
                end += 1
            ) {
                let validOutward = 0

                for (
                    let depth = outward;
                    depth >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE;
                    depth -= 1
                ) {
                    const rect = buildingMapSideService.getSideSliceRectangle(
                        sourceZone,
                        side,
                        start,
                        end,
                        depth
                    )

                    const blocked = sourceZones.some((other) => {
                        if (other.zone_id === sourceZone.zone_id) return false

                        return buildingMapGeometryService.checkOverlap(
                            rect,
                            buildingMapGeometryService.toRectangle(other)
                        )
                    })

                    if (blocked) continue

                    validOutward = depth
                    break
                }

                if (validOutward <= 0) continue

                for (let cell = start; cell < end; cell += 1) {
                    const existingOutward = greenCells.get(cell) || 0
                    greenCells.set(cell, Math.max(existingOutward, validOutward))
                }
            }
        }

        const segments: Array<BuildingMapTransitionSegment> = []
        let cursor = segmentStart

        while (cursor < segmentEnd) {
            const outwardForCell = greenCells.get(cursor)

            if (!outwardForCell) {
                cursor += 1
                continue
            }

            const start = cursor
            let end = cursor + 1
            let segmentOutward = outwardForCell

            while (end < segmentEnd) {
                const nextOutward = greenCells.get(end)

                if (!nextOutward) break

                segmentOutward = Math.min(segmentOutward, nextOutward)
                end += 1
            }

            if (end - start >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) {
                segments.push({
                    start,
                    end,
                    outward: segmentOutward
                })
            }

            cursor = end
        }

        return segments
    }

    getTransitionSegmentsBoundingRectangle(
        sourceZone: ZoneMapItem,
        sourceSide: 'left' | 'right' | 'top' | 'bottom',
        transitionSegments: Array<BuildingMapTransitionSegment>
    ) {
        if (transitionSegments.length === 0) return null

        const start = Math.min(...transitionSegments.map((segment) => segment.start))
        const end = Math.max(...transitionSegments.map((segment) => segment.end))
        const outward = Math.max(...transitionSegments.map((segment) => segment.outward))

        return buildingMapSideService.getSideSliceRectangle(
            sourceZone,
            sourceSide,
            start,
            end,
            outward
        )
    }

    getAddHandleSegmentStyle(
        side: 'left' | 'right' | 'top' | 'bottom',
        sourceSegment: BuildingMapSegment,
        transitionSegment: BuildingMapSegment
    ): Record<string, string> {
        const length = sourceSegment.end - sourceSegment.start
        const startPercent = ((transitionSegment.start - sourceSegment.start) / length) * 100
        const sizePercent = ((transitionSegment.end - transitionSegment.start) / length) * 100
        const startsAfterYellow = transitionSegment.start > sourceSegment.start
        const endsBeforeYellow = transitionSegment.end < sourceSegment.end

        const startRadius = startsAfterYellow ? '999px' : '0'
        const endRadius = endsBeforeYellow ? '999px' : '0'
        const radius = side === 'left' || side === 'right'
            ? `${startRadius} ${startRadius} ${endRadius} ${endRadius}`
            : `${startRadius} ${endRadius} ${endRadius} ${startRadius}`

        if (side === 'left' || side === 'right') {
            return {
                top: `${startPercent}%`,
                height: `${sizePercent}%`,
                borderRadius: radius
            }
        }

        return {
            left: `${startPercent}%`,
            width: `${sizePercent}%`,
            borderRadius: radius
        }
    }

    createPayloadForSegment(
        handle: {
            side: 'left' | 'right' | 'top' | 'bottom'
            payload: {
                zone_from_id: number
                side: 'left' | 'right' | 'top' | 'bottom'
                x_coordinate: number
                y_coordinate: number
                width: number
                height: number
                title: string
                can_create_transition: boolean
                transition_geometry?: {
                    x_coordinate: number
                    y_coordinate: number
                    width: number
                    height: number
                }
            }
        },
        segment: BuildingMapTransitionSegment
    ) {
        const sideLength = Math.max(
            BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
            Math.round(segment.end - segment.start)
        )

        const outwardSize = this.getTransitionOutwardSize(segment)

        const transitionGeometry = handle.side === 'left' || handle.side === 'right'
            ? {
                x_coordinate: handle.side === 'left'
                    ? Math.round(handle.payload.x_coordinate + handle.payload.width - outwardSize)
                    : Math.round(handle.payload.x_coordinate),
                y_coordinate: Math.round(segment.start),
                width: outwardSize,
                height: sideLength
            }
            : {
                x_coordinate: Math.round(segment.start),
                y_coordinate: handle.side === 'top'
                    ? Math.round(handle.payload.y_coordinate + handle.payload.height - outwardSize)
                    : Math.round(handle.payload.y_coordinate),
                width: sideLength,
                height: outwardSize
            }

        return {
            ...handle.payload,
            x_coordinate: transitionGeometry.x_coordinate,
            y_coordinate: transitionGeometry.y_coordinate,
            width: transitionGeometry.width,
            height: transitionGeometry.height,
            can_create_transition: true,
            transition_geometry: transitionGeometry
        }
    }

    private getRunsByKind(cells: Array<{
        start: number
        end: number
        kind: 'regular' | 'transition'
        outward: number
        blockedByOtherFloorAura?: boolean
    }>) {
        const runs: Array<{
            kind: 'regular' | 'transition'
            startIndex: number
            endIndex: number
        }> = []

        for (let index = 0; index < cells.length; index += 1) {
            const previousRun = runs[runs.length - 1]

            if (previousRun && previousRun.kind === cells[index].kind) {
                previousRun.endIndex = index
                continue
            }

            runs.push({
                kind: cells[index].kind,
                startIndex: index,
                endIndex: index
            })
        }

        return runs
    }

    private mergeCellsToSegments(cells: Array<BuildingMapSegment>) {
        const segments: Array<BuildingMapSegment> = []

        for (const cell of cells) {
            const previousSegment = segments[segments.length - 1]

            if (previousSegment && this.isSameCoordinate(previousSegment.end, cell.start)) {
                previousSegment.end = cell.end
                continue
            }

            segments.push({
                start: cell.start,
                end: cell.end
            })
        }

        return segments
    }

    private mergeTransitionCellsToSegments(cells: Array<BuildingMapTransitionSegment>) {
        const segments: Array<BuildingMapTransitionSegment> = []

        for (const cell of cells) {
            const previousSegment = segments[segments.length - 1]

            if (
                previousSegment
                && this.isSameCoordinate(previousSegment.end, cell.start)
                && this.isSameCoordinate(previousSegment.outward, cell.outward)
            ) {
                previousSegment.end = cell.end
                continue
            }

            segments.push({
                start: cell.start,
                end: cell.end,
                outward: cell.outward
            })
        }

        return segments
    }

    private getSegmentDistanceToCoordinate(segment: BuildingMapSegment, coordinate: number) {
        if (coordinate < segment.start) return segment.start - coordinate
        if (coordinate > segment.end) return coordinate - segment.end
        return 0
    }

    private clampValue(value: number, min: number, max: number) {
        if (min > max) return (min + max) / 2
        return Math.min(max, Math.max(min, value))
    }

    private isSameCoordinate(first: number, second: number) {
        return Math.abs(first - second) <= this.epsilon
    }
}

export const buildingMapTransitionService = new BuildingMapTransitionService()
