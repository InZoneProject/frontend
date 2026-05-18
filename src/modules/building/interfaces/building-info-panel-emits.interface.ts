import { Events } from '@/enums/events.enum'

export interface BuildingInfoPanelEmits {
    (event: Events.EDIT): void
    (event: Events.DELETE): void
}
