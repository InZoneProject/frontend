import type { BuildingMapDoorProperties } from '@/modules/building/interfaces/building-map-door-properties.interface'

export const useBuildingMapDoor = (properties: BuildingMapDoorProperties) => {
    const doorClasses = () => ({
        'is-entrance': properties.door.is_entrance,
        'is-horizontal': properties.door.side === 'top' || properties.door.side === 'bottom',
        'is-vertical': properties.door.side === 'left' || properties.door.side === 'right',
        'is-foreign-floor': !properties.isCurrentFloor,
        'is-scan-active': properties.isScanActive
    })

    return {
        doorClasses
    }
}
