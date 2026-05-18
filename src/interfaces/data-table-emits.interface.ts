import { Events } from '@/enums/events.enum'

export interface DataTableEmits {
    (e: Events.UPDATE_SEARCH_QUERY, value: string): void
    (e: Events.UPDATE_OFFSET, value: number): void
}
