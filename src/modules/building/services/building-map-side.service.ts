import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import {BuildingMapRectangle} from "@/modules/building/interfaces/building-map-rectangle.interface";

class BuildingMapSideService {
    readonly sides: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom']

    getZoneSideSegment(zone: ZoneMapItem, side: 'left' | 'right' | 'top' | 'bottom') {
        if (side === 'left' || side === 'right') return {start: zone.y_coordinate, end: zone.y_coordinate + zone.height}
        return {start: zone.x_coordinate, end: zone.x_coordinate + zone.width}
    }

    getSideSliceRectangle(
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        start: number,
        end: number,
        outward: number
    ) {
        if (side === 'left') return {x: zone.x_coordinate - outward, y: start, width: outward, height: end - start}
        if (side === 'right') return {x: zone.x_coordinate + zone.width, y: start, width: outward, height: end - start}
        if (side === 'top') return {x: start, y: zone.y_coordinate - outward, width: end - start, height: outward}
        return {x: start, y: zone.y_coordinate + zone.height, width: end - start, height: outward}
    }

    getCoordinateOnSide(
        rect: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom'
    ) {
        if (side === 'left' || side === 'right') return rect.y + rect.height / 2
        return rect.x + rect.width / 2
    }

    getSideSegment(
        zone: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom'
    ) {
        if (side === 'top' || side === 'bottom') return {start: zone.x, end: zone.x + zone.width}
        return {start: zone.y, end: zone.y + zone.height}
    }

    calculateSegmentOnSide(
        zone: BuildingMapRectangle,
        otherZone: BuildingMapRectangle,
        side: 'left' | 'right' | 'top' | 'bottom'
    ) {
        if (side === 'top' || side === 'bottom') {
            return {
                start: Math.max(zone.x, otherZone.x),
                end: Math.min(zone.x + zone.width, otherZone.x + otherZone.width)
            }
        }

        return {
            start: Math.max(zone.y, otherZone.y),
            end: Math.min(zone.y + zone.height, otherZone.y + otherZone.height)
        }
    }
}

export const buildingMapSideService = new BuildingMapSideService()
