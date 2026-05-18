import { computed } from 'vue'
import { BUILDING_MAP_PREVIEW_CONSTANTS } from '@/modules/building/constants/building-map-preview.constants'
import type { BuildingMapBlockedPreviewProperties } from '@/modules/building/interfaces/building-map-blocked-preview-properties.interface'
import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import {buildingMapRenderedDoorService} from "@/modules/building/services/building-map-rendered-door.service";

export const useBuildingMapBlockedPreview = (properties: BuildingMapBlockedPreviewProperties) => {
    const doorPositioningZones = computed(() =>
        properties.preview.positioningZones || properties.preview.zones
    )

    const fallbackDoorPositioningZones = computed(() =>
        properties.preview.fallbackPositioningZones
        || properties.preview.positioningZones
        || properties.preview.zones
    )

    const bounds = computed(() => {
        const zones = properties.preview.zones

        const minX = Math.min(...zones.map((zone) => zone.x_coordinate))
        const minY = Math.min(...zones.map((zone) => zone.y_coordinate))
        const maxX = Math.max(...zones.map((zone) => zone.x_coordinate + zone.width))
        const maxY = Math.max(...zones.map((zone) => zone.y_coordinate + zone.height))

        return {
            minX,
            minY,
            width: Math.max(1, maxX - minX),
            height: Math.max(1, maxY - minY)
        }
    })

    const scale = computed(() => Math.min(
        BUILDING_MAP_PREVIEW_CONSTANTS.BLOCKED_PREVIEW_WIDTH / bounds.value.width,
        BUILDING_MAP_PREVIEW_CONSTANTS.BLOCKED_PREVIEW_HEIGHT / bounds.value.height
    ))

    const contentOffset = computed(() => {
        const contentWidth = bounds.value.width * scale.value
        const contentHeight = bounds.value.height * scale.value
        return {
            x: Math.max(0, (BUILDING_MAP_PREVIEW_CONSTANTS.BLOCKED_PREVIEW_WIDTH - contentWidth) / 2),
            y: Math.max(0, (BUILDING_MAP_PREVIEW_CONSTANTS.BLOCKED_PREVIEW_HEIGHT - contentHeight) / 2)
        }
    })

    const zoneStyle = (zone: ZoneMapItem) => ({
        left: `${contentOffset.value.x + (zone.x_coordinate - bounds.value.minX) * scale.value}px`,
        top: `${contentOffset.value.y + (zone.y_coordinate - bounds.value.minY) * scale.value}px`,
        width: `${zone.width * scale.value}px`,
        height: `${zone.height * scale.value}px`
    })

    const getPixelValue = (value: string | undefined) => {
        return Number(String(value || '0').replace('px', '')) || 0
    }

    const getTranslateCoordinates = (transform: string | undefined) => {
        const match = /translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/.exec(transform || '')

        return {
            x: match ? Number(match[1]) : 0,
            y: match ? Number(match[2]) : 0
        }
    }

    const createRenderedDoorForPreview = (
        door: DoorMapItem,
        renderedZones: ZoneMapItem[]
    ) => {
        return buildingMapRenderedDoorService.createRenderedDoor({
            door,
            renderedZones,
            doorsForPositioning: properties.preview.doors,
            currentFloorId: properties.preview.floor.floor_id,
            unitSize: scale.value,
            hoveredAddHandle: null,
            baseAddZoneHandles: [],
            hoveredAddHandleCoordinate: null
        })
    }

    const doorStyle = (door: DoorMapItem) => {
        const renderedDoor = createRenderedDoorForPreview(
            door,
            doorPositioningZones.value
        ) || createRenderedDoorForPreview(
            door,
            fallbackDoorPositioningZones.value
        )

        if (!renderedDoor) return {}

        const translate = getTranslateCoordinates(renderedDoor.style.transform)
        const width = getPixelValue(renderedDoor.style.width)
        const height = getPixelValue(renderedDoor.style.height)

        return {
            left: `${contentOffset.value.x + translate.x - bounds.value.minX * scale.value}px`,
            top: `${contentOffset.value.y + translate.y - bounds.value.minY * scale.value}px`,
            width: `${width}px`,
            height: `${height}px`
        }
    }

    return {
        zoneStyle,
        doorStyle
    }
}
