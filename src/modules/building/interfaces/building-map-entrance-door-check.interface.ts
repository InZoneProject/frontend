import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'

export interface BuildingMapEntranceDoorCheck {
    zone: ZoneMapItem
    side: 'left' | 'right' | 'top' | 'bottom'
    floorId: number
    doorsCount: number
}