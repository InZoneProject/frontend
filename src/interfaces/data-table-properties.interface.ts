export interface DataTableProperties<T> {
    items: T[]
    searchQuery: string
    placeholder: string
    loading?: boolean
}