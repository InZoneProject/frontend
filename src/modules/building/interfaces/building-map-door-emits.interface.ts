import { Events } from '@/enums/events.enum'

export interface BuildingMapDoorEmits {
    (event: Events.DELETE_DOOR): void
    (event: Events.OPEN_DOOR_READER): void
}
