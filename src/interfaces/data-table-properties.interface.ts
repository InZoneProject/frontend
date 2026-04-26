export interface DataTableProperties<T> {
    items: T[]
    searchQuery: string
    placeholder: string
    maxHeight: string
    interactiveRows: boolean
    loading: boolean
}
