export interface DataTableProperties<T> {
    items: T[]
    searchQuery: string
    placeholder: string
    emptyText: string
    loadingText: string
    maxHeight: string
    interactiveRows: boolean
    isDragOver: boolean
    loading: boolean
    total: number
    offset: number
    limit: number
}
