import { BUILDING_MAP_GEOMETRY_CONSTANTS } from '@/modules/building/constants/building-map-geometry.constants'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import {BuildingMapRectangle} from "@/modules/building/interfaces/building-map-rectangle.interface";
import {BuildingMapSegment} from "@/modules/building/interfaces/building-map-segment.interface";

class BuildingMapGeometryService {
    private readonly epsilon = BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON

    clampValue(value: number, min: number, max: number) {
        if (min > max) return (min + max) / 2
        return Math.min(max, Math.max(min, value))
    }

    isSameCoordinate(first: number, second: number) {
        return Math.abs(first - second) <= this.epsilon
    }

    toRectangle(zone: ZoneMapItem) {
        return {
            x: zone.x_coordinate,
            y: zone.y_coordinate,
            width: zone.width,
            height: zone.height
        }
    }

    createCoordinatesMap(zones: ZoneMapItem[]) {
        const map = new Map<number, BuildingMapRectangle>()

        for (const zone of zones) {
            map.set(zone.zone_id, this.toRectangle(zone))
        }

        return map
    }

    getChangedZoneIds(
        zones: ZoneMapItem[],
        coordinatesMap: Map<number, BuildingMapRectangle>
    ) {
        const changedZoneIds = new Set<number>()

        for (const zone of zones) {
            const coords = coordinatesMap.get(zone.zone_id)
            if (!coords) continue

            if (
                !this.isSameCoordinate(coords.x, zone.x_coordinate) ||
                !this.isSameCoordinate(coords.y, zone.y_coordinate) ||
                !this.isSameCoordinate(coords.width, zone.width) ||
                !this.isSameCoordinate(coords.height, zone.height)
            ) {
                changedZoneIds.add(zone.zone_id)
            }
        }

        return changedZoneIds
    }

    isZonePreviewed(
        zoneId: number,
        previewZones: ZoneMapItem[] | null,
        sourceZones: ZoneMapItem[]
    ) {
        if (!previewZones) return false

        const previewZone = previewZones.find((zone) => zone.zone_id === zoneId)
        const sourceZone = sourceZones.find((zone) => zone.zone_id === zoneId)

        if (!previewZone || !sourceZone) return false

        return previewZone.x_coordinate !== sourceZone.x_coordinate
            || previewZone.y_coordinate !== sourceZone.y_coordinate
            || previewZone.width !== sourceZone.width
            || previewZone.height !== sourceZone.height
    }

    checkOverlap(
        first: BuildingMapRectangle,
        second: BuildingMapRectangle
    ) {
        return !(
            first.x + first.width <= second.x + this.epsilon
            || second.x + second.width <= first.x + this.epsilon
            || first.y + first.height <= second.y + this.epsilon
            || second.y + second.height <= first.y + this.epsilon
        )
    }

    calculateIntersection(
        zone1: BuildingMapRectangle,
        zone2: BuildingMapRectangle
    ) {
        if (this.isSameCoordinate(zone1.x + zone1.width, zone2.x)) {
            const start = Math.max(zone1.y, zone2.y)
            const end = Math.min(zone1.y + zone1.height, zone2.y + zone2.height)
            return {hasIntersection: end - start > 0, intersectionLength: end - start, side: 'right' as const, start, end}
        }
        if (this.isSameCoordinate(zone1.x, zone2.x + zone2.width)) {
            const start = Math.max(zone1.y, zone2.y)
            const end = Math.min(zone1.y + zone1.height, zone2.y + zone2.height)
            return {hasIntersection: end - start > 0, intersectionLength: end - start, side: 'left' as const, start, end}
        }
        if (this.isSameCoordinate(zone1.y + zone1.height, zone2.y)) {
            const start = Math.max(zone1.x, zone2.x)
            const end = Math.min(zone1.x + zone1.width, zone2.x + zone2.width)
            return {hasIntersection: end - start > 0, intersectionLength: end - start, side: 'bottom' as const, start, end}
        }
        if (this.isSameCoordinate(zone1.y, zone2.y + zone2.height)) {
            const start = Math.max(zone1.x, zone2.x)
            const end = Math.min(zone1.x + zone1.width, zone2.x + zone2.width)
            return {hasIntersection: end - start > 0, intersectionLength: end - start, side: 'top' as const, start, end}
        }
        return {hasIntersection: false, intersectionLength: 0, side: null, start: 0, end: 0}
    }

    mergeSegments(segments: Array<BuildingMapSegment>) {
        const sorted = [...segments].sort((first, second) => first.start - second.start)
        const merged: Array<BuildingMapSegment> = []
        for (const segment of sorted) {
            const last = merged[merged.length - 1]
            if (!last || segment.start > last.end) merged.push({...segment})
            else last.end = Math.max(last.end, segment.end)
        }
        return merged
    }

    calculateFreeSegments(
        totalSegment: BuildingMapSegment,
        occupiedSegments: Array<BuildingMapSegment>
    ) {
        const freeSegments: Array<BuildingMapSegment> = []
        let cursor = totalSegment.start
        for (const segment of occupiedSegments) {
            if (cursor < segment.start) freeSegments.push({start: cursor, end: segment.start})
            cursor = Math.max(cursor, segment.end)
        }
        if (cursor < totalSegment.end) freeSegments.push({start: cursor, end: totalSegment.end})
        return freeSegments
    }

    subtractSegment(
        sourceSegments: Array<BuildingMapSegment>,
        occupiedSegment: BuildingMapSegment
    ) {
        const result: Array<BuildingMapSegment> = []
        for (const segment of sourceSegments) {
            const occupiedStart = Math.max(segment.start, occupiedSegment.start)
            const occupiedEnd = Math.min(segment.end, occupiedSegment.end)
            if (occupiedEnd <= occupiedStart) {
                result.push(segment)
                continue
            }
            if (segment.start < occupiedStart) result.push({start: segment.start, end: occupiedStart})
            if (occupiedEnd < segment.end) result.push({start: occupiedEnd, end: segment.end})
        }
        return result
    }

    getRectangleIntersection(
        first: BuildingMapRectangle,
        second: BuildingMapRectangle
    ) {
        const x = Math.max(first.x, second.x)
        const y = Math.max(first.y, second.y)
        const right = Math.min(first.x + first.width, second.x + second.width)
        const bottom = Math.min(first.y + first.height, second.y + second.height)

        if (
            right <= x + this.epsilon
            || bottom <= y + this.epsilon
        ) {
            return null
        }

        return {
            x,
            y,
            width: right - x,
            height: bottom - y
        }
    }

    getRectangleArea(rectangle: BuildingMapRectangle | null) {
        if (!rectangle) return 0

        return Math.max(0, rectangle.width) * Math.max(0, rectangle.height)
    }

    getRectangleSegmentOnSide(
        rectangle: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom'
    ) {
        if (side === 'left' || side === 'right') {
            return {
                start: rectangle.y,
                end: rectangle.y + rectangle.height
            }
        }

        return {
            start: rectangle.x,
            end: rectangle.x + rectangle.width
        }
    }
}

export const buildingMapGeometryService = new BuildingMapGeometryService()
