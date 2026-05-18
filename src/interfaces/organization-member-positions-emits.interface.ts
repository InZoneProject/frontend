import { Events } from '@/enums/events.enum'

export interface OrganizationMemberPositionsEmits {
    (event: Events.CLOSE): void
    (event: Events.BACK_TO_INFO): void
    (event: Events.START_EDIT): void
    (event: Events.FINISH_EDIT): void
    (event: Events.ADD_POSITION): void
    (event: Events.EDIT, positionId: number): void
    (event: Events.DELETE, positionId: number): void
    (event: Events.ASSIGN, positionId: number): void
    (event: Events.UNASSIGN, positionId: number): void
    (event: Events.UPDATE_ASSIGNED_SEARCH_VALUE, value: string): void
    (event: Events.UPDATE_AVAILABLE_SEARCH_VALUE, value: string): void
    (event: Events.UPDATE_ASSIGNED_OFFSET, value: number): void
    (event: Events.UPDATE_AVAILABLE_OFFSET, value: number): void
}
