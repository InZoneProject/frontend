import {BUILDING_MAP_GEOMETRY_CONSTANTS} from '@/modules/building/constants/building-map-geometry.constants'
import {buildingMapGeometryService} from '@/modules/building/services/building-map-geometry.service'
import {buildingMapSideService} from '@/modules/building/services/building-map-side.service'
import type {BuildingMapRectangle} from '@/modules/building/interfaces/building-map-rectangle.interface'
import type {BuildingMapSegment} from '@/modules/building/interfaces/building-map-segment.interface'
import type {ZoneMapItem} from '@/modules/building/interfaces/zone-map-item.interface'

class BuildingMapFreeSideSliceService {
    public getAddCandidateGeometry(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        segment: BuildingMapSegment,
        outward: number
    ) {
        const rect = buildingMapSideService.getSideSliceRectangle(
            zone,
            side,
            segment.start,
            segment.end,
            outward
        )

        return {
            rect,
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y
        }
    }

    public getFreeSideSlices(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        sourceZones: ZoneMapItem[]
    ) {
        const segment = buildingMapSideService.getZoneSideSegment(zone, side)
        const zoneRect = buildingMapGeometryService.toRectangle(zone)

        const occupiedSegments = sourceZones
            .filter((other) => other.zone_id !== zone.zone_id)
            .map((other) => buildingMapGeometryService.toRectangle(other))
            .filter((otherRect) => this.isZoneAdjacentToSide(zoneRect, otherRect, side))
            .map((otherRect) => this.calculateSegmentOnSide(zoneRect, otherRect, side))
            .filter((occupied) => occupied.end > occupied.start)

        const freeSegments = this.calculateFreeSegments(
            segment,
            this.mergeSegments(occupiedSegments)
        )

        return freeSegments.filter((slice) =>
            slice.end - slice.start >= BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
        )
    }

    public calculateSegmentOnSide(
        zoneRect: BuildingMapRectangle,
        otherRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom'
    ): BuildingMapSegment {
        if (side === 'left' || side === 'right') {
            return {
                start: Math.max(zoneRect.y, otherRect.y),
                end: Math.min(zoneRect.y + zoneRect.height, otherRect.y + otherRect.height)
            }
        }

        return {
            start: Math.max(zoneRect.x, otherRect.x),
            end: Math.min(zoneRect.x + zoneRect.width, otherRect.x + otherRect.width)
        }
    }

    public calculateFreeSegments(
        totalSegment: BuildingMapSegment,
        occupiedSegments: BuildingMapSegment[]
    ): BuildingMapSegment[] {
        if (occupiedSegments.length === 0) return [totalSegment]

        const freeSegments: BuildingMapSegment[] = []
        let cursor = totalSegment.start

        for (const occupiedSegment of occupiedSegments) {
            const start = Math.max(occupiedSegment.start, totalSegment.start)
            const end = Math.min(occupiedSegment.end, totalSegment.end)

            if (end <= totalSegment.start || start >= totalSegment.end) continue

            if (start > cursor) {
                freeSegments.push({
                    start: cursor,
                    end: start
                })
            }

            cursor = Math.max(cursor, end)
        }

        if (cursor < totalSegment.end) {
            freeSegments.push({
                start: cursor,
                end: totalSegment.end
            })
        }

        return freeSegments
    }

    public mergeSegments(
        segments: BuildingMapSegment[]
    ): BuildingMapSegment[] {
        if (segments.length === 0) return []

        const sortedSegments = [...segments].sort((first, second) => first.start - second.start)
        const mergedSegments: BuildingMapSegment[] = []

        for (const segment of sortedSegments) {
            const lastSegment = mergedSegments[mergedSegments.length - 1]

            if (!lastSegment || segment.start > lastSegment.end + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON) {
                mergedSegments.push({
                    start: segment.start,
                    end: segment.end
                })
                continue
            }

            lastSegment.end = Math.max(lastSegment.end, segment.end)
        }

        return mergedSegments
    }

    public isZoneAdjacentToSide(
        zoneRect: BuildingMapRectangle,
        otherRect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom'
    ) {
        if (side === 'left') {
            return buildingMapGeometryService.isSameCoordinate(
                otherRect.x + otherRect.width,
                zoneRect.x
            )
        }

        if (side === 'right') {
            return buildingMapGeometryService.isSameCoordinate(
                otherRect.x,
                zoneRect.x + zoneRect.width
            )
        }

        if (side === 'top') {
            return buildingMapGeometryService.isSameCoordinate(
                otherRect.y + otherRect.height,
                zoneRect.y
            )
        }

        return buildingMapGeometryService.isSameCoordinate(
            otherRect.y,
            zoneRect.y + zoneRect.height
        )
    }

    public sortSegmentsByAvailableSpace(
        segments: BuildingMapSegment[]
    ) {
        return [...segments].sort((first, second) =>
            (second.end - second.start) - (first.end - first.start)
        )
    }
}

export const buildingMapFreeSideSliceService = new BuildingMapFreeSideSliceService()